import {
  findRecommendedArticleForTag,
  getSolvedQuestionIds,
  getStoredFormatStats,
  getStoredQuestions,
  getStoredReviewQueue,
  getStoredTagStats,
  readStorage,
  setSolvedQuestionIds,
  setStoredFormatStats,
  setStoredReviewQueue,
  setStoredTagStats,
  STORAGE_KEYS,
  writeStorage,
} from '../utils/storage.js';
import { simulateApiCall } from './axiosClient.js';

export function getCodeDraftsForQuestion(questionId, starterCode = {}) {
  const allDrafts = readStorage(STORAGE_KEYS.CODE_DRAFTS, {});
  const questionDrafts = allDrafts[questionId] || {};
  return {
    ...starterCode,
    ...questionDrafts,
  };
}

export function saveCodeDraftForQuestion(questionId, language, code) {
  const allDrafts = readStorage(STORAGE_KEYS.CODE_DRAFTS, {});
  const nextForQuestion = {
    ...(allDrafts[questionId] || {}),
    [language]: code,
  };
  writeStorage(STORAGE_KEYS.CODE_DRAFTS, {
    ...allDrafts,
    [questionId]: nextForQuestion,
  });
}

export function resetCodeDraftForQuestion(
  questionId,
  language,
  starterCode = {}
) {
  const defaultCode = starterCode[language] || '';
  saveCodeDraftForQuestion(questionId, language, defaultCode);
  return defaultCode;
}

export function normalizeFillBlankText(str, caseSensitive = false) {
  const trimmed = String(str || '').trim().replace(/\s+/g, ' ');
  return caseSensitive ? trimmed : trimmed.toLowerCase();
}

export function recordQuestionAttempt(question, isCorrect, resultDetailLabel) {
  if (!question) return;

  // 1. Cập nhật danh sách câu hỏi đã giải đúng
  if (isCorrect) {
    const solved = getSolvedQuestionIds();
    if (!solved.includes(question._id)) {
      setSolvedQuestionIds([...solved, question._id]);
    }
  }

  // 2. Cập nhật độ chính xác theo từng Tag kỹ năng
  const tagStats = getStoredTagStats();
  const updatedTags = [...tagStats];

  for (const tag of question.tags || []) {
    const idx = updatedTags.findIndex(
      (item) => item.tag.toLowerCase() === tag.toLowerCase()
    );
    if (idx >= 0) {
      const current = updatedTags[idx];
      const prevCorrect = Math.round((current.accuracy / 100) * current.attempts);
      const nextAttempts = current.attempts + 1;
      const nextCorrect = prevCorrect + (isCorrect ? 1 : 0);
      const nextAccuracy = Math.max(
        15,
        Math.min(100, Math.round((nextCorrect / nextAttempts) * 100))
      );
      updatedTags[idx] = {
        ...current,
        attempts: nextAttempts,
        accuracy: nextAccuracy,
        status:
          nextAccuracy < 50
            ? 'Cần ôn gấp'
            : nextAccuracy < 65
              ? 'Cần củng cố'
              : nextAccuracy < 80
                ? 'Vững'
                : 'Thành thạo',
      };
    } else {
      const rec = findRecommendedArticleForTag(tag);
      const acc = isCorrect ? 85 : 45;
      updatedTags.push({
        tag,
        category: question.category,
        accuracy: acc,
        attempts: 1,
        status: isCorrect ? 'Vững' : 'Cần ôn gấp',
        recommendedArticleSlug: rec.slug,
        recommendedArticleTitle: rec.title,
      });
    }
  }
  setStoredTagStats(updatedTags);

  // 3. Cập nhật thống kê theo định dạng câu hỏi
  const formatStats = getStoredFormatStats();
  const formatNameMap = {
    mcq: 'Trắc nghiệm (MCQ)',
    fill_blank: 'Điền Output (Fill-blank)',
    coding: 'Thực hành Code (Coding)',
  };
  const targetFormatName = formatNameMap[question.type];
  const updatedFormats = formatStats.map((f) => {
    if (f.name !== targetFormatName) return f;
    const nextSolved = isCorrect ? f.solved + 1 : f.solved;
    const delta = isCorrect ? 1 : -2;
    return {
      ...f,
      solved: nextSolved,
      accuracy: Math.max(30, Math.min(100, f.accuracy + delta)),
    };
  });
  setStoredFormatStats(updatedFormats);

  // 4. Nếu làm sai: Tự động đưa vào Hàng đợi Ôn tập Ngắt quãng (chu kỳ 1 ngày)
  if (!isCorrect) {
    upsertQuestionIntoReviewQueue(
      question,
      resultDetailLabel || 'Vừa làm sai — Cần ôn lại'
    );
  }
}

export function upsertQuestionIntoReviewQueue(question, reasonLabel) {
  const queue = getStoredReviewQueue();
  const existingIdx = queue.findIndex(
    (item) => item.questionId === question._id
  );

  const entry = {
    id:
      existingIdx >= 0
        ? queue[existingIdx].id
        : `sr_item_${question._id}_${Date.now()}`,
    questionId: question._id,
    title: question.title,
    type: question.type,
    level: question.level,
    category: question.category,
    tags: question.tags || [],
    currentStage: 1,
    intervalDays: 1,
    cycleLabel: 'Chu kỳ 1 ngày (Cần ôn ngay)',
    dueStatus: 'Đến hạn hôm nay',
    lastAttemptResult: reasonLabel || 'Đã đánh dấu cần ôn lại',
  };

  if (existingIdx >= 0) {
    const updated = [...queue];
    updated[existingIdx] = entry;
    setStoredReviewQueue(updated);
    return { added: false, item: entry, queue: updated };
  }

  const nextQueue = [entry, ...queue];
  setStoredReviewQueue(nextQueue);
  return { added: true, item: entry, queue: nextQueue };
}

export function isQuestionInReviewQueue(questionId) {
  const queue = getStoredReviewQueue();
  return queue.some((item) => item.questionId === questionId);
}

export async function toggleReviewBookmark(question) {
  return simulateApiCall(() => {
    const queue = getStoredReviewQueue();
    const exists = queue.some((item) => item.questionId === question._id);
    if (exists) {
      const filtered = queue.filter((item) => item.questionId !== question._id);
      setStoredReviewQueue(filtered);
      return { bookmarked: false, queue: filtered };
    }
    const res = upsertQuestionIntoReviewQueue(
      question,
      'Đã gắn cờ cần ôn tập lại'
    );
    return { bookmarked: true, queue: res.queue };
  }, 80);
}

export async function evaluateMcq(questionId, selectedIds = []) {
  return simulateApiCall(() => {
    const question = getStoredQuestions().find((q) => q._id === questionId);
    if (!question) throw new Error('Không tìm thấy câu hỏi.');

    const correctOptionIds = question.payload.correctOptionIds || [];
    const sortedUser = [...selectedIds].sort().join(',');
    const sortedCorrect = [...correctOptionIds].sort().join(',');
    const isCorrect = sortedUser === sortedCorrect;

    recordQuestionAttempt(
      question,
      isCorrect,
      isCorrect ? 'Accepted (Chọn đúng MCQ)' : 'Wrong Answer (Chọn sai phương án)'
    );

    return {
      isCorrect,
      correctOptionIds,
      explanation: question.explanation,
      message: isCorrect
        ? 'Chính xác! Bạn đã chọn đúng toàn bộ phương án.'
        : 'Chưa chính xác. Câu hỏi đã được tự động thêm vào Hàng đợi Ôn tập Ngắt quãng (chu kỳ 1 ngày).',
    };
  }, 120);
}

export async function evaluateFillBlank(questionId, answerText = '') {
  return simulateApiCall(() => {
    const question = getStoredQuestions().find((q) => q._id === questionId);
    if (!question) throw new Error('Không tìm thấy câu hỏi.');

    const { caseSensitive, acceptedAnswers = [] } = question.payload;
    const normalizedUser = normalizeFillBlankText(answerText, caseSensitive);
    const isCorrect = acceptedAnswers.some(
      (ans) => normalizeFillBlankText(ans, caseSensitive) === normalizedUser
    );

    recordQuestionAttempt(
      question,
      isCorrect,
      isCorrect
        ? 'Accepted (Điền đúng Output)'
        : `Wrong Answer (Đã điền: "${answerText.trim()}")`
    );

    return {
      isCorrect,
      userAnswer: answerText.trim(),
      acceptedAnswers,
      explanation: question.explanation,
    };
  }, 120);
}

export async function runCodeSandbox({
  questionId,
  language,
  code,
  mode = 'run',
}) {
  return simulateApiCall(() => {
    const question = getStoredQuestions().find((q) => q._id === questionId);
    if (!question) throw new Error('Không tìm thấy bài tập lập trình.');

    const { testCases = [], starterCode = {} } = question.payload;
    const publicTestCases = testCases.filter((tc) => !tc.isHidden);
    const targetCases = mode === 'submit' ? testCases : publicTestCases;

    const trimmedCode = String(code || '').trim();
    const defaultStarter = String(starterCode[language] || '').trim();
    const isUnchangedStarter = trimmedCode === defaultStarter;
    const hasReturnStatement = /\breturn\b/.test(trimmedCode);
    const hasLogicBody =
      trimmedCode.length > 25 && hasReturnStatement && !isUnchangedStarter;

    const evaluatedCases = targetCases.map((tc, index) => {
      const passed = hasLogicBody;
      const actualOutput = passed
        ? tc.expectedOutput
        : hasReturnStatement
          ? 'null / Kết quả chưa khớp'
          : 'undefined (Thiếu lệnh return kết quả)';

      return {
        id: tc.id,
        label: tc.isHidden
          ? `Hidden Test Case #${index + 1}`
          : `Test Case #${index + 1}`,
        isHidden: Boolean(tc.isHidden),
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput,
        passed,
        runtimeMs: 11 + index * 6,
      };
    });

    const passedCount = evaluatedCases.filter((c) => c.passed).length;
    const allPassed =
      evaluatedCases.length > 0 && passedCount === evaluatedCases.length;

    if (mode === 'submit') {
      recordQuestionAttempt(
        question,
        allPassed,
        allPassed
          ? `Accepted (${passedCount}/${evaluatedCases.length} Test Cases)`
          : `Wrong Answer (${passedCount}/${evaluatedCases.length} Test Cases)`
      );
    }

    return {
      mode,
      language,
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      passedCount,
      totalCount: evaluatedCases.length,
      totalTimeMs: evaluatedCases.reduce((sum, c) => sum + c.runtimeMs, 0),
      cases: evaluatedCases,
      explanation: question.explanation,
    };
  }, 380);
}
