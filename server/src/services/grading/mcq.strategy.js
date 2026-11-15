/**
 * Chiến lược chấm điểm câu hỏi Trắc nghiệm (MCQ Strategy).
 */
export const mcqStrategy = {
  async evaluate(question, submissionPayload = {}) {
    const selectedIds = Array.isArray(submissionPayload.selectedIds)
      ? submissionPayload.selectedIds.map(String)
      : [];
    const correctOptionIds = Array.isArray(question.payload?.correctOptionIds)
      ? question.payload.correctOptionIds.map(String)
      : [];

    const sortedUser = [...new Set(selectedIds)].sort().join(',');
    const sortedCorrect = [...new Set(correctOptionIds)].sort().join(',');
    const isCorrect =
      selectedIds.length > 0 && sortedUser === sortedCorrect;

    return {
      type: 'mcq',
      isCorrect,
      status: isCorrect ? 'Accepted' : 'Wrong Answer',
      passedCount: isCorrect ? 1 : 0,
      totalCount: 1,
      runtimeMs: 2,
      correctOptionIds,
      explanation: question.explanation,
      message: isCorrect
        ? 'Chính xác! Bạn đã chọn đúng toàn bộ phương án.'
        : 'Chưa chính xác. Câu hỏi đã được cập nhật vào Hàng đợi Ôn tập Ngắt quãng.',
    };
  },
};
