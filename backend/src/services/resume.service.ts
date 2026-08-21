import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { createWorker } from 'tesseract.js';

// Load PDFJS operator list parser from pdf-parse library
const PDFJS = require('pdf-parse/lib/pdf.js/v1.10.100/build/pdf.js');

export interface ExtractionResult {
  text: string;
  pagesCount: number;
}

function rgbToBmp(width: number, height: number, rgbData: Uint8Array): Buffer {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const imageSize = rowSize * height;
  const fileSize = 54 + imageSize;

  const buf = Buffer.alloc(fileSize);

  // BMP Header
  buf.write('BM', 0);
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(54, 10);

  // DIB Header
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(-height, 22); // Top-down BMP
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(0, 30);
  buf.writeUInt32LE(imageSize, 34);

  let srcIdx = 0;
  for (let y = 0; y < height; y++) {
    const rowOffset = 54 + y * rowSize;
    for (let x = 0; x < width; x++) {
      const r = rgbData[srcIdx++];
      const g = rgbData[srcIdx++];
      const b = rgbData[srcIdx++];
      const offset = rowOffset + x * 3;
      buf[offset] = b;     // Blue
      buf[offset + 1] = g; // Green
      buf[offset + 2] = r; // Red
    }
  }

  return buf;
}

async function performOcrOnPdf(dataBuffer: Buffer): Promise<{ text: string; pagesCount: number }> {
  let worker: any = null;
  try {
    const data = new Uint8Array(dataBuffer);
    const doc = await PDFJS.getDocument({ data }).promise;
    const pagesCount = doc.numPages || 1;

    console.log(`[OCR] Scanned PDF detected (${pagesCount} pages). Extracting image streams...`);

    const images: Array<{ width: number; height: number; data: Uint8Array }> = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const opList = await page.getOperatorList();

      for (let j = 0; j < opList.fnArray.length; j++) {
        const fn = opList.fnArray[j];
        const args = opList.argsArray[j];
        if (
          fn === PDFJS.OPS.paintImageXObject ||
          fn === PDFJS.OPS.paintInlineImageXObject ||
          fn === PDFJS.OPS.paintImageMaskXObject
        ) {
          const imgName = args[0];
          // Await asynchronous page.objs.get call to ensure image data is loaded
          const imgObj: any = await new Promise((resolve) => page.objs.get(imgName, resolve));
          if (imgObj && imgObj.data && imgObj.width > 100 && imgObj.height > 100) {
            images.push({
              width: imgObj.width,
              height: imgObj.height,
              data: imgObj.data,
            });
          }
        }
      }
    }

    if (images.length === 0) {
      console.warn(`[OCR] No embedded page image objects found in PDF.`);
      return { text: '', pagesCount };
    }

    console.log(`[OCR] Running Tesseract OCR on ${images.length} extracted image page(s)...`);
    const langPath = path.join(__dirname, '../../lang-data');
    worker = await createWorker('eng', 1, {
      langPath: fs.existsSync(langPath) ? langPath : undefined,
      gzip: true,
      errorHandler: (err: any) => console.warn('[OCR Worker Error]:', err?.message || err),
    });

    let fullText = '';

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const bmpBuf = rgbToBmp(img.width, img.height, img.data);
      const res = await worker.recognize(bmpBuf);
      console.log(`[OCR] Page ${i + 1} extracted ${res.data.text ? res.data.text.length : 0} characters.`);
      fullText += (res.data.text || '') + '\n';
    }

    await worker.terminate();
    return { text: fullText.trim(), pagesCount };
  } catch (err: any) {
    console.error('[OCR Engine Warning]: Failed to perform OCR on scanned PDF:', err.message);
    if (worker) {
      try { await worker.terminate(); } catch (e) {}
    }
    return { text: '', pagesCount: 1 };
  }
}

export async function extractTextFromFile(filePath: string, fileType: string, fileName?: string): Promise<ExtractionResult> {
  const ext = path.extname(filePath).toLowerCase();
  let extracted = '';
  let pagesCount = 1;

  if (ext === '.pdf' || fileType.includes('pdf')) {
    const dataBuffer = fs.readFileSync(filePath);
    try {
      const data = await pdfParse(dataBuffer);
      extracted = (data.text || '').trim();
      pagesCount = data.numpages || 1;
    } catch (e: any) {
      console.warn('pdf-parse text stream extraction skipped/failed:', e.message);
    }

    // If text extraction yields zero/few characters, trigger local OCR fallback
    if (extracted.length < 30) {
      console.log(`[OCR FALLBACK STARTED] ${fileName || path.basename(filePath)}`);
      const ocrResult = await performOcrOnPdf(dataBuffer);
      console.log(`[OCR RESULT] character count: ${ocrResult.text ? ocrResult.text.length : 0}`);
      if (ocrResult.text && ocrResult.text.length > 0) {
        extracted = ocrResult.text;
      }
      if (ocrResult.pagesCount > 0) {
        pagesCount = ocrResult.pagesCount;
      }
    }
  } else if (ext === '.docx' || fileType.includes('officedocument') || ext === '.doc') {
    const result = await mammoth.extractRawText({ path: filePath });
    extracted = (result.value || '').trim();
    pagesCount = 1;
  } else if (ext === '.txt') {
    extracted = fs.readFileSync(filePath, 'utf-8').trim();
    pagesCount = 1;
  } else {
    throw new Error(`Unsupported file extension (${ext}) for text extraction.`);
  }

  return { text: extracted, pagesCount };
}
