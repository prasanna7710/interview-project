import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const profileUploadsDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
}

const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'resume-' + uniqueSuffix + ext);
  },
});

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, profileUploadsDir);
  },
  filename: (req: any, file, cb) => {
    const userId = req.user?.userId || 'anon';
    const uniqueSuffix = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
  },
});

const resumeFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.pdf', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
  }
};

const avatarFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  if (allowedExtensions.includes(ext) && mimeType.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image format. Only JPG, JPEG, PNG, and WEBP image files are allowed.'));
  }
};

export const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
