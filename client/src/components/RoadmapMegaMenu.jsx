import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { LEVELS } from '../data/tracks.mock.js';
import { cn } from '../utils/cn.js';

const SHORT_EXPERIENCE_BY_LEVEL = {
  Intern: 'Sinh viên năm 3–4',
  Fresher: '0 – 1 năm kinh nghiệm',
  Junior: '1 – 2.5 năm kinh nghiệm',
  Middle: '2.5 – 4+ năm kinh nghiệm',
};

/**
 * Mega-Menu 2x2 hiển thị nhanh 4 cấp độ phỏng vấn trên thanh điều hướng trang chủ.
 * Dùng nền trắng đục hoàn toàn (`bg-white`) để không bị xuyên chữ Hero Banner bên dưới.
 */
export default function RoadmapMegaMenu({ onSelectSection, onClose }) {
  return (
    <div
      id="roadmap-preview-popover"
      role="region"
      aria-label="Xem nhanh 4 cấp độ lộ trình"
      className="absolute left-0 top-full pt-3 w-[min(92vw,620px)] lg:w-[620px] z-[60] whitespace-normal"
    >
      <div className="bg-white text-slate-900 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#0052FF]" aria-hidden="true" />
            <span>Lộ trình Phỏng vấn CNTT theo 4 Cấp độ</span>
          </span>
          <span className="text-xs font-bold text-[#0052FF] whitespace-nowrap">
            235 câu hỏi chọn lọc
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">
          {LEVELS.map((lvl) => (
            <a
              key={lvl.id}
              href="/#lo-trinh"
              onClick={(e) => onSelectSection(e, 'lo-trinh')}
              className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-50/70 hover:bg-blue-50/70 border border-slate-200/80 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap',
                    lvl.badgeClass
                  )}
                >
                  {lvl.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0052FF] text-[11px] font-bold whitespace-nowrap">
                  {lvl.targetQuestionCount} câu
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-900 truncate">
                {SHORT_EXPERIENCE_BY_LEVEL[lvl.id] || lvl.experience}
              </p>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {lvl.focus}
              </p>
            </a>
          ))}
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 text-xs">
          <span className="text-slate-600 font-medium">
            Chưa rõ cấp độ của bạn?
          </span>
          <Link
            to="/quick-test"
            onClick={onClose}
            className="font-bold text-[#0052FF] hover:underline whitespace-nowrap"
          >
            Làm test 5 phút →
          </Link>
        </div>
      </div>
    </div>
  );
}
