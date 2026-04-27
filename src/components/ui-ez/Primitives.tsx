import type { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  deltaDirection,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  /** auto = infer from delta string starting with + or - */
  deltaDirection?: "up" | "down" | "neutral" | "auto";
  icon: ReactNode;
  tone?: "primary" | "success" | "warning" | "info";
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/10 text-info",
  };

  const dir =
    deltaDirection && deltaDirection !== "auto"
      ? deltaDirection
      : delta?.trim().startsWith("-")
      ? "down"
      : delta?.trim().startsWith("+")
      ? "up"
      : "neutral";

  const deltaClass =
    dir === "up"
      ? "text-success bg-success/10"
      : dir === "down"
      ? "text-destructive bg-destructive/10"
      : "text-muted-foreground bg-muted";

  return (
    <div className="ez-card ez-shadow group p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="ez-num mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {delta && (
            <span
              className={cn(
                "ez-num mt-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                deltaClass
              )}
            >
              {dir === "up" && <TrendingUp className="h-3 w-3" />}
              {dir === "down" && <TrendingDown className="h-3 w-3" />}
              {delta}
            </span>
          )}
        </div>
        <div
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105",
            toneMap[tone]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatusPill({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const map: Record<string, string> = {
    new: "bg-info/10 text-info border-info/30",
    accepted: "bg-primary/10 text-primary border-primary/25",
    preparing: "bg-warning/15 text-warning-foreground border-warning/30",
    ready: "bg-success/10 text-success border-success/25",
    pickedup: "bg-info/10 text-info border-info/25",
    delivering: "bg-info/10 text-info border-info/25",
    completed: "bg-success/10 text-success border-success/25",
    cancelled: "bg-destructive/10 text-destructive border-destructive/25",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize whitespace-nowrap",
        map[status] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? status}
    </span>
  );
}

/** Reusable section card with consistent header + body padding */
export function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div className={cn("ez-card ez-shadow", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-border/70 px-5 py-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </div>
  );
}
