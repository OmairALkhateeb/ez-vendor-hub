import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check, X, MapPin, Phone, Search, RefreshCw, Printer, Clock,
  ChefHat, PackageCheck, Bike, CheckCircle2, XCircle, CircleDot,
  Receipt, User, AlertTriangle, Package,
} from "lucide-react";
import { useApp } from "@/i18n/AppProviders";
import { PageHeader, StatusPill } from "@/components/ui-ez/Primitives";
import { ORDERS, pickName, formatMoney, type Order, type OrderStatus } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "الطلبات — EZ Vendor" },
      { name: "description", content: "تابع وأدر جميع طلبات مطعمك في الوقت الفعلي" },
    ],
  }),
  component: OrdersPage,
});

const ACTIVE_STATUSES: OrderStatus[] = ["new", "accepted", "preparing", "ready", "pickedup", "delivering"];
const HISTORY_STATUSES: OrderStatus[] = ["completed", "cancelled"];

const STATUS_LABEL_KEY: Record<OrderStatus, string> = {
  new: "common.new",
  accepted: "orders.accepted",
  preparing: "common.preparing",
  ready: "common.ready",
  pickedup: "orders.pickedup",
  delivering: "common.delivering",
  completed: "common.completed",
  cancelled: "common.cancelled",
};

function OrdersPage() {
  const { t, locale, dir } = useApp();
  const [tab, setTab] = useState<"active" | "history">("active");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(ORDERS[0]?.id ?? "");
  const [orders, setOrders] = useState<Order[]>(ORDERS);

  // Live countdown for new orders
  const tickRef = useRef<number | null>(null);
  useEffect(() => {
    tickRef.current = window.setInterval(() => {
      setOrders((prev) =>
        prev.map((o) =>
          o.status === "new" && o.acceptDeadlineSec && o.acceptDeadlineSec > 0
            ? { ...o, acceptDeadlineSec: o.acceptDeadlineSec - 1 }
            : o
        )
      );
    }, 1000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, []);

  const visible = useMemo(() => {
    const pool = orders.filter((o) =>
      tab === "active" ? ACTIVE_STATUSES.includes(o.status) : HISTORY_STATUSES.includes(o.status)
    );
    const filtered = statusFilter === "all" ? pool : pool.filter((o) => o.status === statusFilter);
    const q = query.trim().toLowerCase();
    if (!q) return filtered;
    return filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        pickName(o.customer, locale).toLowerCase().includes(q) ||
        o.phone.includes(q)
    );
  }, [orders, tab, statusFilter, query, locale]);

  const selected = orders.find((o) => o.id === selectedId) ?? visible[0];

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: 0 };
    const pool = orders.filter((o) =>
      tab === "active" ? ACTIVE_STATUSES.includes(o.status) : HISTORY_STATUSES.includes(o.status)
    );
    c.all = pool.length;
    for (const s of [...ACTIVE_STATUSES, ...HISTORY_STATUSES]) {
      c[s] = pool.filter((o) => o.status === s).length;
    }
    return c;
  }, [orders, tab]);

  const tabs: { key: OrderStatus | "all"; labelKey: string }[] =
    tab === "active"
      ? [
          { key: "all", labelKey: "common.all" },
          { key: "new", labelKey: "common.new" },
          { key: "accepted", labelKey: "orders.accepted" },
          { key: "preparing", labelKey: "common.preparing" },
          { key: "ready", labelKey: "common.ready" },
          { key: "pickedup", labelKey: "orders.pickedup" },
          { key: "delivering", labelKey: "common.delivering" },
        ]
      : [
          { key: "all", labelKey: "common.all" },
          { key: "completed", labelKey: "common.completed" },
          { key: "cancelled", labelKey: "common.cancelled" },
        ];

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status, acceptDeadlineSec: undefined } : o)));
  };

  return (
    <div>
      <PageHeader
        title={t("orders.title")}
        subtitle={t("orders.subtitle")}
        actions={
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-accent">
            <RefreshCw className="h-3.5 w-3.5" /> {t("orders.refresh")}
          </button>
        }
      />

      {/* Active / History tabs */}
      <div className="mb-4 flex items-center gap-1 rounded-xl border border-border bg-card p-1 w-fit">
        {(["active", "history"] as const).map((key) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setStatusFilter("all");
            }}
            className={cn(
              "rounded-lg px-4 py-1.5 text-xs font-semibold transition",
              tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(key === "active" ? "orders.tabActive" : "orders.tabHistory")}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* LEFT: list */}
        <div className="ez-card ez-shadow flex flex-col overflow-hidden">
          {/* Search + filter chips */}
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className={cn("pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", dir === "rtl" ? "right-3" : "left-3")} />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("common.searchOrders")}
                className={cn(
                  "h-10 w-full rounded-lg border border-input bg-secondary/60 text-sm outline-none focus:border-ring focus:bg-background",
                  dir === "rtl" ? "pr-9 pl-3" : "pl-9 pr-3"
                )}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tabs.map((tb) => {
                const active = statusFilter === tb.key;
                const count = counts[tb.key] ?? 0;
                return (
                  <button
                    key={tb.key}
                    onClick={() => setStatusFilter(tb.key)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {t(tb.labelKey)}
                    <span className={cn("ez-num rounded-full px-1.5 text-[10px]", active ? "bg-primary-foreground/20" : "bg-muted")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order cards list */}
          <div className="max-h-[calc(100vh-340px)] divide-y divide-border overflow-y-auto">
            {visible.map((o) => (
              <OrderListCard
                key={o.id}
                order={o}
                selected={selected?.id === o.id}
                onClick={() => setSelectedId(o.id)}
                onAccept={() => updateStatus(o.id, "accepted")}
                onReject={() => updateStatus(o.id, "cancelled")}
              />
            ))}
            {visible.length === 0 && (
              <div className="grid place-items-center p-16 text-sm text-muted-foreground">
                <Package className="mb-3 h-10 w-10 opacity-30" />
                {t("orders.noOrders")}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: details */}
        <div className="ez-card ez-shadow overflow-hidden">
          {selected ? (
            <OrderDetails order={selected} onUpdate={(s) => updateStatus(selected.id, s)} />
          ) : (
            <div className="grid h-full place-items-center p-12 text-sm text-muted-foreground">
              <Receipt className="mb-3 h-10 w-10 opacity-30" />
              {t("orders.selectOrder")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Order list card ---------- */
function OrderListCard({
  order, selected, onClick, onAccept, onReject,
}: {
  order: Order;
  selected: boolean;
  onClick: () => void;
  onAccept: () => void;
  onReject: () => void;
}) {
  const { t, locale } = useApp();
  const isNew = order.status === "new";
  const urgent = isNew && (order.acceptDeadlineSec ?? 0) < 60;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group block w-full p-4 text-start transition",
        selected ? "bg-primary-soft/60" : "hover:bg-accent/40",
        isNew && "relative"
      )}
    >
      {isNew && (
        <span
          className={cn(
            "absolute inset-y-0 w-1",
            urgent ? "bg-destructive" : "bg-primary",
            "start-0"
          )}
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="ez-num text-sm font-bold text-primary">{order.id}</span>
            <StatusPill status={order.status} label={t(STATUS_LABEL_KEY[order.status])} />
            {urgent && (
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">
                <AlertTriangle className="h-3 w-3" /> {t("orders.urgent")}
              </span>
            )}
          </div>
          <p className="mt-1.5 truncate font-semibold">{pickName(order.customer, locale)}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {order.items.length} × {order.items.map((i) => pickName(i.name, locale)).join("، ")}
          </p>
        </div>
        <div className="text-end shrink-0">
          <p className="ez-num text-base font-bold">{formatMoney(order.total)}</p>
          <p className="ez-num text-[10px] text-muted-foreground">{t("common.currency")}</p>
          <p className="ez-num mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            {order.minutesAgo}m {t("orders.elapsed")}
          </p>
        </div>
      </div>

      {isNew && (
        <div className="mt-3 flex items-center gap-2">
          <CountdownBar seconds={order.acceptDeadlineSec ?? 0} total={180} />
          <div className="flex gap-1.5">
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onAccept(); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onAccept(); } }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-success px-2.5 py-1.5 text-xs font-bold text-success-foreground hover:opacity-90"
            >
              <Check className="h-3.5 w-3.5" /> {t("common.accept")}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onReject(); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onReject(); } }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/15"
            >
              <X className="h-3.5 w-3.5" /> {t("common.reject")}
            </span>
          </div>
        </div>
      )}
    </button>
  );
}

function CountdownBar({ seconds, total }: { seconds: number; total: number }) {
  const { t } = useApp();
  const pct = Math.max(0, Math.min(100, (seconds / total) * 100));
  const color = seconds < 30 ? "bg-destructive" : seconds < 60 ? "bg-warning" : "bg-primary";
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  return (
    <div className="flex flex-1 items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="ez-num min-w-[56px] text-end text-[11px] font-bold tabular-nums text-muted-foreground">
        {t("orders.acceptIn")} {mm}:{ss.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

/* ---------- Details panel ---------- */
function OrderDetails({ order, onUpdate }: { order: Order; onUpdate: (s: OrderStatus) => void }) {
  const { t, locale } = useApp();
  const subtotal = order.items.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-secondary/40 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="ez-num text-lg font-bold text-primary">{order.id}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {t("orders.placedAt")} {order.minutesAgo}m {t("orders.elapsed")}
            </p>
          </div>
          <StatusPill status={order.status} label={t(STATUS_LABEL_KEY[order.status])} />
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {/* Timeline */}
        <Section title={t("orders.timeline")}>
          <Timeline status={order.status} />
        </Section>

        {/* Customer */}
        <Section title={t("orders.customerInfo")}>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{pickName(order.customer, locale)}</span>
            </div>
            <div className="ez-num flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" /> {order.phone}
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{pickName(order.address, locale)}</span>
            </div>
          </div>
        </Section>

        {/* Items */}
        <Section title={t("orders.orderItems")}>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-start font-semibold">{t("common.all")}</th>
                  <th className="px-3 py-2 text-center font-semibold">{t("orders.qty")}</th>
                  <th className="px-3 py-2 text-end font-semibold">{t("orders.lineTotal")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {order.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{pickName(it.name, locale)}</p>
                      {it.notes && (
                        <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                          {pickName(it.notes, locale)}
                        </p>
                      )}
                      <p className="ez-num mt-0.5 text-[11px] text-muted-foreground">
                        {formatMoney(it.price)} {t("common.currency")}
                      </p>
                    </td>
                    <td className="ez-num px-3 py-2.5 text-center font-bold">×{it.qty}</td>
                    <td className="ez-num px-3 py-2.5 text-end font-semibold">
                      {formatMoney(it.qty * it.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Totals */}
        <Section title="">
          <div className="space-y-1.5 text-sm">
            <Row label={t("orders.subtotal")} value={`${formatMoney(subtotal)} ${t("common.currency")}`} />
            <Row label={t("orders.deliveryFee")} value={`${formatMoney(order.deliveryFee)} ${t("common.currency")}`} />
            <div className="my-2 border-t border-dashed border-border" />
            <Row
              label={t("orders.total")}
              value={`${formatMoney(subtotal + order.deliveryFee)} ${t("common.currency")}`}
              bold
            />
            <p className="ez-num pt-1 text-[11px] text-muted-foreground">
              {pickName(order.paymentMethod, locale)}
            </p>
          </div>
        </Section>
      </div>

      {/* Sticky action bar */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-accent" title="Call">
            <Phone className="h-4 w-4" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-lg border border-border hover:bg-accent" title="Print">
            <Printer className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <PrimaryAction order={order} onUpdate={onUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      {title && <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>}
      {children}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn("text-muted-foreground", bold && "text-foreground font-bold text-base")}>{label}</span>
      <span className={cn("ez-num font-semibold", bold && "text-base font-bold text-primary")}>{value}</span>
    </div>
  );
}

function PrimaryAction({ order, onUpdate }: { order: Order; onUpdate: (s: OrderStatus) => void }) {
  const { t } = useApp();
  switch (order.status) {
    case "new":
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate("cancelled")}
            className="flex-1 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/15"
          >
            <X className="me-1 inline h-4 w-4" /> {t("common.reject")}
          </button>
          <button
            onClick={() => onUpdate("accepted")}
            className="flex-[2] rounded-lg bg-success px-3 py-2.5 text-sm font-bold text-success-foreground hover:opacity-90"
          >
            <Check className="me-1 inline h-4 w-4" /> {t("common.accept")}
          </button>
        </div>
      );
    case "accepted":
      return (
        <button onClick={() => onUpdate("preparing")} className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
          <ChefHat className="me-1 inline h-4 w-4" /> {t("orders.startPrep")}
        </button>
      );
    case "preparing":
      return (
        <button onClick={() => onUpdate("ready")} className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
          <PackageCheck className="me-1 inline h-4 w-4" /> {t("orders.markReady")}
        </button>
      );
    case "ready":
      return (
        <button onClick={() => onUpdate("pickedup")} className="w-full rounded-lg bg-info px-3 py-2.5 text-sm font-bold text-info-foreground hover:opacity-90">
          <Bike className="me-1 inline h-4 w-4" /> {t("orders.markPickedUp")}
        </button>
      );
    case "pickedup":
    case "delivering":
      return (
        <button onClick={() => onUpdate("completed")} className="w-full rounded-lg bg-success px-3 py-2.5 text-sm font-bold text-success-foreground hover:opacity-90">
          <CheckCircle2 className="me-1 inline h-4 w-4" /> {t("orders.complete")}
        </button>
      );
    default:
      return (
        <div className="grid place-items-center rounded-lg bg-muted px-3 py-2.5 text-xs font-semibold text-muted-foreground">
          —
        </div>
      );
  }
}

/* ---------- Timeline ---------- */
function Timeline({ status }: { status: OrderStatus }) {
  const { t } = useApp();
  const isCancelled = status === "cancelled";

  const steps: { key: OrderStatus; labelKey: string; icon: React.ReactNode }[] = [
    { key: "new", labelKey: "common.new", icon: <CircleDot className="h-3.5 w-3.5" /> },
    { key: "accepted", labelKey: "orders.accepted", icon: <Check className="h-3.5 w-3.5" /> },
    { key: "preparing", labelKey: "common.preparing", icon: <ChefHat className="h-3.5 w-3.5" /> },
    { key: "ready", labelKey: "common.ready", icon: <PackageCheck className="h-3.5 w-3.5" /> },
    { key: "pickedup", labelKey: "orders.pickedup", icon: <Bike className="h-3.5 w-3.5" /> },
    { key: "completed", labelKey: "common.completed", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  ];

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        <XCircle className="h-5 w-5" />
        <span className="font-semibold">{t("common.cancelled")}</span>
      </div>
    );
  }

  const order: OrderStatus[] = ["new", "accepted", "preparing", "ready", "pickedup", "delivering", "completed"];
  const currentIdx = order.indexOf(status);

  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const stepIdx = order.indexOf(s.key);
        const done = stepIdx < currentIdx || (s.key === "completed" && status === "completed");
        const current = stepIdx === currentIdx || (s.key === "pickedup" && status === "delivering");
        return (
          <li key={s.key} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-full border-2 transition",
                  done && "border-success bg-success text-success-foreground",
                  current && "border-primary bg-primary text-primary-foreground animate-pulse",
                  !done && !current && "border-border bg-card text-muted-foreground"
                )}
              >
                {s.icon}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("mt-1 h-6 w-0.5", done ? "bg-success" : "bg-border")} />
              )}
            </div>
            <div className="pt-1">
              <p
                className={cn(
                  "text-sm font-semibold",
                  done && "text-success",
                  current && "text-primary",
                  !done && !current && "text-muted-foreground"
                )}
              >
                {t(s.labelKey)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
