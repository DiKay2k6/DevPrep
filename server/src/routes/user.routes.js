import { Router } from 'express';
import {
  getMe,
  updateProfile,
  updateProfileSchema,
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/me', verifyJWT, getMe);

router.put(
  '/profile',
  verifyJWT,
  validateRequest(updateProfileSchema),
  updateProfile
);

export default router;
