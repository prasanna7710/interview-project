import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatarImage,
  deleteAvatarImage,
} from '../controllers/profile.controller';
import { authenticateToken } from '../middleware/auth';
import { uploadAvatar } from '../middleware/upload';

const router = Router();

router.use(authenticateToken as any);

router.get('/', getProfile as any);
router.put('/', updateProfile as any);
router.post('/avatar', uploadAvatar.single('avatar'), uploadAvatarImage as any);
router.delete('/avatar', deleteAvatarImage as any);

export default router;
