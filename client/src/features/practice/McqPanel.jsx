import { useEffect, useState } from 'react';
import { CheckCircle2, HelpCircle, Loader2, RotateCcw, XCircle } from 'lucide-react';
import { evaluateMcq } from '../../api/practiceApi.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { cn } from '../../utils/cn.js';

export default function McqPanel({ question, onAttemptComplete }) {
  const { notify } = useToast();
  const { isMultiple, options = [], correctOptionIds } = question.payload || {};
  const [selectedIds, setSelectedIds] = useState([]);
  const [submittedResult, setSubmittedResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const revealedCorrectIds =
    submittedResult?.correctOptionIds || correctOptionIds || [];

  useEffect(() => {
    setSelectedIds([]);
    setSubmittedResult(null);
  }, [question._id]);

  const handleToggleOption = (optionId) => {
    if (submittedResult || isEvaluating) return;

    if (isMultiple) {
      setSelectedIds((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedIds([optionId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedIds.length === 0 || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const result = await evaluateMcq(question._id, selectedIds);
      setSubmittedResult(result);
      onAttemptComplete?.(result.isCorrect);

      notify({
        title: result.isCorrect
          ? 'Chính xác! Đã lưu tiến độ câu hỏi'
          : 'Chưa chính xác — Đã thêm vào hàng đợi ôn tập',
        message: result.message,
        type: result.isCorrect ? 'success' : 'info',
      });
    } catch (err) {
      notify({
        title: 'Không thể chấm điểm câu hỏi',
        message: err.message,
        type: 'error',
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setSelectedIds([]);
    setSubmittedResult(null);
  };

  return (
    <div className="p-5 sm:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {isMultiple
              ? 'Trắc nghiệm Chọn nhiều đáp án (Multiple Choice)'
              : 'Trắc nghiệm Chọn 1 đáp án đúng nhất (Single Choice)'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isMultiple
              ? 'Đánh dấu tất cả các phát biểu đúng trước khi bấm Kiểm tra đáp án.'
              : 'Chọn 1 phương án duy nhất phù hợp với yêu cầu đề bài.'}
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
          {isMultiple ? 'Checkbox' : 'Radio'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset className="space-y-3">
          <legend className="visually-hidden">Danh sách phương án trả lời</legend>
          {options.map((opt, idx) => {
            const isChecked = selectedIds.includes(opt.id);
            const isCorrectOption = revealedCorrectIds.includes(opt.id);

            let cardStateClass =
              'border-slate-200 bg-white hover:border-slate-300';
            if (submittedResult) {
              if (isCorrectOption) {
                cardStateClass = 'border-emerald-500 bg-emerald-50/60';
              } else if (isChecked && !isCorrectOption) {
                cardStateClass = 'border-red-400 bg-red-50/60';
              }
            } else if (isChecked) {
              cardStateClass =
                'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/15';
            }

            return (
              <label
                key={opt.id}
                htmlFor={`mcq-${question._id}-${opt.id}`}
                className={cn(
                  'flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                  cardStateClass
                )}
              >
                <input
                  id={`mcq-${question._id}-${opt.id}`}
                  type={isMultiple ? 'checkbox' : 'radio'}
                  name={`mcq-${question._id}`}
                  value={opt.id}
                  checked={isChecked}
                  onChange={() => handleToggleOption(opt.id)}
                  disabled={Boolean(submittedResult) || isEvaluating}
                  className="mt-1 w-4 h-4 accent-blue-600 shrink-0"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-500 uppercase">
                      Phương án {String.fromCharCode(65 + idx)}
                    </span>
                    {submittedResult && isCorrectOption && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2
                          className="w-3.5 h-3.5"
                          aria-hidden="true"
                        />
                        <span>Đáp án đúng</span>
                      </span>
                    )}
                    {submittedResult && isChecked && !isCorrectOption && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
                        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Lựa chọn sai</span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 font-medium leading-relaxed">
                    {opt.text}
                  </p>
                </div>
              </label>
            );
          })}
        </fieldset>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={
              selectedIds.length === 0 ||
              Boolean(submittedResult) ||
              isEvaluating
            }
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500 text-white text-sm font-semibold transition-colors"
          >
            {isEvaluating && (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            )}
            <span>
              {isEvaluating ? 'Đang đối chiếu...' : 'Kiểm tra đáp án'}
            </span>
          </button>

          {submittedResult && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Làm lại câu này</span>
            </button>
          )}
        </div>
      </form>

      {/* Hộp kết quả & Giải thích chi tiết */}
      {submittedResult && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'p-4 rounded-xl border space-y-2',
            submittedResult.isCorrect
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          )}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {submittedResult.isCorrect ? (
              <CheckCircle2
                className="w-5 h-5 text-emerald-600 shrink-0"
                aria-hidden="true"
              />
            ) : (
              <HelpCircle
                className="w-5 h-5 text-amber-600 shrink-0"
                aria-hidden="true"
              />
            )}
            <span>{submittedResult.message}</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-700">
            <strong>Giải thích chuyên môn:</strong>{' '}
            {submittedResult.explanation || question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
