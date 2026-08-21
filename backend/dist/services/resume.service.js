"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromFile = extractTextFromFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
async function extractTextFromFile(filePath, fileType) {
    const ext = path_1.default.extname(filePath).toLowerCase();
    if (ext === '.pdf' || fileType.includes('pdf')) {
        const dataBuffer = fs_1.default.readFileSync(filePath);
        const data = await (0, pdf_parse_1.default)(dataBuffer);
        return data.text || '';
    }
    else if (ext === '.docx' || fileType.includes('officedocument')) {
        const result = await mammoth_1.default.extractRawText({ path: filePath });
        return result.value || '';
    }
    throw new Error('Unsupported file format for text extraction');
}
