import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CalendarClock,
  RefreshCw,
} from 'lucide-react';
import {
  FORMAT_ACCURACY_STATS,
  KNOWLEDGE_GAP_BY_TAG,
  SPACED_REPETITION_QUEUE,
} from '../../data/analytics.mock.js';
import { cn } from '../../utils/cn.js';

export default function AnalyticsDashboardPage() {
  const weakTopics = KNOWLEDGE_GAP_BY_TAG.filter((item) => item.accuracy < 65);

  return (
    <div className="space-y-6">
      <header className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Phân tích Năng lực &amp; Lịch Ôn tập
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Theo dõi tỷ lệ chính xác theo từng chủ đề kỹ thuật và tự động nhắc lịch ôn tập ngắt quãng (1 – 3 – 7 – 14 ngày).
          </p>
        </div>

        <Link
          to="/practice"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shrink-0 transition-colors"
        >
          <span>Luyện tập khắc phục điểm yếu</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <figure className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <figcaption className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">
              Tỷ lệ chính xác theo chủ đề kỹ thuật (%)
            </h2>
            <p className="text-xs text-slate-500">
              Các chủ đề có tỷ lệ đúng dưới 65% được đánh dấu cam/đỏ để ưu tiên ôn tập lại.
            </p>
          </figcaption>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={KNOWLEDGE_GAP_BY_TAG}
                layout="vertical"
                margin={{ top: 8, right: 20, left: 20, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: '#475569', fontSize: 12 }}
                  unit="%"
                />
                <YAxis
                  dataKey="tag"
                  type="category"
                  width={115}
                  tick={{ fill: '#0f172a', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  formatter={(value) => [`${value}% chính xác`, 'Tỷ lệ đúng']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="accuracy" radius={[0, 6, 6, 0]} barSize={22}>
                  {KNOWLEDGE_GAP_BY_TAG.map((entry) => {
                    let fillColor = '#2563eb';
                    if (entry.accuracy < 55) fillColor = '#dc2626';
                    else if (entry.accuracy < 70) fillColor = '#d97706';
                    else if (entry.accuracy >= 85) fillColor = '#059669';
                    return <Cell key={entry.tag} fill={fillColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            {FORMAT_ACCURACY_STATS.map((st) => (
              <div
                key={st.name}
                className="p-2.5 rounded-xl bg-[#F4F7FA] border border-slate-200/70"
              >
                <span className="text-slate-500 block">{st.name}</span>
                <strong className="text-base text-slate-900">
                  {st.accuracy}%
                </strong>
                <span className="text-[11px] text-slate-500 block">
                  ({st.solved} câu)
                </span>
              </div>
            ))}
          </div>
        </figure>

        <section
          aria-labelledby="weak-topics-heading"
          className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle
              className="w-5 h-5 text-amber-600 shrink-0"
              aria-hidden="true"
            />
            <h2 id="weak-topics-heading" className="text-base font-bold text-slate-900">
              Chủ đề cần củng cố ngay ({weakTopics.length})
            </h2>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Dựa trên lịch sử làm bài, hệ thống đề xuất bạn đọc lại các bài tài liệu sau trước khi làm đề thi thử tiếp theo:
          </p>

          <ul role="list" className="space-y-3">
            {weakTopics.map((topic) => (
              <li
                key={topic.tag}
                className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    {topic.tag} ({topic.category})
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
                    Đúng {topic.accuracy}% ({topic.attempts} lượt)
                  </span>
                </div>

                <div className="pt-1.5 border-t border-amber-200/70 flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-700 line-clamp-1">
                    Bài đọc: <strong>{topic.recommendedArticleTitle}</strong>
                  </span>
                  <Link
                    to={`/study-hub/${topic.recommendedArticleSlug}`}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Ôn bài</span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="spaced-rep-heading" className="space-y-4">
        <div>
          <h2
            id="spaced-rep-heading"
            className="text-lg font-bold text-slate-900 inline-flex items-center gap-2"
          >
            <CalendarClock className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <span>Hàng đợi Ôn tập Ngắt quãng</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Các câu trả lời sai hoặc được đánh dấu sẽ tự động lặp lại theo chu kỳ 1 ngày → 3 ngày → 7 ngày → 14 ngày.
          </p>
        </div>

        <div
          tabIndex={0}
          role="region"
          aria-labelledby="spaced-rep-heading"
          className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-x-auto"
        >
          <table className="w-full text-left border-collapse">
            <caption className="visually-hidden">
              Danh sách câu hỏi trong hàng đợi ôn tập ngắt quãng
            </caption>
            <thead className="bg-[#F8FAFC] border-b border-slate-200/80 text-xs font-bold text-slate-600 uppercase">
              <tr>
                <th scope="col" className="py-3.5 px-5">
                  Câu hỏi cần ôn tập
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                  Chu kỳ lặp lại
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                  Trạng thái hạn
                </th>
                <th scope="col" className="py-3.5 px-4 whitespace-nowrap">
                  Lần làm gần nhất
                </th>
                <th scope="col" className="py-3.5 px-5 text-right whitespace-nowrap">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-sm">
              {SPACED_REPETITION_QUEUE.map((item) => {
                const isDueToday = item.dueStatus.includes('hôm nay');
                return (
                  <tr key={item.id} className="hover:bg-blue-50/30">
                    <th scope="row" className="py-4 px-5 font-bold text-slate-900">
                      <Link
                        to={`/practice/${item.questionId}`}
                        className="hover:text-blue-600 block"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs font-normal text-slate-500 mt-1">
                        {item.level} • {item.category} • {item.tags.join(', ')}
                      </p>
                    </th>
                    <td className="py-4 px-4 whitespace-nowrap text-xs font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F4F7FA]">
                        <RefreshCw className="w-3 h-3 text-blue-600" aria-hidden="true" />
                        <span>{item.cycleLabel}</span>
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-xs">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full font-semibold border',
                          isDueToday
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        )}
                      >
                        {item.dueStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                      {item.lastAttemptResult}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Link
                        to={`/practice/${item.questionId}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                      >
                        <span>Ôn tập ngay</span>
                        <span className="visually-hidden">: {item.title}</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
