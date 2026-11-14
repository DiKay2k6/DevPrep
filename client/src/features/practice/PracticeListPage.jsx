import { useEffect, useState } from 'react';
import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, X } from 'lucide-react';
import { getQuestions } from '../../api/questionsApi.js';
import LevelFilterBar from '../../components/LevelFilterBar.jsx';
import { EmptyState, LoadingSkeleton } from '../../components/UiStates.jsx';
import { ARTICLES_MOCK } from '../../data/articles.mock.js';
import { LEVELS, MOCK_USER_PROFILE } from '../../data/tracks.mock.js';
import { cn } from '../../utils/cn.js';

const FORMAT_FILTERS = [
  { id: 'All', label: 'Tất cả hình thức' },
  { id: 'mcq', label: 'Trắc nghiệm' },
  { id: 'fill_blank', label: 'Dự đoán Output' },
  { id: 'coding', label: 'Viết code' },
];

const FORMAT_BADGES = {
  mcq: 'bg-blue-50 text-blue-700 border-blue-200',
  fill_blank: 'bg-amber-50 text-amber-800 border-amber-200',
  coding: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const FORMAT_NAMES = {
  mcq: 'Trắc nghiệm',
  fill_blank: 'Dự đoán Output',
  coding: 'Viết code',
};

export default function PracticeListPage() {
  const outletCtx = useOutletContext() || {};
  const globalLevel = outletCtx.globalLevel || 'All';
  const setGlobalLevel = outletCtx.setGlobalLevel || (() => {});
  const selectedSkills =
    outletCtx.selectedSkills || MOCK_USER_PROFILE.selectedSkills;

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const articleIdFilter = searchParams.get('articleId') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [onlyMySkills, setOnlyMySkills] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const linkedArticle = articleIdFilter
    ? ARTICLES_MOCK.find((a) => a._id === articleIdFilter)
    : null;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getQuestions({
      status: 'approved',
      level: globalLevel,
      category: selectedCategory,
      type: selectedFormat,
      onlyMySkills,
      selectedSkills,
      articleId: articleIdFilter,
      searchQuery,
    })
      .then((list) => {
        if (mounted) setQuestions(list);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [
    globalLevel,
    selectedCategory,
    selectedFormat,
    onlyMySkills,
    selectedSkills,
    articleIdFilter,
    searchQuery,
  ]);

  const clearArticleFilter = () => {
    searchParams.delete('articleId');
    setSearchParams(searchParams, { replace: true });
  };

  const handleResetFilters = () => {
    setGlobalLevel('All');
    setSelectedCategory('All');
    setSelectedFormat('All');
    setOnlyMySkills(false);
    setSearchQuery('');
    clearArticleFilter();
  };

  const getLevelBadge = (levelId) =>
    LEVELS.find((l) => l.id === levelId)?.badgeClass ||
    'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="space-y-6">
      <header className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Ngân hàng Câu hỏi Luyện tập
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Rèn luyện kỹ năng phỏng vấn qua 3 hình thức: Trắc nghiệm chuyên sâu, Dự đoán kết quả thực thi và Viết code trực tiếp trên trình duyệt.
          </p>
        </div>

        {questions[0] && (
          <Link
            to={`/practice/${questions[0]._id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-2xs shrink-0 transition-colors"
          >
            <span>Làm ngay câu đầu tiên</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </header>

      {linkedArticle && (
        <div className="bg-blue-50/90 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm text-blue-900">
            <BookOpen
              className="w-4 h-4 text-blue-600 shrink-0"
              aria-hidden="true"
            />
            <span>
              Đang lọc câu hỏi thuộc bài học:{' '}
              <Link
                to={`/study-hub/${linkedArticle.slug}`}
                className="font-bold underline hover:text-blue-700"
              >
                {linkedArticle.title}
              </Link>
            </span>
          </div>
          <button
            type="button"
            onClick={clearArticleFilter}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-bold text-blue-700 hover:bg-blue-100"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Xem toàn bộ câu hỏi</span>
          </button>
        </div>
      )}

      <LevelFilterBar
        selectedLevel={globalLevel}
        onLevelChange={setGlobalLevel}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onlyMySkills={onlyMySkills}
        onToggleOnlyMySkills={() => setOnlyMySkills((prev) => !prev)}
        selectedSkills={selectedSkills}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Tìm câu hỏi theo tên hoặc kỹ năng (VD: Java, Python, Kotlin, Swift, Two Sum...)"
        totalCount={questions.length}
      />

      {onlyMySkills && (
        <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-900">
          <span>
            Đang lọc câu hỏi khớp với bộ kỹ năng của bạn:{' '}
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

      <div className="flex flex-wrap items-center gap-2">
        {FORMAT_FILTERS.map((fmt) => {
          const active = selectedFormat === fmt.id;
          return (
            <button
              key={fmt.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedFormat(fmt.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap',
                active
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300'
              )}
            >
              {fmt.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} label="Đang tải danh sách câu hỏi..." />
      ) : questions.length === 0 ? (
        <EmptyState
          title="Không tìm thấy câu hỏi phù hợp"
          description="Hãy thử chọn lại cấp độ, tắt lọc kỹ năng cá nhân hoặc xóa từ khóa tìm kiếm."
          actionLabel="Đặt lại bộ lọc"
          onAction={handleResetFilters}
        />
      ) : (
        <div
          tabIndex={0}
          role="region"
          aria-labelledby="practice-table-caption"
          className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-x-auto"
        >
          <table className="w-full text-left border-collapse">
            <caption id="practice-table-caption" className="visually-hidden">
              Danh sách câu hỏi luyện tập theo cấp độ, kỹ năng và hình thức
            </caption>
            <thead className="bg-[#F8FAFC] border-b border-slate-200/80 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3.5 px-5">
                  Câu hỏi phỏng vấn
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                  Hình thức
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                  Cấp độ
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                  Chuyên ngành &amp; Kỹ năng
                </th>
                <th
                  scope="col"
                  className="py-3.5 px-5 text-right whitespace-nowrap"
                >
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-sm">
              {questions.map((q) => (
                <tr
                  key={q._id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <th scope="row" className="py-4 px-5 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/practice/${q._id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {q.title}
                      </Link>
                      {q.isSolved && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold shrink-0">
                          <CheckCircle2
                            className="w-3 h-3"
                            aria-hidden="true"
                          />
                          <span>Đã giải</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-normal text-slate-500 mt-1 line-clamp-1">
                      {q.prompt}
                    </p>
                  </th>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
                        FORMAT_BADGES[q.type]
                      )}
                    >
                      {FORMAT_NAMES[q.type]}
                    </span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border',
                        getLevelBadge(q.level)
                      )}
                    >
                      {q.level}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="font-semibold text-slate-700">
                        {q.category}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500">
                        {q.tags.slice(0, 3).join(', ')}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-right whitespace-nowrap">
                    <Link
                      to={`/practice/${q._id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold border border-blue-200 hover:border-blue-600 transition-colors"
                    >
                      <span>{q.isSolved ? 'Làm lại' : 'Làm bài'}</span>
                      <span className="visually-hidden">{q.title}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
