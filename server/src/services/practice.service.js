import mongoose from 'mongoose';
import { AppError } from '../middlewares/errorHandler.js';
import { Article } from '../models/Article.model.js';
import { MockTest } from '../models/MockTest.model.js';
import { Question } from '../models/Question.model.js';
import { ReviewQueue } from '../models/ReviewQueue.model.js';
import { Submission } from '../models/Submission.model.js';
import { User } from '../models/User.model.js';
import { gradeQuestionByStrategy } from './grading/index.js';

const SPACED_INTERVALS = [1, 3, 7, 14];

export const MOCK_EXAM_TEMPLATES = [
  {
    id: 'tpl_fresher_frontend',
    title: 'Đề Thi Thử Chuẩn Đầu Ra Fresher Frontend (JS & React)',
    level: 'Fresher',
    track: 'Frontend',
    durationMinutes: 30,
    totalQuestions: 5,
    passingScore: 70,
    structureSummary: '2 câu MCQ + 2 câu Dự đoán Output + 1 bài Thuật toán Coding',
    questionIds: [
      'q_mcq_event_loop_01',
      'q_fill_event_loop_02',
      'q_fill_mongo_select_04',
      'q_coding_two_sum_07',
      'q_coding_longest_substr_08',
    ],
  },
  {
    id: 'tpl_junior_fullstack',
    title: 'Đề Sát Hạch Kỹ Sư Junior Full-stack MERN',
    level: 'Junior',
    track: 'Full-stack',
    durationMinutes: 45,
    totalQuestions: 6,
    passingScore: 75,
    structureSummary:
      '3 câu MCQ Kiến trúc/DB + 1 câu Fill-blank Bảo mật + 2 bài Coding O(n)',
    questionIds: [
      'q_mcq_event_loop_01',
      'q_mcq_mongo_esr_03',
      'q_fill_mongo_select_04',
      'q_mcq_jwt_security_05',
      'q_coding_two_sum_07',
      'q_coding_longest_substr_08',
    ],
  },
  {
    id: 'tpl_middle_backend',
    title: 'Đề Phỏng Vấn Chuyên Sâu Middle Backend & Database',
    level: 'Middle',
    track: 'Backend',
    durationMinutes: 45,
    totalQuestions: 5,
    passingScore: 80,
    structureSummary:
      'Tập trung vào Compound Index ESR, Strategy Pattern, JWT Security & Sliding Window',
    questionIds: [
      'q_mcq_mongo_esr_03',
      'q_fill_mongo_select_04',
      'q_mcq_jwt_security_05',
      'q_mcq_strategy_pattern_09',
      'q_coding_longest_substr_08',
    ],
  },
];

function serializeReviewItem(doc) {
  const nextReview = doc.nextReviewAt ? new Date(doc.nextReviewAt) : new Date();
  const diffMs = nextReview.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  const dueStatus =
    diffDays <= 0 ? 'Đến hạn hôm nay' : `Còn ${diffDays} ngày nữa`;

  return {
    id: String(doc._id),
    _id: String(doc._id),
    questionId: doc.questionId,
    title: doc.title,
    type: doc.type,
    level: doc.level,
    category: doc.category,
    tags: doc.tags || [],
    currentStage: doc.currentStage || 1,
    intervalDays: doc.intervalDays || 1,
    cycleLabel: `Chu kỳ ${doc.intervalDays || 1} ngày`,
    dueStatus,
    lastAttemptResult: doc.lastAttemptResult || 'Đến hạn ôn tập',
  };
}

/**
 * Chạy thử code với Sample Test Cases công khai (mode = 'run').
 */
export async function runPracticeCodePreview({ questionId, language, code }) {
  const question = await Question.findById(questionId).lean();
  if (!question || question.type !== 'coding') {
    throw new AppError('Không tìm thấy bài tập lập trình hợp lệ.', 404);
  }

  return gradeQuestionByStrategy(question, {
    language,
    code,
    mode: 'run',
  });
}

/**
 * Nộp bài và chấm điểm tự động cho cả 3 định dạng (mcq, fill_blank, coding) tại Server.
 * Nếu làm sai, tự động đưa vào hàng đợi Spaced Repetition (chu kỳ 1 ngày).
 */
export async function submitPracticeAnswer({
  userId,
  questionId,
  submissionPayload,
}) {
  const question = await Question.findById(questionId).lean();
  if (!question) {
    throw new AppError('Không tìm thấy câu hỏi.', 404);
  }

  const gradeResult = await gradeQuestionByStrategy(question, {
    ...submissionPayload,
    mode: 'submit',
  });

  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    await Submission.create({
      userId,
      questionId: question._id,
      type: question.type,
      language: submissionPayload.language || null,
      submittedAnswer:
        submissionPayload.selectedIds ||
        submissionPayload.answerText ||
        submissionPayload.code ||
        '',
      isCorrect: gradeResult.isCorrect,
      status: gradeResult.status,
      passedCount: gradeResult.passedCount,
      totalCount: gradeResult.totalCount,
      runtimeMs: gradeResult.totalTimeMs || gradeResult.runtimeMs || 0,
    });

    if (gradeResult.isCorrect) {
      await User.findByIdAndUpdate(userId, {
        $addToSet: { solvedQuestionIds: question._id },
      });
    } else {
      const nextReviewAt = new Date();
      await ReviewQueue.findOneAndUpdate(
        { userId, questionId: question._id },
        {
          $set: {
            title: question.title,
            type: question.type,
            level: question.level,
            category: question.category,
            tags: question.tags || [],
            currentStage: 1,
            intervalDays: 1,
            nextReviewAt,
            lastAttemptResult: `${gradeResult.status} (${gradeResult.passedCount}/${gradeResult.totalCount})`,
          },
        },
        { upsert: true, new: true }
      );
    }
  }

  return gradeResult;
}

/**
 * Ghim hoặc gỡ câu hỏi trong hàng đợi Ôn tập Ngắt quãng (ReviewQueue) trên MongoDB.
 */
export async function toggleUserReviewBookmark(userId, questionId) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError('Vui lòng đăng nhập để lưu câu hỏi ôn tập.', 401);
  }

  const question = await Question.findById(questionId).lean();
  if (!question) {
    throw new AppError('Không tìm thấy câu hỏi.', 404);
  }

  const existing = await ReviewQueue.findOne({ userId, questionId });
  if (existing) {
    await ReviewQueue.deleteOne({ _id: existing._id });
    const queue = await listUserReviewQueue(userId);
    return { bookmarked: false, queue };
  }

  await ReviewQueue.create({
    userId,
    questionId: question._id,
    title: question.title,
    type: question.type,
    level: question.level,
    category: question.category,
    tags: question.tags || [],
    currentStage: 1,
    intervalDays: 1,
    nextReviewAt: new Date(),
    lastAttemptResult: 'Đã ghim ôn tập lại',
  });

  const queue = await listUserReviewQueue(userId);
  return { bookmarked: true, queue };
}

/**
 * Thống kê lỗ hổng kiến thức theo Tag bằng MongoDB Aggregation Pipeline
 * (Đẩy tính toán xuống tầng Database thay vì lặp thủ công trên Express).
 */
export async function aggregateUserKnowledgeGap(userId) {
  const matchStage =
    userId && mongoose.Types.ObjectId.isValid(userId)
      ? { userId: new mongoose.Types.ObjectId(userId) }
      : {};

  const tagStats = await Submission.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'questions',
        localField: 'questionId',
        foreignField: '_id',
        as: 'questionDoc',
      },
    },
    { $unwind: '$questionDoc' },
    { $unwind: '$questionDoc.tags' },
    {
      $group: {
        _id: '$questionDoc.tags',
        category: { $first: '$questionDoc.category' },
        attempts: { $sum: 1 },
        correctCount: {
          $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        tag: '$_id',
        category: 1,
        attempts: 1,
        accuracy: {
          $round: [
            { $multiply: [{ $divide: ['$correctCount', '$attempts'] }, 100] },
            0,
          ],
        },
      },
    },
    { $sort: { accuracy: 1 } },
  ]);

  const articles = await Article.find()
    .select('title slug tags category')
    .lean();

  return tagStats.map((item) => {
    const matchedArticle =
      articles.find((a) =>
        (a.tags || []).some((t) => t.toLowerCase() === item.tag.toLowerCase())
      ) || articles[0];
    return {
      ...item,
      status:
        item.accuracy < 50
          ? 'Cần ôn gấp'
          : item.accuracy < 65
            ? 'Cần củng cố'
            : item.accuracy < 80
              ? 'Vững'
              : 'Thành thạo',
      recommendedArticleSlug: matchedArticle?.slug || '',
      recommendedArticleTitle: matchedArticle?.title || '',
    };
  });
}

export async function aggregateUserFormatStats(userId) {
  const matchStage =
    userId && mongoose.Types.ObjectId.isValid(userId)
      ? { userId: new mongoose.Types.ObjectId(userId) }
      : {};

  const rawByType = await Submission.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$type',
        attempts: { $sum: 1 },
        correctCount: {
          $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] },
        },
      },
    },
  ]);

  const mapByType = new Map(rawByType.map((item) => [item._id, item]));
  const definitions = [
    { type: 'mcq', name: 'Trắc nghiệm (MCQ)' },
    { type: 'fill_blank', name: 'Điền Output (Fill-blank)' },
    { type: 'coding', name: 'Thực hành Code (Coding)' },
  ];

  return definitions.map(({ type, name }) => {
    const entry = mapByType.get(type);
    const attempts = entry?.attempts || 0;
    const correctCount = entry?.correctCount || 0;
    const accuracy =
      attempts > 0 ? Math.round((correctCount / attempts) * 100) : 0;
    return {
      name,
      accuracy,
      solved: correctCount,
    };
  });
}

export async function listUserReviewQueue(userId) {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return [];
  }
  const docs = await ReviewQueue.find({ userId })
    .sort({ nextReviewAt: 1 })
    .lean();
  return docs.map(serializeReviewItem);
}

export async function getAnalyticsDashboardData(userId) {
  const [tagStats, formatStats, reviewQueue, userDoc] = await Promise.all([
    aggregateUserKnowledgeGap(userId),
    aggregateUserFormatStats(userId),
    listUserReviewQueue(userId),
    userId && mongoose.Types.ObjectId.isValid(userId)
      ? User.findById(userId)
          .select('solvedQuestionIds completedArticleIds')
          .lean()
      : null,
  ]);

  return {
    tagStats,
    tagMastery: tagStats,
    formatStats,
    reviewQueue,
    solvedCount: (userDoc?.solvedQuestionIds || []).length,
    completedArticlesCount: (userDoc?.completedArticleIds || []).length,
  };
}

export async function advanceUserReviewStage(userId, reviewId) {
  const item = await ReviewQueue.findOne({ _id: reviewId, userId });
  if (!item) {
    throw new AppError('Không tìm thấy mục ôn tập trong hàng đợi.', 404);
  }

  if (item.currentStage >= SPACED_INTERVALS.length) {
    await ReviewQueue.deleteOne({ _id: item._id });
    const queue = await listUserReviewQueue(userId);
    return {
      completedAllStages: true,
      item: serializeReviewItem(item),
      queue,
    };
  }

  const nextStage = item.currentStage + 1;
  const nextDays = SPACED_INTERVALS[nextStage - 1];
  item.currentStage = nextStage;
  item.intervalDays = nextDays;
  item.nextReviewAt = new Date(Date.now() + nextDays * 24 * 60 * 60 * 1000);
  item.lastAttemptResult = `Đã hoàn thành ôn tập chu kỳ ${nextDays} ngày`;
  await item.save();

  const queue = await listUserReviewQueue(userId);
  return {
    completedAllStages: false,
    item: serializeReviewItem(item),
    queue,
  };
}

export async function listMockTestTemplates() {
  return MOCK_EXAM_TEMPLATES;
}

export async function getMockTestSessionByTemplateId(templateId) {
  const template =
    MOCK_EXAM_TEMPLATES.find((t) => t.id === templateId) ||
    MOCK_EXAM_TEMPLATES[0];

  const rawQuestions = await Question.find({
    _id: { $in: template.questionIds },
    status: 'approved',
  })
    .select('-payload.correctOptionIds -payload.acceptedAnswers -explanation')
    .lean();

  const byId = new Map(
    rawQuestions.map((q) => [q._id, Question.sanitizeForClient(q)])
  );
  const questions = template.questionIds
    .map((id) => byId.get(id))
    .filter(Boolean);

  return {
    template: {
      ...template,
      totalQuestions: questions.length,
    },
    questions,
  };
}

function getExpectedAnswerText(question) {
  if (question.type === 'mcq') {
    return (question.payload?.correctOptionIds || []).join(', ');
  }
  if (question.type === 'fill_blank') {
    return (question.payload?.acceptedAnswers || []).join(' | ');
  }
  const totalCases = question.payload?.testCases?.length || 2;
  return `${totalCases}/${totalCases} Test Cases Passed`;
}

function formatUserAnswerDisplay(question, userEntry, gradeResult) {
  if (!userEntry) return 'Chưa trả lời';
  if (question.type === 'mcq') {
    const ids = userEntry.selectedIds || [];
    return ids.length > 0 ? ids.join(', ') : 'Chưa chọn đáp án';
  }
  if (question.type === 'fill_blank') {
    return String(userEntry.text || userEntry.answerText || '').trim() || 'Chưa điền kết quả';
  }
  const lang = userEntry.language || 'javascript';
  return `${gradeResult.status} (${gradeResult.passedCount}/${gradeResult.totalCount} Test Cases - ${lang})`;
}

export async function submitMockTestExam({
  userId,
  templateId,
  answersByQuestion = {},
  timeSpentSeconds = 0,
}) {
  const template =
    MOCK_EXAM_TEMPLATES.find((t) => t.id === templateId) ||
    MOCK_EXAM_TEMPLATES[0];

  const rawQuestions = await Question.find({
    _id: { $in: template.questionIds },
  }).lean();
  const byId = new Map(rawQuestions.map((q) => [q._id, q]));
  const examQuestions = template.questionIds
    .map((id) => byId.get(id))
    .filter(Boolean);

  const formatCounters = {
    mcq: { label: 'Trắc nghiệm (MCQ)', correct: 0, total: 0 },
    fill_blank: { label: 'Điền đáp án / Output', correct: 0, total: 0 },
    coding: { label: 'Thực hành Code (Sandbox)', correct: 0, total: 0 },
  };

  const questionReviews = [];

  for (const q of examQuestions) {
    const userEntry = answersByQuestion[q._id] || {};
    const gradeResult = await submitPracticeAnswer({
      userId,
      questionId: q._id,
      submissionPayload: {
        selectedIds: userEntry.selectedIds,
        answerText: userEntry.text ?? userEntry.answerText,
        language: userEntry.language,
        code: userEntry.code,
      },
    });

    const bucket = formatCounters[q.type];
    if (bucket) {
      bucket.total += 1;
      if (gradeResult.isCorrect) bucket.correct += 1;
    }

    questionReviews.push({
      questionId: q._id,
      title: q.title,
      type: q.type,
      tags: q.tags || [],
      isCorrect: gradeResult.isCorrect,
      userAnswerText: formatUserAnswerDisplay(q, answersByQuestion[q._id], gradeResult),
      expectedAnswerText: getExpectedAnswerText(q),
      timeSpentSec: Math.max(
        15,
        Math.round(timeSpentSeconds / Math.max(1, examQuestions.length))
      ),
    });
  }

  const correctCount = questionReviews.filter((r) => r.isCorrect).length;
  const totalQuestions = Math.max(1, questionReviews.length);
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const passed = scorePercent >= (template.passingScore || 70);

  const breakdownByFormat = Object.values(formatCounters)
    .filter((b) => b.total > 0)
    .map((b) => ({
      format: b.label,
      correct: b.correct,
      total: b.total,
      accuracy: Math.round((b.correct / b.total) * 100),
    }));

  const statusBadge = passed
    ? 'Đạt chuẩn phỏng vấn (Passed)'
    : 'Cần củng cố thêm (Chưa đạt ngưỡng)';

  let savedDoc = null;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    savedDoc = await MockTest.create({
      userId,
      templateId: template.id,
      templateTitle: template.title,
      level: template.level,
      track: template.track,
      durationMinutes: template.durationMinutes,
      timeSpentSeconds: Math.max(1, timeSpentSeconds),
      scorePercent,
      correctCount,
      totalQuestions,
      passingScore: template.passingScore || 70,
      statusBadge,
      breakdownByFormat,
      questionReviews,
    });
  }

  return {
    testId: savedDoc ? String(savedDoc._id) : `mt_${Date.now()}`,
    templateId: template.id,
    templateTitle: template.title,
    level: template.level,
    track: template.track,
    passingScore: template.passingScore || 70,
    completedAt: new Date().toLocaleString('vi-VN'),
    durationMinutes: template.durationMinutes,
    timeSpentSeconds: Math.max(1, timeSpentSeconds),
    scorePercent,
    correctCount,
    totalQuestions,
    statusBadge,
    breakdownByFormat,
    questionReviews,
  };
}

export async function getLatestMockTestResult(userId) {
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    const latest = await MockTest.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();
    if (latest) {
      return {
        testId: String(latest._id),
        templateId: latest.templateId,
        templateTitle: latest.templateTitle,
        level: latest.level,
        track: latest.track,
        passingScore: latest.passingScore || 70,
        completedAt: new Date(latest.createdAt).toLocaleString('vi-VN'),
        durationMinutes: latest.durationMinutes,
        timeSpentSeconds: latest.timeSpentSeconds,
        scorePercent: latest.scorePercent,
        correctCount: latest.correctCount,
        totalQuestions: latest.totalQuestions,
        statusBadge: latest.statusBadge,
        breakdownByFormat: latest.breakdownByFormat || [],
        questionReviews: latest.questionReviews || [],
      };
    }
  }
  return null;
}
