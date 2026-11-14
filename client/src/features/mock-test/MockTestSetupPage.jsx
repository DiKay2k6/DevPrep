import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  FileCheck2,
  Layers,
  ShieldAlert,
  Timer,
} from 'lucide-react';
import { MOCK_TEST_TEMPLATES } from '../../data/mockTest.mock.js';
import { LEVELS } from '../../data/tracks.mock.js';
import { cn } from '../../utils/cn.js';

export default function MockTestSetupPage() {
  const getLevelBadge = (levelId) =>
    LEVELS.find((l) => l.id === levelId)?.badgeClass ||
    'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="space-y-6">
      <header className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <Timer className="w-4 h-4" aria-hidden="true" />
            <span>PHÒNG THI THỬ ÁP LỰC THỜI GIAN (MOCK TEST SIMULATOR)</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Mô phỏng Bài Kiểm tra Kỹ thuật Tuyển dụng CNTT
          </h1>
          <p className="text-sm text-slate-600">
            Đề thi kết hợp cả 3 định dạng câu hỏi với đồng hồ đếm ngược, bảng điều hướng câu hỏi và báo cáo phân tích điểm số.
          </p>
        </div>

        <Link
          to="/mock-test/result"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F4F7FA] hover:bg-slate-200/70 border border-slate-200/80 text-slate-800 text-xs sm:text-sm font-bold shrink-0 transition-colors"
        >
          <FileCheck2 className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <span>Xem Mẫu Báo cáo Kết quả Thi</span>
        </Link>
      </header>

      {/* Quy định phòng thi thử */}
      <section className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-amber-950">
        <ShieldAlert
          className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="font-bold">Cơ chế Chống gian lận &amp; Bảo toàn bài làm:</p>
          <p className="text-amber-900 leading-relaxed">
            Trong quá trình làm bài thi thử, toàn bộ đáp án đúng và Hidden Test Cases được ẩn hoàn toàn khỏi phản hồi API. Điểm số chỉ được chấm tập trung khi bấm Nộp bài hoặc khi đồng hồ đếm ngược về 00:00.
          </p>
        </div>
      </section>

      {/* Danh sách bộ đề thi thử mẫu */}
      <section aria-labelledby="exam-templates-heading" className="space-y-4">
        <h2 id="exam-templates-heading" className="text-lg font-extrabold text-slate-900">
          Chọn Bộ đề Thi thử theo Cấp độ &amp; Chuyên ngành
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {MOCK_TEST_TEMPLATES.map((tpl, idx) => {
            const bannerGradients = [
              'from-sky-100 via-blue-50 to-indigo-100',
              'from-indigo-100 via-purple-50 to-blue-100',
              'from-emerald-100 via-teal-50 to-cyan-100',
            ];
            return (
              <article
                key={tpl.id}
                className="bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl p-4 shadow-sm hover:shadow-md flex flex-col justify-between gap-4 transition-all"
              >
                <header
                  className={cn(
                    'rounded-xl p-4 bg-gradient-to-br space-y-3',
                    bannerGradients[idx % bannerGradients.length]
                  )}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full font-bold border bg-white/90',
                        getLevelBadge(tpl.level)
                      )}
                    >
                      {tpl.level}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-white/85 text-slate-800 font-bold text-[11px] uppercase">
                      {tpl.track}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                    {tpl.title}
                  </h3>
                </header>

                <div className="px-1 space-y-3 text-xs text-slate-600">
                  <p className="leading-relaxed">{tpl.structureSummary}</p>

                  <dl className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                    <div className="p-2 rounded-xl bg-[#F4F7FA]">
                      <dt className="text-[11px] text-slate-500">Thời lượng</dt>
                      <dd className="font-bold text-slate-900 mt-0.5 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" aria-hidden="true" />
                        <span>{tpl.durationMinutes}p</span>
                      </dd>
                    </div>
                    <div className="p-2 rounded-xl bg-[#F4F7FA]">
                      <dt className="text-[11px] text-slate-500">Số câu hỏi</dt>
                      <dd className="font-bold text-slate-900 mt-0.5 inline-flex items-center gap-1">
                        <Layers className="w-3 h-3 text-blue-600" aria-hidden="true" />
                        <span>{tpl.totalQuestions} câu</span>
                      </dd>
                    </div>
                    <div className="p-2 rounded-xl bg-[#F4F7FA]">
                      <dt className="text-[11px] text-slate-500">Điểm đạt</dt>
                      <dd className="font-bold text-emerald-700 mt-0.5 inline-flex items-center gap-1">
                        <Award className="w-3 h-3" aria-hidden="true" />
                        <span>{tpl.passingScore}%</span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <footer className="px-1 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Sẵn sàng thi</span>
                  </span>
                  <Link
                    to={`/mock-test/room?templateId=${encodeURIComponent(tpl.id)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Bắt đầu làm bài</span>
                    <span className="visually-hidden">: {tpl.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </footer>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
