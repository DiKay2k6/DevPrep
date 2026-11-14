import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
import { MOCK_USER_PROFILE } from './data/tracks.mock.js';

export default function App() {
  const [globalLevel, setGlobalLevel] = useState('All');
  const [selectedSkills, setSelectedSkills] = useState(
    MOCK_USER_PROFILE.selectedSkills
  );

  return (
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
          <Route path="admin" element={<AdminModerationPage />} />
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
  );
}
