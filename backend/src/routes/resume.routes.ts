import { Router } from 'express';
import {
  uploadResumeFile,
  analyzeResume,
  getUserResumes,
  getResumeById,
  updateResumeData,
} from '../controllers/resume.controller';
import { authenticateToken } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = Router();

router.use(authenticateToken as any);

router.post('/upload', uploadResume.single('resume'), uploadResumeFile as any);
router.post('/:id/analyze', analyzeResume as any);
router.get('/', getUserResumes as any);
router.get('/:id', getResumeById as any);
router.put('/:id', updateResumeData as any);

export default router;
