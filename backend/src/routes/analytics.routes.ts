import { Router } from 'express';
import { getAnalytics } from '../controllers/analytics.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getAnalytics as any);

export default router;
