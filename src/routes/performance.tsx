import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, CheckCircle2, XCircle, Star } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { useApp } from "@/i18n/AppProviders";
import { PageHeader, StatCard } from "@/components/ui-ez/Primitives";
import { REVENUE_WEEK, formatMoney } from "@/data/mock";

export const Route = createFileRoute("/performance")({
  head: () => ({
    meta: [
      { title: "الأداء — EZ Vendor" },
      { name: "description", content: "تابع مؤشرات الأداء الرئيسية لمطعمك" },
    ],
  }),
  component: PerformancePage,
});

function PerformancePage() {
  const { t, locale } = useApp();
  return (
    <div>
      <PageHeader title={t("perf.title")} subtitle={t("perf.subtitle")} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t("perf.completionRate")} value="96.4%" delta="+2.1%" icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
        <StatCard label={t("perf.acceptanceRate")} value="98.2%" delta="+0.8%" icon={<TrendingUp className="h-5 w-5" />} tone="primary" />
        <StatCard label={t("perf.cancelRate")} value="3.6%" delta="-0.5%" icon={<XCircle className="h-5 w-5" />} tone="warning" />
        <StatCard label={t("perf.avgRating")} value="4.8 / 5" delta="312 reviews" icon={<Star className="h-5 w-5" />} tone="info" />
      </div>

      <div className="ez-card ez-shadow mt-6 p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold">{t("dash.weeklyRevenue")}</h3>
          <p className="text-xs text-muted-foreground">{t("common.week")}</p>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={REVENUE_WEEK} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`${formatMoney(v)} ${t("common.currency")}`, t("dash.revenue")]}
              />
              <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
