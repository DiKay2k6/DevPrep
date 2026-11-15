import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { getCurrentUser, updateProfile } from './api/authApi.js';
import { ToastProvider, useToast } from './components/ToastProvider.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import LandingLayout from './layouts/LandingLayout.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import ReaderLayout from './layouts/ReaderLayout.jsx';
import LandingPage from './features/tracks/LandingPage.jsx';
import HomeTracksPage from './features/tracks/HomeTracksPage.jsx';
import LoginPage from './features/auth/LoginPage.jsx';
import RegisterPage from './features/auth/RegisterPage.jsx';
import ProfilePage from './features/auth/ProfilePage.jsx';
import StudyHubListPage from './features/study-hub/StudyHubListPage.jsx';
import ArticleDetailPage from './features/study-hub/ArticleDetailPage.jsx';
import PracticeListPage from './features/practice/PracticeListPage.jsx';
import PracticeWorkspacePage from './features/practice/PracticeWorkspacePage.jsx';
import QuickTestPage from './features/mock-test/QuickTestPage.jsx';
import MockTestSetupPage from './features/mock-test/MockTestSetupPage.jsx';
import MockTestRoomPage from './features/mock-test/MockTestRoomPage.jsx';
import MockTestResultPage from './features/mock-test/MockTestResultPage.jsx';
import AnalyticsDashboardPage from './features/analytics/AnalyticsDashboardPage.jsx';
import AdminModerationPage from './features/admin/AdminModerationPage.jsx';
import {
  getStoredSelectedSkills,
  getStoredTargetLevel,
  getStoredUser,
  setStoredSelectedSkills,
  setStoredTargetLevel,
  subscribeStorageSync,
} from './utils/storage.js';

export function AdminRoute({ children }) {
  const { notify } = useToast();
  const [user, setUser] = useState(() => getStoredUser());
  const notifiedRef = useRef(false);

  useEffect(() => {
    return subscribeStorageSync(() => {
      setUser(getStoredUser());
    });
  }, []);

  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    if (!isAdmin && !notifiedRef.current) {
      notifiedRef.current = true;
      notify({
        title: 'Truy cập bị từ chối (RBAC)',
        message:
          'Chỉ tài khoản Quản trị viên (role: admin) mới được phép truy cập trang Kiểm duyệt.',
        type: 'error',
      });
    }
  }, [isAdmin, notify]);

  if (!isAdmin) {
    return <Navigate to="/tracks" replace />;
  }

  return children;
}

const areStringArraysEqual = (a, b) =>
  Array.isArray(a) &&
  Array.isArray(b) &&
  a.length === b.length &&
  a.every((item, idx) => item === b[idx]);

export default function App() {
  const [globalLevel, setGlobalLevelState] = useState(() =>
    getStoredTargetLevel()
  );
  const [selectedSkills, setSelectedSkillsState] = useState(() =>
    getStoredSelectedSkills()
  );

  const didBootstrapAuthRef = useRef(false);

  // Đồng bộ hồ sơ người dùng thật từ MongoDB (GET /api/v1/auth/me) đúng 1 lần khi khởi động app
  useEffect(() => {
    if (didBootstrapAuthRef.current) return;
    didBootstrapAuthRef.current = true;

    getCurrentUser().then((user) => {
      if (!user) return;
      if (user.targetLevel) {
        setGlobalLevelState((prev) =>
          prev === user.targetLevel ? prev : user.targetLevel
        );
      }
      if (Array.isArray(user.selectedSkills)) {
        setSelectedSkillsState((prev) =>
          areStringArraysEqual(prev, user.selectedSkills)
            ? prev
            : user.selectedSkills
        );
      }
    });
  }, []);

  const setGlobalLevel = useCallback((nextLevel) => {
    setGlobalLevelState((prev) => {
      const resolved =
        typeof nextLevel === 'function' ? nextLevel(prev) : nextLevel;
      setStoredTargetLevel(resolved);
      if (resolved && resolved !== 'All' && getStoredUser()) {
        updateProfile({ targetLevel: resolved }).catch(() => {});
      }
      return resolved;
    });
  }, []);

  const setSelectedSkills = useCallback((nextSkills) => {
    setSelectedSkillsState((prev) => {
      const resolved =
        typeof nextSkills === 'function' ? nextSkills(prev) : nextSkills;
      setStoredSelectedSkills(resolved);
      if (getStoredUser()) {
        updateProfile({ selectedSkills: resolved }).catch(() => {});
      }
      return areStringArraysEqual(prev, resolved) ? prev : resolved;
    });
  }, []);

  useEffect(() => {
    return subscribeStorageSync(() => {
      const nextLevel = getStoredTargetLevel();
      const nextSkills = getStoredSelectedSkills();
      setGlobalLevelState((prev) => (prev === nextLevel ? prev : nextLevel));
      setSelectedSkillsState((prev) =>
        areStringArraysEqual(prev, nextSkills) ? prev : nextSkills
      );
    });
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Vùng Công khai (Public): Trang chủ (/) và Đánh giá nhanh (/quick-test) */}
          <Route element={<LandingLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="quick-test" element={<QuickTestPage />} />
          </Route>

          {/* Bố cục Xác thực riêng biệt (/login, /register) — không có Sidebar & Top Header nội bộ */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Không gian Học tập Nội bộ (HUB) dùng MainLayout có Left Sidebar */}
          <Route
            element={
              <MainLayout
                globalLevel={globalLevel}
                setGlobalLevel={setGlobalLevel}
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
              />
            }
          >
            <Route path="tracks" element={<HomeTracksPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="study-hub" element={<StudyHubListPage />} />
            <Route path="practice" element={<PracticeListPage />} />
            <Route path="mock-test" element={<MockTestSetupPage />} />
            <Route path="mock-test/room" element={<MockTestRoomPage />} />
            <Route path="mock-test/result" element={<MockTestResultPage />} />
            <Route path="analytics" element={<AnalyticsDashboardPage />} />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminModerationPage />
                </AdminRoute>
              }
            />
          </Route>

          {/* Trang đọc tài liệu tập trung dùng ReaderLayout */}
          <Route
            element={
              <ReaderLayout
                globalLevel={globalLevel}
                setGlobalLevel={setGlobalLevel}
              />
            }
          >
            <Route path="study-hub/:slug" element={<ArticleDetailPage />} />
          </Route>

          {/* Không gian làm bài tập chia đôi màn hình (WorkspaceSplitLayout) */}
          <Route
            path="practice/:questionId"
            element={<PracticeWorkspacePage />}
          />

          {/* Điều hướng mặc định nếu gõ sai đường dẫn */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
