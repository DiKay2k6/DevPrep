import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../middlewares/errorHandler.js';
import { MockTest } from '../models/MockTest.model.js';
import { Submission } from '../models/Submission.model.js';
import { User } from '../models/User.model.js';

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      targetLevel: user.targetLevel,
    },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      email: user.email,
    },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
}

async function computeUserStats(userDoc) {
  const solvedCount = (userDoc.solvedQuestionIds || []).length;
  const readArticlesCount = (userDoc.completedArticleIds || []).length;
  const streakDays = userDoc.streak?.currentDays || 1;

  const [totalSubmissions, correctSubmissions, completedMockTests] =
    await Promise.all([
      Submission.countDocuments({ userId: userDoc._id }),
      Submission.countDocuments({ userId: userDoc._id, isCorrect: true }),
      MockTest.countDocuments({ userId: userDoc._id }),
    ]);

  const accuracyRate =
    totalSubmissions > 0
      ? Math.round((correctSubmissions / totalSubmissions) * 100)
      : 0;

  return {
    streakDays,
    solvedQuestions: solvedCount,
    readArticles: readArticlesCount,
    accuracyRate,
    completedMockTests,
  };
}

export async function serializeUser(userDoc) {
  const stats = await computeUserStats(userDoc);
  const createdDate = userDoc.createdAt ? new Date(userDoc.createdAt) : new Date();
  const joinedAt = createdDate.toLocaleDateString('vi-VN', {
    month: '2-digit',
    year: 'numeric',
  });

  return {
    id: String(userDoc._id),
    _id: String(userDoc._id),
    fullName: userDoc.fullName,
    email: userDoc.email,
    role: userDoc.role,
    targetLevel: userDoc.targetLevel || 'Fresher',
    targetTrack: userDoc.targetTrack || 'Frontend',
    selectedSkills: Array.isArray(userDoc.selectedSkills)
      ? userDoc.selectedSkills
      : [],
    bio: userDoc.bio || '',
    streakDays: stats.streakDays,
    completedArticleIds: userDoc.completedArticleIds || [],
    solvedQuestionIds: userDoc.solvedQuestionIds || [],
    joinedAt,
    stats,
    createdAt: userDoc.createdAt,
  };
}

export async function registerUser({
  fullName,
  email,
  password,
  targetLevel = 'Fresher',
  targetTrack = 'Full-stack',
  selectedSkills,
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: normalizedEmail }).lean();
  if (existing) {
    throw new AppError('Địa chỉ email này đã được đăng ký tài khoản.', 409);
  }

  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash: password,
    role: 'user',
    targetLevel,
    targetTrack,
    selectedSkills:
      Array.isArray(selectedSkills) && selectedSkills.length > 0
        ? selectedSkills
        : ['JavaScript', 'ReactJS', 'Node.js'],
  });

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 8);
  await user.save();

  return {
    user: await serializeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select(
    '+passwordHash +refreshTokenHash'
  );
  if (!user) {
    throw new AppError('Email hoặc mật khẩu không chính xác.', 401);
  }

  const matched = await user.comparePassword(password);
  if (!matched) {
    throw new AppError('Email hoặc mật khẩu không chính xác.', 401);
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(refreshToken, 8);
  await user.save();

  return {
    user: await serializeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refreshUserTokens(refreshToken) {
  if (!refreshToken) {
    throw new AppError('Không tìm thấy Refresh Token.', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Refresh Token không hợp lệ hoặc đã hết hạn.', 401);
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user || !user.refreshTokenHash) {
    throw new AppError('Phiên đăng nhập không còn hiệu lực.', 401);
  }

  const validHash = await bcrypt.compare(refreshToken, user.refreshTokenHash);
  if (!validHash) {
    throw new AppError('Refresh Token đã bị thu hồi.', 401);
  }

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);
  user.refreshTokenHash = await bcrypt.hash(newRefreshToken, 8);
  await user.save();

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function getUserProfileById(userId) {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new AppError('Không tìm thấy hồ sơ người dùng.', 404);
  }
  return serializeUser(user);
}

export async function updateUserProfileById(userId, updates = {}) {
  const allowedUpdates = {};
  if (updates.fullName !== undefined) {
    allowedUpdates.fullName = updates.fullName.trim();
  }
  if (updates.bio !== undefined) {
    allowedUpdates.bio = updates.bio.trim();
  }
  if (updates.targetLevel !== undefined) {
    allowedUpdates.targetLevel = updates.targetLevel;
  }
  if (updates.targetTrack !== undefined) {
    allowedUpdates.targetTrack = updates.targetTrack;
  }
  if (Array.isArray(updates.selectedSkills)) {
    allowedUpdates.selectedSkills = updates.selectedSkills;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: allowedUpdates },
    { new: true, runValidators: true }
  ).lean();

  if (!user) {
    throw new AppError('Không tìm thấy hồ sơ người dùng để cập nhật.', 404);
  }
  return serializeUser(user);
}
