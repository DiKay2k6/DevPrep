import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { MOCK_TEST_RESULT_SAMPLE } from '../../data/mockTest.mock.js';

export default function MockTestResultPage() {
  const result = MOCK_TEST_RESULT_SAMPLE;
  const minutes = Math.floor(result.timeSpentSeconds / 60);
  const seconds = result.timeSpentSeconds % 60;

  return (
    <div className="space-y-6">
      {/* Tổng quan điểm số bài thi */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <Award className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{result.statusBadge}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Kết quả: {result.templateTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Hoàn thành lúc {result.completedAt} • Cấp độ: {result.level} ({result.track})
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:w-96 shrink-0 text-center">
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
              <span className="text-xs text-blue-700 font-medium block">
                Tổng điểm
              </span>
              <strong className="text-2xl font-bold text-blue-700">
                {result.scorePercent}%
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">
                Số câu đúng
              </span>
              <strong className="text-2xl font-bold text-slate-900">
                {result.correctCount}/{result.totalQuestions}
              </strong>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 font-medium block">
                Thời gian làm
              </span>
              <strong className="text-lg font-bold text-slate-900 inline-flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4 text-slate-500" aria-hidden="true" />
                <span>
                  {minutes}p {seconds}s
                </span>
              </strong>
            </div>
          </div>
        </div>

        {/* Phân rã theo 3 định dạng câu hỏi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
          {result.breakdownByFormat.map((item) => (
            <div
              key={item.format}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">{item.format}</span>
                <span className="text-blue-700">
                  {item.correct}/{item.total} ({item.accuracy}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${item.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Chi tiết từng câu hỏi trong bài thi */}
      <section aria-labelledby="review-list-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="review-list-heading" className="text-lg font-bold text-slate-900">
            Chi tiết Đáp án &amp; Nhận xét từng câu
          </h2>
          <div className="flex items-center gap-2">
            <Link
              to="/mock-test"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Chọn đề thi khác</span>
            </Link>
            <Link
              to="/analytics"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <span>Phân tích Lỗ hổng Kiến thức</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          {result.questionReviews.map((rev, idx) => (
            <article
              key={rev.questionId}
              className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {rev.isCorrect ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Đúng</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-semibold">
                      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Cần ôn lại</span>
                    </span>
                  )}
                  <span className="font-mono text-slate-500">
                    Câu #{idx + 1} ({rev.type})
                  </span>
                  {rev.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {rev.title}
                </h3>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <p>
                    <strong>Bài làm của bạn:</strong>{' '}
                    <code className="font-mono text-slate-800">
                      {rev.userAnswerText}
                    </code>
                  </p>
                  <p>
                    <strong>Đáp án chuẩn:</strong>{' '}
                    <code className="font-mono text-emerald-700">
                      {rev.expectedAnswerText}
                    </code>
                  </p>
                </div>
              </div>

              <Link
                to={`/practice/${rev.questionId}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white text-xs font-semibold shrink-0 transition-colors"
              >
                <span>Mở lại trong Workspace</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
