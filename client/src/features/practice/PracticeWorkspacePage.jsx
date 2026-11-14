import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Tag,
} from 'lucide-react';
import {
  isQuestionInReviewQueue,
  toggleReviewBookmark,
} from '../../api/practiceApi.js';
import { getQuestionById } from '../../api/questionsApi.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { ErrorState, LoadingSkeleton } from '../../components/UiStates.jsx';
import { LEVELS } from '../../data/tracks.mock.js';
import WorkspaceSplitLayout from '../../layouts/WorkspaceSplitLayout.jsx';
import { cn } from '../../utils/cn.js';
import CodingPanel from './CodingPanel.jsx';
import FillBlankPanel from './FillBlankPanel.jsx';
import McqPanel from './McqPanel.jsx';

export default function PracticeWorkspacePage() {
  const { questionId } = useParams();
  const { notify } = useToast();

  const [workspaceData, setWorkspaceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getQuestionById(questionId)
      .then((res) => {
        if (!mounted) return;
        setWorkspaceData(res);
        setBookmarked(isQuestionInReviewQueue(res.question._id));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [questionId]);

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <LoadingSkeleton rows={4} label="Đang khởi tạo không gian làm bài..." />
      </div>
    );
  }

  if (!workspaceData?.question) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <ErrorState title="Không tìm thấy câu hỏi luyện tập" />
      </div>
    );
  }

  const {
    question,
    currentIndex,
    totalApproved,
    prevQuestion,
    nextQuestion,
    relatedArticle,
  } = workspaceData;

  const levelBadge =
    LEVELS.find((l) => l.id === question.level)?.badgeClass ||
    'bg-slate-100 text-slate-700 border-slate-200';

  const handleToggleBookmark = async () => {
    const res = await toggleReviewBookmark(question);
    setBookmarked(res.bookmarked);
    notify({
      title: res.bookmarked
        ? 'Đã ghim vào Hàng đợi Ôn tập Ngắt quãng'
        : 'Đã gỡ câu hỏi khỏi hàng đợi ôn tập',
      message: res.bookmarked
        ? 'Câu hỏi đã được đặt lịch ôn lại ở chu kỳ 1 ngày trong trang Phân tích Năng lực.'
        : 'Bạn vẫn có thể ghim lại câu hỏi bất kỳ lúc nào.',
      type: res.bookmarked ? 'success' : 'info',
    });
  };

  const handleAttemptComplete = (isCorrect) => {
    setWorkspaceData((prev) =>
      prev
        ? {
            ...prev,
            question: {
              ...prev.question,
              isSolved: prev.question.isSolved || isCorrect,
            },
          }
        : prev
    );
    if (!isCorrect) {
      setBookmarked(true);
    }
  };

  const headerRightSlot = (
    <div className="flex items-center gap-2 text-xs">
      <button
        type="button"
        onClick={handleToggleBookmark}
        aria-pressed={bookmarked}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-colors',
          bookmarked
            ? 'bg-amber-50 text-amber-800 border-amber-300'
            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
        )}
      >
        <Bookmark
          className={cn('w-3.5 h-3.5', bookmarked && 'fill-amber-500 text-amber-600')}
          aria-hidden="true"
        />
        <span className="hidden sm:inline">
          {bookmarked ? 'Đã lưu ôn tập' : 'Đánh dấu ôn lại'}
        </span>
      </button>

      <span className="text-slate-500 hidden md:inline">
        Câu {currentIndex + 1} / {totalApproved}
      </span>

      {prevQuestion ? (
        <Link
          to={`/practice/${prevQuestion._id}`}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-medium text-slate-700"
        >
          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Câu trước</span>
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed">
          <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Câu trước</span>
        </span>
      )}

      {nextQuestion ? (
        <Link
          to={`/practice/${nextQuestion._id}`}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 font-medium text-slate-700"
        >
          <span>Câu tiếp</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      ) : (
        <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed">
          <span>Câu tiếp</span>
          <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      )}
    </div>
  );

  const leftPanelContent = (
    <div className="p-5 sm:p-6 space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span
          className={cn(
            'px-2.5 py-0.5 rounded-full font-semibold border',
            levelBadge
          )}
        >
          {question.level}
        </span>
        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
          {question.category}
        </span>
        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono font-semibold uppercase">
          {question.type}
        </span>
        {question.isSolved && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Đã hoàn thành</span>
          </span>
        )}
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
        {question.title}
      </h1>

      <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-3">
        <p>{question.prompt}</p>
      </div>

      {question.codeSnippet && (
        <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 text-xs font-mono text-slate-300">
            Đoạn mã minh họa (Code Snippet)
          </div>
          <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
            <code>{question.codeSnippet}</code>
          </pre>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 pt-2">
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
          >
            <Tag className="w-3 h-3 text-slate-500" aria-hidden="true" />
            <span>{tag}</span>
          </span>
        ))}
      </div>

      {relatedArticle && (
        <div className="mt-6 p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
            <BookOpen className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <span>Tài liệu lý thuyết bổ trợ cho câu hỏi này</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Nếu bạn chưa chắc chắn về bản chất kỹ thuật, hãy xem lại bài phân tích chi tiết tại Study Hub:
          </p>
          <Link
            to={`/study-hub/${relatedArticle.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 underline"
          >
            <span>Đọc bài: {relatedArticle.title}</span>
          </Link>
        </div>
      )}
    </div>
  );

  let rightPanelContent = null;
  if (question.type === 'mcq') {
    rightPanelContent = (
      <McqPanel
        question={question}
        onAttemptComplete={handleAttemptComplete}
      />
    );
  } else if (question.type === 'fill_blank') {
    rightPanelContent = (
      <FillBlankPanel
        question={question}
        onAttemptComplete={handleAttemptComplete}
      />
    );
  } else {
    rightPanelContent = (
      <CodingPanel
        question={question}
        onAttemptComplete={handleAttemptComplete}
      />
    );
  }

  return (
    <WorkspaceSplitLayout
      title={question.title}
      subtitle={`${question.level} • ${question.category}`}
      backTo="/practice"
      backLabel="Danh sách câu hỏi"
      headerRight={headerRightSlot}
      leftPanel={leftPanelContent}
      rightPanel={rightPanelContent}
    />
  );
}
