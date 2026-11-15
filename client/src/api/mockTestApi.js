import {
  getStoredLastMockResult,
  getStoredUser,
  readStorage,
  setStoredLastMockResult,
  STORAGE_KEYS,
  writeStorage,
} from '../utils/storage.js';
import axiosClient from './axiosClient.js';

function getActiveExamStorageKey() {
  const user = getStoredUser();
  const suffix = user?._id || user?.id || 'guest';
  return `${STORAGE_KEYS.ACTIVE_EXAM}_${suffix}`;
}

export async function getMockTemplates() {
  const res = await axiosClient.get('/practice/mock-tests/templates');
  return Array.isArray(res.data) ? res.data : [];
}

export async function getMockExamSession(templateId) {
  const res = await axiosClient.get(
    `/practice/mock-tests/session/${encodeURIComponent(templateId)}`
  );
  return res.data;
}

export function getActiveExamSessionSync() {
  return readStorage(getActiveExamStorageKey(), null);
}

export function saveActiveExamSessionSync(session) {
  return writeStorage(getActiveExamStorageKey(), session);
}

export function clearActiveExamSessionSync() {
  return writeStorage(getActiveExamStorageKey(), null);
}

export async function submitMockExam({
  templateId,
  answersByQuestion = {},
  timeSpentSeconds = 0,
}) {
  const res = await axiosClient.post('/practice/mock-tests/submit', {
    templateId,
    answersByQuestion,
    timeSpentSeconds,
  });
  const result = res.data;
  clearActiveExamSessionSync();
  setStoredLastMockResult(result);
  return result;
}

export async function getLastMockResult() {
  try {
    const res = await axiosClient.get('/practice/mock-tests/latest');
    if (res.data) {
      setStoredLastMockResult(res.data);
      return res.data;
    }
  } catch {
    // Fallback xuống cache cục bộ nếu chưa có bản ghi trên server
  }
  return getStoredLastMockResult();
}
