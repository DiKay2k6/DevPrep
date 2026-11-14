import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../utils/cn.js';

const ToastContext = createContext({
  notify: () => {},
});

let lastLiveMessage = '';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [liveAnnouncement, setLiveAnnouncement] = useState('');
  const pausedIdsRef = useRef(new Set());

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
    pausedIdsRef.current.delete(id);
  }, []);

  const notify = useCallback(
    ({ title, message, type = 'success', duration = 3800 }) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const fullText = [title, message].filter(Boolean).join('. ');

      let nextAnnouncement = fullText;
      if (nextAnnouncement === lastLiveMessage) {
        nextAnnouncement += '\u00A0';
      }
      lastLiveMessage = nextAnnouncement;
      setLiveAnnouncement(nextAnnouncement);

      setToasts((prev) => [
        ...prev.slice(-3),
        { id, title, message, type, duration, createdAt: Date.now() },
      ]);
    },
    []
  );

  useEffect(() => {
    if (toasts.length === 0) return undefined;
    const interval = window.setInterval(() => {
      const now = Date.now();
      setToasts((prev) =>
        prev.filter((t) => {
          if (pausedIdsRef.current.has(t.id)) return true;
          return now - t.createdAt < t.duration;
        })
      );
    }, 400);
    return () => window.clearInterval(interval);
  }, [toasts.length]);

  return (
    <ToastContext.Provider value={{ notify, dismissToast }}>
      {children}

      {/* Vùng thông báo ẩn cho trình đọc màn hình (ARIA live region) */}
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {liveAnnouncement ? `Thông báo hệ thống: ${liveAnnouncement}` : ''}
      </div>

      {/* Khung chứa Toast Notification cố định góc dưới phải */}
      <div
        role="region"
        aria-label="Thông báo hệ thống"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((t) => {
          const Icon =
            t.type === 'error'
              ? AlertCircle
              : t.type === 'info'
                ? Info
                : CheckCircle2;

          return (
            <div
              key={t.id}
              onFocus={() => pausedIdsRef.current.add(t.id)}
              onBlur={() => pausedIdsRef.current.delete(t.id)}
              onMouseEnter={() => pausedIdsRef.current.add(t.id)}
              onMouseLeave={() => pausedIdsRef.current.delete(t.id)}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border bg-white shadow-lg transition-all',
                t.type === 'error'
                  ? 'border-red-200 text-slate-900'
                  : t.type === 'info'
                    ? 'border-blue-200 text-slate-900'
                    : 'border-emerald-200 text-slate-900'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 mt-0.5',
                  t.type === 'error'
                    ? 'text-red-600'
                    : t.type === 'info'
                      ? 'text-blue-600'
                      : 'text-emerald-600'
                )}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0 text-xs sm:text-sm space-y-0.5">
                {t.title && (
                  <p className="font-bold text-slate-900 leading-snug">
                    {t.title}
                  </p>
                )}
                {t.message && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="Đóng thông báo"
                className="min-w-[28px] min-h-[28px] inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
