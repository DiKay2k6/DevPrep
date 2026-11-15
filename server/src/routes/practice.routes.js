import { Router } from 'express';
import {
  advanceReviewStage,
  bookmarkQuestionSchema,
  getAnalytics,
  getLatestMockResultController,
  getMockExamSession,
  getMockTemplates,
  runCode,
  runCodeSchema,
  submitAnswer,
  submitAnswerSchema,
  submitMockExamController,
  submitMockExamSchema,
  toggleBookmark,
} from '../controllers/practice.controller.js';
import {
  optionalVerifyJWT,
  verifyJWT,
} from '../middlewares/auth.middleware.js';
import { sandboxLimiter } from '../middlewares/rateLimiter.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

router.post(
  '/run-code',
  optionalVerifyJWT,
  sandboxLimiter,
  validateRequest(runCodeSchema),
  runCode
);

router.post(
  '/submit',
  optionalVerifyJWT,
  sandboxLimiter,
  validateRequest(submitAnswerSchema),
  submitAnswer
);

router.get('/analytics', optionalVerifyJWT, getAnalytics);

router.post(
  '/review-queue/bookmark',
  verifyJWT,
  validateRequest(bookmarkQuestionSchema),
  toggleBookmark
);

router.patch('/review-queue/:reviewId/advance', verifyJWT, advanceReviewStage);

// Nhóm API Phòng Thi Thử (Mock Test)
router.get('/mock-tests/templates', optionalVerifyJWT, getMockTemplates);
router.get(
  '/mock-tests/session/:templateId',
  optionalVerifyJWT,
  getMockExamSession
);
router.post(
  '/mock-tests/submit',
  optionalVerifyJWT,
  sandboxLimiter,
  validateRequest(submitMockExamSchema),
  submitMockExamController
);
router.get(
  '/mock-tests/latest',
  optionalVerifyJWT,
  getLatestMockResultController
);

export default router;
