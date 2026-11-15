import { Router } from 'express';
import adminRoutes from './admin.routes.js';
import articleRoutes from './article.routes.js';
import authRoutes from './auth.routes.js';
import practiceRoutes from './practice.routes.js';
import questionRoutes from './question.routes.js';
import userRoutes from './user.routes.js';

const router = Router();

export function healthCheckHandler(_req, res) {
  res.status(200).json({
    success: true,
    service: 'DevPrep REST API v1',
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
}

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/articles', articleRoutes);
router.use('/questions', questionRoutes);
router.use('/practice', practiceRoutes);
router.use('/admin', adminRoutes);

export default router;
