import { AppError } from '../../middlewares/errorHandler.js';
import { codingStrategy } from './coding.strategy.js';
import { fillBlankStrategy } from './fillBlank.strategy.js';
import { mcqStrategy } from './mcq.strategy.js';

const gradingStrategies = {
  mcq: mcqStrategy,
  fill_blank: fillBlankStrategy,
  coding: codingStrategy,
};

/**
 * Động cơ chấm điểm trung tâm áp dụng Strategy Pattern.
 * Tách biệt hoàn toàn 3 luồng chấm: mcq, fill_blank và coding.
 */
export async function gradeQuestionByStrategy(question, submissionPayload) {
  if (!question || !question.type) {
    throw new AppError('Không xác định được định dạng câu hỏi để chấm điểm.', 400);
  }

  const strategy = gradingStrategies[question.type];
  if (!strategy) {
    throw new AppError(
      `Định dạng câu hỏi "${question.type}" chưa được hỗ trợ chấm tự động.`,
      400
    );
  }

  return strategy.evaluate(question, submissionPayload);
}
