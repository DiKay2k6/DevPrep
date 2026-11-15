export const STORAGE_KEYS = {
  AUTH_USER: 'devprep_auth_user_v3',
  ACCESS_TOKEN: 'devprep_access_token_v3',
  REFRESH_TOKEN: 'devprep_refresh_token_v3',
  PREFS_PREFIX: 'devprep_prefs_',
  CODE_DRAFTS: 'devprep_code_drafts_v3',
  ACTIVE_EXAM: 'devprep_active_mock_exam_v3',
  LAST_MOCK_RESULT: 'devprep_last_mock_result_v3',
  REVIEW_QUEUE_CACHE: 'devprep_review_queue_cache_v3',
};

const SYNC_EVENT = 'devprep:storage-sync';
const DEFAULT_GUEST_SKILLS = ['JavaScript', 'ReactJS', 'Node.js'];

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
    const prevRaw = window.localStorage.getItem(key);
    if (value === null || value === undefined) {
      if (prevRaw === null) return value;
      window.localStorage.removeItem(key);
    } else {
      const nextRaw = JSON.stringify(value);
      if (prevRaw === nextRaw) return value;
      window.localStorage.setItem(key, nextRaw);
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

/**
 * Lấy thông tin user đang đăng nhập.
 * Trả về null nếu chưa đăng nhập (không dùng dữ liệu giả "Nguyễn Duy Khang").
 */
export function getStoredUser() {
  const user = readStorage(STORAGE_KEYS.AUTH_USER, null);
  const token = readStorage(STORAGE_KEYS.ACCESS_TOKEN, null);
  if (!user || !token || user.isAuthenticated === false) {
    return null;
  }
  return user;
}

export function setStoredUser(user) {
  if (!user) {
    return writeStorage(STORAGE_KEYS.AUTH_USER, null);
  }
  const normalizedUser = {
    ...user,
    _id: String(user._id || user.id || ''),
    id: String(user.id || user._id || ''),
    isAuthenticated: true,
  };
  writeStorage(STORAGE_KEYS.AUTH_USER, normalizedUser);

  // Đồng bộ cache phụ theo hậu tố user._id (`devprep_prefs_${user._id}`)
  if (normalizedUser._id) {
    const prefKey = `${STORAGE_KEYS.PREFS_PREFIX}${normalizedUser._id}`;
    const existingPrefs = readStorage(prefKey, {});
    writeStorage(prefKey, {
      ...existingPrefs,
      targetLevel:
        normalizedUser.targetLevel || existingPrefs.targetLevel || 'All',
      selectedSkills: Array.isArray(normalizedUser.selectedSkills)
        ? normalizedUser.selectedSkills
        : existingPrefs.selectedSkills || DEFAULT_GUEST_SKILLS,
      completedArticleIds: Array.isArray(normalizedUser.completedArticleIds)
        ? normalizedUser.completedArticleIds
        : existingPrefs.completedArticleIds || [],
      solvedQuestionIds: Array.isArray(normalizedUser.solvedQuestionIds)
        ? normalizedUser.solvedQuestionIds
        : existingPrefs.solvedQuestionIds || [],
    });
  }

  return normalizedUser;
}

/**
 * Xóa sạch toàn bộ Token và Cache phiên cũ khi Đăng xuất hoặc đổi tài khoản.
 */
export function clearAuthSessionStorage() {
  writeStorage(STORAGE_KEYS.ACCESS_TOKEN, null);
  writeStorage(STORAGE_KEYS.REFRESH_TOKEN, null);
  writeStorage(STORAGE_KEYS.AUTH_USER, null);
  writeStorage(STORAGE_KEYS.REVIEW_QUEUE_CACHE, null);
}

function getCurrentUserPrefsKey() {
  const user = getStoredUser();
  const userId = user?._id || user?.id;
  return userId
    ? `${STORAGE_KEYS.PREFS_PREFIX}${userId}`
    : `${STORAGE_KEYS.PREFS_PREFIX}guest`;
}

function readCurrentUserPrefs() {
  return readStorage(getCurrentUserPrefsKey(), {});
}

function writeCurrentUserPrefs(patch) {
  const key = getCurrentUserPrefsKey();
  const current = readStorage(key, {});
  return writeStorage(key, { ...current, ...patch });
}

export function getStoredTargetLevel() {
  const user = getStoredUser();
  const prefs = readCurrentUserPrefs();
  return prefs.targetLevel || user?.targetLevel || 'All';
}

export function setStoredTargetLevel(level) {
  const resolved = level || 'All';
  writeCurrentUserPrefs({ targetLevel: resolved });
  const user = getStoredUser();
  if (user && resolved !== 'All') {
    writeStorage(STORAGE_KEYS.AUTH_USER, { ...user, targetLevel: resolved });
  }
  return resolved;
}

export function getStoredSelectedSkills() {
  const user = getStoredUser();
  if (user && Array.isArray(user.selectedSkills)) {
    return user.selectedSkills;
  }
  const prefs = readCurrentUserPrefs();
  return Array.isArray(prefs.selectedSkills)
    ? prefs.selectedSkills
    : DEFAULT_GUEST_SKILLS;
}

export function setStoredSelectedSkills(skills) {
  const safeSkills = Array.isArray(skills) ? skills : [];
  writeCurrentUserPrefs({ selectedSkills: safeSkills });
  const user = getStoredUser();
  if (user) {
    writeStorage(STORAGE_KEYS.AUTH_USER, {
      ...user,
      selectedSkills: safeSkills,
    });
  }
  return safeSkills;
}

export function getCompletedArticleIds() {
  const user = getStoredUser();
  if (user && Array.isArray(user.completedArticleIds)) {
    return user.completedArticleIds;
  }
  const prefs = readCurrentUserPrefs();
  return Array.isArray(prefs.completedArticleIds)
    ? prefs.completedArticleIds
    : [];
}

export function setCompletedArticleIds(ids) {
  const safeIds = Array.isArray(ids) ? ids : [];
  writeCurrentUserPrefs({ completedArticleIds: safeIds });
  const user = getStoredUser();
  if (user) {
    writeStorage(STORAGE_KEYS.AUTH_USER, {
      ...user,
      completedArticleIds: safeIds,
      stats: {
        ...(user.stats || {}),
        readArticles: safeIds.length,
      },
    });
  }
  return safeIds;
}

export function getSolvedQuestionIds() {
  const user = getStoredUser();
  if (user && Array.isArray(user.solvedQuestionIds)) {
    return user.solvedQuestionIds;
  }
  const prefs = readCurrentUserPrefs();
  return Array.isArray(prefs.solvedQuestionIds) ? prefs.solvedQuestionIds : [];
}

export function setSolvedQuestionIds(ids) {
  const safeIds = Array.isArray(ids) ? ids : [];
  writeCurrentUserPrefs({ solvedQuestionIds: safeIds });
  const user = getStoredUser();
  if (user) {
    writeStorage(STORAGE_KEYS.AUTH_USER, {
      ...user,
      solvedQuestionIds: safeIds,
      stats: {
        ...(user.stats || {}),
        solvedQuestions: safeIds.length,
      },
    });
  }
  return safeIds;
}

export function getStoredReviewQueue() {
  return readStorage(STORAGE_KEYS.REVIEW_QUEUE_CACHE, []);
}

export function setStoredReviewQueue(queue) {
  return writeStorage(
    STORAGE_KEYS.REVIEW_QUEUE_CACHE,
    Array.isArray(queue) ? queue : []
  );
}

export function getStoredLastMockResult() {
  const user = getStoredUser();
  const suffix = user?._id || user?.id || 'guest';
  return readStorage(`${STORAGE_KEYS.LAST_MOCK_RESULT}_${suffix}`, null);
}

export function setStoredLastMockResult(result) {
  const user = getStoredUser();
  const suffix = user?._id || user?.id || 'guest';
  return writeStorage(`${STORAGE_KEYS.LAST_MOCK_RESULT}_${suffix}`, result);
}
