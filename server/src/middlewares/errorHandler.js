export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundHandler(req, res, next) {
  next(
    new AppError(
      `Không tìm thấy đường dẫn API: ${req.method} ${req.originalUrl}`,
      404
    )
  );
}

export function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Đã xảy ra lỗi nội bộ trên máy chủ.';
  let details = err.details || null;

  // Lỗi trùng khóa Unique trên MongoDB (ví dụ trùng email hoặc slug)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || 'dữ liệu';
    message = `Giá trị của trường "${duplicatedField}" đã tồn tại trong hệ thống.`;
  }

  // Lỗi kiểm tra ràng buộc dữ liệu của Mongoose (ValidationError / CastError)
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    const issues = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    details = issues;
    message = issues[0]?.message || 'Dữ liệu không hợp lệ với cấu trúc Schema.';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Định dạng dữ liệu của trường "${err.path}" không hợp lệ.`;
  }

  // Lỗi xác thực JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token xác thực không hợp lệ.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Phiên đăng nhập (Access Token) đã hết hạn.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { errors: details } : {}),
  });
}
