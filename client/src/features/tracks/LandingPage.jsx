import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Play,
} from 'lucide-react';
import { LEVELS } from '../../data/tracks.mock.js';
import { cn } from '../../utils/cn.js';
import LandingFeatureSections from './LandingFeatureSections.jsx';

export default function LandingPage() {
  return (
    <div>
      {/* HERO SECTION — Đồng bộ với Sticky Glassmorphism Header (#0052FF) */}
      <section className="landing-hero-surface text-white pt-10 pb-20 sm:pt-14 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Cột trái: Thông điệp chính & 1 nút CTA nổi bật */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <p className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 border border-white/20 text-xs font-semibold tracking-wide">
              <span>Lộ trình ôn luyện phỏng vấn CNTT có cấu trúc</span>
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.12]">
              <span className="text-sky-200">Nền tảng Học</span> và Luyện phỏng vấn IT thông minh
            </h1>

            <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Hệ thống hóa kiến thức theo 4 chuyên ngành cốt lõi, kết hợp tài liệu kỹ thuật chọn lọc, thực hành viết code trực tiếp trên trình duyệt và tự động phát hiện lỗ hổng kiến thức cần bù đắp.
            </p>

            {/* 1 Nút CTA chính màu trắng bo tròn + 1 Link phụ nhẹ nhàng */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link
                to="/quick-test"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-white text-[#0052FF] hover:bg-blue-50 text-sm sm:text-base font-extrabold shadow-[0_0_32px_rgba(255,255,255,0.4)] transition-all"
              >
                <span>Bắt đầu luyện tập ngay</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <a
                href="#lo-trinh"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white/90 hover:text-white underline underline-offset-4 transition-colors"
              >
                <span>Xem thử lộ trình</span>
              </a>
            </div>

            {/* Chỉ số tóm tắt gọn gàng */}
            <dl className="pt-4 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 border-t border-white/15 text-left">
              <div>
                <dt className="text-xs text-blue-100">Lộ trình phân cấp</dt>
                <dd className="text-xl sm:text-2xl font-extrabold mt-0.5">4 cấp độ</dd>
              </div>
              <div>
                <dt className="text-xs text-blue-100">Định dạng thực hành</dt>
                <dd className="text-xl sm:text-2xl font-extrabold mt-0.5">3 hình thức</dd>
              </div>
              <div>
                <dt className="text-xs text-blue-100">Chuyên ngành IT</dt>
                <dd className="text-xl sm:text-2xl font-extrabold mt-0.5">4 hướng đi</dd>
              </div>
            </dl>
          </div>

          {/* Cột phải: Thẻ minh họa giao diện bài tập Code & Quiz thực tế */}
          <div className="lg:col-span-5">
            <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-blue-950/30 border border-white/40 space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-800">
                    Bài tập thực hành: Two Sum O(n)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052FF] text-[11px] font-bold">
                  Cấp độ Intern / Fresher
                </span>
              </div>

              {/* Khung code minh họa */}
              <div className="rounded-2xl bg-slate-900 text-slate-100 p-4 font-mono text-xs leading-relaxed space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                  <span>solution.js</span>
                  <span className="text-emerald-400">Hash Map • O(n)</span>
                </div>
                <pre className="overflow-x-auto text-sky-200">
                  <code>{`function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
}`}</code>
                </pre>
              </div>

              {/* Kết quả chạy kiểm thử mẫu */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>Accepted • Vượt qua 4/4 ca kiểm thử</span>
                </div>
                <span className="text-[11px] font-mono font-semibold text-emerald-700">
                  38 ms
                </span>
              </div>

              {/* Thanh liên kết nhanh vào làm thử Test đầu vào */}
              <div className="pt-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Đánh giá nhanh năng lực trong 5 phút
                </span>
                <Link
                  to="/quick-test"
                  className="inline-flex items-center gap-1 font-bold text-[#0052FF] hover:underline"
                >
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Làm test đầu vào</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: Lộ trình 4 cấp độ từ Intern đến Middle (#lo-trinh) */}
      <section
        id="lo-trinh"
        aria-labelledby="landing-levels-heading"
        className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052FF]">
              1. Lộ trình 4 cấp độ (Intern → Middle)
            </span>
            <h2
              id="landing-levels-heading"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
            >
              Ôn tập đúng trọng tâm theo từng bậc tuyển dụng CNTT
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Từ nền tảng cú pháp cho sinh viên thực tập đến kiến trúc hệ thống và tối ưu hóa truy vấn cho kỹ sư có kinh nghiệm.
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0052FF] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors shrink-0"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Đăng nhập để mở khóa đầy đủ</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {LEVELS.map((lvl, index) => (
            <article
              key={lvl.id}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-bold border',
                      lvl.badgeClass
                    )}
                  >
                    {lvl.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Chặng 0{index + 1}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {lvl.experience}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {lvl.focus}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">
                  {lvl.targetQuestionCount} câu hỏi chọn lọc
                </span>
                <Link
                  to="/login"
                  className="text-[#0052FF] hover:underline inline-flex items-center gap-1 font-bold"
                >
                  <span>Mở khóa</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CÁC SECTION GIỚI THIỆU TƯƠNG TÁC (#kho-tai-lieu, #luyen-tap, #thi-thu, #phan-tich) */}
      <LandingFeatureSections />
    </div>
  );
}
