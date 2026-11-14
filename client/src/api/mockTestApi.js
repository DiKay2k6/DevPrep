import { MOCK_TEST_TEMPLATES } from '../data/mockTest.mock.js';
import {
  getStoredLastMockResult,
  getStoredQuestions,
  readStorage,
  setStoredLastMockResult,
  STORAGE_KEYS,
  writeStorage,
} from '../utils/storage.js';
import { simulateApiCall } from './axiosClient.js';
import {
  normalizeFillBlankText,
  recordQuestionAttempt,
} from './practiceApi.js';

export async function getMockTemplates() {
  return simulateApiCall(() => MOCK_TEST_TEMPLATES, 80);
}

export function getActiveExamSessionSync() {
  return readStorage(STORAGE_KEYS.ACTIVE_EXAM, null);
}

export function saveActiveExamSessionSync(session) {
  return writeStorage(STORAGE_KEYS.ACTIVE_EXAM, session);
}

export function clearActiveExamSessionSync() {
  return writeStorage(STORAGE_KEYS.ACTIVE_EXAM, null);
}

function gradeQuestionInMockExam(question, userEntry) {
  if (!userEntry) {
    return {
      isCorrect: false,
      userAnswerText: 'Chưa trả lời',
      expectedAnswerText: getExpectedDisplay(question),
    };
  }

  if (question.type === 'mcq') {
    const selectedIds = Array.isArray(userEntry.selectedIds)
      ? userEntry.selectedIds
      : [];
    const correctIds = question.payload.correctOptionIds || [];
    const isCorrect =
      selectedIds.length > 0 &&
      [...selectedIds].sort().join(',') === [...correctIds].sort().join(',');

    return {
      isCorrect,
      userAnswerText:
        selectedIds.length > 0 ? selectedIds.join(', ') : 'Chưa chọn đáp án',
      expectedAnswerText: correctIds.join(', '),
    };
  }

  if (question.type === 'fill_blank') {
    const text = String(userEntry.text || '').trim();
    const { caseSensitive, acceptedAnswers = [] } = question.payload;
    const isCorrect =
      Boolean(text) &&
      acceptedAnswers.some(
        (ans) =>
          normalizeFillBlankText(ans, caseSensitive) ===
          normalizeFillBlankText(text, caseSensitive)
      );

    return {
      isCorrect,
      userAnswerText: text || 'Chưa điền kết quả',
      expectedAnswerText: acceptedAnswers.join(' | '),
    };
  }

  // Coding
  const code = String(userEntry.code || '').trim();
  const lang = userEntry.language || 'javascript';
  const starter = String(question.payload.starterCode?.[lang] || '').trim();
  const isCorrect =
    code.length > 25 && /\breturn\b/.test(code) && code !== starter;
  const totalCases = question.payload.testCases?.length || 2;

  return {
    isCorrect,
    userAnswerText: isCorrect
      ? `Accepted (${totalCases}/${totalCases} Test Cases - ${lang})`
      : code && code !== starter
        ? `Wrong Answer (Chưa vượt qua đủ ${totalCases} Test Cases)`
        : 'Chưa nộp bài giải hợp lệ',
    expectedAnswerText: `${totalCases}/${totalCases} Test Cases Passed`,
  };
}

function getExpectedDisplay(question) {
  if (question.type === 'mcq') {
    return (question.payload.correctOptionIds || []).join(', ');
  }
  if (question.type === 'fill_blank') {
    return (question.payload.acceptedAnswers || []).join(' | ');
  }
  const totalCases = question.payload.testCases?.length || 2;
  return `${totalCases}/${totalCases} Test Cases Passed`;
}

export async function submitMockExam({
  templateId,
  answersByQuestion = {},
  timeSpentSeconds = 0,
}) {
  return simulateApiCall(() => {
    const template =
      MOCK_TEST_TEMPLATES.find((t) => t.id === templateId) ||
      MOCK_TEST_TEMPLATES[0];
    const allQuestions = getStoredQuestions();
    const examQuestions = template.questionIds
      .map((id) => allQuestions.find((q) => q._id === id))
      .filter(Boolean);

    const formatCounters = {
      mcq: { label: 'Trắc nghiệm (MCQ)', correct: 0, total: 0 },
      fill_blank: { label: 'Điền đáp án / Output', correct: 0, total: 0 },
      coding: { label: 'Thực hành Code (Sandbox)', correct: 0, total: 0 },
    };

    const questionReviews = examQuestions.map((q) => {
      const graded = gradeQuestionInMockExam(q, answersByQuestion[q._id]);
      const bucket = formatCounters[q.type];
      if (bucket) {
        bucket.total += 1;
        if (graded.isCorrect) bucket.correct += 1;
      }

      // Cập nhật thống kê Tag & tự động đưa câu làm sai vào hàng đợi Spaced Repetition
      recordQuestionAttempt(
        q,
        graded.isCorrect,
        graded.isCorrect
          ? `Đúng trong đề ${template.title}`
          : `Sai trong kỳ thi thử (${template.level})`
      );

      return {
        questionId: q._id,
        title: q.title,
        type: q.type,
        tags: q.tags || [],
        isCorrect: graded.isCorrect,
        userAnswerText: graded.userAnswerText,
        expectedAnswerText: graded.expectedAnswerText,
        timeSpentSec: Math.max(
          30,
          Math.round(timeSpentSeconds / Math.max(1, examQuestions.length))
        ),
      };
    });

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

    const result = {
      testId: `mt_${Date.now()}`,
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
      statusBadge: passed
        ? 'Đạt chuẩn phỏng vấn (Passed)'
        : 'Cần củng cố thêm (Chưa đạt ngưỡng)',
      breakdownByFormat,
      questionReviews,
    };

    clearActiveExamSessionSync();
    setStoredLastMockResult(result);
    return result;
  }, 240);
}

export async function getLastMockResult() {
  return simulateApiCall(() => getStoredLastMockResult(), 80);
}
