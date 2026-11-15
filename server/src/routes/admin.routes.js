import { Router } from 'express';
import {
  getModerationQuestions,
  moderateQuestion,
  moderateQuestionSchema,
} from '../controllers/admin.controller.js';
import {
  authorizeRoles,
  verifyJWT,
} from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('admin'));

router.get('/questions', getModerationQuestions);

router.patch(
  '/questions/:questionId/status',
  validateRequest(moderateQuestionSchema),
  moderateQuestion
);

export default router;
