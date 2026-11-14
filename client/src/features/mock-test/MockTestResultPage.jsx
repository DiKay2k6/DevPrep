import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { getLastMockResult } from '../../api/mockTestApi.js';
import { LoadingSkeleton } from '../../components/UiStates.jsx';
import { cn } from '../../utils/cn.js';

export default function MockTestResultPage() {
  const [r, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getLastMockResult()
      .then((data) => {
        if (mounted) setResult(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !r) {
    return <LoadingSkeleton rows={3} label="Đang tải biên bản chấm điểm..." />;
  }

  const mins = Math.floor(r.timeSpentSeconds / 60);
  const secs = r.timeSpentSeconds % 60;
  const isPassed = r.scorePercent >= (r.passingScore || 70);

  return (
    <div className="space-y-6">
      {/* Banner Điểm tổng kết */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold',
              isPassed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            )}
          >
            <Award className="w-4 h-4" aria-hidden="true" />
            <span>{r.statusBadge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Kết quả: {r.templateTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 flex flex-wrap items-center gap-3">
            <span>Cấp độ: {r.level}</span>
            <span>•</span>
            <span>Chuyên ngành: {r.track}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                Thời gian hoàn thành: {mins} phút {secs} giây / {r.durationMinutes}{' '}
                phút
              </span>
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div
            className={cn(
              'p-4 rounded-2xl border text-center min-w-[120px]',
              isPassed
                ? 'bg-emerald-50/70 border-emerald-200'
                : 'bg-amber-50/70 border-amber-200'
            )}
          >
            <span
              className={cn(
                'text-3xl font-extrabold block',
                isPassed ? 'text-emerald-700' : 'text-amber-800'
              )}
            >
              {r.scorePercent}%
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {r.correctCount}/{r.totalQuestions} câu đúng
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              to="/analytics"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              <BarChart3 className="w-4 h-4" aria-hidden="true" />
              <span>Phân tích lỗ hổng kiến thức</span>
            </Link>
            <Link
              to="/mock-test"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Thi lại đề khác</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Phân rã điểm theo 3 định dạng */}
      <section
        aria-label="Phân rã kết quả theo định dạng"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {r.breakdownByFormat.map((item) => (
          <article
            key={item.format}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>{item.format}</span>
              <span className="font-mono text-slate-900">
                {item.correct}/{item.total} câu
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {item.accuracy}%
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
                style={{ width: `${item.accuracy}%` }}
              />
            </div>
          </article>
        ))}
      </section>

      {/* Bảng đối chiếu từng câu hỏi trong đề */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900">
            Biên bản chấm điểm chi tiết từng câu hỏi
          </h2>
          <span className="text-xs text-slate-500">
            Các câu làm sai đã được tự động đẩy vào Hàng đợi Ôn tập Ngắt quãng (chu kỳ 1 ngày).
          </span>
        </div>

        <div className="space-y-3">
          {r.questionReviews.map((item, idx) => (
            <div
              key={item.questionId}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-slate-500">
                    #{idx + 1}
                  </span>
                  {item.isCorrect ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      <CheckCircle2
                        className="w-3.5 h-3.5"
                        aria-hidden="true"
                      />
                      <span>Chính xác</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
                      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Cần ôn lại</span>
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono uppercase">
                    {item.type}
                  </span>
                  <span className="text-slate-500">
                    Tags: {item.tags.join(', ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {item.title}
                </h3>

                <div className="text-xs text-slate-600 space-y-0.5 font-mono">
                  <div>Bài làm của bạn: {item.userAnswerText}</div>
                  <div className="text-emerald-700">
                    Đáp án chuẩn: {item.expectedAnswerText}
                  </div>
                </div>
              </div>

              <Link
                to={`/practice/${item.questionId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-semibold shrink-0 transition-colors"
              >
                <span>Làm lại trong Sandbox</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
