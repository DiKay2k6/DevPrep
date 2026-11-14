import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  Send,
  Terminal,
} from 'lucide-react';
import { MOCK_TEST_TEMPLATES } from '../../data/mockTest.mock.js';
import { QUESTIONS_MOCK } from '../../data/questions.mock.js';
import { cn } from '../../utils/cn.js';

export default function MockTestRoomPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const templateId = searchParams.get('templateId') || 'tpl_junior_fullstack';
  const template =
    MOCK_TEST_TEMPLATES.find((t) => t.id === templateId) ||
    MOCK_TEST_TEMPLATES[1];

  const examQuestions = QUESTIONS_MOCK.filter((q) =>
    template.questionIds.includes(q._id)
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedIds, setFlaggedIds] = useState(['q_coding_longest_substr_08']);

  const currentQuestion = examQuestions[currentIdx] || examQuestions[0];

  const toggleFlag = (qId) => {
    setFlaggedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSelectMcq = (qId, optId, isMultiple) => {
    setAnswers((prev) => {
      const current = prev[qId] || [];
      if (isMultiple) {
        const next = current.includes(optId)
          ? current.filter((id) => id !== optId)
          : [...current, optId];
        return { ...prev, [qId]: next };
      }
      return { ...prev, [qId]: [optId] };
    });
  };

  const handleTextAnswer = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const isQuestionAnswered = (qId) => {
    const val = answers[qId];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'string') return val.trim().length > 0;
    return false;
  };

  const answeredCount = examQuestions.filter((q) =>
    isQuestionAnswered(q._id)
  ).length;

  return (
    <div className="space-y-5">
      {/* Thanh trạng thái phòng thi & Đồng hồ đếm ngược */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            Phòng Thi Thử Đang Diễn Ra • {template.level} {template.track}
          </span>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">
            {template.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="timer"
            aria-label="Thời gian còn lại của bài thi"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-mono text-sm font-bold"
          >
            <Clock className="w-4 h-4 text-amber-600" aria-hidden="true" />
            <span>29:45</span>
          </div>

          <span className="text-xs font-medium text-slate-600 px-2">
            Đã làm: <strong>{answeredCount}</strong> / {examQuestions.length}
          </span>

          <button
            type="button"
            onClick={() => navigate('/mock-test/result')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Nộp bài thi</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Cột trái: Nội dung câu hỏi hiện tại */}
        <article className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <header className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-200">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <span>
                  Câu hỏi {currentIdx + 1} / {examQuestions.length}
                </span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                  {currentQuestion.type}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                {currentQuestion.title}
              </h2>
            </div>

            <button
              type="button"
              aria-pressed={flaggedIds.includes(currentQuestion._id)}
              onClick={() => toggleFlag(currentQuestion._id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors',
                flaggedIds.includes(currentQuestion._id)
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              <Flag className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {flaggedIds.includes(currentQuestion._id)
                  ? 'Đã đánh dấu phân vân'
                  : 'Đánh dấu phân vân'}
              </span>
            </button>
          </header>

          <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
            {currentQuestion.prompt}
          </p>

          {currentQuestion.codeSnippet && (
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs sm:text-sm font-mono overflow-x-auto leading-relaxed">
              <code>{currentQuestion.codeSnippet}</code>
            </pre>
          )}

          {/* Vùng trả lời theo định dạng */}
          {currentQuestion.type === 'mcq' && (
            <fieldset className="space-y-2.5 pt-2">
              <legend className="text-xs font-semibold text-slate-500 mb-2">
                {currentQuestion.payload.isMultiple
                  ? 'Chọn một hoặc nhiều đáp án đúng:'
                  : 'Chọn 1 đáp án đúng nhất:'}
              </legend>
              {currentQuestion.payload.options.map((opt) => {
                const selectedList = answers[currentQuestion._id] || [];
                const checked = selectedList.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    htmlFor={`exam-${currentQuestion._id}-${opt.id}`}
                    className={cn(
                      'flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors',
                      checked
                        ? 'border-blue-600 bg-blue-50/40'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <input
                      id={`exam-${currentQuestion._id}-${opt.id}`}
                      type={
                        currentQuestion.payload.isMultiple
                          ? 'checkbox'
                          : 'radio'
                      }
                      name={`exam-${currentQuestion._id}`}
                      checked={checked}
                      onChange={() =>
                        handleSelectMcq(
                          currentQuestion._id,
                          opt.id,
                          currentQuestion.payload.isMultiple
                        )
                      }
                      className="mt-0.5 w-4 h-4 accent-blue-600 shrink-0"
                    />
                    <span className="text-sm text-slate-800">{opt.text}</span>
                  </label>
                );
              })}
            </fieldset>
          )}

          {currentQuestion.type === 'fill_blank' && (
            <div className="space-y-2 pt-2">
              <label
                htmlFor={`exam-fill-${currentQuestion._id}`}
                className="block text-sm font-semibold text-slate-800"
              >
                Nhập đáp án của bạn:
              </label>
              <input
                id={`exam-fill-${currentQuestion._id}`}
                type="text"
                value={answers[currentQuestion._id] || ''}
                onChange={(e) =>
                  handleTextAnswer(currentQuestion._id, e.target.value)
                }
                placeholder={currentQuestion.payload.placeholder}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm text-slate-900"
              />
            </div>
          )}

          {currentQuestion.type === 'coding' && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <label
                  htmlFor={`exam-code-${currentQuestion._id}`}
                  className="font-semibold inline-flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                  <span>Lời giải JavaScript (Function: {currentQuestion.payload.functionName}):</span>
                </label>
                <span className="font-mono text-slate-500">
                  Chấm toàn bộ Test Cases khi nộp đề
                </span>
              </div>
              <textarea
                id={`exam-code-${currentQuestion._id}`}
                rows={9}
                value={
                  answers[currentQuestion._id] ??
                  currentQuestion.payload.starterCode.javascript
                }
                onChange={(e) =>
                  handleTextAnswer(currentQuestion._id, e.target.value)
                }
                className="w-full p-4 rounded-xl border border-slate-300 bg-slate-50 font-mono text-xs sm:text-sm text-slate-900 leading-relaxed"
              />
            </div>
          )}

          <footer className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Câu trước</span>
            </button>

            <button
              type="button"
              disabled={currentIdx === examQuestions.length - 1}
              onClick={() =>
                setCurrentIdx((i) => Math.min(examQuestions.length - 1, i + 1))
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold"
            >
              <span>Câu tiếp theo</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </footer>
        </article>

        {/* Cột phải: Bảng điều hướng danh sách câu hỏi */}
        <aside
          aria-label="Bảng điều hướng danh sách câu hỏi trong đề thi"
          className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 lg:sticky lg:top-20"
        >
          <h2 className="text-sm font-bold text-slate-900">
            Bảng Điều hướng Câu hỏi ({examQuestions.length})
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-2">
            {examQuestions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              const answered = isQuestionAnswered(q._id);
              const flagged = flaggedIds.includes(q._id);

              return (
                <button
                  key={q._id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors',
                    isCurrent
                      ? 'border-blue-600 bg-blue-50 text-blue-800 ring-2 ring-blue-600/20'
                      : answered
                        ? 'border-emerald-300 bg-emerald-50/70 text-emerald-800'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  )}
                >
                  <span>Câu {idx + 1}</span>
                  <span className="text-[10px] font-normal text-slate-500 uppercase">
                    {q.type === 'fill_blank' ? 'Output' : q.type}
                  </span>
                  {flagged && (
                    <span className="text-[10px] text-amber-700 font-bold">
                      ★ Phân vân
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <dl className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <dt>Đã trả lời:</dt>
              <dd className="font-semibold text-emerald-700">{answeredCount} câu</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Đang đánh dấu phân vân:</dt>
              <dd className="font-semibold text-amber-700">
                {flaggedIds.length} câu
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
