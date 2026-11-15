import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  Send,
  Timer,
} from 'lucide-react';
import {
  getActiveExamSessionSync,
  getMockExamSession,
  saveActiveExamSessionSync,
  submitMockExam,
} from '../../api/mockTestApi.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { LoadingSkeleton } from '../../components/UiStates.jsx';
import { MOCK_TEST_TEMPLATES } from '../../data/mockTest.mock.js';
import { cn } from '../../utils/cn.js';

export default function MockTestRoomPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notify } = useToast();

  const templateId = searchParams.get('templateId') || MOCK_TEST_TEMPLATES[1].id;
  const fallbackTemplate =
    MOCK_TEST_TEMPLATES.find((t) => t.id === templateId) ||
    MOCK_TEST_TEMPLATES[1];

  const [template, setTemplate] = useState(fallbackTemplate);
  const [examQuestions, setExamQuestions] = useState([]);
  const [loadingSession, setLoadingSession] = useState(true);

  const savedSession = getActiveExamSessionSync();
  const isResumingSameTemplate =
    savedSession && savedSession.templateId === fallbackTemplate.id;

  const totalDurationSeconds = template.durationMinutes * 60;
  const [currentIdx, setCurrentIdx] = useState(() =>
    isResumingSameTemplate ? savedSession.currentIdx || 0 : 0
  );
  const [flaggedIds, setFlaggedIds] = useState(() =>
    isResumingSameTemplate ? savedSession.flaggedIds || [] : []
  );
  const [answersByQuestion, setAnswersByQuestion] = useState(() =>
    isResumingSameTemplate ? savedSession.answersByQuestion || {} : {}
  );
  const [secondsLeft, setSecondsLeft] = useState(() =>
    isResumingSameTemplate && typeof savedSession.secondsLeft === 'number'
      ? savedSession.secondsLeft
      : fallbackTemplate.durationMinutes * 60
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    setLoadingSession(true);
    getMockExamSession(templateId)
      .then((data) => {
        if (!mounted) return;
        if (data?.template) setTemplate(data.template);
        setExamQuestions(data?.questions || []);
      })
      .finally(() => {
        if (mounted) setLoadingSession(false);
      });
    return () => {
      mounted = false;
    };
  }, [templateId]);

  const currentQuestion = examQuestions[currentIdx] || examQuestions[0];

  // Lưu tự động trạng thái ca thi vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (loadingSession || isSubmitting || secondsLeft <= 0) return;
    saveActiveExamSessionSync({
      templateId: template.id,
      templateTitle: template.title,
      currentIdx,
      flaggedIds,
      answersByQuestion,
      secondsLeft,
      updatedAt: Date.now(),
    });
  }, [
    loadingSession,
    template.id,
    template.title,
    currentIdx,
    flaggedIds,
    answersByQuestion,
    secondsLeft,
    isSubmitting,
  ]);

  const handleFinishExam = useCallback(
    async (isAutoTimeout = false) => {
      if (autoSubmittedRef.current) return;
      autoSubmittedRef.current = true;
      setIsSubmitting(true);

      const timeSpentSeconds = Math.max(
        10,
        totalDurationSeconds - Math.max(0, secondsLeft)
      );

      try {
        const result = await submitMockExam({
          templateId: template.id,
          answersByQuestion,
          timeSpentSeconds,
        });
        notify({
          title: isAutoTimeout
            ? 'Hết giờ! Hệ thống đã tự động thu bài'
            : 'Đã nộp bài thi thử thành công!',
          message: `Điểm tổng kết: ${result.scorePercent}% (${result.correctCount}/${result.totalQuestions} câu đúng).`,
          type: result.scorePercent >= template.passingScore ? 'success' : 'info',
        });
        navigate('/mock-test/result');
      } catch (err) {
        autoSubmittedRef.current = false;
        setIsSubmitting(false);
        notify({
          title: 'Lỗi khi nộp bài thi',
          message: err.message,
          type: 'error',
        });
      }
    },
    [
      answersByQuestion,
      navigate,
      notify,
      secondsLeft,
      template.id,
      template.passingScore,
      totalDurationSeconds,
    ]
  );

  // Đồng hồ đếm ngược thực tế (tự động thu bài khi chạm 00:00)
  useEffect(() => {
    if (loadingSession) return undefined;
    if (secondsLeft <= 0) {
      handleFinishExam(true);
      return undefined;
    }
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loadingSession, secondsLeft, handleFinishExam]);

  if (loadingSession || !currentQuestion) {
    return (
      <LoadingSkeleton
        rows={4}
        label="Đang tải bộ câu hỏi phòng thi từ máy chủ..."
      />
    );
  }

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const toggleFlag = (qId) => {
    setFlaggedIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const isQuestionAnswered = (q) => {
    const entry = answersByQuestion[q._id];
    if (!entry) return false;
    if (q.type === 'mcq') return (entry.selectedIds || []).length > 0;
    if (q.type === 'fill_blank') return Boolean(String(entry.text || '').trim());
    return Boolean(String(entry.code || '').trim());
  };

  const currentAnswer = answersByQuestion[currentQuestion._id] || {};

  const updateMcqOption = (optionId) => {
    const isMultiple = currentQuestion.payload.isMultiple;
    const prevIds = currentAnswer.selectedIds || [];
    const nextIds = isMultiple
      ? prevIds.includes(optionId)
        ? prevIds.filter((id) => id !== optionId)
        : [...prevIds, optionId]
      : [optionId];

    setAnswersByQuestion((prev) => ({
      ...prev,
      [currentQuestion._id]: { selectedIds: nextIds },
    }));
  };

  const updateFillBlank = (text) => {
    setAnswersByQuestion((prev) => ({
      ...prev,
      [currentQuestion._id]: { text },
    }));
  };

  const updateCodingAnswer = (field, val) => {
    const defaultLang =
      currentQuestion.payload.supportedLanguages?.[0] || 'javascript';
    const currentLang = currentAnswer.language || defaultLang;
    const defaultStarter =
      currentQuestion.payload.starterCode?.[currentLang] || '';

    setAnswersByQuestion((prev) => ({
      ...prev,
      [currentQuestion._id]: {
        language: field === 'language' ? val : currentLang,
        code:
          field === 'code'
            ? val
            : field === 'language'
              ? currentQuestion.payload.starterCode?.[val] || ''
              : currentAnswer.code ?? defaultStarter,
      },
    }));
  };

  const answeredTotal = examQuestions.filter(isQuestionAnswered).length;

  return (
    <div className="space-y-5">
      {/* Thanh trạng thái kỳ thi & Đồng hồ đếm ngược MM:SS */}
      <header className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-700">
            Đang diễn ra kỳ thi thử • Đã làm {answeredTotal}/{examQuestions.length} câu
          </span>
          <h1 className="text-base sm:text-lg font-bold text-slate-900">
            {template.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div
            role="timer"
            aria-label="Thời gian làm bài còn lại"
            className={cn(
              'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border font-mono text-sm font-bold',
              secondsLeft < 300
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-slate-100 border-slate-200 text-slate-900'
            )}
          >
            <Timer
              className="w-4 h-4 text-blue-600"
              aria-hidden="true"
            />
            <span>{formatTimer(secondsLeft)}</span>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleFinishExam(false)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{isSubmitting ? 'Đang chấm bài...' : 'Nộp bài sớm'}</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Khung làm câu hỏi hiện tại */}
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold">
                Câu {currentIdx + 1} / {examQuestions.length}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono uppercase font-semibold">
                {currentQuestion.type}
              </span>
            </div>

            <button
              type="button"
              aria-pressed={flaggedIds.includes(currentQuestion._id)}
              onClick={() => toggleFlag(currentQuestion._id)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                flaggedIds.includes(currentQuestion._id)
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              <Flag className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {flaggedIds.includes(currentQuestion._id)
                  ? 'Đã gắn cờ xem lại'
                  : 'Gắn cờ xem lại'}
              </span>
            </button>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              {currentQuestion.title}
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              {currentQuestion.prompt}
            </p>
            {currentQuestion.codeSnippet && (
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto">
                <code>{currentQuestion.codeSnippet}</code>
              </pre>
            )}
          </div>

          {/* Vùng trả lời theo đúng định dạng câu hỏi */}
          {currentQuestion.type === 'mcq' && (
            <div className="space-y-2.5 pt-2">
              {currentQuestion.payload.options.map((opt, i) => {
                const checked = (currentAnswer.selectedIds || []).includes(
                  opt.id
                );
                return (
                  <label
                    key={opt.id}
                    htmlFor={`exam-opt-${opt.id}`}
                    className={cn(
                      'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors',
                      checked
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    )}
                  >
                    <input
                      id={`exam-opt-${opt.id}`}
                      type={
                        currentQuestion.payload.isMultiple
                          ? 'checkbox'
                          : 'radio'
                      }
                      name={`exam-q-${currentQuestion._id}`}
                      checked={checked}
                      onChange={() => updateMcqOption(opt.id)}
                      className="mt-0.5 accent-blue-600"
                    />
                    <span className="text-sm text-slate-800">
                      <strong className="font-mono mr-1.5">
                        {String.fromCharCode(65 + i)}.
                      </strong>
                      {opt.text}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'fill_blank' && (
            <div className="space-y-2 pt-2">
              <label
                htmlFor="exam-fill-input"
                className="block text-xs font-semibold text-slate-700"
              >
                Nhập đáp án hoặc Output dự đoán:
              </label>
              <input
                id="exam-fill-input"
                type="text"
                value={currentAnswer.text || ''}
                onChange={(e) => updateFillBlank(e.target.value)}
                placeholder={currentQuestion.payload.placeholder}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 font-mono text-sm text-slate-900 focus:border-blue-600"
              />
            </div>
          )}

          {currentQuestion.type === 'coding' && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="exam-code-area"
                  className="text-xs font-semibold text-slate-700"
                >
                  Viết hàm giải quyết bài toán ({currentQuestion.payload.functionName}):
                </label>
                <select
                  aria-label="Ngôn ngữ lập trình"
                  value={
                    currentAnswer.language ||
                    currentQuestion.payload.supportedLanguages?.[0] ||
                    'javascript'
                  }
                  onChange={(e) => updateCodingAnswer('language', e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-800"
                >
                  {(currentQuestion.payload.supportedLanguages || ['javascript']).map(
                    (lang) => (
                      <option key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </option>
                    )
                  )}
                </select>
              </div>
              <textarea
                id="exam-code-area"
                rows={7}
                value={
                  currentAnswer.code ??
                  currentQuestion.payload.starterCode?.[
                    currentAnswer.language || 'javascript'
                  ] ??
                  ''
                }
                onChange={(e) => updateCodingAnswer('code', e.target.value)}
                className="w-full p-3.5 rounded-xl border border-slate-300 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed focus:border-blue-600"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-semibold text-slate-700"
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-white"
            >
              <span>Câu tiếp theo</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Bảng điều hướng câu hỏi bên phải */}
        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Danh sách câu hỏi trong đề ({examQuestions.length})
          </h2>

          <div className="grid grid-cols-5 gap-2">
            {examQuestions.map((q, idx) => {
              const active = idx === currentIdx;
              const isFlagged = flaggedIds.includes(q._id);
              const isDone = isQuestionAnswered(q);

              return (
                <button
                  key={q._id}
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  aria-label={`Chuyển tới câu ${idx + 1}`}
                  className={cn(
                    'h-10 rounded-xl font-mono text-xs font-bold border transition-all relative flex items-center justify-center',
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isFlagged
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  )}
                >
                  <span>{idx + 1}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className="w-3.5 h-3.5 text-emerald-600"
                aria-hidden="true"
              />
              <span>
                Đã trả lời: <strong>{answeredTotal}</strong> / {examQuestions.length} câu
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Trạng thái ca thi đang được lưu tự động vào <code>localStorage</code>.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
