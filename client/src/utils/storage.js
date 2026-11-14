import { ARTICLES_MOCK } from '../data/articles.mock.js';
import {
  FORMAT_ACCURACY_STATS,
  KNOWLEDGE_GAP_BY_TAG,
  SPACED_REPETITION_QUEUE,
} from '../data/analytics.mock.js';
import { MOCK_TEST_RESULT_SAMPLE } from '../data/mockTest.mock.js';
import { QUESTIONS_MOCK } from '../data/questions.mock.js';
import { MOCK_USER, MOCK_USER_PROFILE } from '../data/tracks.mock.js';

export const STORAGE_KEYS = {
  AUTH_USER: 'devprep_auth_user_v2',
  ACCESS_TOKEN: 'devprep_access_token_v2',
  REFRESH_TOKEN: 'devprep_refresh_token_v2',
  TARGET_LEVEL: 'devprep_target_level_v2',
  SELECTED_SKILLS: 'devprep_selected_skills_v2',
  COMPLETED_ARTICLES: 'devprep_completed_articles_v2',
  SOLVED_QUESTIONS: 'devprep_solved_questions_v2',
  CODE_DRAFTS: 'devprep_code_drafts_v2',
  REVIEW_QUEUE: 'devprep_review_queue_v2',
  TAG_STATS: 'devprep_tag_stats_v2',
  FORMAT_STATS: 'devprep_format_stats_v2',
  ACTIVE_EXAM: 'devprep_active_mock_exam_v2',
  LAST_MOCK_RESULT: 'devprep_last_mock_result_v2',
  QUESTIONS_STATE: 'devprep_questions_state_v2',
};

const SYNC_EVENT = 'devprep:storage-sync';

export function readStorage(key, fallbackValue) {
  if (typeof window === 'undefined') return fallbackValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallbackValue;
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

export function writeStorage(key, value) {
  if (typeof window === 'undefined') return value;
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { key } }));
  } catch {
    // Bỏ qua lỗi quota của localStorage nếu trình duyệt chặn
  }
  return value;
}

export function subscribeStorageSync(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => callback(e?.detail?.key);
  window.addEventListener(SYNC_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(SYNC_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getStoredUser() {
  return readStorage(STORAGE_KEYS.AUTH_USER, {
    ...MOCK_USER,
    isAuthenticated: true,
    isDemo: true,
  });
}

export function setStoredUser(user) {
  return writeStorage(STORAGE_KEYS.AUTH_USER, user);
}

export function getStoredTargetLevel() {
  return readStorage(STORAGE_KEYS.TARGET_LEVEL, 'All');
}

export function setStoredTargetLevel(level) {
  return writeStorage(STORAGE_KEYS.TARGET_LEVEL, level || 'All');
}

export function getStoredSelectedSkills() {
  return readStorage(
    STORAGE_KEYS.SELECTED_SKILLS,
    MOCK_USER_PROFILE.selectedSkills
  );
}

export function setStoredSelectedSkills(skills) {
  return writeStorage(
    STORAGE_KEYS.SELECTED_SKILLS,
    Array.isArray(skills) ? skills : []
  );
}

export function getCompletedArticleIds() {
  return readStorage(STORAGE_KEYS.COMPLETED_ARTICLES, [
    'art_js_event_loop_01',
    'art_mongo_compound_idx_02',
  ]);
}

export function setCompletedArticleIds(ids) {
  return writeStorage(STORAGE_KEYS.COMPLETED_ARTICLES, ids);
}

export function getSolvedQuestionIds() {
  return readStorage(STORAGE_KEYS.SOLVED_QUESTIONS, [
    'q_mcq_event_loop_01',
    'q_fill_event_loop_02',
    'q_fill_mongo_select_04',
    'q_coding_two_sum_07',
  ]);
}

export function setSolvedQuestionIds(ids) {
  return writeStorage(STORAGE_KEYS.SOLVED_QUESTIONS, ids);
}

export function getStoredQuestions() {
  const saved = readStorage(STORAGE_KEYS.QUESTIONS_STATE, null);
  if (!Array.isArray(saved) || saved.length === 0) {
    return QUESTIONS_MOCK;
  }
  const savedMap = new Map(saved.map((item) => [item._id, item]));
  const merged = QUESTIONS_MOCK.map((q) => savedMap.get(q._id) || q);
  const customOnly = saved.filter(
    (item) => !QUESTIONS_MOCK.some((q) => q._id === item._id)
  );
  return [...customOnly, ...merged];
}

export function setStoredQuestions(questions) {
  return writeStorage(STORAGE_KEYS.QUESTIONS_STATE, questions);
}

export function getStoredReviewQueue() {
  return readStorage(STORAGE_KEYS.REVIEW_QUEUE, SPACED_REPETITION_QUEUE);
}

export function setStoredReviewQueue(queue) {
  return writeStorage(STORAGE_KEYS.REVIEW_QUEUE, queue);
}

export function getStoredTagStats() {
  return readStorage(STORAGE_KEYS.TAG_STATS, KNOWLEDGE_GAP_BY_TAG);
}

export function setStoredTagStats(stats) {
  return writeStorage(STORAGE_KEYS.TAG_STATS, stats);
}

export function getStoredFormatStats() {
  return readStorage(STORAGE_KEYS.FORMAT_STATS, FORMAT_ACCURACY_STATS);
}

export function setStoredFormatStats(stats) {
  return writeStorage(STORAGE_KEYS.FORMAT_STATS, stats);
}

export function getStoredLastMockResult() {
  return readStorage(STORAGE_KEYS.LAST_MOCK_RESULT, MOCK_TEST_RESULT_SAMPLE);
}

export function setStoredLastMockResult(result) {
  return writeStorage(STORAGE_KEYS.LAST_MOCK_RESULT, result);
}

export function findRecommendedArticleForTag(tag) {
  const normalized = String(tag || '').toLowerCase();
  const matched =
    ARTICLES_MOCK.find((a) =>
      a.tags.some((t) => t.toLowerCase() === normalized)
    ) || ARTICLES_MOCK[0];
  return {
    slug: matched.slug,
    title: matched.title,
    category: matched.category,
  };
}
