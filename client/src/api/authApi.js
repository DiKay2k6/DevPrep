import { MOCK_USER } from '../data/tracks.mock.js';
import {
  getCompletedArticleIds,
  getSolvedQuestionIds,
  getStoredSelectedSkills,
  getStoredTargetLevel,
  getStoredUser,
  setStoredSelectedSkills,
  setStoredTargetLevel,
  setStoredUser,
  STORAGE_KEYS,
  writeStorage,
} from '../utils/storage.js';
import { simulateApiCall } from './axiosClient.js';

function buildEnrichedUser(rawUser) {
  if (!rawUser) return null;
  const solvedIds = getSolvedQuestionIds();
  const completedArticles = getCompletedArticleIds();
  const selectedSkills = getStoredSelectedSkills();

  return {
    ...rawUser,
    selectedSkills,
    stats: {
      ...(rawUser.stats || MOCK_USER.stats),
      solvedQuestions: Math.max(
        solvedIds.length,
        rawUser.stats?.solvedQuestions || 38
      ),
      readArticles: Math.max(
        completedArticles.length,
        rawUser.stats?.readArticles || 4
      ),
    },
  };
}

export async function getCurrentUser() {
  return simulateApiCall(() => buildEnrichedUser(getStoredUser()), 60);
}

export async function login({ email, password }) {
  return simulateApiCall(() => {
    if (!email || !password) {
      throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
    }
    const existing = getStoredUser() || MOCK_USER;
    const isAdmin = email.toLowerCase().includes('admin') || email === MOCK_USER.email;
    const user = {
      ...MOCK_USER,
      ...existing,
      email: email.trim(),
      fullName:
        email.trim() === MOCK_USER.email
          ? MOCK_USER.fullName
          : existing?.fullName || email.split('@')[0],
      role: isAdmin ? 'admin' : 'candidate',
      isAuthenticated: true,
      isDemo: false,
    };

    writeStorage(STORAGE_KEYS.ACCESS_TOKEN, `mock_jwt_${Date.now()}`);
    writeStorage(STORAGE_KEYS.REFRESH_TOKEN, `mock_refresh_${Date.now()}`);
    setStoredUser(user);
    return buildEnrichedUser(user);
  }, 180);
}

export async function loginDemo() {
  return simulateApiCall(() => {
    const demoUser = {
      ...MOCK_USER,
      isAuthenticated: true,
      isDemo: true,
    };
    writeStorage(STORAGE_KEYS.ACCESS_TOKEN, `demo_jwt_${Date.now()}`);
    setStoredUser(demoUser);
    return buildEnrichedUser(demoUser);
  }, 120);
}

export async function register({ fullName, email, password, targetLevel }) {
  return simulateApiCall(() => {
    if (!fullName || !email || !password) {
      throw new Error('Vui lòng điền đầy đủ thông tin đăng ký.');
    }
    const level = targetLevel || 'Fresher';
    const newUser = {
      ...MOCK_USER,
      id: `usr_${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      role: 'candidate',
      targetLevel: level,
      joinedAt: new Date().toLocaleDateString('vi-VN', {
        month: '2-digit',
        year: 'numeric',
      }),
      isAuthenticated: true,
      isDemo: false,
    };
    writeStorage(STORAGE_KEYS.ACCESS_TOKEN, `mock_jwt_${Date.now()}`);
    setStoredTargetLevel(level);
    setStoredUser(newUser);
    return buildEnrichedUser(newUser);
  }, 200);
}

export async function logout() {
  return simulateApiCall(() => {
    const current = getStoredUser() || MOCK_USER;
    const loggedOutUser = {
      ...current,
      isAuthenticated: false,
      isDemo: false,
    };
    writeStorage(STORAGE_KEYS.ACCESS_TOKEN, null);
    writeStorage(STORAGE_KEYS.REFRESH_TOKEN, null);
    setStoredUser(loggedOutUser);
    return loggedOutUser;
  }, 100);
}

export async function updateProfile({
  fullName,
  bio,
  targetLevel,
  targetTrack,
  selectedSkills,
}) {
  return simulateApiCall(() => {
    const current = getStoredUser() || MOCK_USER;
    const updatedUser = {
      ...current,
      fullName: fullName?.trim() || current.fullName,
      bio: bio !== undefined ? bio : current.bio,
      targetLevel: targetLevel || current.targetLevel || getStoredTargetLevel(),
      targetTrack: targetTrack || current.targetTrack,
      isAuthenticated: true,
    };
    setStoredUser(updatedUser);

    if (targetLevel) {
      setStoredTargetLevel(targetLevel);
    }
    if (Array.isArray(selectedSkills)) {
      setStoredSelectedSkills(selectedSkills);
    }

    return buildEnrichedUser(updatedUser);
  }, 150);
}
