function normalizeAnswer(str, caseSensitive = false) {
  const normalized = String(str || '')
    .replace(/\r\n/g, '\n')
    .trim()
    .replace(/\s+/g, ' ');
  return caseSensitive ? normalized : normalized.toLowerCase();
}

/**
 * Chiến lược chấm điểm câu hỏi Điền đáp án / Dự đoán Output (Fill-Blank Strategy).
 */
export const fillBlankStrategy = {
  async evaluate(question, submissionPayload = {}) {
    const rawUserAnswer = String(
      submissionPayload.answerText ?? submissionPayload.text ?? ''
    );
    const caseSensitive = Boolean(question.payload?.caseSensitive);
    const acceptedAnswers = Array.isArray(question.payload?.acceptedAnswers)
      ? question.payload.acceptedAnswers
      : [];

    const normalizedUser = normalizeAnswer(rawUserAnswer, caseSensitive);
    const isCorrect =
      Boolean(normalizedUser) &&
      acceptedAnswers.some(
        (ans) => normalizeAnswer(ans, caseSensitive) === normalizedUser
      );

    return {
      type: 'fill_blank',
      isCorrect,
      status: isCorrect ? 'Accepted' : 'Wrong Answer',
      passedCount: isCorrect ? 1 : 0,
      totalCount: 1,
      runtimeMs: 3,
      userAnswer: rawUserAnswer.trim(),
      acceptedAnswers,
      explanation: question.explanation,
      message: isCorrect
        ? 'Accepted — Câu trả lời hoàn toàn khớp với đáp án chuẩn!'
        : 'Wrong Answer — Kết quả chưa khớp với tập đáp án được chấp nhận.',
    };
  },
};
