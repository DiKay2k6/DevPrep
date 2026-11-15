import { Router } from 'express';
import {
  getMe,
  login,
  loginSchema,
  refreshToken,
  refreshTokenSchema,
  register,
  registerSchema,
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateRequest(registerSchema),
  register
);

router.post('/login', authLimiter, validateRequest(loginSchema), login);

router.post(
  '/refresh-token',
  validateRequest(refreshTokenSchema),
  refreshToken
);

router.post(
  '/refresh',
  validateRequest(refreshTokenSchema),
  refreshToken
);

router.get('/me', verifyJWT, getMe);

export default router;
