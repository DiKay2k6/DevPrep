import { Link } from 'react-router-dom';
import { BookOpen, Code2 } from 'lucide-react';

const FORMAT_LABELS = {
  mcq: 'Trắc nghiệm',
  fill_blank: 'Dự đoán Output',
  coding: 'Viết code',
};

/**
 * Khu vực hiển thị Bài học & Câu hỏi đề xuất tự động lọc theo `selectedSkills` và `globalLevel`.
 */
export default function SkillRecommendationsSection({
  selectedSkills = [],
  globalLevel = 'All',
  recommendedArticles = [],
  recommendedQuestions = [],
}) {
  return (
    <section
      aria-labelledby="personalized-recommendations-heading"
      className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h2
            id="personalized-recommendations-heading"
            className="text-base sm:text-lg font-extrabold text-slate-900"
          >
            Bài học &amp; Câu hỏi đề xuất cho kỹ năng của bạn
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động lọc theo {selectedSkills.length} kỹ năng đã chọn kết hợp cấp độ{' '}
            <strong className="text-slate-700">
              {globalLevel === 'All' ? 'Tất cả' : globalLevel}
            </strong>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          <Link to="/study-hub" className="text-blue-600 hover:underline">
            Kho tài liệu ({recommendedArticles.length})
          </Link>
          <span className="text-slate-300">•</span>
          <Link to="/practice" className="text-blue-600 hover:underline">
            Ngân hàng câu hỏi ({recommendedQuestions.length})
          </Link>
        </div>
      </div>

      {/* Bài học đề xuất */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Tài liệu kỹ thuật phù hợp ({recommendedArticles.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedArticles.slice(0, 3).map((art) => (
            <article
              key={art._id}
              className="bg-[#F4F7FA] hover:bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl p-4 transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600">{art.category}</span>
                  <span className="text-slate-500 font-medium">
                    {art.level} • {art.readingTimeMinutes} phút
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-2">
                  <Link
                    to={`/study-hub/${art.slug}`}
                    className="hover:text-blue-600"
                  >
                    {art.title}
                  </Link>
                </h4>
              </div>
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-slate-500 truncate">
                  {art.tags.slice(0, 2).join(' • ')}
                </span>
                <Link
                  to={`/study-hub/${art.slug}`}
                  className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Đọc bài</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Câu hỏi đề xuất */}
      <div className="space-y-2.5 pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Câu hỏi thực hành phù hợp ({recommendedQuestions.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedQuestions.slice(0, 6).map((q) => (
            <article
              key={q._id}
              className="bg-[#F4F7FA] hover:bg-white border border-slate-200/80 hover:border-blue-300 rounded-2xl p-4 transition-all flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="text-blue-600 font-semibold">
                    {FORMAT_LABELS[q.type] || 'Thực hành'}
                  </span>
                  <span>
                    {q.level} • {q.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  <Link
                    to={`/practice/${q._id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {q.title}
                  </Link>
                </h4>
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-xs">
                <span className="text-slate-500 truncate">
                  {q.tags.slice(0, 2).join(' • ')}
                </span>
                <Link
                  to={`/practice/${q._id}`}
                  className="inline-flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 shrink-0"
                >
                  <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Làm bài</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
