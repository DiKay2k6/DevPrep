import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LogIn, ShieldCheck, Zap } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'khang.nguyen.dev@gmail.com',
    password: 'Password@2026',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');

  const validateField = (name, value) => {
    if (name === 'email') {
      if (!value.trim()) return 'Vui lòng nhập địa chỉ email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Địa chỉ email không đúng định dạng (ví dụ: ten@domain.com).';
      }
    }
    if (name === 'password') {
      if (!value) return 'Vui lòng nhập mật khẩu.';
      if (value.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự.';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    if (err) {
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setStatusMessage(
      'Xác thực thành công. Đang mở Không gian Học tập DevPrep...'
    );
    setTimeout(() => navigate('/tracks'), 500);
  };

  const handleDemoLogin = () => {
    navigate('/tracks');
  };

  return (
    <article className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <header className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#0052FF] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Xác thực Tài khoản DevPrep</span>
        </div>
        <h1 id="login-form-heading" className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Đăng nhập vào hệ thống
        </h1>
        <p className="text-sm text-slate-600">
          Lưu trữ tiến độ luyện tập, lịch sử thi thử và hàng đợi ôn tập ngắt quãng.
        </p>
      </header>

      {/* Nút vào thẳng HUB nội bộ cho nhà tuyển dụng / người dùng thử */}
      <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">Chế độ dùng thử nhanh</span>
          <span className="px-2 py-0.5 rounded-full bg-white text-[#0052FF] font-semibold border border-blue-200">
            Fresher • 38/68 câu
          </span>
        </div>
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-blue-50 text-[#0052FF] border border-blue-300 text-xs sm:text-sm font-bold shadow-2xs transition-colors"
        >
          <Zap className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Trải nghiệm nhanh với Tài khoản Demo</span>
          <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
          Hoặc đăng nhập bằng Email
        </span>
        <div className="border-t border-slate-200 w-full" />
      </div>

      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800"
        >
          {statusMessage}
        </div>
      )}

      <form
        aria-labelledby="login-form-heading"
        method="POST"
        action="/login"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
            className="text-sm font-semibold text-slate-800"
          >
            Địa chỉ Email <span aria-hidden="true" className="text-red-600">*</span>
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            enterKeyHint="next"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : 'login-email-hint'}
            className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-base text-slate-900 focus:border-[#0052FF]"
          />
          <span id="login-email-hint" className="text-xs text-slate-500">
            Dùng email đã đăng ký tài khoản ứng viên hoặc quản trị viên.
          </span>
          {errors.email && (
            <p
              id="login-email-error"
              role="alert"
              className="text-xs font-medium text-red-600"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-sm font-semibold text-slate-800"
            >
              Mật khẩu <span aria-hidden="true" className="text-red-600">*</span>
            </label>
            <button
              type="button"
              aria-pressed={showPassword}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              onClick={() => setShowPassword((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-[#0052FF]"
            >
              {showPassword ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Ẩn</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Hiện</span>
                </>
              )}
            </button>
          </div>
          <input
            id="login-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            minLength={6}
            autoComplete="current-password"
            enterKeyHint="done"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-base text-slate-900 focus:border-[#0052FF]"
          />
          {errors.password && (
            <p
              id="login-password-error"
              role="alert"
              className="text-xs font-medium text-red-600"
            >
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052FF] hover:bg-blue-700 text-white text-sm font-bold shadow-xs transition-colors"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          <span>Đăng nhập vào DevPrep</span>
        </button>
      </form>

      <footer className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
        Chưa có tài khoản ứng viên?{' '}
        <Link to="/register" className="font-bold text-[#0052FF] hover:underline">
          Tạo tài khoản mới
        </Link>
      </footer>
    </article>
  );
}
