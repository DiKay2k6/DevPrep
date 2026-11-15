import { z } from 'zod';
import {
  getUserProfileById,
  loginUser,
  refreshUserTokens,
  registerUser,
  updateUserProfileById,
} from '../services/auth.service.js';

const VALID_LEVELS = ['Intern', 'Fresher', 'Junior', 'Middle'];
const VALID_TRACKS = [
  'Frontend',
  'Backend',
  'Full-stack',
  'Mobile',
  'Database',
];

export const registerSchema = z.object({
  body: z.object({
    fullName: z
      .string({ required_error: 'Họ và tên là bắt buộc.' })
      .trim()
      .min(2, 'Họ và tên cần tối thiểu 2 ký tự.')
      .max(80, 'Họ và tên tối đa 80 ký tự.'),
    email: z
      .string({ required_error: 'Email là bắt buộc.' })
      .trim()
      .email('Định dạng email không hợp lệ.'),
    password: z
      .string({ required_error: 'Mật khẩu là bắt buộc.' })
      .min(6, 'Mật khẩu cần tối thiểu 6 ký tự.')
      .max(100, 'Mật khẩu tối đa 100 ký tự.'),
    targetLevel: z.enum(VALID_LEVELS).optional().default('Fresher'),
    targetTrack: z.enum(VALID_TRACKS).optional().default('Full-stack'),
    selectedSkills: z.array(z.string().trim()).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email là bắt buộc.' })
      .trim()
      .email('Định dạng email không hợp lệ.'),
    password: z
      .string({ required_error: 'Mật khẩu là bắt buộc.' })
      .min(1, 'Vui lòng nhập mật khẩu.'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z
      .string({ required_error: 'Refresh Token là bắt buộc.' })
      .min(1, 'Refresh Token không được để trống.'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(80).optional(),
    bio: z.string().trim().max(300).optional(),
    targetLevel: z.enum(VALID_LEVELS).optional(),
    targetTrack: z.enum(VALID_TRACKS).optional(),
    selectedSkills: z.array(z.string().trim()).optional(),
  }),
});

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công.',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công.',
      data: result,
    });
  } catch (err) {
    return next(err);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const tokens = await refreshUserTokens(req.body.refreshToken);
    return res.status(200).json({
      success: true,
      message: 'Làm mới phiên đăng nhập thành công.',
      data: tokens,
    });
  } catch (err) {
    return next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const profile = await getUserProfileById(req.user.id);
    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    return next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const updated = await updateUserProfileById(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Đã cập nhật hồ sơ cá nhân và nhóm kỹ năng mục tiêu.',
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
}
