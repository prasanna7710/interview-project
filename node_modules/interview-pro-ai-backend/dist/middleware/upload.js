"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.uploadResume = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadsDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
const profileUploadsDir = path_1.default.join(__dirname, '../../uploads/profiles');
if (!fs_1.default.existsSync(profileUploadsDir)) {
    fs_1.default.mkdirSync(profileUploadsDir, { recursive: true });
}
const resumeStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, 'resume-' + uniqueSuffix + ext);
    },
});
const avatarStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, profileUploadsDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.userId || 'anon';
        const uniqueSuffix = Date.now();
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
    },
});
const resumeFileFilter = (_req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx', '.txt'];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
};
const avatarFileFilter = (_req, file, cb) => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();
    if (allowedExtensions.includes(ext) && mimeType.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid image format. Only JPG, JPEG, PNG, and WEBP image files are allowed.'));
    }
};
exports.uploadResume = (0, multer_1.default)({
    storage: resumeStorage,
    fileFilter: resumeFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
});
exports.uploadAvatar = (0, multer_1.default)({
    storage: avatarStorage,
    fileFilter: avatarFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
