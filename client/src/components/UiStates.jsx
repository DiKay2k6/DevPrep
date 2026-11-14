import { AlertTriangle, Inbox, RefreshCw } from 'lucide-react';

export function LoadingSkeleton({ rows = 3, label = 'Đang tải dữ liệu...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-2xs"
    >
      <span className="visually-hidden">{label}</span>
      <div className="h-5 w-1/3 rounded-lg bg-slate-200/80 animate-pulse" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2.5"
          >
            <div className="h-4 w-2/3 rounded bg-slate-200/80 animate-pulse" />
            <div className="h-3 w-full rounded bg-slate-200/60 animate-pulse" />
            <div className="h-3 w-4/5 rounded bg-slate-200/50 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  title = 'Chưa có dữ liệu phù hợp',
  description = 'Hãy thử thay đổi bộ lọc cấp độ, kỹ năng hoặc từ khóa tìm kiếm.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center space-y-3 shadow-2xs">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
        <Inbox className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="pt-1">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{actionLabel}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Không thể tải dữ liệu',
  message = 'Đã xảy ra sự cố tạm thời khi truy xuất dữ liệu. Vui lòng thử lại.',
  onRetry,
}) {
  return (
    <div
      role="alert"
      className="bg-white border border-red-200 rounded-2xl p-6 text-center space-y-3 shadow-2xs"
    >
      <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-5 h-5" aria-hidden="true" />
      </div>
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Thử tải lại</span>
        </button>
      )}
    </div>
  );
}
