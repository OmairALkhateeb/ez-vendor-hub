import type { ReactNode } from "react";
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
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: ReactNode;
  tone?: "primary" | "success" | "warning" | "info";
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/10 text-info",
  };
  return (
    <div className="ez-card ez-shadow p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="ez-num mt-2 text-2xl font-bold tracking-tight">{value}</p>
          {delta && <p className="ez-num mt-1 text-xs font-medium text-success">{delta}</p>}
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl", toneMap[tone])}>{icon}</div>
      </div>
    </div>
  );
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize",
        map[status] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? status}
    </span>
  );
}
