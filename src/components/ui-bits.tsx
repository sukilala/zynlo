import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export function cnJoin(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "strong" | "soft" | "outline";
}) {
  const tones = {
    default: "bg-purple-100 text-purple-700",
    strong: "bg-primary text-white",
    soft: "bg-purple-50 text-purple-600",
    outline: "bg-surface text-purple-700 border border-border",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-light text-xs font-bold text-white shadow-[0_2px_8px_rgba(167,67,255,0.35)]">
      {initials || "?"}
    </span>
  );
}

export function Btn({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
}) {
  const variants = {
    primary:
      "bg-primary text-white shadow-[0_4px_15px_rgba(167,67,255,0.35)] hover:bg-primary-dark",
    secondary:
      "bg-surface border border-border text-fg hover:border-primary hover:text-primary",
    ghost: "bg-transparent text-muted hover:bg-purple-50 hover:text-primary",
    danger:
      "bg-surface border border-purple-300 text-purple-700 hover:bg-purple-50",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    icon: "h-8 w-8 p-0",
  };
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_2px_16px_rgba(0,0,0,0.28)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
      <h3 className="text-base font-bold text-fg">{title}</h3>
      {action}
    </div>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-[10px] border border-border bg-bg px-3.5 py-2.5 text-base text-fg md:text-sm outline-none transition focus:border-primary focus:shadow-[0_0_0_3px_rgba(167,67,255,0.25)]";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(8,4,16,0.72)] p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto rounded-[20px] bg-surface shadow-[0_25px_80px_rgba(0,0,0,0.55)]",
          wide ? "max-w-2xl" : "max-w-lg",
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 pt-6">
          <h2 className="text-lg font-bold text-fg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[10px] text-muted hover:bg-bg hover:text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="px-6 py-16 text-center text-muted">
      <div className="mb-3 flex justify-center opacity-40">{icon}</div>
      <h3 className="text-base font-bold text-fg">{title}</h3>
      {description && <p className="mt-1 text-sm">{description}</p>}
    </div>
  );
}

export function Stars({ rating }: { rating: number | null | undefined }) {
  if (rating == null || Number(rating) <= 0) {
    return <span className="text-muted">-</span>;
  }
  const n = Number(rating);
  const label = n % 1 ? n.toFixed(1) : String(n);
  return (
    <span className="font-semibold text-primary" aria-label={`${label} of 10`}>
      {label}/10
    </span>
  );
}

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: Array<{ id: string; message: string; type: string }>;
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[1001] flex max-w-[calc(100vw-2rem)] flex-col gap-2 sm:top-5 sm:bottom-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto animate-slide-in flex min-w-[260px] max-w-sm items-center gap-2 rounded-xl border border-border border-l-4 border-l-primary bg-surface px-4 py-3 text-sm font-medium shadow-lg"
          onClick={() => onDismiss(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
