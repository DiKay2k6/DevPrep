import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import RoadmapMegaMenu from '../components/RoadmapMegaMenu.jsx';
import { cn } from '../utils/cn.js';

const PUBLIC_NAV_ITEMS = [
  { id: 'lo-trinh', label: 'Lộ trình 4 cấp độ', hasPopover: true },
  { id: 'kho-tai-lieu', label: 'Kho tài liệu' },
  { id: 'luyen-tap', label: 'Luyện tập' },
  { id: 'thi-thu', label: 'Thi thử' },
  { id: 'phan-tich', label: 'Phân tích năng lực' },
];

/**
 * Bố cục Vùng Công khai (`/` và `/quick-test`) — Không có Sidebar trái.
 * Sử dụng Sticky Glassmorphism Header chuyển màu mượt khi cuộn quá 40px.
 */
export default function LandingLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cuộn mượt tới section khi URL có hash (ví dụ chuyển từ /quick-test về /#kho-tai-lieu)
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const targetId = location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
      }
    }
  }, [location.pathname, location.hash]);

  const handlePublicSectionClick = (e, sectionId) => {
    e.preventDefault();
    setIsRoadmapOpen(false);
    setMobileMenuOpen(false);

    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }

    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#F4F7FA] text-slate-900 scroll-smooth">
      <a
        href="#landing-main"
        className="visually-hidden focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0052FF] focus:text-white focus:rounded-xl focus:shadow-md"
      >
        Chuyển tới nội dung chính
      </a>

      {/* Sticky Glassmorphism Header: đầu trang nền #0052FF/90, cuộn > 40px chuyển sang bg-white/95 */}
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300 backdrop-blur-md',
          isScrolled
            ? 'bg-white/95 text-slate-800 shadow-sm border-b border-slate-200/80'
            : 'bg-[#0052FF]/90 text-white border-b border-white/10'
        )}
      >
        <div className="max-w-[1380px] w-full mx-auto px-6 lg:px-10 h-20 flex items-center justify-between gap-6">
          {/* Logo DevPrep */}
          <Link
            to="/"
            className={cn(
              'flex items-center gap-2.5 font-extrabold text-lg tracking-tight whitespace-nowrap shrink-0 transition-colors',
              isScrolled ? 'text-slate-900' : 'text-white'
            )}
          >
            <span
              className={cn(
                'inline-flex items-center justify-center w-8 h-8 rounded-xl font-mono text-xs font-bold transition-colors',
                isScrolled
                  ? 'bg-[#0052FF] text-white shadow-xs'
                  : 'bg-white text-[#0052FF]'
              )}
            >
              {'</>'}
            </span>
            <span>
              DEV
              <span className={isScrolled ? 'text-[#0052FF]' : 'text-sky-200'}>
                PREP
              </span>
            </span>
          </Link>

          {/* Menu điều hướng cuộn mượt tới 5 section giới thiệu trên LandingPage */}
          <nav aria-label="Điều hướng trang chủ" className="hidden lg:block">
            <ul role="list" className="flex items-center gap-2 xl:gap-3 whitespace-nowrap">
              {PUBLIC_NAV_ITEMS.map((item) => {
                if (item.hasPopover) {
                  return (
                    <li
                      key={item.id}
                      className="relative"
                      onMouseEnter={() => setIsRoadmapOpen(true)}
                      onMouseLeave={() => setIsRoadmapOpen(false)}
                      onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                          setIsRoadmapOpen(false);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsRoadmapOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-center">
                        <a
                          href={`/#${item.id}`}
                          onClick={(e) => handlePublicSectionClick(e, item.id)}
                          aria-expanded={isRoadmapOpen}
                          aria-controls="roadmap-preview-popover"
                          onFocus={() => setIsRoadmapOpen(true)}
                          className={cn(
                            'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                            isScrolled
                              ? 'text-slate-700 hover:text-[#0052FF] hover:bg-blue-50/80'
                              : 'text-white/95 hover:text-white hover:bg-white/15'
                          )}
                        >
                          <span>{item.label}</span>
                          <ChevronDown
                            className={cn(
                              'w-3.5 h-3.5 transition-transform duration-200',
                              isRoadmapOpen && 'rotate-180'
                            )}
                            aria-hidden="true"
                          />
                        </a>
                      </div>

                      {/* Mega-Menu 2x2 nền trắng đục hoàn toàn */}
                      {isRoadmapOpen && (
                        <RoadmapMegaMenu
                          onSelectSection={handlePublicSectionClick}
                          onClose={() => setIsRoadmapOpen(false)}
                        />
                      )}
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <a
                      href={`/#${item.id}`}
                      onClick={(e) => handlePublicSectionClick(e, item.id)}
                      className={cn(
                        'inline-flex items-center px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200',
                        isScrolled
                          ? 'text-slate-700 hover:text-[#0052FF] hover:bg-blue-50/80'
                          : 'text-white/90 hover:text-white hover:bg-white/15'
                      )}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Cụm nút hành động bên phải: Chỉ giữ Đăng nhập & Test đầu vào miễn phí */}
          <div className="flex items-center gap-3 shrink-0 whitespace-nowrap">
            <Link
              to="/login"
              className={cn(
                'inline-flex items-center px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200',
                isScrolled
                  ? 'text-slate-700 hover:text-[#0052FF] hover:bg-slate-100'
                  : 'text-white hover:bg-white/15'
              )}
            >
              Đăng nhập
            </Link>

            <Link
              to="/quick-test"
              className={cn(
                'inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold shadow-sm transition-all duration-200',
                isScrolled
                  ? 'bg-[#0052FF] text-white hover:bg-blue-700'
                  : 'bg-white text-[#0052FF] hover:bg-blue-50'
              )}
            >
              <span>Test đầu vào miễn phí</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Mở menu điều hướng"
              className={cn(
                'lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors',
                isScrolled
                  ? 'text-slate-700 hover:bg-slate-100'
                  : 'text-white hover:bg-white/15'
              )}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Ngăn kéo điều hướng cho màn hình nhỏ */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white text-slate-900 border-t border-slate-200 px-4 py-4 shadow-lg space-y-3">
            <ul role="list" className="space-y-1">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={`/#${item.id}`}
                    onClick={(e) => handlePublicSectionClick(e, item.id)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0052FF]"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      <main id="landing-main" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#0052FF] text-white font-mono text-[10px] font-bold">
              {'</>'}
            </span>
            <span className="font-bold text-slate-800">DevPrep</span>
            <span>— Nền tảng ôn luyện phỏng vấn kỹ sư CNTT</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-semibold text-slate-600">
            <a
              href="/#lo-trinh"
              onClick={(e) => handlePublicSectionClick(e, 'lo-trinh')}
              className="hover:text-[#0052FF]"
            >
              Lộ trình 4 cấp độ
            </a>
            <Link to="/quick-test" className="hover:text-[#0052FF]">
              Test đầu vào miễn phí
            </Link>
            <Link to="/login" className="hover:text-[#0052FF]">
              Đăng nhập HUB
            </Link>
            <Link to="/register" className="hover:text-[#0052FF]">
              Đăng ký tài khoản
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
