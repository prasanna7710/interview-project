import { Router } from 'express';
import {
  createInterview,
  getInterviews,
  getInterviewById,
  submitAnswer,
  completeInterview,
} from '../controllers/interview.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

router.post('/', createInterview as any);
router.get('/', getInterviews as any);
router.get('/:id', getInterviewById as any);
router.post('/:id/submit-answer', submitAnswer as any);
router.post('/:id/complete', completeInterview as any);

export default router;
