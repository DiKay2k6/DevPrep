import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  Target,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { QUESTIONS_MOCK } from '../../data/questions.mock.js';
import { cn } from '../../utils/cn.js';

const QUICK_TEST_IDS = [
  'q_fill_event_loop_02',
  'q_mcq_event_loop_01',
  'q_fill_mongo_select_04',
  'q_mcq_mongo_esr_03',
  'q_mcq_strategy_pattern_09',
];

function evaluateQuestion(q, answer) {
  if (q.type === 'mcq') {
    const selected = Array.isArray(answer) ? answer : [];
    const expected = q.payload.correctOptionIds || [];
    if (selected.length !== expected.length) return false;
    return expected.every((id) => selected.includes(id));
  }
  if (q.type === 'fill_blank') {
    const raw = typeof answer === 'string' ? answer.trim() : '';
    if (!raw) return false;
    const normalized = q.payload.caseSensitive ? raw : raw.toLowerCase();
    return (q.payload.acceptedAnswers || []).some((acc) => {
      const target = q.payload.caseSensitive ? acc.trim() : acc.trim().toLowerCase();
      return normalized === target;
    });
  }
  return false;
}

function getRecommendedLevel(score) {
  if (score >= 5) {
    return {
      level: 'Middle',
      summary: 'Bạn nắm vững cả tư duy bất đồng bộ, tối ưu truy vấn cơ sở dữ liệu và kiến trúc bảo mật hệ thống.',
    };
  }
  if (score === 4) {
    return {
      level: 'Junior',
      summary: 'Nền tảng kỹ thuật của bạn khá chắc chắn, phù hợp luyện sâu thêm về tối ưu hóa Index và thiết kế hệ thống.',
    };
  }
  if (score >= 2) {
    return {
      level: 'Fresher',
      summary: 'Bạn đã có kiến thức cốt lõi nhưng cần rèn thêm các bài tập phân tích luồng bất đồng bộ và bảo mật API.',
    };
  }
  return {
    level: 'Intern',
    summary: 'Hãy bắt đầu từ lộ trình Nền tảng (Intern) để củng cố vững chắc cơ chế JavaScript, HTTP và truy vấn cơ bản.',
  };
}

export default function QuickTestPage() {
  const questions = useMemo(
    () =>
      QUICK_TEST_IDS.map((id) => QUESTIONS_MOCK.find((q) => q._id === id)).filter(
        Boolean
      ),
    []
  );

  const [secondsLeft, setSecondsLeft] = useState(300);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isSubmitted) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const handleMcqChange = (q, optionId) => {
    if (isSubmitted) return;
    setAnswers((prev) => {
      const current = Array.isArray(prev[q._id]) ? prev[q._id] : [];
      if (q.payload.isMultiple) {
        const exists = current.includes(optionId);
        const next = exists
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
        return { ...prev, [q._id]: next };
      }
      return { ...prev, [q._id]: [optionId] };
    });
  };

  const handleFillChange = (qId, value) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const handleReset = () => {
    setAnswers({});
    setIsSubmitted(false);
    setSecondsLeft(300);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const results = useMemo(
    () =>
      questions.map((q) => ({
        question: q,
        isCorrect: evaluateQuestion(q, answers[q._id]),
      })),
    [questions, answers]
  );

  const correctCount = results.filter((r) => r.isCorrect).length;
  const recommendation = getRecommendedLevel(correctCount);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="pb-16">
      {/* dải tiêu đề xanh đồng bộ với Sticky Header */}
      <section className="landing-hero-surface text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
              <Target className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Đánh giá năng lực đầu vào miễn phí (Không cần đăng nhập)</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bài kiểm tra nhanh 5 câu hỏi phỏng vấn CNTT
            </h1>
            <p className="text-xs sm:text-sm text-blue-100">
              Kết hợp Trắc nghiệm chuyên sâu và Dự đoán kết quả thực thi để gợi ý lộ trình sát nhất với trình độ hiện tại.
            </p>
          </div>

          <div
            role="timer"
            aria-live="off"
            className="shrink-0 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3 text-center"
          >
            <div className="flex items-center justify-center gap-1.5 text-xs text-blue-100 font-semibold">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Thời gian còn lại</span>
            </div>
            <p className="font-mono text-2xl font-extrabold tracking-wider mt-0.5">
              {mm}:{ss}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Khối kết quả & Gợi ý cấp độ sau khi nộp bài */}
        {isSubmitted && (
          <section
            aria-live="polite"
            className="bg-white border-2 border-[#0052FF] rounded-3xl p-6 sm:p-8 shadow-md space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0052FF]">
                  Kết quả đánh giá năng lực
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Đạt {correctCount}/{questions.length} câu chính xác — Gợi ý cấp độ:{' '}
                  <span className="text-[#0052FF]">{recommendation.level}</span>
                </h2>
                <p className="text-sm text-slate-600">{recommendation.summary}</p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Làm lại bài test</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900">
                  Lưu lộ trình cấp độ {recommendation.level} vào Không gian Học tập (HUB)
                </p>
                <p className="text-xs text-slate-600">
                  Tạo tài khoản miễn phí để mở khóa toàn bộ câu hỏi thực hành, trình biên dịch code và lịch ôn tập ngắt quãng.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0052FF] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" aria-hidden="true" />
                  <span>Đăng ký lưu lộ trình</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold transition-colors"
                >
                  <span>Đăng nhập</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Danh sách 5 câu hỏi */}
        <div className="space-y-5">
          {questions.map((q, index) => {
            const selectedMcq = Array.isArray(answers[q._id]) ? answers[q._id] : [];
            const fillValue = typeof answers[q._id] === 'string' ? answers[q._id] : '';
            const isCorrect = results[index]?.isCorrect;

            return (
              <article
                key={q._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0052FF] text-xs font-extrabold">
                      Câu {index + 1}/5
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {q.type === 'mcq' ? 'Trắc nghiệm' : 'Dự đoán Output'} • Cấp độ {q.level}
                    </span>
                  </div>

                  {isSubmitted && (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold',
                        isCorrect
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-700'
                      )}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Chính xác</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Chưa chính xác</span>
                        </>
                      )}
                    </span>
                  )}
                </div>

                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {q.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">{q.prompt}</p>

                {q.codeSnippet && (
                  <pre className="rounded-xl bg-slate-900 text-sky-200 p-4 font-mono text-xs overflow-x-auto leading-relaxed">
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}

                {q.type === 'mcq' ? (
                  <div className="space-y-2 pt-1">
                    {q.payload.options.map((opt) => {
                      const checked = selectedMcq.includes(opt.id);
                      return (
                        <label
                          key={opt.id}
                          className={cn(
                            'flex items-start gap-3 p-3.5 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors',
                            checked
                              ? 'bg-blue-50/70 border-[#0052FF] text-slate-900 font-semibold'
                              : 'bg-[#F4F7FA] border-slate-200/80 text-slate-700 hover:bg-slate-100/80'
                          )}
                        >
                          <input
                            type={q.payload.isMultiple ? 'checkbox' : 'radio'}
                            name={`quick-${q._id}`}
                            checked={checked}
                            disabled={isSubmitted}
                            onChange={() => handleMcqChange(q, opt.id)}
                            className="mt-0.5 w-4 h-4 accent-[#0052FF]"
                          />
                          <span>{opt.text}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <label
                      htmlFor={`fill-${q._id}`}
                      className="text-xs font-bold text-slate-700"
                    >
                      Câu trả lời của bạn:
                    </label>
                    <input
                      id={`fill-${q._id}`}
                      type="text"
                      disabled={isSubmitted}
                      value={fillValue}
                      onChange={(e) => handleFillChange(q._id, e.target.value)}
                      placeholder={q.payload.placeholder}
                      className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-sm text-slate-900 focus:border-[#0052FF]"
                    />
                  </div>
                )}

                {isSubmitted && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-slate-900">Giải thích đáp án:</p>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Nút nộp bài chấm điểm tại chỗ */}
        {!isSubmitted && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <p className="text-xs sm:text-sm text-slate-600">
              Hoàn thành các câu hỏi trên và nhấn nộp bài để xem điểm số kèm cấp độ gợi ý ngay lập tức.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0052FF] hover:bg-blue-700 text-white text-sm font-extrabold shadow-xs transition-colors shrink-0"
            >
              <span>Nộp bài &amp; Xem cấp độ gợi ý</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
