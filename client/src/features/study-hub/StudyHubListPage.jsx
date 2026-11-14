import { useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Code2, FileText } from 'lucide-react';
import LevelFilterBar from '../../components/LevelFilterBar.jsx';
import { ARTICLES_MOCK } from '../../data/articles.mock.js';
import { LEVELS, MOCK_USER_PROFILE } from '../../data/tracks.mock.js';
import { cn } from '../../utils/cn.js';

const CATEGORY_PASTELS = {
  Frontend: 'from-sky-100/80 via-blue-50 to-indigo-50 text-blue-700',
  Backend: 'from-emerald-100/80 via-teal-50 to-cyan-50 text-emerald-700',
  'Full-stack': 'from-indigo-100/80 via-slate-50 to-blue-50 text-indigo-700',
  Mobile: 'from-rose-100/80 via-pink-50 to-orange-50 text-rose-700',
  Database: 'from-amber-100/80 via-orange-50 to-yellow-50 text-amber-800',
};

export default function StudyHubListPage() {
  const outletCtx = useOutletContext() || {};
  const globalLevel = outletCtx.globalLevel || 'All';
  const setGlobalLevel = outletCtx.setGlobalLevel || (() => {});
  const selectedSkills =
    outletCtx.selectedSkills || MOCK_USER_PROFILE.selectedSkills;

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [onlyMySkills, setOnlyMySkills] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const filteredArticles = ARTICLES_MOCK.filter((article) => {
    const matchLevel = globalLevel === 'All' || article.level === globalLevel;
    const matchCategory =
      selectedCategory === 'All' || article.category === selectedCategory;
    const matchSkills =
      !onlyMySkills ||
      selectedSkills.length === 0 ||
      article.tags.some((t) => selectedSkills.includes(t));
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      article.title.toLowerCase().includes(q) ||
      article.summary.toLowerCase().includes(q) ||
      article.tags.some((t) => t.toLowerCase().includes(q));
    return matchLevel && matchCategory && matchSkills && matchQuery;
  });

  const getLevelBadgeClass = (levelId) =>
    LEVELS.find((l) => l.id === levelId)?.badgeClass ||
    'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="space-y-6">
      <header className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Kho Tài liệu Kỹ thuật
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Hệ thống bài đọc lý thuyết cốt lõi kèm ví dụ minh họa và câu hỏi thực hành theo từng nhóm kỹ năng – công nghệ.
          </p>
        </div>

        <Link
          to="/practice"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shrink-0 shadow-2xs transition-colors"
        >
          <Code2 className="w-4 h-4" aria-hidden="true" />
          <span>Sang Phòng Luyện tập</span>
        </Link>
      </header>

      <LevelFilterBar
        selectedLevel={globalLevel}
        onLevelChange={setGlobalLevel}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        onlyMySkills={onlyMySkills}
        onToggleOnlyMySkills={() => setOnlyMySkills((prev) => !prev)}
        selectedSkills={selectedSkills}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm bài viết theo kỹ năng (VD: Java, Python, Tailwind CSS, Kotlin, Swift...)"
        totalCount={filteredArticles.length}
      />

      {onlyMySkills && (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
          <span>
            Đang lọc bài viết khớp với bộ kỹ năng của bạn:{' '}
            <strong>{selectedSkills.join(', ') || 'Chưa chọn kỹ năng'}</strong>
          </span>
          <Link
            to="/profile"
            className="font-bold text-emerald-800 underline hover:text-emerald-950"
          >
            Cập nhật kỹ năng trong Hồ sơ →
          </Link>
        </div>
      )}

      {filteredArticles.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center space-y-3">
          <FileText
            className="w-10 h-10 text-slate-400 mx-auto"
            aria-hidden="true"
          />
          <h2 className="text-base font-bold text-slate-900">
            Không tìm thấy bài tài liệu phù hợp
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Hãy thử tắt bộ lọc &ldquo;Phù hợp kỹ năng của tôi&rdquo;, chọn lại &ldquo;Tất cả trình độ&rdquo; hoặc xóa từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => {
            const pastelClass =
              CATEGORY_PASTELS[article.category] || CATEGORY_PASTELS.Frontend;

            return (
              <article
                key={article._id}
                className="group bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl p-4 shadow-2xs hover:shadow-md flex flex-col justify-between gap-4 transition-all"
              >
                <div
                  className={cn(
                    'rounded-xl p-4 bg-gradient-to-br flex flex-col justify-between min-h-[100px]',
                    pastelClass
                  )}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/90 font-bold text-[11px]">
                      {article.category}
                    </span>
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full font-bold border bg-white/90',
                        getLevelBadgeClass(article.level)
                      )}
                    >
                      {article.level}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 pt-2">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{article.readingTimeMinutes} phút đọc</span>
                    </span>
                    <span className="text-[11px] text-slate-600 truncate max-w-[170px]">
                      {article.tags.slice(0, 3).join(' • ')}
                    </span>
                  </div>
                </div>

                <div className="px-1 space-y-2 flex-1">
                  <h2 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    <Link to={`/study-hub/${article.slug}`}>{article.title}</Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <footer className="px-1 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/study-hub/${article.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                    <span>
                      Đọc bài viết
                      <span className="visually-hidden">: {article.title}</span>
                    </span>
                  </Link>

                  <Link
                    to={`/practice?articleId=${encodeURIComponent(article._id)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-colors"
                  >
                    <span>Luyện tập ({article.questionIds.length})</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
