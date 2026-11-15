import { z } from 'zod';
import {
  listAllQuestionsForAdmin,
  updateQuestionModerationStatus,
} from '../services/question.service.js';

export const moderateQuestionSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'rejected', 'pending'], {
      required_error: 'Trạng thái kiểm duyệt là bắt buộc.',
    }),
  }),
});

export async function getModerationQuestions(req, res, next) {
  try {
    const items = await listAllQuestionsForAdmin({
      status: req.query.status || 'All',
    });
    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    return next(err);
  }
}

export async function moderateQuestion(req, res, next) {
  try {
    const updated = await updateQuestionModerationStatus(
      req.params.questionId,
      req.body.status
    );
    return res.status(200).json({
      success: true,
      message: `Đã cập nhật trạng thái câu hỏi "${updated._id}" thành "${updated.status}".`,
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
}
