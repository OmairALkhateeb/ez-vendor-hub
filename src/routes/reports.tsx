import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ShoppingBag,
  DollarSign,
  Percent,
  XCircle,
  Download,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApp } from "@/i18n/AppProviders";
import { PageHeader, StatCard } from "@/components/ui-ez/Primitives";
import {
  ITEMS,
  CATEGORIES,
  ORDERS,
  REVENUE_WEEK,
  formatMoney,
  pickName,
} from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "التقارير — EZ Vendor" },
      { name: "description", content: "تقارير المبيعات والإيرادات والعمولات" },
    ],
  }),
  component: ReportsPage,
});

type Range = "today" | "week" | "month";

function ReportsPage() {
  const { t, locale } = useApp();
  const [range, setRange] = useState<Range>("week");

  // Aggregate KPIs derived from mock orders + revenue chart.
  const kpis = useMemo(() => {
    const totalOrders = 412;
    const completed = ORDERS.filter((o) => o.status === "completed").length + 396;
    const cancelled = ORDERS.filter((o) => o.status === "cancelled").length + 15;
    const revenue = REVENUE_WEEK.reduce((s, d) => s + d.value, 0);
    const commissionRate = 0.15;
    const commissions = Math.round(revenue * commissionRate);
    const net = revenue - commissions;
    const aov = Math.round(revenue / totalOrders);
    return { totalOrders, completed, cancelled, revenue, commissions, net, aov };
  }, []);

  const topItems = useMemo(
    () => [...ITEMS].sort((a, b) => b.sold - a.sold).slice(0, 6),
    []
  );

  // Category share of sales (sold * price aggregation)
  const categoryData = useMemo(() => {
    const totals: Record<string, number> = {};
    ITEMS.forEach((it) => {
      totals[it.category] = (totals[it.category] ?? 0) + it.sold * it.price;
    });
    return CATEGORIES.filter((c) => totals[c.id]).map((c) => ({
      name: pickName(c.name, locale),
      value: totals[c.id] ?? 0,
    }));
  }, [locale]);

  const PIE_COLORS = [
    "var(--color-primary)",
    "color-mix(in oklab, var(--color-primary) 70%, white)",
    "color-mix(in oklab, var(--color-primary) 45%, white)",
    "color-mix(in oklab, var(--color-primary) 25%, white)",
    "color-mix(in oklab, var(--color-primary) 60%, black)",
    "color-mix(in oklab, var(--color-primary) 35%, black)",
    "color-mix(in oklab, var(--color-primary) 15%, black)",
  ];

  const maxSold = Math.max(...topItems.map((i) => i.sold));

  return (
    <div>
      <PageHeader
        title={t("reports.title")}
        subtitle={t("reports.subtitle")}
        actions={
          <>
            <div className="ez-card flex items-center gap-1 p-1">
              {(["today", "week", "month"] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    range === r
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent"
                  )}
                >
                  {t(`common.${r}`)}
                </button>
              ))}
            </div>
            <button className="ez-card inline-flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-accent">
              <Calendar className="h-4 w-4" />
              {t("reports.dateRange")}
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90">
              <Download className="h-4 w-4" />
              {t("reports.export")}
            </button>
          </>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label={t("reports.totalOrders")}
          value={formatMoney(kpis.totalOrders)}
          delta="+12.4% ↑"
          icon={<ShoppingBag className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label={t("reports.revenue")}
          value={`${formatMoney(kpis.revenue)} ${t("common.currency")}`}
          delta="+8.4% ↑"
          icon={<DollarSign className="h-5 w-5" />}
          tone="success"
        />
        <StatCard
          label={t("reports.commissions")}
          value={`${formatMoney(kpis.commissions)} ${t("common.currency")}`}
          delta={`15% ${t("reports.platformFee")}`}
          icon={<Percent className="h-5 w-5" />}
          tone="warning"
        />
        <StatCard
          label={t("reports.cancelled")}
          value={formatMoney(kpis.cancelled)}
          delta="-0.5% ↓"
          icon={<XCircle className="h-5 w-5" />}
          tone="info"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SimpleStat label={t("reports.completed")} value={formatMoney(kpis.completed)} />
        <SimpleStat
          label={t("reports.netRevenue")}
          value={`${formatMoney(kpis.net)} ${t("common.currency")}`}
          accent
        />
        <SimpleStat
          label={t("reports.aov")}
          value={`${formatMoney(kpis.aov)} ${t("common.currency")}`}
        />
      </div>

      {/* Revenue chart */}
      <div className="ez-card ez-shadow mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">{t("reports.revenueTrend")}</h3>
            <p className="text-xs text-muted-foreground">{t("common.week")}</p>
          </div>
          <span className="ez-num inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success">
            <TrendingUp className="h-3.5 w-3.5" />
            +18.2%
          </span>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_WEEK} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="rep-rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey={locale === "en" ? "en" : locale === "ku" ? "ku" : "day"}
                tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [
                  `${formatMoney(v)} ${t("common.currency")}`,
                  t("reports.revenue"),
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#rep-rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products + Category breakdown */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="ez-card ez-shadow p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">{t("reports.topProducts")}</h3>
            <span className="text-xs text-muted-foreground">{t("reports.byUnits")}</span>
          </div>
          <ul className="space-y-3">
            {topItems.map((item, i) => {
              const pct = (item.sold / maxSold) * 100;
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <span className="ez-num grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary-soft text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent text-lg">
                    {item.image ?? "🍽️"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{pickName(item.name, locale)}</p>
                      <span className="ez-num text-xs font-semibold text-muted-foreground">
                        {item.sold} {t("menu.sold")}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="ez-num w-24 text-end text-sm font-semibold">
                    {formatMoney(item.sold * item.price)} {t("common.currency")}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="ez-card ez-shadow p-5">
          <h3 className="mb-4 text-base font-semibold">{t("reports.byCategory")}</h3>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  stroke="var(--color-background)"
                  strokeWidth={2}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => `${formatMoney(v)} ${t("common.currency")}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-2">
            {categoryData.map((c, i) => (
              <li key={c.name} className="flex items-center gap-2 text-xs">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="flex-1 truncate text-foreground">{c.name}</span>
                <span className="ez-num font-semibold text-muted-foreground">
                  {formatMoney(c.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Orders vs Cancelled */}
      <div className="ez-card ez-shadow mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{t("reports.ordersVsCancelled")}</h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Legend color="var(--color-primary)" label={t("reports.completed")} />
            <Legend color="var(--color-destructive)" label={t("reports.cancelled")} />
          </div>
        </div>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={REVENUE_WEEK.map((d, i) => ({
                day: locale === "en" ? d.en : locale === "ku" ? d.ku : d.day,
                completed: 40 + i * 5 + (i % 2 === 0 ? 8 : 0),
                cancelled: 2 + (i % 3),
              }))}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: "var(--color-accent)" }}
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="completed" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="cancelled" fill="var(--color-destructive)" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function SimpleStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("ez-card ez-shadow p-4", accent && "border-primary/40 bg-primary-soft")}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn("ez-num mt-1 text-xl font-bold", accent && "text-primary")}>{value}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}
