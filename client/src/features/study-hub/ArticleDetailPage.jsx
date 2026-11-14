import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Clock,
  Code2,
  Layers,
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer.jsx';
import { ARTICLES_MOCK } from '../../data/articles.mock.js';
import { QUESTIONS_MOCK } from '../../data/questions.mock.js';
import { LEVELS } from '../../data/tracks.mock.js';
import { cn } from '../../utils/cn.js';

const TYPE_LABELS = {
  mcq: 'Trắc nghiệm (MCQ)',
  fill_blank: 'Điền Output',
  coding: 'Thực hành Code',
};

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const article =
    ARTICLES_MOCK.find((a) => a.slug === slug) || ARTICLES_MOCK[0];

  const relatedQuestions = QUESTIONS_MOCK.filter(
    (q) =>
      q.status === 'approved' &&
      (article.questionIds.includes(q._id) || q.relatedArticleId === article._id)
  );

  const levelBadgeClass =
    LEVELS.find((l) => l.id === article.level)?.badgeClass ||
    'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Cột đọc tài liệu chính */}
      <article className="lg:col-span-8 space-y-6">
        <header className="pb-6 border-b border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full font-semibold border',
                levelBadgeClass
              )}
            >
              Cấp độ: {article.level}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
              {article.category}
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{article.readingTimeMinutes} phút đọc</span>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Cập nhật: {article.updatedAt}</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
            {article.title}
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            {article.summary}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200/80"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <Link
              to={`/practice?articleId=${encodeURIComponent(article._id)}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
            >
              <Code2 className="w-4 h-4" aria-hidden="true" />
              <span>Luyện tập chủ đề này ({relatedQuestions.length} câu)</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        {/* Nội dung Markdown */}
        <MarkdownRenderer content={article.content} />

        {/* Khối CTA cuối bài đọc */}
        <footer className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Đã nắm vững lý thuyết bài học này?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Kiểm tra ngay mức độ hiểu sâu qua bộ câu hỏi Trắc nghiệm, Điền Output và Code Sandbox.
            </p>
          </div>
          <Link
            to={`/practice?articleId=${encodeURIComponent(article._id)}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shrink-0 transition-colors"
          >
            <Code2 className="w-4 h-4" aria-hidden="true" />
            <span>Luyện tập chủ đề này</span>
          </Link>
        </footer>
      </article>

      {/* Cột phụ bên phải: Câu hỏi thực hành liên kết & Bài học khác */}
      <aside
        aria-label="Bài tập thực hành và tài liệu liên quan"
        className="lg:col-span-4 space-y-5 lg:sticky lg:top-20"
      >
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <h2 className="text-sm font-bold text-slate-900">
              Câu hỏi thực hành gắn với bài học ({relatedQuestions.length})
            </h2>
          </div>

          <ul role="list" className="space-y-2.5">
            {relatedQuestions.map((q) => (
              <li key={q._id}>
                <Link
                  to={`/practice/${q._id}`}
                  className="block p-3 rounded-lg bg-white border border-slate-200 hover:border-blue-400 transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px] font-medium">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {TYPE_LABELS[q.type]}
                    </span>
                    <span className="text-slate-500">{q.level}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 leading-snug">
                    {q.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            to={`/practice?articleId=${encodeURIComponent(article._id)}`}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <span>Luyện tập toàn bộ chủ đề</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" aria-hidden="true" />
            <h2 className="text-sm font-bold text-slate-900">
              Tài liệu kỹ thuật khác
            </h2>
          </div>
          <ul role="list" className="space-y-2 text-xs">
            {ARTICLES_MOCK.filter((a) => a._id !== article._id).map((other) => (
              <li key={other._id}>
                <Link
                  to={`/study-hub/${other.slug}`}
                  className="block p-2 rounded-lg hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-medium transition-colors"
                >
                  {other.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
