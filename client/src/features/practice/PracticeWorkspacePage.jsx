import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Terminal,
} from 'lucide-react';
import WorkspaceSplitLayout from '../../layouts/WorkspaceSplitLayout.jsx';
import McqPanel from './McqPanel.jsx';
import FillBlankPanel from './FillBlankPanel.jsx';
import CodingPanel from './CodingPanel.jsx';
import { QUESTIONS_MOCK } from '../../data/questions.mock.js';
import { ARTICLES_MOCK } from '../../data/articles.mock.js';
import { LEVELS } from '../../data/tracks.mock.js';
import { cn } from '../../utils/cn.js';

const FORMAT_LABELS = {
  mcq: 'Trắc nghiệm',
  fill_blank: 'Dự đoán Output',
  coding: 'Viết code',
};

export default function PracticeWorkspacePage() {
  const { questionId } = useParams();
  const navigate = useNavigate();

  const approvedQuestions = QUESTIONS_MOCK.filter((q) => q.status === 'approved');
  const currentIndex = Math.max(
    0,
    approvedQuestions.findIndex((q) => q._id === questionId)
  );
  const question = approvedQuestions[currentIndex] || approvedQuestions[0];

  const relatedArticle = ARTICLES_MOCK.find(
    (a) => a._id === question.relatedArticleId
  );

  const prevQuestion =
    currentIndex > 0 ? approvedQuestions[currentIndex - 1] : null;
  const nextQuestion =
    currentIndex < approvedQuestions.length - 1
      ? approvedQuestions[currentIndex + 1]
      : null;

  const levelBadgeClass =
    LEVELS.find((l) => l.id === question.level)?.badgeClass ||
    'bg-slate-100 text-slate-700 border-slate-200';

  const badgeNode = (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-xs font-semibold border shrink-0',
        levelBadgeClass
      )}
    >
      {question.level}
    </span>
  );

  const headerActions = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={!prevQuestion}
        onClick={() => prevQuestion && navigate(`/practice/${prevQuestion._id}`)}
        aria-label="Câu hỏi trước"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-medium text-slate-700"
      >
        <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Câu trước</span>
      </button>
      <span className="text-xs font-semibold text-slate-500 px-1.5">
        {currentIndex + 1}/{approvedQuestions.length}
      </span>
      <button
        type="button"
        disabled={!nextQuestion}
        onClick={() => nextQuestion && navigate(`/practice/${nextQuestion._id}`)}
        aria-label="Câu hỏi tiếp theo"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-medium text-slate-700"
      >
        <span className="hidden sm:inline">Câu tiếp</span>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );

  const leftPanel = (
    <div className="p-5 sm:p-6 space-y-5">
      <header className="space-y-2.5 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-semibold">
            {question.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
            {FORMAT_LABELS[question.type] || 'Thực hành'}
          </span>
        </div>

        <h1 className="text-xl font-bold text-slate-900 leading-snug">
          {question.title}
        </h1>

        <div className="flex flex-wrap gap-1.5">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full bg-[#F4F7FA] text-slate-600 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Nội dung câu hỏi
        </h2>
        <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
          {question.prompt}
        </p>
      </div>

      {question.codeSnippet && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Terminal className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            <span>Đoạn mã minh họa:</span>
          </div>
          <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
            <code>{question.codeSnippet}</code>
          </pre>
        </div>
      )}

      {relatedArticle && (
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
            <span>Bài đọc lý thuyết liên quan:</span>
          </div>
          <Link
            to={`/study-hub/${relatedArticle.slug}`}
            className="block text-sm font-bold text-blue-700 hover:underline"
          >
            {relatedArticle.title}
          </Link>
        </div>
      )}

      <details className="group rounded-xl border border-slate-200 bg-[#F4F7FA] p-4">
        <summary className="cursor-pointer list-none flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Xem gợi ý &amp; Giải thích kiến thức nền tảng</span>
          </span>
          <span className="text-blue-600 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <p className="mt-3 pt-3 border-t border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {question.explanation}
        </p>
      </details>
    </div>
  );

  let rightPanel = null;
  if (question.type === 'mcq') {
    rightPanel = <McqPanel key={question._id} question={question} />;
  } else if (question.type === 'fill_blank') {
    rightPanel = <FillBlankPanel key={question._id} question={question} />;
  } else {
    rightPanel = <CodingPanel key={question._id} question={question} />;
  }

  return (
    <WorkspaceSplitLayout
      title={question.title}
      badgeNode={badgeNode}
      headerActions={headerActions}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
    />
  );
}
