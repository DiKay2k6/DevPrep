import {
  getSolvedQuestionIds,
  getStoredReviewQueue,
  getStoredUser,
  readStorage,
  setSolvedQuestionIds,
  setStoredReviewQueue,
  STORAGE_KEYS,
  writeStorage,
} from '../utils/storage.js';
import axiosClient from './axiosClient.js';

function getDraftsStorageKey() {
  const user = getStoredUser();
  const suffix = user?._id || user?.id || 'guest';
  return `${STORAGE_KEYS.CODE_DRAFTS}_${suffix}`;
}

export function getCodeDraftsForQuestion(questionId, starterCode = {}) {
  const allDrafts = readStorage(getDraftsStorageKey(), {});
  const questionDrafts = allDrafts[questionId] || {};
  return {
    ...starterCode,
    ...questionDrafts,
  };
}

export function saveCodeDraftForQuestion(questionId, language, code) {
  const key = getDraftsStorageKey();
  const allDrafts = readStorage(key, {});
  const nextForQuestion = {
    ...(allDrafts[questionId] || {}),
    [language]: code,
  };
  writeStorage(key, {
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

function syncSolvedQuestionInClientCache(questionId, isCorrect) {
  if (!isCorrect || !questionId) return;
  const solved = getSolvedQuestionIds();
  if (!solved.includes(questionId)) {
    setSolvedQuestionIds([...solved, questionId]);
  }
}

export function isQuestionInReviewQueue(questionId) {
  const queue = getStoredReviewQueue();
  return queue.some((item) => item.questionId === questionId);
}

export async function toggleReviewBookmark(question) {
  const res = await axiosClient.post('/practice/review-queue/bookmark', {
    questionId: question._id,
  });
  const data = res.data;
  if (Array.isArray(data?.queue)) {
    setStoredReviewQueue(data.queue);
  }
  return data;
}

export async function evaluateMcq(questionId, selectedIds = []) {
  const res = await axiosClient.post('/practice/submit', {
    questionId,
    selectedIds,
  });
  const data = res.data;
  syncSolvedQuestionInClientCache(questionId, data.isCorrect);
  return data;
}

export async function evaluateFillBlank(questionId, answerText = '') {
  const res = await axiosClient.post('/practice/submit', {
    questionId,
    answerText,
  });
  const data = res.data;
  syncSolvedQuestionInClientCache(questionId, data.isCorrect);
  return data;
}

export async function runCodeSandbox({
  questionId,
  language,
  code,
  mode = 'run',
}) {
  if (mode === 'submit') {
    const res = await axiosClient.post('/practice/submit', {
      questionId,
      language,
      code,
    });
    const data = res.data;
    syncSolvedQuestionInClientCache(questionId, data.isCorrect);
    return data;
  }

  const res = await axiosClient.post('/practice/run-code', {
    questionId,
    language,
    code,
  });
  return res.data;
}
