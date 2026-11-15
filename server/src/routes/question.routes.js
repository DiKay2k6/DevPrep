import { Router } from 'express';
import {
  contributeQuestion,
  createQuestionSchema,
  getQuestionById,
  getQuestions,
} from '../controllers/question.controller.js';
import {
  optionalVerifyJWT,
  verifyJWT,
} from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

router.get('/', optionalVerifyJWT, getQuestions);
router.get('/:questionId', optionalVerifyJWT, getQuestionById);
router.post(
  '/',
  verifyJWT,
  validateRequest(createQuestionSchema),
  contributeQuestion
);

export default router;
