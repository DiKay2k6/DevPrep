import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  Code2,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  advanceSpacedRepetitionCycle,
  getAnalyticsDashboard,
} from '../../api/analyticsApi.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { LoadingSkeleton } from '../../components/UiStates.jsx';
import { cn } from '../../utils/cn.js';
import { subscribeStorageSync } from '../../utils/storage.js';

export default function AnalyticsDashboardPage() {
  const { notify } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    getAnalyticsDashboard()
      .then((res) => setDashboard(res))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    return subscribeStorageSync(loadData);
  }, []);

  const handleAdvanceCycle = async (item) => {
    try {
      const res = await advanceSpacedRepetitionCycle(item.id);
      setDashboard((prev) =>
        prev ? { ...prev, reviewQueue: res.queue } : prev
      );
      notify({
        title: res.completedAllStages
          ? 'Hoàn tất chu kỳ 14 ngày!'
          : `Đã nâng lên ${res.item.cycleLabel}`,
        message: res.completedAllStages
          ? `Câu hỏi "${item.title}" đã được ghi nhớ bền vững.`
          : `Hệ thống sẽ nhắc bạn ôn lại câu hỏi này sau ${res.item.intervalDays} ngày.`,
        type: 'success',
      });
    } catch (err) {
      notify({
        title: 'Lỗi cập nhật chu kỳ ôn tập',
        message: err.message,
        type: 'error',
      });
    }
  };

  if (loading || !dashboard) {
    return (
      <LoadingSkeleton
        rows={4}
        label="Đang tổng hợp thống kê năng lực..."
      />
    );
  }

  const { tagStats, formatStats, reviewQueue } = dashboard;
  const weakTags = tagStats.filter((item) => item.accuracy < 65);

  const getBarColor = (accuracy) => {
    if (accuracy < 55) return '#dc2626';
    if (accuracy < 70) return '#d97706';
    return '#2563eb';
  };

  return (
    <div className="space-y-6">
      <header className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Phân tích Lỗ hổng Kiến thức &amp; Ôn tập Ngắt quãng
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Tự động cập nhật tỷ lệ chính xác theo từng nhãn kỹ năng (Tag) mỗi khi bạn làm bài luyện tập hoặc nộp đề thi thử.
        </p>
      </header>

      {/* Cảnh báo các chủ đề dưới ngưỡng an toàn (< 65%) */}
      {weakTags.length > 0 && (
        <section
          aria-labelledby="weak-tags-heading"
          className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm sm:text-base">
            <AlertTriangle
              className="w-5 h-5 text-amber-600 shrink-0"
              aria-hidden="true"
            />
            <h2 id="weak-tags-heading">
              Phát hiện {weakTags.length} chủ đề có tỷ lệ chính xác dưới ngưỡng an toàn (65%)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weakTags.map((wt) => (
              <div
                key={wt.tag}
                className="bg-white border border-amber-200/90 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{wt.tag}</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 font-bold">
                      Độ chính xác: {wt.accuracy}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Chuyên ngành: {wt.category} • {wt.attempts} lượt làm bài
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    Bài học lý thuyết cần đọc lại ngay:
                  </span>
                  <Link
                    to={`/study-hub/${wt.recommendedArticleSlug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900"
                  >
                    <BookOpen
                      className="w-3.5 h-3.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="line-clamp-1">
                      {wt.recommendedArticleTitle}
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Biểu đồ Recharts: Tỷ lệ chính xác theo Tag & theo Định dạng */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Biểu đồ Tỷ lệ Chính xác theo Chủ đề Kỹ thuật (%)
            </h2>
            <p className="text-xs text-slate-500">
              Màu đỏ (&lt;55%): Cần ôn gấp • Màu cam (55–69%): Cần củng cố • Màu xanh (&ge;70%): Vững vàng
            </p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tagStats}
                layout="vertical"
                margin={{ top: 5, right: 24, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: '#475569' }}
                  unit="%"
                />
                <YAxis
                  dataKey="tag"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Độ chính xác']}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#cbd5e1',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="accuracy" radius={[0, 6, 6, 0]} barSize={22}>
                  {tagStats.map((entry) => (
                    <Cell
                      key={entry.tag}
                      fill={getBarColor(entry.accuracy)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Độ chính xác theo Hình thức Bài tập
            </h2>
            <p className="text-xs text-slate-500">
              Đối chiếu năng lực lý thuyết và thực hành viết code.
            </p>
          </div>

          <div className="space-y-4">
            {formatStats.map((fmt) => (
              <div key={fmt.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">
                    {fmt.name}
                  </span>
                  <span className="font-mono font-bold text-blue-700">
                    {fmt.accuracy}% ({fmt.solved} câu)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${fmt.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong>Nhận xét tự động:</strong> Các câu làm sai ở bất kỳ hình thức nào đều được tự động đẩy xuống hàng đợi Spaced Repetition bên dưới.
          </div>
        </section>
      </div>

      {/* Hàng đợi Ôn tập Ngắt quãng (Spaced Repetition Queue: 1 -> 3 -> 7 -> 14 ngày) */}
      <section
        aria-labelledby="sr-queue-heading"
        className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
          <div>
            <h2
              id="sr-queue-heading"
              className="text-lg font-bold text-slate-900 flex items-center gap-2"
            >
              <CalendarClock
                className="w-5 h-5 text-blue-600"
                aria-hidden="true"
              />
              <span>
                Hàng đợi Ôn tập Ngắt quãng (Spaced Repetition:{' '}
                {reviewQueue.length} câu)
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Chu kỳ nhắc lại tự động: <strong>1 ngày → 3 ngày → 7 ngày → 14 ngày</strong> đối với các câu làm sai hoặc được đánh dấu cần ôn lại.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {reviewQueue.map((item) => {
            const isDueToday = item.dueStatus.includes('hôm nay');
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full font-bold border',
                        isDueToday
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      )}
                    >
                      {item.dueStatus}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-white border border-slate-200 font-semibold text-slate-700">
                      {item.cycleLabel}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {item.level} • {item.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500">
                    Trạng thái gần nhất: <strong>{item.lastAttemptResult}</strong>{' '}
                    • Nhãn: {item.tags.join(', ')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleAdvanceCycle(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Đã ôn xong (+Chu kỳ)</span>
                  </button>

                  <Link
                    to={`/practice/${item.questionId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Ôn tập câu này</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
