import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Code2,
  Flame,
  Mail,
  Save,
  Shield,
  Target,
} from 'lucide-react';
import SkillPicker from '../../components/SkillPicker.jsx';
import {
  CAREER_TRACKS,
  LEVELS,
  MOCK_USER,
  MOCK_USER_PROFILE,
} from '../../data/tracks.mock.js';

export default function ProfilePage() {
  const outletCtx = useOutletContext() || {};
  const [localSkills, setLocalSkills] = useState(
    MOCK_USER_PROFILE.selectedSkills
  );

  const selectedSkills = outletCtx.selectedSkills || localSkills;
  const setSelectedSkills = outletCtx.setSelectedSkills || setLocalSkills;

  const [profile, setProfile] = useState({
    fullName: MOCK_USER.fullName,
    targetLevel: MOCK_USER.targetLevel,
    targetTrack: MOCK_USER.targetTrack,
    bio: MOCK_USER.bio,
  });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (typeof outletCtx.setGlobalLevel === 'function') {
      outletCtx.setGlobalLevel(profile.targetLevel);
    }
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Đầu trang Hồ sơ ứng viên */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm">
            NK
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {profile.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-semibold">
                <Shield className="w-3 h-3" aria-hidden="true" />
                <span>Vai trò: {MOCK_USER.role}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 inline-flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{MOCK_USER.email}</span>
              <span>•</span>
              <span>Tham gia từ {MOCK_USER.joinedAt}</span>
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
          <Link
            to="/login"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
          >
            Đổi tài khoản
          </Link>
        </div>
      </section>

      {/* Thống kê năng lực thực hành */}
      <section aria-label="Chỉ số luyện tập cá nhân" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Chuỗi ngày học (Streak)</span>
            <Flame className="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {MOCK_USER.stats.streakDays} ngày
          </p>
          <p className="text-xs text-slate-500 mt-1">Duy trì đều đặn mỗi ngày</p>
        </article>

        <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Câu hỏi đã giải</span>
            <Code2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {MOCK_USER.stats.solvedQuestions} / 68
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tổng {MOCK_USER.stats.totalSubmissions} lượt nộp bài
          </p>
        </article>

        <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Tỷ lệ chính xác</span>
            <Target className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">
            {MOCK_USER.stats.accuracyRate}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Trung bình cả 3 định dạng</p>
        </article>

        <article className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Tài liệu &amp; Đề thi thử</span>
            <BookOpen className="w-4 h-4 text-purple-600" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {MOCK_USER.stats.readArticles} bài đọc
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Đã hoàn thành {MOCK_USER.stats.completedMockTests} đề thi thử
          </p>
        </article>
      </section>

      {/* Form cập nhật Mục tiêu Phỏng vấn & Nhóm Kỹ năng Chuyên môn */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 id="profile-settings-heading" className="text-lg font-bold text-slate-900">
          Cấu hình Mục tiêu Ôn luyện &amp; Nhóm Kỹ năng
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">
          Tùy chỉnh cấp độ mục tiêu và các kỹ năng công nghệ để hệ thống đề xuất bài đọc, câu hỏi sát nhất với định hướng của bạn.
        </p>

        {savedNotice && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 inline-flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>
              Đã lưu cấu hình mục tiêu ({profile.targetLevel}) và {selectedSkills.length} kỹ năng chuyên môn!
            </span>
          </div>
        )}

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
              <label htmlFor="profile-bio" className="text-sm font-semibold text-slate-800">
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
                      setProfile((prev) => ({ ...prev, targetLevel: e.target.value }))
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
                      setProfile((prev) => ({ ...prev, targetTrack: e.target.value }))
                    }
                    className="accent-blue-600"
                  />
                  <span>{tr.id}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Tích hợp SkillPicker để quản lý Nhóm Kỹ năng – Công nghệ */}
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
