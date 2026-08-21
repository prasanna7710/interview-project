import { Router } from 'express';
import {
  setupCodingTest,
  getCodingTest,
  runCode,
  submitQuestion,
  finishCodingTest,
  getCodingHistory,
} from '../controllers/coding.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

router.post('/setup', setupCodingTest as any);
router.get('/history', getCodingHistory as any);
router.get('/tests/:id', getCodingTest as any);
router.post('/tests/:testId/run', runCode as any);
router.post('/tests/:testId/submit-question', submitQuestion as any);
router.post('/tests/:testId/finish', finishCodingTest as any);

export default router;
