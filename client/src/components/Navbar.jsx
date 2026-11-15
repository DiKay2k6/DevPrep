import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  BookOpen,
  ChevronDown,
  Code2,
  Compass,
  Flame,
  LayoutGrid,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  Timer,
  Trophy,
  X,
} from 'lucide-react';
import { logout } from '../api/authApi.js';
import { LEVELS } from '../data/tracks.mock.js';
import { cn } from '../utils/cn.js';
import {
  getSolvedQuestionIds,
  getStoredReviewQueue,
  getStoredUser,
  subscribeStorageSync,
} from '../utils/storage.js';
import { useToast } from './ToastProvider.jsx';

export const NAV_ITEMS = [
  {
    to: '/tracks',
    label: 'Lộ trình & Chuyên ngành',
    shortLabel: 'Lộ trình',
    icon: Compass,
  },
  {
    to: '/study-hub',
    label: 'Kho Tài liệu',
    shortLabel: 'Tài liệu',
    icon: BookOpen,
  },
  {
    to: '/practice',
    label: 'Phòng Luyện tập',
    shortLabel: 'Luyện tập',
    icon: Code2,
  },
  {
    to: '/mock-test',
    label: 'Phòng Thi thử',
    shortLabel: 'Thi thử',
    icon: Timer,
  },
  {
    to: '/analytics',
    label: 'Phân tích Năng lực',
    shortLabel: 'Phân tích',
    icon: BarChart3,
  },
  {
    to: '/admin',
    label: 'Duyệt Đóng góp',
    shortLabel: 'Quản trị',
    icon: ShieldCheck,
    adminOnly: true,
  },
];

function getInitials(name) {
  const parts = String(name || 'UV')
    .trim()
    .split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
}

export default function Navbar({
  selectedLevel = 'All',
  onSelectLevel,
  sidebarExpanded = false,
  onToggleSidebar,
  mobileDrawerOpen = false,
  onToggleMobileDrawer,
}) {
  const [user, setUser] = useState(() => getStoredUser());
  const [solvedCount, setSolvedCount] = useState(
    () => getSolvedQuestionIds().length
  );
  const [dueReviewCount, setDueReviewCount] = useState(
    () => getStoredReviewQueue().length
  );

  useEffect(() => {
    const syncState = () => {
      setUser(getStoredUser());
      setSolvedCount(getSolvedQuestionIds().length);
      setDueReviewCount(getStoredReviewQueue().length);
    };
    syncState();
    return subscribeStorageSync(syncState);
  }, []);

  const displaySolved = Math.max(
    solvedCount,
    user?.stats?.solvedQuestions || 0
  );
  const displayStreak = user?.streakDays || user?.stats?.streakDays || 1;
  const isAuthenticated = Boolean(user && user.isAuthenticated !== false);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-3 sm:px-5">
      <a
        href="#main-content"
        className="visually-hidden focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-xl focus:shadow-md"
      >
        Chuyển tới nội dung chính
      </a>

      <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between gap-3">
        {/* Cụm bên trái: Nút đóng/mở Sidebar + Logo DevPrep + Pill chọn Cấp độ mục tiêu */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-expanded={sidebarExpanded}
            aria-label={
              sidebarExpanded
                ? 'Thu gọn thanh điều hướng bên'
                : 'Mở rộng thanh điều hướng bên'
            }
            className="hidden lg:inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#F4F7FA] hover:bg-slate-200/70 text-slate-700 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onToggleMobileDrawer}
            aria-expanded={mobileDrawerOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={
              mobileDrawerOpen
                ? 'Đóng menu điều hướng'
                : 'Mở menu điều hướng'
            }
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#F4F7FA] hover:bg-slate-200/70 text-slate-700 transition-colors shrink-0"
          >
            {mobileDrawerOpen ? (
              <X className="w-5 h-5" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5" aria-hidden="true" />
            )}
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 text-slate-900 font-extrabold text-xl tracking-tight whitespace-nowrap shrink-0"
          >
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white font-mono text-sm font-bold shadow-xs">
              {'</>'}
            </span>
            <span className="tracking-tight">
              DEV<span className="text-blue-600">PREP</span>
            </span>
          </Link>

          <div className="relative flex items-center bg-[#F4F7FA] hover:bg-slate-200/60 border border-slate-200/80 rounded-full pl-3 pr-2.5 py-1.5 transition-colors shrink-0">
            <LayoutGrid
              className="w-3.5 h-3.5 text-slate-500 mr-1.5 shrink-0 hidden sm:block"
              aria-hidden="true"
            />
            <label
              htmlFor="header-level-select"
              className="text-xs font-medium text-slate-600 whitespace-nowrap mr-1 hidden md:inline"
            >
              Cấp độ mục tiêu:
            </label>
            <select
              id="header-level-select"
              aria-label="Chọn cấp độ phỏng vấn mục tiêu"
              value={selectedLevel}
              onChange={(e) => onSelectLevel?.(e.target.value)}
              className="appearance-none bg-transparent text-xs font-bold text-blue-600 pr-4 cursor-pointer focus:outline-none whitespace-nowrap"
            >
              <option value="All">Tất cả cấp độ</option>
              {LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="w-3.5 h-3.5 text-blue-600 pointer-events-none -ml-3 shrink-0"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Cụm bên phải: Streak + Tiến độ câu hỏi + Thông báo + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 text-xs font-bold text-amber-700 transition-colors"
          >
            <Flame
              className="w-4 h-4 text-amber-500 fill-amber-500"
              aria-hidden="true"
            />
            <span>{displayStreak}</span>
            <span className="hidden sm:inline font-semibold text-amber-800">
              ngày
            </span>
          </Link>

          <Link
            to="/practice"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 hover:bg-blue-100/70 border border-blue-200/70 text-xs font-bold text-blue-700 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            <span>{displaySolved}/16 câu</span>
          </Link>

          <Link
            to="/analytics"
            aria-label={`Xem hàng đợi ôn tập ngắt quãng (${dueReviewCount} câu)`}
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#F4F7FA] hover:bg-slate-200/70 text-slate-700 transition-colors"
          >
            <Bell className="w-4 h-4" aria-hidden="true" />
            {dueReviewCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold inline-flex items-center justify-center ring-2 ring-white"
                aria-hidden="true"
              >
                {dueReviewCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 pl-1 pr-1 sm:pr-3 py-1 rounded-full bg-[#F4F7FA] hover:bg-slate-200/70 border border-slate-200/80 transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold inline-flex items-center justify-center">
                {getInitials(user.fullName)}
              </span>
              <span className="hidden md:inline text-xs font-semibold text-slate-800 max-w-[125px] truncate">
                {user.fullName}
              </span>
              {user.role === 'admin' && (
                <span className="hidden lg:inline px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                  ADMIN
                </span>
              )}
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Đăng nhập</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export function LeftNavigationRail({
  expanded = false,
  mobileOpen = false,
  onCloseMobile,
}) {
  const navigate = useNavigate();
  const { notify } = useToast();
  const [user, setUser] = useState(() => getStoredUser());

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    return subscribeStorageSync(sync);
  }, []);

  const isAuthenticated = Boolean(user && user.isAuthenticated !== false);
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || user?.role === 'admin'
  );

  const handleLogoutClick = async () => {
    await logout();
    notify({
      title: 'Đã đăng xuất khỏi tài khoản',
      message: 'Phiên đăng nhập và bộ nhớ tạm của tài khoản đã được xóa sạch.',
      type: 'info',
    });
    onCloseMobile?.();
    navigate('/login');
  };

  return (
    <>
      <aside
        aria-label="Thanh điều hướng bên trái"
        className={cn(
          'hidden lg:flex flex-col justify-between sticky top-16 h-[calc(100dvh-4rem)] bg-white border-r border-slate-200/80 py-4 px-2.5 shrink-0 select-none transition-all duration-200',
          expanded ? 'w-60' : 'w-[84px]'
        )}
      >
        <nav aria-label="Điều hướng chính">
          <ul role="list" className="space-y-1.5">
            {visibleNavItems.map(({ to, label, shortLabel, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center rounded-2xl transition-all whitespace-nowrap',
                      expanded
                        ? 'gap-3 px-3.5 py-3 text-sm'
                        : 'flex-col justify-center gap-1 py-2.5 px-1.5 text-[11px]',
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-bold shadow-2xs ring-1 ring-blue-100'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
                    )
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {expanded ? label : shortLabel}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="pt-3 border-t border-slate-100">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogoutClick}
              className={cn(
                'w-full flex items-center rounded-2xl transition-colors whitespace-nowrap text-slate-500 hover:text-red-600 hover:bg-red-50/70',
                expanded
                  ? 'gap-3 px-3.5 py-2.5 text-xs font-semibold'
                  : 'flex-col justify-center gap-1 py-2.5 px-1.5 text-[11px] font-medium'
              )}
            >
              <LogOut className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{expanded ? 'Đăng xuất tài khoản' : 'Đăng xuất'}</span>
            </button>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-2xl transition-colors whitespace-nowrap',
                  expanded
                    ? 'gap-3 px-3.5 py-2.5 text-xs font-semibold'
                    : 'flex-col justify-center gap-1 py-2.5 px-1.5 text-[11px] font-medium',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                )
              }
            >
              <LogIn className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{expanded ? 'Tài khoản / Đăng nhập' : 'Đăng nhập'}</span>
            </NavLink>
          )}
        </div>
      </aside>

      {mobileOpen && (
        <div
          id="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng di động"
          className="lg:hidden fixed inset-0 z-50 flex"
        >
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <nav
            aria-label="Điều hướng di động"
            className="relative z-10 w-72 max-w-[82dvw] bg-white h-full p-4 flex flex-col justify-between shadow-xl"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-extrabold text-base text-slate-900">
                  Điều hướng
                </span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  aria-label="Đóng menu"
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-600"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <ul role="list" className="space-y-1.5">
                {visibleNavItems.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={onCloseMobile}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                            : 'text-slate-700 hover:bg-slate-100'
                        )
                      }
                    >
                      <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={onCloseMobile}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 truncate max-w-[140px]"
                  >
                    {user.fullName}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogoutClick}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Đăng xuất</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={onCloseMobile}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
                >
                  <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Đăng nhập tài khoản</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
