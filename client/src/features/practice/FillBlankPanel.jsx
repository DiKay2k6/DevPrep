import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Loader2,
  RotateCcw,
  Terminal,
  XCircle,
} from 'lucide-react';
import { evaluateFillBlank } from '../../api/practiceApi.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { cn } from '../../utils/cn.js';

export default function FillBlankPanel({ question, onAttemptComplete }) {
  const { notify } = useToast();
  const { placeholder, caseSensitive, acceptedAnswers } =
    question.payload || {};
  const [answerText, setAnswerText] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const revealedAcceptedAnswers =
    evaluation?.acceptedAnswers || acceptedAnswers || [];

  useEffect(() => {
    setAnswerText('');
    setEvaluation(null);
  }, [question._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answerText.trim() || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const result = await evaluateFillBlank(question._id, answerText);
      setEvaluation(result);
      onAttemptComplete?.(result.isCorrect);

      notify({
        title: result.isCorrect
          ? 'Accepted — Kết quả trùng khớp!'
          : 'Wrong Answer — Đã xếp vào hàng đợi ôn tập',
        message: result.isCorrect
          ? 'Đã ghi nhận câu hỏi vào danh sách hoàn thành.'
          : 'Câu hỏi được đặt lịch ôn lại sau 1 ngày (Spaced Repetition).',
        type: result.isCorrect ? 'success' : 'info',
      });
    } catch (err) {
      notify({
        title: 'Không thể kiểm tra câu trả lời',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setAnswerText('');
    setEvaluation(null);
  };

  return (
    <div className="p-5 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Điền Câu trả lời / Dự đoán Output (Fill-in-the-blank)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hệ thống tự động chuẩn hóa khoảng trắng thừa trước khi đối chiếu với tập đáp án chuẩn.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
          {caseSensitive ? 'Phân biệt Hoa/Thường' : 'Không phân biệt Hoa/Thường'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor={`fill-input-${question._id}`}
            className="block text-sm font-semibold text-slate-800"
          >
            Nhập kết quả hoặc biểu thức còn thiếu:
          </label>
          <div className="relative">
            <input
              id={`fill-input-${question._id}`}
              name="answer"
              type="text"
              required
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              placeholder={placeholder}
              value={answerText}
              onChange={(e) => {
                setAnswerText(e.target.value);
                if (evaluation) setEvaluation(null);
              }}
              aria-describedby={`fill-hint-${question._id}`}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 bg-slate-50/70 focus:bg-white font-mono text-sm text-slate-900 focus:border-blue-600"
            />
          </div>
          <p
            id={`fill-hint-${question._id}`}
            className="text-xs text-slate-500 flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
            <span>Gợi ý định dạng: {placeholder}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!answerText.trim() || isEvaluating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 text-white text-sm font-semibold transition-colors"
          >
            {isEvaluating && (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            )}
            <span>
              {isEvaluating ? 'Đang đối chiếu...' : 'Đối chiếu kết quả'}
            </span>
          </button>

          {evaluation && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Nhập lại</span>
            </button>
          )}
        </div>
      </form>

      {evaluation && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'p-4 rounded-xl border space-y-3',
            evaluation.isCorrect
              ? 'bg-emerald-50/80 border-emerald-200'
              : 'bg-red-50/70 border-red-200'
          )}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            {evaluation.isCorrect ? (
              <>
                <CheckCircle2
                  className="w-5 h-5 text-emerald-600"
                  aria-hidden="true"
                />
                <span className="text-emerald-900">
                  Accepted — Câu trả lời hoàn toàn khớp!
                </span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
                <span className="text-red-900">
                  Wrong Answer — Kết quả chưa khớp với đáp án chuẩn
                </span>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-500 block">Câu trả lời của bạn:</span>
              <code className="font-mono font-semibold text-slate-900">
                {evaluation.userAnswer}
              </code>
            </div>
            <div className="p-2.5 rounded-lg bg-white border border-slate-200">
              <span className="text-slate-500 block">Đáp án được chấp nhận:</span>
              <code className="font-mono font-semibold text-emerald-700">
                {revealedAcceptedAnswers.join('  hoặc  ')}
              </code>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">
            <strong>Giải thích:</strong>{' '}
            {evaluation.explanation || question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
