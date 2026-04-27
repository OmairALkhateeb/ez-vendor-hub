import type { ReactNode } from "react";
import {
  Inbox,
  UtensilsCrossed,
  Loader2,
  AlertTriangle,
  WifiOff,
  Search,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------- EmptyState -------------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "default",
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "default" | "primary" | "warning" | "destructive";
  className?: string;
}) {
  const toneMap: Record<string, string> = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning/15 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div
      className={cn(
        "ez-card flex flex-col items-center justify-center px-6 py-12 text-center",
        className
      )}
    >
      <div
        className={cn(
          "mb-4 grid h-16 w-16 place-items-center rounded-2xl",
          toneMap[tone]
        )}
      >
        {icon ?? <Inbox className="h-7 w-7" />}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex flex-wrap items-center justify-center gap-2">{action}</div>}
    </div>
  );
}

/* -------------------- Specific empties -------------------- */

export function EmptyOrders({ title, description, actionLabel, onAction }: {
  title: string; description: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <EmptyState
      icon={<Inbox className="h-7 w-7" />}
      tone="primary"
      title={title}
      description={description}
      action={
        actionLabel ? (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" /> {actionLabel}
          </button>
        ) : undefined
      }
    />
  );
}

export function EmptyMenu({ title, description, actionLabel, onAction }: {
  title: string; description: string; actionLabel?: string; onAction?: () => void;
}) {
  return (
    <EmptyState
      icon={<UtensilsCrossed className="h-7 w-7" />}
      tone="primary"
      title={title}
      description={description}
      action={
        actionLabel ? (
          <button
            onClick={onAction}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            + {actionLabel}
          </button>
        ) : undefined
      }
    />
  );
}

export function EmptySearch({ title, description }: { title: string; description: string }) {
  return (
    <EmptyState
      icon={<Search className="h-7 w-7" />}
      title={title}
      description={description}
    />
  );
}

/* -------------------- Loading -------------------- */

export function LoadingState({ label }: { label?: string }) {
  return (
    <div className="ez-card flex flex-col items-center justify-center px-6 py-12 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-primary" />
      {label && <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>}
    </div>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="ez-card divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ez-card space-y-3 p-5">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-9 w-9 animate-pulse rounded-xl bg-muted" />
          </div>
          <div className="h-7 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-muted/70" />
        </div>
      ))}
    </div>
  );
}

/* -------------------- Error / Offline -------------------- */

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
}: {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-7 w-7" />}
      tone="destructive"
      title={title}
      description={description}
      action={
        onRetry ? (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" /> {retryLabel}
          </button>
        ) : undefined
      }
    />
  );
}

export function OfflineState({
  title,
  description,
  retryLabel,
  onRetry,
}: {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<WifiOff className="h-7 w-7" />}
      tone="warning"
      title={title}
      description={description}
      action={
        onRetry ? (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            <RefreshCw className="h-4 w-4" /> {retryLabel}
          </button>
        ) : undefined
      }
    />
  );
}

/* -------------------- Inline offline banner -------------------- */

export function OfflineBanner({ label }: { label: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs font-medium text-warning-foreground">
      <WifiOff className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}
