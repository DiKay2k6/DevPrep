import { z } from 'zod';
import {
  advanceUserReviewStage,
  getAnalyticsDashboardData,
  getLatestMockTestResult,
  getMockTestSessionByTemplateId,
  listMockTestTemplates,
  runPracticeCodePreview,
  submitMockTestExam,
  submitPracticeAnswer,
  toggleUserReviewBookmark,
} from '../services/practice.service.js';

export const runCodeSchema = z.object({
  body: z.object({
    questionId: z
      .string({ required_error: 'Mã câu hỏi là bắt buộc.' })
      .trim()
      .min(1),
    language: z.enum(['javascript', 'python', 'java', 'cpp']),
    code: z
      .string({ required_error: 'Mã nguồn không được để trống.' })
      .min(1, 'Vui lòng nhập mã nguồn trước khi chạy thử.'),
  }),
});

export const submitAnswerSchema = z.object({
  body: z.object({
    questionId: z
      .string({ required_error: 'Mã câu hỏi là bắt buộc.' })
      .trim()
      .min(1),
    selectedIds: z.array(z.string()).optional(),
    answerText: z.string().optional(),
    language: z.enum(['javascript', 'python', 'java', 'cpp']).optional(),
    code: z.string().optional(),
  }),
});

export const bookmarkQuestionSchema = z.object({
  body: z.object({
    questionId: z
      .string({ required_error: 'Mã câu hỏi là bắt buộc.' })
      .trim()
      .min(1),
  }),
});

export const submitMockExamSchema = z.object({
  body: z.object({
    templateId: z
      .string({ required_error: 'Mã đề thi thử là bắt buộc.' })
      .trim()
      .min(1),
    answersByQuestion: z.record(z.any()).optional().default({}),
    timeSpentSeconds: z.number().nonnegative().optional().default(0),
  }),
});

export async function runCode(req, res, next) {
  try {
    const result = await runPracticeCodePreview(req.body);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

export async function submitAnswer(req, res, next) {
  try {
    const { questionId, ...submissionPayload } = req.body;
    const result = await submitPracticeAnswer({
      userId: req.user?.id || null,
      questionId,
      submissionPayload,
    });

    return res.status(200).json({
      success: true,
      message: result.isCorrect
        ? 'Chính xác! Kết quả đã được ghi nhận.'
        : 'Chưa chính xác. Hệ thống đã cập nhật giải thích và lịch ôn tập.',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

export async function toggleBookmark(req, res, next) {
  try {
    const result = await toggleUserReviewBookmark(
      req.user.id,
      req.body.questionId
    );
    return res.status(200).json({
      success: true,
      message: result.bookmarked
        ? 'Đã ghim câu hỏi vào Hàng đợi Ôn tập Ngắt quãng.'
        : 'Đã gỡ câu hỏi khỏi hàng đợi ôn tập.',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getAnalytics(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const dashboardData = await getAnalyticsDashboardData(userId);

    return res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (err) {
    return next(err);
  }
}

export async function advanceReviewStage(req, res, next) {
  try {
    const result = await advanceUserReviewStage(
      req.user.id,
      req.params.reviewId
    );
    return res.status(200).json({
      success: true,
      message: result.completedAllStages
        ? 'Chúc mừng! Bạn đã hoàn tất toàn bộ chu kỳ ôn tập ngắt quãng cho câu hỏi này.'
        : 'Đã chuyển sang chu kỳ ôn tập ngắt quãng tiếp theo.',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getMockTemplates(_req, res, next) {
  try {
    const templates = await listMockTestTemplates();
    return res.status(200).json({
      success: true,
      data: templates,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getMockExamSession(req, res, next) {
  try {
    const session = await getMockTestSessionByTemplateId(req.params.templateId);
    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    return next(err);
  }
}

export async function submitMockExamController(req, res, next) {
  try {
    const result = await submitMockTestExam({
      userId: req.user?.id || null,
      templateId: req.body.templateId,
      answersByQuestion: req.body.answersByQuestion,
      timeSpentSeconds: req.body.timeSpentSeconds,
    });
    return res.status(200).json({
      success: true,
      message: 'Đã chấm điểm và lưu kết quả kỳ thi thử.',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getLatestMockResultController(req, res, next) {
  try {
    const result = await getLatestMockTestResult(req.user?.id || null);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}
