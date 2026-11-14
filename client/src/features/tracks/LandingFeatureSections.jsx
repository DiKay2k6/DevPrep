import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  Lock,
  RefreshCw,
  Terminal,
  Timer,
} from 'lucide-react';
import { ARTICLES_MOCK } from '../../data/articles.mock.js';
import { cn } from '../../utils/cn.js';

const PRACTICE_PREVIEWS = [
  {
    id: 'mcq',
    label: '1. Trắc nghiệm chuyên sâu',
    icon: Layers,
    level: 'Fresher • Frontend',
    title: 'Thứ tự ưu tiên giữa Microtask Queue và Macrotask Queue',
    prompt:
      'Sau khi Call Stack trống, Event Loop sẽ xử lý hàng đợi nào trước tiên?',
    snippet: `console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve().then(() => console.log('C'));
console.log('D');`,
    highlight: 'Đáp án đúng: Thực thi toàn bộ Microtask Queue (Promise.then) trước khi lấy tác vụ từ Macrotask Queue (A → D → C → B).',
  },
  {
    id: 'output',
    label: '2. Dự đoán kết quả thực thi',
    icon: Terminal,
    level: 'Intern • JavaScript',
    title: 'Phân tích luồng chạy bất đồng bộ không dùng trình biên dịch',
    prompt:
      'Điền chính xác chuỗi kết quả in ra màn hình console khi đoạn chương trình kết thúc:',
    snippet: `const out = ['1'];
setTimeout(() => console.log(out.join(' ')), 0);
Promise.resolve().then(() => out.push('3')).then(() => out.push('4'));
out.push('5');`,
    highlight: 'Kết quả chuẩn xác: "1 5 3 4" — Rèn kỹ năng đọc hiểu luồng thực thi thực tế khi phỏng vấn.',
  },
  {
    id: 'coding',
    label: '3. Viết code trên trình duyệt',
    icon: Code2,
    level: 'Intern / Junior • Algorithms',
    title: 'Tìm cặp chỉ số có tổng bằng Target với bảng băm O(n)',
    prompt:
      'Soạn thảo thuật toán trên 4 ngôn ngữ (JS, Python, Java, C++) và đối chiếu tự động với bộ ca kiểm thử mẫu & ẩn.',
    snippet: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
}`,
    highlight: 'Vượt qua 4/4 ca kiểm thử (bao gồm ca kiểm thử ẩn chống gán cứng kết quả) trong 38 ms.',
  },
];

export default function LandingFeatureSections() {
  const [selectedArticleIdx, setSelectedArticleIdx] = useState(0);
  const [selectedFormatId, setSelectedFormatId] = useState('mcq');

  const previewArticles = ARTICLES_MOCK.slice(0, 3);
  const activeArticle = previewArticles[selectedArticleIdx] || previewArticles[0];
  const activeFormat =
    PRACTICE_PREVIEWS.find((item) => item.id === selectedFormatId) ||
    PRACTICE_PREVIEWS[0];

  return (
    <>
      {/* SECTION 2: KHO TÀI LIỆU (#kho-tai-lieu) */}
      <section
        id="kho-tai-lieu"
        aria-labelledby="landing-studyhub-heading"
        className="scroll-mt-20 bg-white border-y border-slate-200/80 py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0052FF]">
                2. Kho tài liệu kỹ thuật (Study Hub)
              </span>
              <h2
                id="landing-studyhub-heading"
                className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
              >
                Tài liệu cô đọng, liên kết trực tiếp với câu hỏi thực hành
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Mỗi bài viết tập trung giải quyết các câu hỏi phỏng vấn thực tế về kiến trúc, cơ sở dữ liệu và bảo mật thay vì lý thuyết dàn trải.
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Danh sách chọn bài đọc xem trước */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-3">
              {previewArticles.map((art, idx) => {
                const isSelected = idx === selectedArticleIdx;
                return (
                  <button
                    key={art._id}
                    type="button"
                    onClick={() => setSelectedArticleIdx(idx)}
                    className={cn(
                      'w-full text-left p-4 sm:p-5 rounded-2xl border transition-all space-y-2',
                      isSelected
                        ? 'bg-blue-50/70 border-[#0052FF] shadow-xs'
                        : 'bg-[#F4F7FA] border-slate-200/80 hover:bg-slate-100/80'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#0052FF]">
                        {art.category} • Cấp độ {art.level}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        {art.readingTimeMinutes} phút đọc
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {art.summary}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Khung xem trước nội dung bài đọc */}
            <div className="lg:col-span-7 bg-[#F4F7FA] border border-slate-200/80 rounded-2xl p-6 sm:p-7 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <BookOpen className="w-4 h-4 text-[#0052FF]" aria-hidden="true" />
                    <span>Bản xem trước bài đọc chuyên đề</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeArticle.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  {activeArticle.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeArticle.summary}
                </p>

                <div className="p-4 rounded-xl bg-white border border-slate-200/80 space-y-2">
                  <p className="text-xs font-bold text-slate-800">
                    Điểm nổi bật trong bài đọc này:
                  </p>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    <li>Phân tích bản chất kỹ thuật kèm sơ đồ luồng thực thi và ví dụ code minh họa.</li>
                    <li>Tổng hợp các lỗi sai phổ biến ứng viên thường mắc phải khi trả lời phỏng vấn.</li>
                    <li>
                      Tích hợp sẵn {activeArticle.questionIds.length} bài tập thực hành cuối bài để kiểm tra mức độ hiểu sâu.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-medium text-slate-500">
                  Đăng nhập vào HUB để đọc toàn văn và lưu đánh dấu bài học.
                </span>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-blue-50 text-[#0052FF] border border-blue-200 text-xs font-bold transition-colors shrink-0"
                >
                  <span>Đăng nhập để mở khóa đầy đủ</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: LUYỆN TẬP THỰC CHIẾN (#luyen-tap) */}
      <section
        id="luyen-tap"
        aria-labelledby="landing-formats-heading"
        className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052FF]">
              3. Không gian luyện tập đa định dạng
            </span>
            <h2
              id="landing-formats-heading"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
            >
              3 hình thức rèn luyện sát với vòng phỏng vấn kỹ thuật
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Chọn từng định dạng bên dưới để xem trước cách DevPrep kiểm tra tư duy đọc hiểu và viết code.
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

        {/* Thanh chuyển đổi xem trước 3 hình thức */}
        <div className="flex flex-wrap gap-2">
          {PRACTICE_PREVIEWS.map((item) => {
            const Icon = item.icon;
            const active = item.id === selectedFormatId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedFormatId(item.id)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all',
                  active
                    ? 'bg-[#0052FF] text-white border-[#0052FF] shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                )}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-[#0052FF] text-xs font-bold">
              {activeFormat.level}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">
              {activeFormat.title}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {activeFormat.prompt}
            </p>
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs font-semibold text-emerald-900 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{activeFormat.highlight}</span>
            </div>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/quick-test"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0052FF] text-xs font-bold transition-colors"
              >
                <span>Làm thử 5 câu đầu vào miễn phí</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                <span>Đăng nhập để mở khóa đầy đủ</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-slate-900 text-slate-100 p-5 font-mono text-xs leading-relaxed space-y-2 shadow-md">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                <span>preview-workspace.js</span>
                <span className="text-sky-300">Chế độ xem trước công khai</span>
              </div>
              <pre className="overflow-x-auto text-sky-200">
                <code>{activeFormat.snippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THI THỬ BẤM GIỜ (#thi-thu) */}
      <section
        id="thi-thu"
        aria-labelledby="landing-mocktest-heading"
        className="scroll-mt-20 bg-white border-y border-slate-200/80 py-16 sm:py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052FF]">
              4. Phòng thi thử mô phỏng (Mock Test)
            </span>
            <h2
              id="landing-mocktest-heading"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
            >
              Rèn tâm lý phòng thi với đồng hồ đếm ngược và ma trận đề chuẩn
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Tự động sinh đề thi tổ hợp theo vị trí ứng tuyển và cấp độ mong muốn. Hệ thống tự động thu bài khi hết giờ và phân tích chi tiết từng câu đúng/sai.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/quick-test"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#0052FF] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <Timer className="w-4 h-4" aria-hidden="true" />
                <span>Thi thử 5 phút không cần đăng nhập</span>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-[#F4F7FA] hover:bg-slate-200/70 text-slate-800 text-xs sm:text-sm font-bold transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-[#0052FF]" aria-hidden="true" />
                <span>Đăng nhập để mở khóa đầy đủ</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#F4F7FA] border border-slate-200/80 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <p className="text-xs font-bold text-[#0052FF]">Đề mô phỏng Full-stack Junior</p>
                  <p className="text-sm font-extrabold text-slate-900">Thời lượng: 30 phút • 12 câu hỏi</p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-bold">
                  24:18 còn lại
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                  <p className="text-[11px] text-slate-500">Trắc nghiệm</p>
                  <p className="text-base font-extrabold text-slate-900">7 câu</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                  <p className="text-[11px] text-slate-500">Dự đoán Output</p>
                  <p className="text-base font-extrabold text-slate-900">3 câu</p>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
                  <p className="text-[11px] text-slate-500">Viết thuật toán</p>
                  <p className="text-base font-extrabold text-slate-900">2 bài</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: PHÂN TÍCH NĂNG LỰC (#phan-tich) */}
      <section
        id="phan-tich"
        aria-labelledby="landing-analytics-heading"
        className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0052FF]">
              5. Phân tích năng lực &amp; Ôn tập ngắt quãng
            </span>
            <h2
              id="landing-analytics-heading"
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight"
            >
              Phát hiện lỗ hổng kiến thức và tự động nhắc lịch ôn tập
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Mọi lượt nộp bài đều được tổng hợp theo từng chủ đề kỹ thuật. Khi tỷ lệ chính xác ở một mảng xuống dưới ngưỡng an toàn, hệ thống tự động gợi ý bài đọc cần ôn lại và đưa câu làm sai vào hàng đợi lặp lại ngắt quãng (1 – 3 – 7 – 14 ngày).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-[#F4F7FA] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <BarChart3 className="w-4 h-4 text-[#0052FF]" aria-hidden="true" />
                  <span>Thống kê tỷ lệ đúng theo chủ đề</span>
                </div>
                <p className="text-xs text-slate-600">
                  Nhận diện ngay các mảng kiến thức còn yếu trước ngày phỏng vấn chính thức.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-[#F4F7FA] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <RefreshCw className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Chu kỳ ôn tập 1 – 3 – 7 – 14 ngày</span>
                </div>
                <p className="text-xs text-slate-600">
                  Chuyển hóa kiến thức ngắn hạn thành phản xạ giải quyết vấn đề bền vững.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0052FF] hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
              >
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span>Đăng nhập để mở khóa đầy đủ</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F4F7FA] border border-slate-200/80 rounded-2xl p-5 space-y-3.5">
            <p className="text-xs font-bold text-slate-800">
              Minh họa thống kê độ vững kiến thức theo chủ đề
            </p>
            {[
              { tag: 'JavaScript & Event Loop', score: 86, status: 'Đã vững' },
              { tag: 'React Hooks & Hiệu năng', score: 74, status: 'Khá tốt' },
              { tag: 'Bảo mật JWT & Phân quyền', score: 52, status: 'Cần ôn lại' },
              { tag: 'Tối ưu Index MongoDB', score: 45, status: 'Lỗ hổng ưu tiên' },
            ].map((item) => (
              <div key={item.tag} className="bg-white p-3 rounded-xl border border-slate-200/70 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{item.tag}</span>
                  <span className={item.score < 60 ? 'font-bold text-amber-700' : 'font-bold text-emerald-700'}>
                    {item.score}% ({item.status})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={item.score < 60 ? 'h-full bg-amber-500 rounded-full' : 'h-full bg-[#0052FF] rounded-full'}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
