import { useEffect, useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import {
  BookOpen,
  Code2,
  Flame,
  LogOut,
  Mail,
  Save,
  Shield,
  Target,
} from 'lucide-react';
import { getCurrentUser, logout, updateProfile } from '../../api/authApi.js';
import SkillPicker from '../../components/SkillPicker.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { LoadingSkeleton } from '../../components/UiStates.jsx';
import {
  CAREER_TRACKS,
  LEVELS,
} from '../../data/tracks.mock.js';
import { getStoredUser } from '../../utils/storage.js';

const EMPTY_STATS = {
  streakDays: 1,
  solvedQuestions: 0,
  readArticles: 0,
  accuracyRate: 0,
  completedMockTests: 0,
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const outletCtx = useOutletContext() || {};
  const selectedSkills = outletCtx.selectedSkills || [];
  const setSelectedSkills = outletCtx.setSelectedSkills || (() => {});

  const cachedUser = getStoredUser();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(cachedUser));
  const [userStats, setUserStats] = useState(cachedUser?.stats || EMPTY_STATS);
  const [userMeta, setUserMeta] = useState({
    email: cachedUser?.email || '',
    role: cachedUser?.role || 'user',
    joinedAt: cachedUser?.joinedAt || '03/2026',
  });
  const [profile, setProfile] = useState({
    fullName: cachedUser?.fullName || '',
    targetLevel:
      outletCtx.globalLevel && outletCtx.globalLevel !== 'All'
        ? outletCtx.globalLevel
        : cachedUser?.targetLevel || 'Fresher',
    targetTrack: cachedUser?.targetTrack || 'Full-stack',
    bio: cachedUser?.bio || '',
  });

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((user) => {
        if (!mounted) return;
        if (!user) {
          setIsAuthenticated(false);
          return;
        }
        setIsAuthenticated(true);
        setProfile({
          fullName: user.fullName || '',
          targetLevel: user.targetLevel || 'Fresher',
          targetTrack: user.targetTrack || 'Full-stack',
          bio: user.bio || '',
        });
        setUserStats(user.stats || EMPTY_STATS);
        setUserMeta({
          email: user.email || '',
          role: user.role || 'user',
          joinedAt: user.joinedAt || '03/2026',
        });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateProfile({
        ...profile,
        selectedSkills,
      });
      if (typeof outletCtx.setGlobalLevel === 'function') {
        outletCtx.setGlobalLevel(profile.targetLevel);
      }
      setUserStats(updated.stats || userStats);
      notify({
        title: 'Đã lưu cấu hình hồ sơ & kỹ năng!',
        message: `Cấp độ mục tiêu: ${profile.targetLevel} • ${selectedSkills.length} kỹ năng chuyên môn đã được đồng bộ.`,
        type: 'success',
      });
    } catch (err) {
      notify({
        title: 'Lỗi khi lưu hồ sơ',
        message: err.message,
        type: 'error',
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    notify({
      title: 'Đã đăng xuất khỏi phiên làm việc',
      message: 'Toàn bộ token và phiên làm việc hiện tại đã được xóa sạch.',
      type: 'info',
    });
    navigate('/login');
  };

  if (loading) {
    return <LoadingSkeleton rows={3} label="Đang tải hồ sơ ứng viên..." />;
  }

  if (!isAuthenticated) {
    return (
      <section className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto">
        <h1 className="text-xl font-bold text-slate-900">
          Bạn chưa đăng nhập tài khoản
        </h1>
        <p className="text-sm text-slate-600">
          Vui lòng đăng nhập hoặc tạo tài khoản mới để quản lý hồ sơ cá nhân, đồng bộ nhóm kỹ năng và lưu tiến độ luyện tập vào cơ sở dữ liệu.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
          >
            Đăng nhập ngay
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold transition-colors"
          >
            Tạo tài khoản mới
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Đầu trang Hồ sơ ứng viên */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
            {profile.fullName
              .split(/\s+/)
              .slice(-2)
              .map((w) => w[0])
              .join('')
              .toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {profile.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                <Shield className="w-3 h-3" aria-hidden="true" />
                <span>Vai trò: {userMeta.role}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{userMeta.email}</span>
              <span>•</span>
              <span>Tham gia từ {userMeta.joinedAt}</span>
            </p>
            <p className="text-sm text-slate-700 pt-1">{profile.bio}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            to="/analytics"
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors"
          >
            Xem Bản đồ Lỗ hổng Kiến thức
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 hover:border-red-200 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </section>

      {/* Thống kê năng lực thực hành */}
      <section
        aria-label="Chỉ số luyện tập cá nhân"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Chuỗi ngày học (Streak)</span>
            <Flame className="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {userStats.streakDays} ngày
          </p>
          <p className="text-xs text-slate-500 mt-1">Duy trì đều đặn mỗi ngày</p>
        </article>

        <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Câu hỏi đã giải</span>
            <Code2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {userStats.solvedQuestions} / 68
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Đồng bộ tự động với bộ nhớ trình duyệt
          </p>
        </article>

        <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Tỷ lệ chính xác</span>
            <Target className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {userStats.accuracyRate}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Trung bình cả 3 định dạng</p>
        </article>

        <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Tài liệu đã hoàn thành</span>
            <BookOpen className="w-4 h-4 text-purple-600" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {userStats.readArticles} bài đọc
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Đã hoàn thành {userStats.completedMockTests} đề thi thử
          </p>
        </article>
      </section>

      {/* Form cập nhật Mục tiêu Phỏng vấn & Nhóm Kỹ năng Chuyên môn */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2
          id="profile-settings-heading"
          className="text-lg font-bold text-slate-900"
        >
          Cấu hình Mục tiêu Ôn luyện &amp; Nhóm Kỹ năng
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">
          Tùy chỉnh cấp độ mục tiêu và các kỹ năng công nghệ để hệ thống đề xuất bài đọc, câu hỏi sát nhất với định hướng của bạn.
        </p>

        <form
          aria-labelledby="profile-settings-heading"
          onSubmit={handleSave}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="profile-fullname"
                className="text-sm font-semibold text-slate-800"
              >
                Họ và tên hiển thị
              </label>
              <input
                id="profile-fullname"
                name="fullName"
                type="text"
                autoComplete="name"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-blue-600"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="profile-bio"
                className="text-sm font-semibold text-slate-800"
              >
                Ghi chú mục tiêu nghề nghiệp
              </label>
              <input
                id="profile-bio"
                name="bio"
                type="text"
                value={profile.bio}
                onChange={(e) =>
                  setProfile((prev) => ({ ...prev, bio: e.target.value }))
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 focus:border-blue-600"
              />
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-800">
              Cấp độ phỏng vấn mục tiêu
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {LEVELS.map((lvl) => (
                <label
                  key={lvl.id}
                  htmlFor={`prof-lvl-${lvl.id}`}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-semibold text-slate-800"
                >
                  <input
                    id={`prof-lvl-${lvl.id}`}
                    type="radio"
                    name="targetLevel"
                    value={lvl.id}
                    checked={profile.targetLevel === lvl.id}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        targetLevel: e.target.value,
                      }))
                    }
                    className="accent-blue-600"
                  />
                  <span>{lvl.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-slate-800">
              Chuyên ngành trọng tâm
            </legend>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {CAREER_TRACKS.map((tr) => (
                <label
                  key={tr.id}
                  htmlFor={`prof-track-${tr.id}`}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-semibold text-slate-800"
                >
                  <input
                    id={`prof-track-${tr.id}`}
                    type="radio"
                    name="targetTrack"
                    value={tr.id}
                    checked={profile.targetTrack === tr.id}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        targetTrack: e.target.value,
                      }))
                    }
                    className="accent-blue-600"
                  />
                  <span>{tr.id}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Nhóm Kỹ năng &amp; Công nghệ chuyên môn
              </h3>
              <p className="text-xs text-slate-500">
                Chọn các kỹ năng cụ thể (Java, Python, HTML/Tailwind CSS, ReactJS, Kotlin, Swift...) để lọc đề xuất học tập độc lập với cấp độ.
              </p>
            </div>
            <SkillPicker
              selectedSkills={selectedSkills}
              onChange={setSelectedSkills}
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" aria-hidden="true" />
            <span>Lưu thay đổi hồ sơ &amp; kỹ năng</span>
          </button>
        </form>
      </section>
    </div>
  );
}
