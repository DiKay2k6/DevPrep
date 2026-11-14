import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Layers,
  Play,
  RotateCcw,
  ShieldAlert,
  Timer,
} from 'lucide-react';
import {
  clearActiveExamSessionSync,
  getActiveExamSessionSync,
  getMockTemplates,
} from '../../api/mockTestApi.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { LoadingSkeleton } from '../../components/UiStates.jsx';
import { LEVELS } from '../../data/tracks.mock.js';
import { cn } from '../../utils/cn.js';

export default function MockTestSetupPage() {
  const navigate = useNavigate();
  const { notify } = useToast();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [activeSession, setActiveSession] = useState(() =>
    getActiveExamSessionSync()
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getMockTemplates()
      .then((list) => {
        if (!mounted) return;
        setTemplates(list);
        if (list[0]) {
          setSelectedTemplateId(
            activeSession?.templateId || list[0].id
          );
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [activeSession?.templateId]);

  const selectedTemplate =
    templates.find((t) => t.id === selectedTemplateId) || templates[0];

  const handleStartExam = () => {
    if (!selectedTemplate) return;
    if (
      activeSession &&
      activeSession.templateId !== selectedTemplate.id
    ) {
      clearActiveExamSessionSync();
    }
    navigate(
      `/mock-test/room?templateId=${encodeURIComponent(selectedTemplate.id)}`
    );
  };

  const handleDiscardActiveSession = () => {
    clearActiveExamSessionSync();
    setActiveSession(null);
    notify({
      title: 'Đã xóa phiên thi thử đang dở',
      message: 'Bạn có thể bắt đầu một ca thi mới từ đầu.',
      type: 'info',
    });
  };

  if (loading || !selectedTemplate) {
    return <LoadingSkeleton rows={3} label="Đang tải cấu hình phòng thi thử..." />;
  }

  const formatRemaining = (secs = 0) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6">
      <header className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold">
            <Timer className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Mô phỏng áp lực phỏng vấn thực tế</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Phòng Thi Thử Tổng Hợp (Mock Test Simulator)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Tự động lưu trạng thái làm bài mỗi giây và tự động thu bài khi đồng hồ đếm ngược chạm mốc 00:00.
          </p>
        </div>

        <Link
          to="/mock-test/result"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold shrink-0 transition-colors"
        >
          <span>Xem báo cáo ca thi gần nhất</span>
        </Link>
      </header>

      {/* Banner khôi phục phiên thi đang làm dở trong localStorage */}
      {activeSession && (
        <div
          role="status"
          className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Phát hiện ca thi đang làm dở trong bộ nhớ trình duyệt
            </p>
            <p className="text-sm font-bold text-slate-900">
              {activeSession.templateTitle} • Còn lại:{' '}
              <span className="font-mono text-amber-800">
                {formatRemaining(activeSession.secondsLeft)}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              to={`/mock-test/room?templateId=${encodeURIComponent(activeSession.templateId)}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Tiếp tục làm bài</span>
            </Link>
            <button
              type="button"
              onClick={handleDiscardActiveSession}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Hủy ca thi cũ</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            1. Chọn Bộ Đề Thi Thử Chuẩn Đầu Ra
          </h2>

          <div className="space-y-3">
            {templates.map((tpl) => {
              const isSelected = tpl.id === selectedTemplateId;
              const badgeClass =
                LEVELS.find((l) => l.id === tpl.level)?.badgeClass ||
                'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={cn(
                    'p-5 rounded-2xl border-2 cursor-pointer transition-all bg-white space-y-3',
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-600/15 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={cn(
                          'px-2.5 py-0.5 rounded-full font-semibold border',
                          badgeClass
                        )}
                      >
                        {tpl.level}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                        {tpl.track}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                      <span className="inline-flex items-center gap-1">
                        <Clock
                          className="w-3.5 h-3.5 text-blue-600"
                          aria-hidden="true"
                        />
                        <span>{tpl.durationMinutes} phút</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Layers
                          className="w-3.5 h-3.5 text-slate-500"
                          aria-hidden="true"
                        />
                        <span>{tpl.totalQuestions} câu hỏi</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {tpl.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Cấu trúc đề: {tpl.structureSummary}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2
                        className="w-5 h-5 text-blue-600 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="space-y-1 pb-4 border-b border-slate-200">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Tóm tắt ca thi đã chọn
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              {selectedTemplate.title}
            </h2>
          </div>

          <dl className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Cấp độ đánh giá:</dt>
              <dd className="font-bold text-slate-900">
                {selectedTemplate.level}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Thời gian làm bài:</dt>
              <dd className="font-bold text-slate-900">
                {selectedTemplate.durationMinutes} phút (Đếm ngược tự động)
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Số lượng câu hỏi:</dt>
              <dd className="font-bold text-slate-900">
                {selectedTemplate.totalQuestions} câu đa định dạng
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Điểm chuẩn đạt (Passing):</dt>
              <dd className="font-bold text-emerald-700">
                &ge; {selectedTemplate.passingScore}%
              </dd>
            </div>
          </dl>

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5">
            <div className="font-bold inline-flex items-center gap-1.5">
              <ShieldAlert
                className="w-4 h-4 text-amber-600 shrink-0"
                aria-hidden="true"
              />
              <span>Quy chế Phòng Thi Thử</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-700">
              <li>
                Trạng thái đáp án, câu gắn cờ và số giây còn lại được lưu tự động khi tải lại trang (F5).
              </li>
              <li>
                Khi đồng hồ về 00:00, hệ thống tự động thu bài và cập nhật trực tiếp biểu đồ năng lực.
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={handleStartExam}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-colors"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>Bắt đầu làm bài thi ngay</span>
          </button>
        </aside>
      </div>
    </div>
  );
}
