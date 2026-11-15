import mongoose from 'mongoose';
import { AppError } from '../middlewares/errorHandler.js';
import { Article } from '../models/Article.model.js';
import { Question } from '../models/Question.model.js';
import { ReviewQueue } from '../models/ReviewQueue.model.js';
import { User } from '../models/User.model.js';

const ANTI_CHEAT_PROJECTION =
  '-payload.correctOptionIds -payload.acceptedAnswers -explanation';

async function getSolvedQuestionIdsForUser(userId) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return [];
  }
  const user = await User.findById(userId).select('solvedQuestionIds').lean();
  return user?.solvedQuestionIds || [];
}

export async function listQuestionsForPractice({
  level,
  category,
  type,
  skills,
  articleId,
  q,
  page = 1,
  limit = 50,
  userId = null,
}) {
  // Tận dụng Compound Index: { status: 1, level: 1, category: 1, tags: 1 }
  const filter = { status: 'approved' };

  if (level && level !== 'All') {
    filter.level = level;
  }
  if (category && category !== 'All') {
    filter.category = category;
  }
  if (type && type !== 'All') {
    filter.type = type;
  }
  if (Array.isArray(skills) && skills.length > 0) {
    filter.tags = { $in: skills };
  }

  const andConditions = [];

  if (articleId) {
    const linkedArticle = await Article.findById(articleId)
      .select('questionIds')
      .lean();
    andConditions.push({
      $or: [
        { relatedArticleId: articleId },
        { _id: { $in: linkedArticle?.questionIds || [] } },
      ],
    });
  }

  if (q && q.trim()) {
    const regex = new RegExp(q.trim(), 'i');
    andConditions.push({
      $or: [{ title: regex }, { prompt: regex }, { tags: regex }],
    });
  }

  if (andConditions.length === 1) {
    Object.assign(filter, andConditions[0]);
  } else if (andConditions.length > 1) {
    filter.$and = andConditions;
  }

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));
  const skip = (safePage - 1) * safeLimit;

  const [rawItems, total, solvedIds] = await Promise.all([
    Question.find(filter)
      .select(ANTI_CHEAT_PROJECTION)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Question.countDocuments(filter),
    getSolvedQuestionIdsForUser(userId),
  ]);

  const items = rawItems.map((doc) => ({
    ...Question.sanitizeForClient(doc),
    isSolved: solvedIds.includes(doc._id),
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

export async function getQuestionDetailForPractice(questionId, userId = null) {
  const [rawQuestion, approvedList, solvedIds, bookmarkedDoc] =
    await Promise.all([
      Question.findOne({
        _id: questionId,
        status: 'approved',
      })
        .select(ANTI_CHEAT_PROJECTION)
        .lean(),
      Question.find({ status: 'approved' })
        .select('_id title level category')
        .sort({ createdAt: 1 })
        .lean(),
      getSolvedQuestionIdsForUser(userId),
      userId && mongoose.Types.ObjectId.isValid(userId)
        ? ReviewQueue.findOne({ userId, questionId }).select('_id').lean()
        : null,
    ]);

  if (!rawQuestion) {
    throw new AppError('Không tìm thấy câu hỏi luyện tập.', 404);
  }

  const sanitized = Question.sanitizeForClient(rawQuestion);
  const question = {
    ...sanitized,
    isSolved: solvedIds.includes(sanitized._id),
  };

  const currentIndex = Math.max(
    0,
    approvedList.findIndex((item) => item._id === question._id)
  );
  const prevQuestion = currentIndex > 0 ? approvedList[currentIndex - 1] : null;
  const nextQuestion =
    currentIndex < approvedList.length - 1
      ? approvedList[currentIndex + 1]
      : null;

  const relatedArticle = question.relatedArticleId
    ? await Article.findById(question.relatedArticleId)
        .select('_id title slug level category')
        .lean()
    : null;

  return {
    question,
    currentIndex,
    totalApproved: approvedList.length,
    prevQuestion,
    nextQuestion,
    relatedArticle,
    isBookmarked: Boolean(bookmarkedDoc),
  };
}

export async function createContributedQuestion(user, payloadData) {
  const customId =
    payloadData._id || `q_${payloadData.type}_${Date.now().toString(36)}`;

  const created = await Question.create({
    ...payloadData,
    _id: customId,
    status: user.role === 'admin' ? 'approved' : 'pending',
    submittedBy: user.email,
    submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
  });

  return Question.sanitizeForClient(created);
}

export async function listAllQuestionsForAdmin({ status = 'All' } = {}) {
  const filter = {};
  if (status && status !== 'All') {
    filter.status = status;
  }
  return Question.find(filter).sort({ createdAt: -1 }).lean();
}

export async function updateQuestionModerationStatus(questionId, status) {
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    throw new AppError('Trạng thái kiểm duyệt không hợp lệ.', 400);
  }

  const updated = await Question.findByIdAndUpdate(
    questionId,
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new AppError('Không tìm thấy câu hỏi cần kiểm duyệt.', 404);
  }
  return updated;
}
