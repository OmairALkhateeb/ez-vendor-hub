import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, DollarSign, Clock, Star, ArrowUpRight, ChevronLeft } from "lucide-react";
import {
  Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { useApp } from "@/i18n/AppProviders";
import { PageHeader, StatCard, StatusPill } from "@/components/ui-ez/Primitives";
import { ORDERS, ITEMS, REVENUE_WEEK, pickName, formatMoney } from "@/data/mock";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الرئيسية — EZ Vendor" },
      { name: "description", content: "نظرة عامة على أداء مطعمك اليومي" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, locale, dir } = useApp();
  const live = ORDERS.filter((o) => ["new", "preparing", "ready", "delivering"].includes(o.status)).slice(0, 5);
  const top = [...ITEMS].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const Chevron = dir === "rtl" ? ChevronLeft : ChevronLeft;

  return (
    <div>
      <PageHeader
        title={`${t("dash.welcome")} مطعم البركة 👋`}
        subtitle={new Date().toLocaleDateString(locale === "en" ? "en-GB" : "ar-IQ", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
        })}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("dash.todayOrders")} value="48" delta="+12% ↑" icon={<ShoppingBag className="h-5 w-5" />} tone="primary" />
        <StatCard label={t("dash.revenue")} value={`612,000 ${t("common.currency")}`} delta="+8.4% ↑" icon={<DollarSign className="h-5 w-5" />} tone="success" />
        <StatCard label={t("dash.avgPrep")} value={`14 ${t("dash.minutes")}`} delta="-2 min" icon={<Clock className="h-5 w-5" />} tone="info" />
        <StatCard label={t("dash.rating")} value="4.8" delta="312 reviews" icon={<Star className="h-5 w-5" />} tone="warning" />
      </div>

      {/* Chart + Top items */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="ez-card ez-shadow p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">{t("dash.weeklyRevenue")}</h3>
              <p className="text-xs text-muted-foreground">{t("common.week")}</p>
            </div>
            <span className="ez-num rounded-md bg-success/10 px-2 py-1 text-xs font-semibold text-success">+18.2%</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_WEEK} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey={locale === "en" ? "en" : locale === "ku" ? "ku" : "day"}
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  cursor={{ fill: "var(--color-accent)" }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${formatMoney(v)} ${t("common.currency")}`, t("dash.revenue")]}
                />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[8, 8, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ez-card ez-shadow p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">{t("dash.topItems")}</h3>
            <Link to="/menu" className="text-xs font-medium text-primary hover:underline">{t("dash.viewAll")}</Link>
          </div>
          <ul className="space-y-3">
            {top.map((item, i) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="ez-num grid h-7 w-7 place-items-center rounded-md bg-primary-soft text-xs font-bold text-primary">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{pickName(item.name, locale)}</p>
                  <p className="ez-num text-xs text-muted-foreground">{item.sold} طلب</p>
                </div>
                <span className="ez-num text-sm font-semibold">{formatMoney(item.price)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Live orders */}
      <div className="ez-card ez-shadow mt-6">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold">{t("dash.liveOrders")}</h3>
            <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              LIVE
            </span>
          </div>
          <Link to="/orders" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
            {t("dash.viewAll")} <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {live.map((o) => (
            <li key={o.id} className="flex items-center gap-4 p-4 hover:bg-accent/40">
              <div className="ez-num text-xs font-semibold text-muted-foreground">{o.id}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{pickName(o.customer, locale)}</p>
                <p className="ez-num truncate text-xs text-muted-foreground">
                  {o.items.length} منتج · {formatMoney(o.total)} {t("common.currency")}
                </p>
              </div>
              <StatusPill status={o.status} />
              <span className="ez-num hidden text-xs text-muted-foreground sm:inline">{o.minutesAgo}m</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
