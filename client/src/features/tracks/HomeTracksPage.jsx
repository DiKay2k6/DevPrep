import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Layers,
  Layout,
  Search,
  Server,
  SlidersHorizontal,
  Smartphone,
  Trophy,
  X,
} from 'lucide-react';
import { getArticles } from '../../api/articlesApi.js';
import { getQuestions } from '../../api/questionsApi.js';
import { SkillPickerModal } from '../../components/SkillPicker.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import {
  ALL_SKILLS,
  CAREER_TRACKS,
  LEVELS,
  MOCK_USER_PROFILE,
} from '../../data/tracks.mock.js';
import { cn } from '../../utils/cn.js';
import { getSolvedQuestionIds } from '../../utils/storage.js';
import SkillRecommendationsSection from './SkillRecommendationsSection.jsx';

const TRACK_VISUALS = {
  Frontend: {
    icon: Layout,
    bannerBg: 'bg-gradient-to-br from-sky-100/90 via-blue-50 to-indigo-50',
    iconBg: 'bg-blue-600',
    domainText: 'HTML/CSS • Tailwind CSS • ReactJS',
  },
  Backend: {
    icon: Server,
    bannerBg: 'bg-gradient-to-br from-emerald-100/90 via-teal-50 to-cyan-50',
    iconBg: 'bg-emerald-600',
    domainText: 'Node.js • Java • Python • Spring Boot',
  },
  'Full-stack': {
    icon: Layers,
    bannerBg: 'bg-gradient-to-br from-indigo-100/90 via-slate-50 to-blue-50',
    iconBg: 'bg-indigo-600',
    domainText: 'ReactJS • ExpressJS • JWT & Bảo mật',
  },
  Mobile: {
    icon: Smartphone,
    bannerBg: 'bg-gradient-to-br from-rose-100/90 via-pink-50 to-orange-50',
    iconBg: 'bg-rose-600',
    domainText: 'Kotlin Android • Swift iOS • React Native',
  },
  Database: {
    icon: Database,
    bannerBg: 'bg-gradient-to-br from-amber-100/90 via-orange-50 to-yellow-50',
    iconBg: 'bg-amber-600',
    domainText: 'MongoDB • SQL • Thuật toán O(n)',
  },
};

const LEVEL_PILLS = [
  { id: 'All', label: 'Tất cả' },
  { id: 'Intern', label: 'Intern' },
  { id: 'Fresher', label: 'Fresher' },
  { id: 'Junior', label: 'Junior' },
  { id: 'Middle', label: 'Middle' },
];

export default function HomeTracksPage() {
  const { notify } = useToast();
  const outletCtx = useOutletContext() || {};
  const globalLevel = outletCtx.globalLevel || 'All';
  const setGlobalLevel = outletCtx.setGlobalLevel || (() => {});
  const selectedSkills =
    outletCtx.selectedSkills || MOCK_USER_PROFILE.selectedSkills;
  const setSelectedSkills = outletCtx.setSelectedSkills || (() => {});

  const [activeTab, setActiveTab] = useState('tracks');
  const [searchText, setSearchText] = useState('');
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [recommendedArticles, setRecommendedArticles] = useState([]);
  const [recommendedQuestions, setRecommendedQuestions] = useState([]);

  const activeLevelForRoadmap = globalLevel === 'All' ? 'Junior' : globalLevel;
  const solvedCount = Math.max(getSolvedQuestionIds().length, 38);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getArticles({
        level: globalLevel,
        onlyMySkills: true,
        selectedSkills,
      }),
      getQuestions({
        status: 'approved',
        level: globalLevel,
        onlyMySkills: true,
        selectedSkills,
        searchQuery: searchText,
      }),
    ]).then(([arts, qs]) => {
      if (!mounted) return;
      setRecommendedArticles(arts);
      setRecommendedQuestions(qs);
    });
    return () => {
      mounted = false;
    };
  }, [globalLevel, selectedSkills, searchText]);

  const removeSkill = (skillId) => {
    const next = selectedSkills.filter((id) => id !== skillId);
    setSelectedSkills(next);
    notify({
      title: 'Đã cập nhật nhóm kỹ năng mục tiêu',
      message: `Còn ${next.length} kỹ năng đang được ưu tiên đề xuất.`,
      type: 'info',
    });
  };

  const getSkillLabel = (skillId) =>
    ALL_SKILLS.find((s) => s.id === skillId)?.label || skillId;

  const filteredTracks = CAREER_TRACKS.filter((tr) => {
    const kw = searchText.trim().toLowerCase();
    if (!kw) return true;
    return (
      tr.title.toLowerCase().includes(kw) ||
      tr.subtitle.toLowerCase().includes(kw) ||
      tr.coreTags.some((t) => t.toLowerCase().includes(kw))
    );
  });

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="selected-skills-heading"
        className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
      >
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="selected-skills-heading"
              className="text-sm sm:text-base font-extrabold text-slate-900"
            >
              Bộ kỹ năng mục tiêu của bạn ({selectedSkills.length})
            </h2>
            <span className="text-xs text-slate-500">
              — Đề xuất bài học &amp; câu hỏi theo công nghệ độc lập với cấp độ
            </span>
          </div>

          {selectedSkills.length === 0 ? (
            <p className="text-xs text-amber-700 font-medium">
              Bạn chưa chọn kỹ năng nào. Hệ thống đang hiển thị toàn bộ chủ đề mặc định.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {selectedSkills.map((skillId) => (
                <span
                  key={skillId}
                  className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold"
                >
                  <span>{getSkillLabel(skillId)}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skillId)}
                    aria-label={`Bỏ chọn kỹ năng ${getSkillLabel(skillId)}`}
                    className="w-4 h-4 rounded-full inline-flex items-center justify-center hover:bg-blue-200/70 text-blue-700 transition-colors"
                  >
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setSkillModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-2xs transition-colors shrink-0"
        >
          <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          <span>Tùy chỉnh kỹ năng</span>
        </button>
      </section>

      <section
        aria-labelledby="tracks-dashboard-heading"
        className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h1
              id="tracks-dashboard-heading"
              className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight"
            >
              Lộ trình &amp; Chuyên ngành
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Trọng tâm kiến thức hiện tại đang hiển thị theo cấp độ{' '}
              <strong className="text-slate-800">{activeLevelForRoadmap}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Chế độ xem lộ trình"
              className="inline-flex items-center p-1 rounded-full bg-[#F4F7FA] border border-slate-200/80"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'tracks'}
                onClick={() => setActiveTab('tracks')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                  activeTab === 'tracks'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Theo Chuyên ngành
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'levels'}
                onClick={() => setActiveTab('levels')}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap',
                  activeTab === 'levels'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Theo Cấp độ
              </button>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/80 border border-amber-200/80 text-xs font-bold text-slate-800 whitespace-nowrap">
              <Trophy
                className="w-3.5 h-3.5 text-amber-500"
                aria-hidden="true"
              />
              <span>{solvedCount}/68 câu</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {LEVEL_PILLS.map((pill) => {
              const active = globalLevel === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setGlobalLevel(pill.id)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap',
                    active
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:text-slate-900'
                  )}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <label htmlFor="tracks-search-input" className="visually-hidden">
              Tìm kiếm chuyên ngành hoặc chủ đề
            </label>
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="tracks-search-input"
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm chuyên ngành, kỹ năng..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full border border-slate-200 bg-[#F8FAFC] text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600"
            />
          </div>
        </div>

        {activeTab === 'tracks' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filteredTracks.map((track) => {
              const visual = TRACK_VISUALS[track.id] || TRACK_VISUALS.Frontend;
              const Icon = visual.icon;
              const milestones =
                track.milestones[activeLevelForRoadmap] ||
                track.milestones.Junior;

              return (
                <article
                  key={track.id}
                  className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div
                    className={cn(
                      'h-24 rounded-xl p-3.5 flex flex-col justify-between',
                      visual.bannerBg
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-slate-700 bg-white/85 px-2.5 py-0.5 rounded-full">
                        {track.id}
                      </span>
                      <span
                        className={cn(
                          'w-7 h-7 rounded-full text-white flex items-center justify-center shadow-xs shrink-0',
                          visual.iconBg
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 truncate">
                      {visual.domainText}
                    </p>
                  </div>

                  <div className="space-y-2 flex-1">
                    <h2 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      <Link
                        to={`/practice?category=${encodeURIComponent(track.id)}`}
                      >
                        {track.title}
                      </Link>
                    </h2>
                    <ul className="space-y-1">
                      {milestones.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-1.5 text-xs text-slate-600 leading-snug"
                        >
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <span className="line-clamp-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <footer className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <Link
                      to={`/study-hub?category=${encodeURIComponent(track.id)}`}
                      className="text-slate-600 hover:text-blue-600"
                    >
                      {track.articleCount} bài học
                    </Link>
                    <Link
                      to={`/practice?category=${encodeURIComponent(track.id)}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <span>{track.questionCount} câu</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </footer>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {LEVELS.map((lvl) => {
              const isSelected = activeLevelForRoadmap === lvl.id;
              return (
                <article
                  key={lvl.id}
                  className={cn(
                    'rounded-2xl p-5 border transition-all flex flex-col justify-between gap-4',
                    isSelected
                      ? 'bg-blue-50/25 border-blue-600'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  )}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={cn(
                          'px-3 py-0.5 rounded-full text-xs font-bold border',
                          lvl.badgeClass
                        )}
                      >
                        {lvl.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {lvl.targetQuestionCount} câu hỏi
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-slate-900">
                      {lvl.experience}
                    </h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {lvl.focus}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setGlobalLevel(lvl.id)}
                    className={cn(
                      'w-full py-2 px-3 rounded-xl text-xs font-bold transition-colors',
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#F4F7FA] hover:bg-slate-200 text-slate-700'
                    )}
                  >
                    {isSelected
                      ? 'Đang chọn cấp độ này'
                      : `Chọn cấp độ ${lvl.label}`}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <SkillRecommendationsSection
        selectedSkills={selectedSkills}
        globalLevel={globalLevel}
        recommendedArticles={recommendedArticles}
        recommendedQuestions={recommendedQuestions}
      />

      <SkillPickerModal
        isOpen={skillModalOpen}
        onClose={() => setSkillModalOpen(false)}
        selectedSkills={selectedSkills}
        onChange={setSelectedSkills}
      />
    </div>
  );
}
