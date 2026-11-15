import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, Loader2, PlusCircle, X } from 'lucide-react';
import { contributeQuestion, getQuestions } from '../../api/questionsApi.js';
import LevelFilterBar from '../../components/LevelFilterBar.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { EmptyState, LoadingSkeleton } from '../../components/UiStates.jsx';
import { ARTICLES_MOCK } from '../../data/articles.mock.js';
import { CAREER_TRACKS, LEVELS } from '../../data/tracks.mock.js';
import { cn } from '../../utils/cn.js';
import { getStoredUser } from '../../utils/storage.js';

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

const INITIAL_CONTRIBUTE_FORM = {
  title: '',
  type: 'fill_blank',
  level: 'Fresher',
  category: 'Backend',
  tagsText: 'Node.js, ExpressJS',
  prompt: '',
  codeSnippet: '',
  acceptedAnswer: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOptionId: 'opt_a',
  explanation: '',
};

const EMPTY_SKILLS = [];

export default function PracticeListPage() {
  const navigate = useNavigate();
  const { notify } = useToast();
  const dialogRef = useRef(null);

  const outletCtx = useOutletContext() || {};
  const globalLevel = outletCtx.globalLevel || 'All';
  const setGlobalLevel = outletCtx.setGlobalLevel || (() => {});
  const selectedSkills = outletCtx.selectedSkills || EMPTY_SKILLS;

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const articleIdFilter = searchParams.get('articleId') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [onlyMySkills, setOnlyMySkills] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState(INITIAL_CONTRIBUTE_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const linkedArticle = articleIdFilter
    ? ARTICLES_MOCK.find((a) => a._id === articleIdFilter)
    : null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isModalOpen) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isModalOpen]);

  const handleOpenContributeModal = () => {
    const user = getStoredUser();
    if (!user) {
      notify({
        title: 'Yêu cầu đăng nhập',
        message: 'Vui lòng đăng nhập tài khoản để đóng góp câu hỏi mới vào ngân hàng đề.',
        type: 'info',
      });
      navigate('/login');
      return;
    }
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateContributeForm = () => {
    const errs = {};
    if (formState.title.trim().length < 5) {
      errs.title = 'Tiêu đề câu hỏi cần tối thiểu 5 ký tự.';
    }
    if (formState.prompt.trim().length < 10) {
      errs.prompt = 'Nội dung đề bài cần tối thiểu 10 ký tự.';
    }
    if (formState.type === 'mcq') {
      if (!formState.optionA.trim() || !formState.optionB.trim()) {
        errs.options = 'Vui lòng nhập tối thiểu phương án A và B.';
      }
    } else if (!formState.acceptedAnswer.trim()) {
      errs.acceptedAnswer = 'Vui lòng nhập đáp án chuẩn hoặc kết quả kỳ vọng.';
    }
    if (formState.explanation.trim().length < 5) {
      errs.explanation = 'Vui lòng nhập giải thích đáp án (tối thiểu 5 ký tự).';
    }
    return errs;
  };

  const handleContributeSubmit = async (e) => {
    e.preventDefault();
    const errs = validateContributeForm();
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    const tags = formState.tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    let payload = {};
    if (formState.type === 'mcq') {
      const options = [
        { id: 'opt_a', text: formState.optionA.trim() },
        { id: 'opt_b', text: formState.optionB.trim() },
        formState.optionC.trim() && { id: 'opt_c', text: formState.optionC.trim() },
        formState.optionD.trim() && { id: 'opt_d', text: formState.optionD.trim() },
      ].filter(Boolean);
      payload = {
        isMultiple: false,
        options,
        correctOptionIds: [formState.correctOptionId],
      };
    } else {
      payload = {
        placeholder: 'Nhập kết quả dự đoán...',
        caseSensitive: false,
        acceptedAnswers: formState.acceptedAnswer
          .split('|')
          .map((s) => s.trim())
          .filter(Boolean),
      };
    }

    setSubmitting(true);
    try {
      const res = await contributeQuestion({
        title: formState.title.trim(),
        type: formState.type,
        level: formState.level,
        category: formState.category,
        tags: tags.length > 0 ? tags : [formState.category],
        prompt: formState.prompt.trim(),
        codeSnippet: formState.codeSnippet.trim() || null,
        payload,
        explanation: formState.explanation.trim(),
      });

      notify({
        title: 'Đã gửi câu hỏi đóng góp thành công!',
        message:
          res.question?.status === 'approved'
            ? 'Câu hỏi của Admin đã được xuất bản trực tiếp lên ngân hàng đề.'
            : 'Câu hỏi đã được lưu vào MongoDB với trạng thái chờ Admin phê duyệt (pending).',
        type: 'success',
      });

      if (res.question?.status === 'approved') {
        setQuestions((prev) => [res.question, ...prev]);
      }

      setFormState(INITIAL_CONTRIBUTE_FORM);
      setIsModalOpen(false);
    } catch (err) {
      notify({
        title: 'Không thể gửi câu hỏi đóng góp',
        message: err.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

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

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenContributeModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            <span>Đóng góp câu hỏi</span>
          </button>

          {questions[0] && (
            <Link
              to={`/practice/${questions[0]._id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-2xs transition-colors"
            >
              <span>Làm ngay câu đầu tiên</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          )}
        </div>
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

      {/* Hộp thoại native <dialog> đóng góp câu hỏi mới vào MongoDB */}
      <dialog
        ref={dialogRef}
        aria-labelledby="contribute-dialog-title"
        onCancel={(e) => {
          e.preventDefault();
          setIsModalOpen(false);
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) setIsModalOpen(false);
        }}
        className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl m-auto"
      >
        <form onSubmit={handleContributeSubmit} noValidate className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
            <div>
              <h2
                id="contribute-dialog-title"
                className="text-lg font-extrabold text-slate-900"
              >
                Đóng góp Câu hỏi Phỏng vấn Mới
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Câu hỏi của ứng viên sẽ được lưu với trạng thái <code>pending</code> để Quản trị viên phê duyệt trước khi xuất bản.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Đóng cửa sổ đóng góp câu hỏi"
              className="w-8 h-8 rounded-full inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1 scrollable-region">
            <div>
              <label
                htmlFor="contrib-title"
                className="block text-xs font-bold text-slate-800 mb-1"
              >
                Tiêu đề câu hỏi <span className="text-red-600">*</span>
              </label>
              <input
                id="contrib-title"
                type="text"
                required
                value={formState.title}
                onChange={(e) => {
                  setFormState((p) => ({ ...p, title: e.target.value }));
                  if (formErrors.title) setFormErrors((p) => ({ ...p, title: '' }));
                }}
                placeholder="VD: Cơ chế Event Loop khi kết hợp Promise.resolve và setTimeout"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
              {formErrors.title && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {formErrors.title}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label
                  htmlFor="contrib-type"
                  className="block text-xs font-bold text-slate-800 mb-1"
                >
                  Định dạng câu hỏi
                </label>
                <select
                  id="contrib-type"
                  value={formState.type}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, type: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  <option value="fill_blank">Dự đoán Output (Fill Blank)</option>
                  <option value="mcq">Trắc nghiệm (MCQ)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contrib-level"
                  className="block text-xs font-bold text-slate-800 mb-1"
                >
                  Cấp độ mục tiêu
                </label>
                <select
                  id="contrib-level"
                  value={formState.level}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, level: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  {LEVELS.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="contrib-category"
                  className="block text-xs font-bold text-slate-800 mb-1"
                >
                  Chuyên ngành
                </label>
                <select
                  id="contrib-category"
                  value={formState.category}
                  onChange={(e) =>
                    setFormState((p) => ({ ...p, category: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                >
                  {CAREER_TRACKS.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.id}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="contrib-tags"
                className="block text-xs font-bold text-slate-800 mb-1"
              >
                Nhãn kỹ năng (Tags, phân cách bởi dấu phẩy)
              </label>
              <input
                id="contrib-tags"
                type="text"
                value={formState.tagsText}
                onChange={(e) =>
                  setFormState((p) => ({ ...p, tagsText: e.target.value }))
                }
                placeholder="VD: JavaScript, Node.js, ReactJS"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="contrib-prompt"
                className="block text-xs font-bold text-slate-800 mb-1"
              >
                Nội dung đề bài <span className="text-red-600">*</span>
              </label>
              <textarea
                id="contrib-prompt"
                rows={3}
                value={formState.prompt}
                onChange={(e) => {
                  setFormState((p) => ({ ...p, prompt: e.target.value }));
                  if (formErrors.prompt) setFormErrors((p) => ({ ...p, prompt: '' }));
                }}
                placeholder="Mô tả rõ yêu cầu câu hỏi hoặc ngữ cảnh bài toán..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
              {formErrors.prompt && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {formErrors.prompt}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="contrib-snippet"
                className="block text-xs font-bold text-slate-800 mb-1"
              >
                Đoạn mã minh họa (Code Snippet - Không bắt buộc)
              </label>
              <textarea
                id="contrib-snippet"
                rows={3}
                value={formState.codeSnippet}
                onChange={(e) =>
                  setFormState((p) => ({ ...p, codeSnippet: e.target.value }))
                }
                placeholder="console.log(1); setTimeout(() => console.log(2), 0);"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs bg-slate-50"
              />
            </div>

            {formState.type === 'mcq' ? (
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-800">
                  Các phương án lựa chọn &amp; Đáp án đúng
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formState.optionA}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, optionA: e.target.value }))
                    }
                    placeholder="Phương án A *"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={formState.optionB}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, optionB: e.target.value }))
                    }
                    placeholder="Phương án B *"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={formState.optionC}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, optionC: e.target.value }))
                    }
                    placeholder="Phương án C"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                  <input
                    type="text"
                    value={formState.optionD}
                    onChange={(e) =>
                      setFormState((p) => ({ ...p, optionD: e.target.value }))
                    }
                    placeholder="Phương án D"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <label
                    htmlFor="contrib-correct-opt"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Phương án đúng:
                  </label>
                  <select
                    id="contrib-correct-opt"
                    value={formState.correctOptionId}
                    onChange={(e) =>
                      setFormState((p) => ({
                        ...p,
                        correctOptionId: e.target.value,
                      }))
                    }
                    className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-bold text-emerald-700"
                  >
                    <option value="opt_a">Phương án A</option>
                    <option value="opt_b">Phương án B</option>
                    <option value="opt_c">Phương án C</option>
                    <option value="opt_d">Phương án D</option>
                  </select>
                </div>
                {formErrors.options && (
                  <p role="alert" className="text-xs text-red-600">
                    {formErrors.options}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label
                  htmlFor="contrib-accepted"
                  className="block text-xs font-bold text-slate-800 mb-1"
                >
                  Đáp án chuẩn được chấp nhận (phân cách nhiều cách viết bằng dấu |){' '}
                  <span className="text-red-600">*</span>
                </label>
                <input
                  id="contrib-accepted"
                  type="text"
                  value={formState.acceptedAnswer}
                  onChange={(e) => {
                    setFormState((p) => ({
                      ...p,
                      acceptedAnswer: e.target.value,
                    }));
                    if (formErrors.acceptedAnswer) {
                      setFormErrors((p) => ({ ...p, acceptedAnswer: '' }));
                    }
                  }}
                  placeholder="VD: 1 3 2 | 1, 3, 2"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                />
                {formErrors.acceptedAnswer && (
                  <p role="alert" className="text-xs text-red-600 mt-1">
                    {formErrors.acceptedAnswer}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="contrib-explanation"
                className="block text-xs font-bold text-slate-800 mb-1"
              >
                Giải thích chuyên môn cho đáp án <span className="text-red-600">*</span>
              </label>
              <textarea
                id="contrib-explanation"
                rows={2}
                value={formState.explanation}
                onChange={(e) => {
                  setFormState((p) => ({ ...p, explanation: e.target.value }));
                  if (formErrors.explanation) {
                    setFormErrors((p) => ({ ...p, explanation: '' }));
                  }
                }}
                placeholder="Giải thích ngắn gọn tại sao đáp án trên là chính xác..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
              {formErrors.explanation && (
                <p role="alert" className="text-xs text-red-600 mt-1">
                  {formErrors.explanation}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs disabled:opacity-60"
            >
              {submitting && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
              )}
              <span>{submitting ? 'Đang gửi...' : 'Gửi câu hỏi đóng góp'}</span>
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
