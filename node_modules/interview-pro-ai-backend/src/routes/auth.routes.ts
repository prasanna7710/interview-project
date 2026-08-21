import { Router } from 'express';
import { register, login, getMe, forgotPassword, resetPassword, googleAuth } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', authenticateToken as any, getMe as any);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
