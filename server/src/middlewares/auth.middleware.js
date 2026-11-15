import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7).trim();
}

export function verifyJWT(req, _res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return next(
      new AppError(
        'Vui lòng đăng nhập để thực hiện thao tác này (Thiếu Bearer Token).',
        401
      )
    );
  }

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      targetLevel: decoded.targetLevel,
    };
    return next();
  } catch (err) {
    return next(err);
  }
}

export function optionalVerifyJWT(req, _res, next) {
  const token = extractBearerToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      targetLevel: decoded.targetLevel,
    };
  } catch {
    // Bỏ qua nếu token khách không hợp lệ, vẫn cho phép xem tài liệu/câu hỏi công khai
  }
  return next();
}

export function authorizeRoles(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError('Chưa xác thực người dùng.', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Tài khoản của bạn (vai trò: ${req.user.role}) không có quyền truy cập tài nguyên này.`,
          403
        )
      );
    }
    return next();
  };
}
