import {
  clearAuthSessionStorage,
  getStoredUser,
  readStorage,
  setStoredSelectedSkills,
  setStoredTargetLevel,
  setStoredUser,
  STORAGE_KEYS,
  writeStorage,
} from '../utils/storage.js';
import axiosClient from './axiosClient.js';

function persistAuthenticatedSession({ user, accessToken, refreshToken }) {
  if (accessToken) {
    writeStorage(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  }
  if (refreshToken) {
    writeStorage(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
  const stored = setStoredUser(user);
  if (user?.targetLevel) {
    setStoredTargetLevel(user.targetLevel);
  }
  if (Array.isArray(user?.selectedSkills)) {
    setStoredSelectedSkills(user.selectedSkills);
  }
  return stored;
}

export async function getCurrentUser() {
  const token = readStorage(STORAGE_KEYS.ACCESS_TOKEN, null);
  if (!token) {
    return null;
  }
  try {
    const res = await axiosClient.get('/auth/me');
    const user = res.data;
    if (user) {
      return setStoredUser(user);
    }
    return null;
  } catch {
    return getStoredUser();
  }
}

export async function login({ email, password }) {
  if (!email || !password) {
    throw new Error('Vui lòng nhập đầy đủ Email và Mật khẩu.');
  }
  clearAuthSessionStorage();
  const res = await axiosClient.post('/auth/login', {
    email: email.trim(),
    password,
  });
  return persistAuthenticatedSession(res.data);
}

export async function loginDemo() {
  return login({
    email: 'demo@devprep.vn',
    password: 'DevPrep@2026',
  });
}

export async function loginQuickAdmin() {
  return login({
    email: 'admin@devprep.vn',
    password: 'Admin@2026',
  });
}

export async function register({
  fullName,
  email,
  password,
  targetLevel = 'Fresher',
  targetTrack = 'Full-stack',
  selectedSkills,
}) {
  if (!fullName || !email || !password) {
    throw new Error('Vui lòng điền đầy đủ thông tin đăng ký.');
  }
  clearAuthSessionStorage();
  const res = await axiosClient.post('/auth/register', {
    fullName: fullName.trim(),
    email: email.trim(),
    password,
    targetLevel,
    targetTrack,
    ...(Array.isArray(selectedSkills) && selectedSkills.length > 0
      ? { selectedSkills }
      : {}),
  });
  return persistAuthenticatedSession(res.data);
}

export async function logout() {
  clearAuthSessionStorage();
  return null;
}

export async function updateProfile({
  fullName,
  bio,
  targetLevel,
  targetTrack,
  selectedSkills,
}) {
  const token = readStorage(STORAGE_KEYS.ACCESS_TOKEN, null);
  if (!token) {
    if (targetLevel && targetLevel !== 'All') {
      setStoredTargetLevel(targetLevel);
    }
    if (Array.isArray(selectedSkills)) {
      setStoredSelectedSkills(selectedSkills);
    }
    return null;
  }

  const payload = {};
  if (fullName !== undefined) payload.fullName = fullName;
  if (bio !== undefined) payload.bio = bio;
  if (targetLevel && targetLevel !== 'All') payload.targetLevel = targetLevel;
  if (targetTrack !== undefined) payload.targetTrack = targetTrack;
  if (Array.isArray(selectedSkills)) payload.selectedSkills = selectedSkills;

  const res = await axiosClient.put('/users/profile', payload);
  const updatedUser = setStoredUser(res.data);
  if (updatedUser?.targetLevel) {
    setStoredTargetLevel(updatedUser.targetLevel);
  }
  if (Array.isArray(updatedUser?.selectedSkills)) {
    setStoredSelectedSkills(updatedUser.selectedSkills);
  }
  return updatedUser;
}
