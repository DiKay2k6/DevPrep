import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, FileCode2, XCircle } from 'lucide-react';
import { getQuestions, moderateQuestion } from '../../api/questionsApi.js';
import { useToast } from '../../components/ToastProvider.jsx';
import { EmptyState, LoadingSkeleton } from '../../components/UiStates.jsx';
import { cn } from '../../utils/cn.js';

const STATUS_TABS = [
  { id: 'pending', label: 'Chờ phê duyệt' },
  { id: 'approved', label: 'Đã xuất bản' },
  { id: 'rejected', label: 'Đã từ chối' },
];

const FORMAT_LABELS = {
  mcq: 'Trắc nghiệm',
  fill_blank: 'Dự đoán Output',
  coding: 'Viết code',
};

export default function AdminModerationPage() {
  const { notify } = useToast();
  const [questions, setQuestions] = useState([]);
  const [activeStatus, setActiveStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getQuestions({ status: 'All' })
      .then((list) => {
        if (mounted) setQuestions(list);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleModerate = async (id, newStatus) => {
    try {
      const res = await moderateQuestion(id, newStatus);
      setQuestions(res.questions);
      const statusLabel =
        newStatus === 'approved' ? 'Đã xuất bản' : 'Đã từ chối';
      notify({
        title: `Đã cập nhật trạng thái: ${statusLabel}`,
        message: `Câu hỏi "${res.question?.title}" đã được lưu vào bộ nhớ trình duyệt.`,
        type: newStatus === 'approved' ? 'success' : 'info',
      });
    } catch (err) {
      notify({
        title: 'Lỗi khi kiểm duyệt câu hỏi',
        message: err.message,
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <LoadingSkeleton
        rows={3}
        label="Đang tải danh sách câu hỏi đóng góp..."
      />
    );
  }

  const filteredList = questions.filter((q) => q.status === activeStatus);
  const countByStatus = (st) => questions.filter((q) => q.status === st).length;

  return (
    <div className="space-y-6">
      <header className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Kiểm duyệt Câu hỏi Đóng góp
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Rà soát nội dung đề bài, tính chính xác của đáp án và bộ ca kiểm thử trước khi xuất bản lên ngân hàng câu hỏi.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            Chờ duyệt: {countByStatus('pending')}
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Đã xuất bản: {countByStatus('approved')}
          </span>
        </div>
      </header>

      <div
        role="tablist"
        aria-label="Lọc câu hỏi theo trạng thái kiểm duyệt"
        className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 rounded-t-2xl"
      >
        {STATUS_TABS.map((tab) => {
          const selected = activeStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveStatus(tab.id)}
              className={cn(
                'relative py-3.5 px-4 text-xs sm:text-sm font-bold transition-colors',
                selected
                  ? 'text-blue-600 after:content-[""] after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {tab.label} ({countByStatus(tab.id)})
            </button>
          );
        })}
      </div>

      {filteredList.length === 0 ? (
        <EmptyState
          title="Không có câu hỏi nào trong mục này"
          description="Tất cả câu hỏi đóng góp ở trạng thái này đã được xử lý."
        />
      ) : (
        <div className="space-y-4">
          {filteredList.map((q) => (
            <article
              key={q._id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4"
            >
              <header className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                      {FORMAT_LABELS[q.type] || 'Thực hành'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                      {q.level} • {q.category}
                    </span>
                    {q.submittedBy && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        <span>
                          Đóng góp bởi: {q.submittedBy} ({q.submittedAt})
                        </span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {q.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {q.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => handleModerate(q._id, 'approved')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors"
                    >
                      <CheckCircle2
                        className="w-3.5 h-3.5"
                        aria-hidden="true"
                      />
                      <span>Phê duyệt</span>
                    </button>
                  )}
                  {q.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => handleModerate(q._id, 'rejected')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Từ chối</span>
                    </button>
                  )}
                </div>
              </header>

              <p className="text-sm text-slate-700 leading-relaxed">
                {q.prompt}
              </p>

              {q.codeSnippet && (
                <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto">
                  <code>{q.codeSnippet}</code>
                </pre>
              )}

              <div className="p-3.5 rounded-xl bg-[#F4F7FA] border border-slate-200/80 text-xs space-y-1.5">
                <div className="font-semibold text-slate-800 inline-flex items-center gap-1.5">
                  <FileCode2
                    className="w-3.5 h-3.5 text-blue-600"
                    aria-hidden="true"
                  />
                  <span>
                    Cấu hình đáp án chuẩn (Chỉ hiển thị cho Quản trị viên):
                  </span>
                </div>

                {q.type === 'mcq' && (
                  <p className="text-slate-600">
                    Phương án đúng:{' '}
                    <code className="font-mono font-bold text-emerald-700">
                      {q.payload.correctOptionIds.join(', ')}
                    </code>
                  </p>
                )}

                {q.type === 'fill_blank' && (
                  <p className="text-slate-600">
                    Các đáp án được chấp nhận:{' '}
                    <code className="font-mono font-bold text-emerald-700">
                      {q.payload.acceptedAnswers.join(' | ')}
                    </code>
                  </p>
                )}

                {q.type === 'coding' && (
                  <p className="text-slate-600">
                    Hàm kiểm thử:{' '}
                    <code className="font-mono">
                      {q.payload.functionName}
                    </code>{' '}
                    • Tổng số ca kiểm thử:{' '}
                    <strong>{q.payload.testCases.length}</strong> (Bao gồm cả ca kiểm thử ẩn)
                  </p>
                )}

                <p className="text-slate-600">
                  <strong>Giải thích đi kèm:</strong> {q.explanation}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
