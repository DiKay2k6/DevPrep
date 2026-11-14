import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar, { LeftNavigationRail } from '../components/Navbar.jsx';

export default function MainLayout({
  globalLevel,
  setGlobalLevel,
  selectedSkills,
  setSelectedSkills,
}) {
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
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 focus:outline-none"
          >
            <Outlet
              context={{
                globalLevel,
                setGlobalLevel,
                selectedSkills,
                setSelectedSkills,
              }}
            />
          </main>

          <footer className="max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">DevPrep Platform</span>
              <span>•</span>
              <span>Nền tảng Ôn luyện Phỏng vấn CNTT (Intern → Middle)</span>
            </div>
            <div className="flex items-center gap-3">
              <span>MERN Stack (JavaScript ES6+)</span>
              <span>•</span>
              <span>Light Mode EdTech UI</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
