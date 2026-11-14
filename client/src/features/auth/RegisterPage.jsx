import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { LEVELS } from '../../data/tracks.mock.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    targetLevel: 'Fresher',
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validateField = (name, value) => {
    if (name === 'fullName' && !value.trim()) {
      return 'Vui lòng nhập họ và tên đầy đủ.';
    }
    if (name === 'email') {
      if (!value.trim()) return 'Vui lòng nhập địa chỉ email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Địa chỉ email chưa hợp lệ.';
      }
    }
    if (name === 'password') {
      if (!value || value.length < 8) {
        return 'Mật khẩu cần tối thiểu 8 ký tự.';
      }
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
    if (err) setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {
      fullName: validateField('fullName', formData.fullName),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };
    if (newErrors.fullName || newErrors.email || newErrors.password) {
      setErrors(newErrors);
      return;
    }
    setSubmitted(true);
    setTimeout(() => navigate('/tracks'), 600);
  };

  return (
    <article className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <header className="space-y-1">
        <h1 id="register-heading" className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Đăng ký tài khoản ứng viên
        </h1>
        <p className="text-sm text-slate-600">
          Thiết lập mục tiêu phỏng vấn ban đầu để hệ thống gợi ý bộ câu hỏi phù hợp.
        </p>
      </header>

      {submitted && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800"
        >
          Khởi tạo tài khoản thành công! Đang chuyển tới Không gian Học tập...
        </div>
      )}

      <form
        aria-labelledby="register-heading"
        method="POST"
        action="/register"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-fullname"
            className="text-sm font-semibold text-slate-800"
          >
            Họ và tên <span aria-hidden="true" className="text-red-600">*</span>
          </label>
          <input
            id="register-fullname"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            enterKeyHint="next"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ví dụ: Nguyễn Văn An"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'reg-name-error' : undefined}
            className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-base text-slate-900 focus:border-[#0052FF]"
          />
          {errors.fullName && (
            <p id="reg-name-error" role="alert" className="text-xs text-red-600">
              {errors.fullName}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-email"
            className="text-sm font-semibold text-slate-800"
          >
            Email liên hệ <span aria-hidden="true" className="text-red-600">*</span>
          </label>
          <input
            id="register-email"
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
            placeholder="ungvien@devprep.vn"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'reg-email-error' : undefined}
            className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-base text-slate-900 focus:border-[#0052FF]"
          />
          {errors.email && (
            <p id="reg-email-error" role="alert" className="text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="register-password"
            className="text-sm font-semibold text-slate-800"
          >
            Mật khẩu <span aria-hidden="true" className="text-red-600">*</span>
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            enterKeyHint="done"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(errors.password)}
            aria-describedby="reg-password-constraints"
            className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-base text-slate-900 focus:border-[#0052FF]"
          />
          <span id="reg-password-constraints" className="text-xs text-slate-500">
            Tối thiểu 8 ký tự, kết hợp chữ cái và chữ số để bảo vệ tài khoản.
          </span>
          {errors.password && (
            <p role="alert" className="text-xs text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <fieldset className="space-y-2 pt-1">
          <legend className="text-sm font-semibold text-slate-800">
            Cấp độ phỏng vấn mục tiêu
          </legend>
          <div className="grid grid-cols-2 gap-2 pt-1">
            {LEVELS.map((lvl) => (
              <label
                key={lvl.id}
                htmlFor={`target-level-${lvl.id}`}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 cursor-pointer text-sm font-medium text-slate-800"
              >
                <input
                  id={`target-level-${lvl.id}`}
                  type="radio"
                  name="targetLevel"
                  value={lvl.id}
                  checked={formData.targetLevel === lvl.id}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#0052FF]"
                />
                <span>{lvl.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052FF] hover:bg-blue-700 text-white text-sm font-bold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" aria-hidden="true" />
          <span>Hoàn tất đăng ký</span>
        </button>
      </form>

      <footer className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-bold text-[#0052FF] hover:underline">
          Đăng nhập ngay
        </Link>
      </footer>
    </article>
  );
}
