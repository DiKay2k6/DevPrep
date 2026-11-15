import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const isDevelopment = env.NODE_ENV === 'development';
const LOOPBACK_IPS = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

function isLoopbackRequest(req) {
  const ip = req.ip || '';
  const remoteAddress = req.socket?.remoteAddress || '';
  return LOOPBACK_IPS.has(ip) || LOOPBACK_IPS.has(remoteAddress);
}

function shouldSkipRateLimit(req) {
  if (req.path === '/health' || req.originalUrl === '/api/v1/health') {
    return true;
  }
  return isDevelopment && isLoopbackRequest(req);
}

function createRateLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    skip: shouldSkipRateLimit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });
}

/**
 * Giới hạn tần suất chung cho toàn bộ API /api/v1/*.
 * Nới lỏng ở môi trường development để phục vụ test UI & React.StrictMode.
 */
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: isDevelopment ? 1000 : 200,
  message: 'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau ít phút.',
});

/**
 * Giới hạn tần suất chống brute-force mật khẩu / spam tạo tài khoản (/login, /register).
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: isDevelopment ? 100 : 20,
  message: 'Quá nhiều lần thử đăng nhập/đăng ký, vui lòng đợi 15 phút.',
});

/**
 * Giới hạn tần suất cho luồng chấm điểm & chạy code qua Piston Sandbox Proxy.
 */
export const sandboxLimiter = createRateLimiter({
  windowMs: isDevelopment ? 5 * 60 * 1000 : 60 * 1000,
  max: isDevelopment ? 60 : 15,
  message: isDevelopment
    ? 'Bạn đang gửi yêu cầu chạy code quá nhanh (tối đa 60 lần/5 phút). Vui lòng chờ giây lát.'
    : 'Bạn đang gửi yêu cầu chạy code quá nhanh (tối đa 15 lần/phút). Vui lòng chờ giây lát.',
});
