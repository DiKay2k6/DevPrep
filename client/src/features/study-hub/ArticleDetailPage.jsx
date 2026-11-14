import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BookCheck,
  CheckCircle2,
  Clock,
  Code2,
  ListTree,
  Tag,
} from 'lucide-react';
import {
  getArticleBySlug,
  toggleArticleCompleted,
} from '../../api/articlesApi.js';
import MarkdownRenderer from '../../components/MarkdownRenderer.jsx';
import { useToast } from '../../components/ToastProvider.jsx';
import { ErrorState, LoadingSkeleton } from '../../components/UiStates.jsx';
import { LEVELS } from '../../data/tracks.mock.js';
import { cn } from '../../utils/cn.js';
import { extractTocFromMarkdown } from '../../utils/markdownToc.js';

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const { notify } = useToast();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeHeadingId, setActiveHeadingId] = useState('');
  const manualScrollLockUntilRef = useRef(0);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    getArticleBySlug(slug)
      .then((data) => {
        if (!mounted) return;
        setArticle(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || 'Không thể tải bài viết.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug]);

  const tocItems = useMemo(
    () => extractTocFromMarkdown(article?.content || ''),
    [article?.content]
  );

  useEffect(() => {
    if (tocItems.length === 0) return undefined;
    setActiveHeadingId(tocItems[0].id);

    const handleScroll = () => {
      if (Date.now() < manualScrollLockUntilRef.current) return;
      const offset = 130;
      let currentId = tocItems[0].id;
      for (const item of tocItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            currentId = item.id;
          }
        }
      }
      setActiveHeadingId(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tocItems]);

  const handleScrollToHeading = (e, headingId) => {
    e.preventDefault();
    manualScrollLockUntilRef.current = Date.now() + 650;
    setActiveHeadingId(headingId);
    const targetEl = document.getElementById(headingId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleToggleCompleted = async () => {
    if (!article) return;
    try {
      const res = await toggleArticleCompleted(article._id);
      setArticle((prev) => ({ ...prev, isCompleted: res.isCompleted }));
      notify({
        title: res.isCompleted
          ? 'Đã đánh dấu hoàn thành bài học!'
          : 'Đã bỏ đánh dấu hoàn thành',
        message: res.isCompleted
          ? `Bạn đã hoàn thành ${res.totalCompleted} bài tài liệu trong Study Hub.`
          : 'Bạn có thể đọc và đánh dấu lại bất kỳ lúc nào.',
        type: res.isCompleted ? 'success' : 'info',
      });
    } catch (err) {
      notify({
        title: 'Không thể cập nhật trạng thái bài học',
        message: err.message,
        type: 'error',
      });
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={4} label="Đang tải nội dung bài học..." />;
  }

  if (error || !article) {
    return (
      <ErrorState
        title="Không tìm thấy bài viết"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  const levelBadge =
    LEVELS.find((l) => l.id === article.level)?.badgeClass ||
    'bg-slate-100 text-slate-700 border-slate-200';
  const relatedQuestions = article.relatedQuestions || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Cột chính: Nội dung bài học Markdown + Nút hoàn thành + Bài tập liên kết */}
      <article className="lg:col-span-8 space-y-8 min-w-0">
        <header className="space-y-4 pb-6 border-b border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full font-semibold border',
                  levelBadge
                )}
              >
                Cấp độ: {article.level}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                Chuyên ngành: {article.category}
              </span>
              <span className="inline-flex items-center gap-1 text-slate-500">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{article.readingTimeMinutes} phút đọc</span>
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleCompleted}
              aria-pressed={Boolean(article.isCompleted)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all',
                article.isCompleted
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border-slate-300'
              )}
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>
                {article.isCompleted
                  ? 'Đã hoàn thành bài học'
                  : 'Đánh dấu hoàn thành'}
              </span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-base text-slate-600 leading-relaxed max-w-[68ch]">
            {article.summary}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50/70 text-blue-800 border border-blue-100 text-xs font-medium"
              >
                <Tag className="w-3 h-3 text-blue-600" aria-hidden="true" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        </header>

        {/* Nội dung Markdown đã chống XSS và tự động gán id tiêu đề */}
        <MarkdownRenderer content={article.content} />

        {/* Thanh xác nhận hoàn thành bài học ở cuối bài */}
        <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 inline-flex items-center gap-2">
              <BookCheck
                className="w-4 h-4 text-emerald-600"
                aria-hidden="true"
              />
              <span>Ghi nhận tiến độ đọc hiểu lý thuyết</span>
            </h2>
            <p className="text-xs text-slate-600">
              Đánh dấu hoàn thành để lưu tiến độ vào bộ nhớ trình duyệt trước khi chuyển sang giải câu hỏi thực chiến.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleCompleted}
            aria-pressed={Boolean(article.isCompleted)}
            className={cn(
              'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0',
              article.isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
            )}
          >
            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            <span>
              {article.isCompleted
                ? 'Đã hoàn thành (Bấm để hoàn tác)'
                : 'Hoàn thành bài học này'}
            </span>
          </button>
        </div>

        {/* Khối liên kết hai chiều: Bài học -> Câu hỏi thực hành */}
        <section
          aria-labelledby="related-practice-heading"
          className="pt-6 border-t border-slate-200 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2
                id="related-practice-heading"
                className="text-lg font-bold text-slate-900 flex items-center gap-2"
              >
                <Code2 className="w-5 h-5 text-blue-600" aria-hidden="true" />
                <span>
                  Luyện tập ngay sau khi đọc ({relatedQuestions.length} câu hỏi)
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Áp dụng kiến thức vừa đọc vào các câu hỏi phỏng vấn thực chiến.
              </p>
            </div>

            {relatedQuestions[0] && (
              <Link
                to={`/practice/${relatedQuestions[0]._id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shrink-0"
              >
                <span>Giải câu đầu tiên</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {relatedQuestions.map((q) => (
              <div
                key={q._id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono font-semibold text-blue-700 uppercase">
                      {q.type}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {q.level} • {q.category}
                    </span>
                    {q.isSolved && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                        <CheckCircle2
                          className="w-3.5 h-3.5"
                          aria-hidden="true"
                        />
                        <span>Đã giải</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {q.title}
                  </h3>
                </div>

                <Link
                  to={`/practice/${q._id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-semibold shrink-0 transition-colors"
                >
                  <span>Mở bài tập</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      </article>

      {/* Cột phụ bên phải: Mục lục tự động (Sticky Table of Contents) */}
      <aside
        aria-label="Mục lục bài viết và lối tắt thực hành"
        className="lg:col-span-4 lg:sticky lg:top-24 space-y-5"
      >
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <ListTree className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Mục lục bài viết ({tocItems.length})</span>
          </div>

          {tocItems.length === 0 ? (
            <p className="text-xs text-slate-500">
              Bài viết ngắn gọn, không chia tiểu mục.
            </p>
          ) : (
            <nav aria-label="Các mục chính trong bài">
              <ol className="space-y-1.5 text-xs">
                {tocItems.map((item, idx) => {
                  const isActive = activeHeadingId === item.id;
                  return (
                    <li
                      key={item.id}
                      className={cn(item.level === 3 && 'pl-3.5')}
                    >
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => handleScrollToHeading(e, item.id)}
                        className={cn(
                          'w-full text-left flex items-start gap-2 px-2.5 py-1.5 rounded-lg transition-colors',
                          isActive
                            ? 'bg-blue-600 text-white font-bold shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-200/70 font-medium'
                        )}
                      >
                        <span
                          className={cn(
                            'font-mono shrink-0',
                            isActive ? 'text-blue-100' : 'text-blue-600'
                          )}
                        >
                          {idx + 1}.
                        </span>
                        <span className="line-clamp-2">{item.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
            <CheckCircle2
              className="w-4 h-4 text-blue-600"
              aria-hidden="true"
            />
            <span>Gợi ý ôn tập hiệu quả</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Sau khi nắm vững lý thuyết, hãy làm ngay các câu hỏi đính kèm. Nếu làm sai, hệ thống sẽ tự động xếp câu hỏi vào hàng đợi ôn tập ngắt quãng (chu kỳ 1 → 3 → 7 → 14 ngày).
          </p>
          <Link
            to={`/practice?articleId=${encodeURIComponent(article._id)}`}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <span>Làm toàn bộ bài tập chủ đề này</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
