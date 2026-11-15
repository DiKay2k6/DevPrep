import mongoose from 'mongoose';
import { AppError } from '../middlewares/errorHandler.js';
import { Article } from '../models/Article.model.js';
import { Question } from '../models/Question.model.js';
import { User } from '../models/User.model.js';

async function getUserProgressLists(userId) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return { completedArticleIds: [], solvedQuestionIds: [] };
  }
  const user = await User.findById(userId)
    .select('completedArticleIds solvedQuestionIds')
    .lean();
  return {
    completedArticleIds: user?.completedArticleIds || [],
    solvedQuestionIds: user?.solvedQuestionIds || [],
  };
}

export async function listArticles({
  level,
  category,
  skills,
  q,
  page = 1,
  limit = 20,
  userId = null,
}) {
  const filter = {};
  if (level && level !== 'All') {
    filter.level = level;
  }
  if (category && category !== 'All') {
    filter.category = category;
  }
  if (Array.isArray(skills) && skills.length > 0) {
    filter.tags = { $in: skills };
  }
  if (q && q.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    filter.$or = [{ title: regex }, { summary: regex }, { tags: regex }];
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const skip = (safePage - 1) * safeLimit;

  const [rawItems, total, { completedArticleIds }] = await Promise.all([
    Article.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Article.countDocuments(filter),
    getUserProgressLists(userId),
  ]);

  const items = rawItems.map((art) => ({
    ...art,
    isCompleted: completedArticleIds.includes(art._id),
  }));

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

export async function getArticleDetailBySlug(slug, userId = null) {
  const [article, { completedArticleIds, solvedQuestionIds }] =
    await Promise.all([
      Article.findOne({ slug }).lean(),
      getUserProgressLists(userId),
    ]);

  if (!article) {
    throw new AppError(`Không tìm thấy bài viết với slug "${slug}".`, 404);
  }

  // Lấy danh sách câu hỏi thực hành liên kết (BẮT BUỘC dùng Projection ẩn đáp án đúng)
  const rawQuestions = await Question.find({
    status: 'approved',
    $or: [
      { _id: { $in: article.questionIds || [] } },
      { relatedArticleId: article._id },
    ],
  })
    .select('-payload.correctOptionIds -payload.acceptedAnswers -explanation')
    .lean();

  const relatedQuestions = rawQuestions.map((q) => ({
    ...Question.sanitizeForClient(q),
    isSolved: solvedQuestionIds.includes(q._id),
  }));

  return {
    ...article,
    isCompleted: completedArticleIds.includes(article._id),
    relatedQuestions,
  };
}

export async function toggleUserCompletedArticle(userId, articleId) {
  const article = await Article.findById(articleId).lean();
  if (!article) {
    throw new AppError('Không tìm thấy bài học.', 404);
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('Không tìm thấy người dùng.', 404);
  }

  const exists = user.completedArticleIds.includes(articleId);
  if (exists) {
    user.completedArticleIds = user.completedArticleIds.filter(
      (id) => id !== articleId
    );
  } else {
    user.completedArticleIds.push(articleId);
  }
  await user.save();

  return {
    articleId,
    isCompleted: !exists,
    totalCompleted: user.completedArticleIds.length,
    completedArticleIds: user.completedArticleIds,
  };
}
