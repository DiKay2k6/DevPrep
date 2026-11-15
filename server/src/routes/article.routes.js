import { Router } from 'express';
import {
  getArticleBySlug,
  getArticles,
  toggleCompleteArticle,
} from '../controllers/article.controller.js';
import {
  optionalVerifyJWT,
  verifyJWT,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', optionalVerifyJWT, getArticles);
router.get('/:slug', optionalVerifyJWT, getArticleBySlug);
router.post('/:articleId/complete', verifyJWT, toggleCompleteArticle);

export default router;
