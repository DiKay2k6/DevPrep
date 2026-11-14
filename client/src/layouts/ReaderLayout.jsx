import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, BookOpen, Code2 } from 'lucide-react';
import Navbar, { LeftNavigationRail } from '../components/Navbar.jsx';

/**
 * Bố cục đọc tài liệu tập trung (ReaderLayout) đồng bộ với App Shell 2 vùng.
 */
export default function ReaderLayout({ globalLevel, setGlobalLevel }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col bg-[#F4F7FA] text-slate-900">
      <Navbar
        selectedLevel={globalLevel}
        onSelectLevel={setGlobalLevel}
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((prev) => !prev)}
        mobileDrawerOpen={mobileDrawerOpen}
        onToggleMobileDrawer={() => setMobileDrawerOpen((prev) => !prev)}
      />

      <div className="flex-1 flex min-w-0">
        <LeftNavigationRail
          expanded={sidebarExpanded}
          mobileOpen={mobileDrawerOpen}
          onCloseMobile={() => setMobileDrawerOpen(false)}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-white/80 border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 text-xs">
              <Link
                to="/study-hub"
                className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Quay lại Kho Tài liệu (Study Hub)</span>
              </Link>

              <div className="flex items-center gap-3 text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                  <span>Reader Mode</span>
                </span>
                <Link
                  to="/practice"
                  className="hidden sm:inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
                >
                  <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Sang Phòng Luyện tập</span>
                </Link>
              </div>
            </div>
          </div>

          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 focus:outline-none"
          >
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
              <Outlet context={{ globalLevel, setGlobalLevel }} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
