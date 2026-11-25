import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Info, AlertCircle, X } from 'lucide-react';

export type ToastVariant = 'success' | 'info' | 'error';

export interface ToastInput {
  title: string;
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

export interface ToastItem extends Required<Pick<ToastInput, 'title' | 'message' | 'variant' | 'durationMs'>> {
  id: string;
}

const DEFAULT_DURATION_MS = 5000;

/**
 * Reusable toast notification state hook.
 * Can be mounted at the app root or inside any workflow to enqueue, stack,
 * auto-dismiss, and manually dismiss luxury editorial toast notifications.
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput) => {
    counterRef.current += 1;
    const id = `toast-${Date.now()}-${counterRef.current}`;
    const item: ToastItem = {
      id,
      title: input.title,
      message: input.message,
      variant: input.variant ?? 'success',
      durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
    };
    setToasts((prev) => [...prev.slice(-2), item]);
    return id;
  }, []);

  return { toasts, showToast, dismissToast };
}

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(toast.durationMs);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (paused) return;
    startedAtRef.current = Date.now();
    const timer = window.setTimeout(() => {
      onDismiss(toast.id);
    }, remainingRef.current);

    return () => {
      window.clearTimeout(timer);
      const elapsed = Date.now() - startedAtRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    };
  }, [paused, toast.id, onDismiss]);

  const icon =
    toast.variant === 'error' ? (
      <AlertCircle className="h-4 w-4 text-[#F3C6B8]" aria-hidden="true" />
    ) : toast.variant === 'info' ? (
      <Info className="h-4 w-4 text-[#F9F6F1]" aria-hidden="true" />
    ) : (
      <Check className="h-4 w-4 text-[#F9F6F1]" aria-hidden="true" />
    );

  const eyebrowLabel =
    toast.variant === 'error'
      ? 'Notice'
      : toast.variant === 'info'
        ? 'Concierge'
        : 'Confirmed';

  return (
    <div
      role={toast.variant === 'error' ? 'alert' : 'status'}
      data-testid="toast-notification"
      data-variant={toast.variant}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="pointer-events-auto relative w-full max-w-[380px] overflow-hidden border border-[#F9F6F1]/20 bg-[#251C14]/95 text-[#F9F6F1] shadow-[0_20px_50px_rgba(7,6,5,0.45)] backdrop-blur-md animate-toast-in"
    >
      <div className="flex items-start gap-3.5 px-5 py-4">
        <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#F9F6F1]/25 bg-[#7A6047]/45">
          {icon}
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#D8C7B4]">
            {eyebrowLabel}
          </p>
          <p className="font-serif text-base font-normal leading-snug text-white">
            {toast.title}
          </p>
          <p className="text-xs font-light leading-relaxed text-white/80">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="inline-flex h-7 w-7 shrink-0 items-center justify-center text-white/60 transition-colors hover:text-white cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F9F6F1]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Hairline auto-dismiss indicator */}
      <div className="h-[2px] w-full bg-white/10">
        <div
          style={{
            animationDuration: `${toast.durationMs}ms`,
            animationPlayState: paused ? 'paused' : 'running',
          }}
          className="h-full w-full bg-[#D8C7B4] animate-toast-progress"
        />
      </div>
    </div>
  );
}

interface ToastViewportProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

/**
 * Fixed viewport container rendering active toast notifications in the bottom-right corner.
 */
export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="pointer-events-none fixed right-4 bottom-4 sm:right-6 sm:bottom-6 z-[110] flex w-[calc(100vw-2rem)] max-w-[380px] flex-col gap-3"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
