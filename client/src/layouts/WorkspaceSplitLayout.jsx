import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';

/**
 * Bố cục chia đôi màn hình (WorkspaceSplitLayout) trên nền #F4F7FA:
 * - Cột trái: Đề bài, tag kỹ thuật, code mẫu, giải thích & bài học liên quan.
 * - Cột phải: Khung tương tác làm bài (MCQ / Fill-blank / Monaco Editor + Test Cases).
 */
export default function WorkspaceSplitLayout({
  title,
  badgeNode,
  headerActions,
  leftPanel,
  rightPanel,
  backTo = '/practice',
  backLabel = 'Danh sách câu hỏi',
}) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F4F7FA] text-slate-900">
      {/* Thanh công cụ gọn trên đỉnh (h-14) */}
      <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200/80 px-4 sm:px-6">
        <div className="h-full max-w-[1600px] mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={backTo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-[#F4F7FA] hover:bg-slate-200/70 text-xs font-bold text-slate-700 shrink-0 whitespace-nowrap transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{backLabel}</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 hidden sm:block shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
              <span className="font-bold text-sm text-slate-900 truncate">
                {title}
              </span>
              {badgeNode}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            {headerActions}
            <Link
              to="/study-hub"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
              <span>Study Hub</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Khung chia đôi 2 cột bo góc rounded-2xl */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 focus:outline-none"
      >
        <section
          aria-label="Nội dung đề bài và hướng dẫn"
          className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col min-w-0 lg:max-h-[calc(100dvh-5rem)] scrollable-region"
        >
          {leftPanel}
        </section>

        <section
          aria-label="Không gian làm bài và kết quả kiểm thử"
          className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex flex-col min-w-0 lg:max-h-[calc(100dvh-5rem)] scrollable-region overflow-hidden"
        >
          {rightPanel}
        </section>
      </main>
    </div>
  );
}
