import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Bố cục tối giản dành riêng cho trang Đăng nhập (`/login`) và Đăng ký (`/register`).
 * Tách biệt hoàn toàn khỏi MainLayout (không có Top Header nội bộ hay Left Sidebar).
 */
export default function AuthLayout() {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F4F7FA] text-slate-900">
      <a
        href="#auth-main"
        className="visually-hidden focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0052FF] focus:text-white focus:rounded-xl focus:shadow-md"
      >
        Chuyển tới biểu mẫu xác thực
      </a>

      {/* Thanh điều hướng tối giản phía trên */}
      <header className="w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-slate-900 font-extrabold text-lg tracking-tight whitespace-nowrap"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#0052FF] text-white font-mono text-xs font-bold shadow-xs">
              {'</>'}
            </span>
            <span>
              DEV<span className="text-[#0052FF]">PREP</span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </header>

      {/* Vùng chứa biểu mẫu căn giữa màn hình */}
      <main
        id="auth-main"
        tabIndex={-1}
        className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14 focus:outline-none"
      >
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-slate-500">
        <span>DevPrep — Nền tảng ôn luyện phỏng vấn kỹ sư CNTT (Intern → Middle)</span>
      </footer>
    </div>
  );
}
