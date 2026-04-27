import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Wallet as WalletIcon,
  TrendingUp,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Percent,
  ShieldCheck,
  Building2,
  CalendarClock,
  Search,
  Download,
  CheckCircle2,
} from "lucide-react";
import { useApp } from "@/i18n/AppProviders";
import { PageHeader } from "@/components/ui-ez/Primitives";
import { TRANSACTIONS, pickName, formatMoney } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "المحفظة — EZ Vendor" },
      { name: "description", content: "تابع رصيدك وعملياتك المالية" },
    ],
  }),
  component: WalletPage,
});

interface Settlement {
  id: string;
  period: { ar: string; en: string; ku: string };
  date: string;
  orders: number;
  gross: number;
  commission: number;
  net: number;
  status: "paid" | "scheduled" | "processing";
}

const SETTLEMENTS: Settlement[] = [
  {
    id: "ST-2042",
    period: { ar: "20–26 نيسان", en: "Apr 20–26", ku: "٢٠–٢٦ نیسان" },
    date: "2025-04-27",
    orders: 412,
    gross: 2972000,
    commission: 445800,
    net: 2526200,
    status: "scheduled",
  },
  {
    id: "ST-2041",
    period: { ar: "13–19 نيسان", en: "Apr 13–19", ku: "١٣–١٩ نیسان" },
    date: "2025-04-20",
    orders: 388,
    gross: 2680000,
    commission: 402000,
    net: 2278000,
    status: "paid",
  },
  {
    id: "ST-2040",
    period: { ar: "6–12 نيسان", en: "Apr 6–12", ku: "٦–١٢ نیسان" },
    date: "2025-04-13",
    orders: 401,
    gross: 2845000,
    commission: 426750,
    net: 2418250,
    status: "paid",
  },
  {
    id: "ST-2039",
    period: { ar: "30 آذار – 5 نيسان", en: "Mar 30 – Apr 5", ku: "٣٠ ئادار – ٥ نیسان" },
    date: "2025-04-06",
    orders: 372,
    gross: 2510000,
    commission: 376500,
    net: 2133500,
    status: "paid",
  },
];

type Tab = "all" | "in" | "out";

function WalletPage() {
  const { t, locale } = useApp();
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return TRANSACTIONS.filter((tx) => {
      if (tab !== "all" && tx.type !== tab) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      return (
        tx.id.toLowerCase().includes(q) ||
        pickName(tx.desc, locale).toLowerCase().includes(q)
      );
    });
  }, [tab, query, locale]);

  const statusStyle: Record<Settlement["status"], string> = {
    paid: "bg-success/10 text-success border-success/25",
    scheduled: "bg-info/10 text-info border-info/25",
    processing: "bg-warning/15 text-warning-foreground border-warning/30",
  };
  const statusLabel: Record<Settlement["status"], string> = {
    paid: t("wallet.statusPaid"),
    scheduled: t("wallet.statusScheduled"),
    processing: t("wallet.statusProcessing"),
  };

  return (
    <div>
      <PageHeader
        title={t("wallet.title")}
        subtitle={t("wallet.subtitle")}
        actions={
          <>
            <button className="ez-card inline-flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-accent">
              <Download className="h-4 w-4" />
              {t("wallet.statement")}
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <ArrowDownLeft className="h-4 w-4" /> {t("wallet.withdraw")}
            </button>
          </>
        }
      />

      {/* Top: Balance hero + 3 KPI cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Balance hero */}
        <div className="ez-gradient relative overflow-hidden rounded-2xl p-6 text-primary-foreground ez-shadow lg:col-span-2">
          <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -start-6 -bottom-12 h-32 w-32 rounded-full bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wider opacity-80">
                {t("wallet.balance")}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold">
                <ShieldCheck className="h-3 w-3" /> {t("wallet.verified")}
              </span>
            </div>
            <p className="ez-num mt-3 text-4xl font-bold tracking-tight">
              4,820,000
              <span className="ms-1 text-lg font-medium opacity-80">
                {t("common.currency")}
              </span>
            </p>
            <p className="mt-1 text-xs opacity-80">{t("wallet.availableNow")}</p>

            <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4 text-xs">
              <div>
                <p className="opacity-70">{t("wallet.nextSettlement")}</p>
                <p className="ez-num mt-0.5 font-semibold">2025-04-30</p>
              </div>
              <div className="text-end">
                <p className="opacity-70">EZ Vendor Wallet</p>
                <p className="ez-num mt-0.5 font-semibold">•••• 4521</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 KPI tiles */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-3">
          <KpiTile
            tone="warning"
            icon={<Clock className="h-5 w-5" />}
            label={t("wallet.pending")}
            value={`815,000 ${t("common.currency")}`}
            hint={t("wallet.pendingHint")}
          />
          <KpiTile
            tone="info"
            icon={<Percent className="h-5 w-5" />}
            label={t("wallet.commissions")}
            value={`445,800 ${t("common.currency")}`}
            hint={`15% ${t("wallet.thisWeek")}`}
          />
          <KpiTile
            tone="success"
            icon={<TrendingUp className="h-5 w-5" />}
            label={t("wallet.totalEarned")}
            value={`28,450,000 ${t("common.currency")}`}
            hint="+12.4% ↑"
          />
        </div>
      </div>

      {/* Mid: Payout method + Trust note */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="ez-card ez-shadow p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">{t("wallet.payoutMethod")}</h3>
            <button className="text-xs font-medium text-primary hover:underline">
              {t("wallet.changeMethod")}
            </button>
          </div>
          <div className="flex items-start gap-4 rounded-xl border border-border bg-secondary/40 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {t("wallet.bankTransfer")} — {t("wallet.bankName")}
              </p>
              <p className="ez-num mt-0.5 text-xs text-muted-foreground">
                IBAN: IQ•• •••• •••• •••• •••• 4521
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 font-semibold text-success">
                  <CheckCircle2 className="h-3 w-3" /> {t("wallet.verified")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
                  <CalendarClock className="h-3 w-3" /> {t("wallet.weeklyPayouts")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="ez-card ez-shadow flex flex-col justify-between gap-3 p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-success/10 text-success">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t("wallet.trustTitle")}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t("wallet.trustBody")}
              </p>
            </div>
          </div>
          <button className="text-start text-xs font-medium text-primary hover:underline">
            {t("wallet.learnMore")} →
          </button>
        </div>
      </div>

      {/* Settlements */}
      <div className="ez-card ez-shadow mt-6">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <h3 className="text-base font-semibold">{t("wallet.settlements")}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("wallet.settlementsHint")}
            </p>
          </div>
          <button className="text-xs font-medium text-primary hover:underline">
            {t("dash.viewAll")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("wallet.settlementId")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("wallet.period")}</th>
                <th className="px-4 py-3 text-end font-semibold">{t("wallet.orders")}</th>
                <th className="px-4 py-3 text-end font-semibold">{t("wallet.gross")}</th>
                <th className="px-4 py-3 text-end font-semibold">{t("wallet.commission")}</th>
                <th className="px-4 py-3 text-end font-semibold">{t("wallet.net")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("common.status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SETTLEMENTS.map((s) => (
                <tr key={s.id} className="hover:bg-accent/30">
                  <td className="ez-num px-4 py-3 text-xs font-semibold">{s.id}</td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-medium">{pickName(s.period, locale)}</p>
                    <p className="ez-num mt-0.5 text-[11px] text-muted-foreground">{s.date}</p>
                  </td>
                  <td className="ez-num px-4 py-3 text-end text-xs">{s.orders}</td>
                  <td className="ez-num px-4 py-3 text-end text-xs">
                    {formatMoney(s.gross)}
                  </td>
                  <td className="ez-num px-4 py-3 text-end text-xs text-warning-foreground">
                    -{formatMoney(s.commission)}
                  </td>
                  <td className="ez-num px-4 py-3 text-end text-sm font-bold text-success">
                    {formatMoney(s.net)} {t("common.currency")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        statusStyle[s.status]
                      )}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {statusLabel[s.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions */}
      <div className="ez-card ez-shadow mt-6">
        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold">{t("wallet.transactions")}</h3>
            <WalletIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              {(["all", "in", "out"] as Tab[]).map((tk) => (
                <button
                  key={tk}
                  onClick={() => setTab(tk)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    tab === tk
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tk === "all"
                    ? t("common.all")
                    : tk === "in"
                      ? t("wallet.in")
                      : t("wallet.out")}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("common.search")}
                className="h-8 w-48 rounded-lg border border-border bg-background ps-8 pe-3 text-xs focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("wallet.date")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("wallet.type")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("wallet.description")}</th>
                <th className="px-4 py-3 text-end font-semibold">{t("wallet.amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {t("wallet.noTransactions")}
                  </td>
                </tr>
              )}
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-accent/30">
                  <td className="ez-num px-4 py-3 text-xs text-muted-foreground">{tx.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        tx.type === "in"
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {tx.type === "in" ? (
                        <ArrowDownLeft className="h-3 w-3" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3" />
                      )}
                      {tx.type === "in" ? t("wallet.in") : t("wallet.out")}
                    </span>
                  </td>
                  <td className="px-4 py-3">{pickName(tx.desc, locale)}</td>
                  <td
                    className={cn(
                      "ez-num px-4 py-3 text-end font-bold",
                      tx.type === "in" ? "text-success" : "text-destructive"
                    )}
                  >
                    {tx.type === "in" ? "+" : "-"}
                    {formatMoney(tx.amount)} {t("common.currency")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiTile({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone: "primary" | "success" | "warning" | "info";
}) {
  const toneMap: Record<string, string> = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    info: "bg-info/10 text-info",
  };
  return (
    <div className="ez-card ez-shadow flex flex-col justify-between p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <div className={cn("grid h-9 w-9 place-items-center rounded-xl", toneMap[tone])}>
          {icon}
        </div>
      </div>
      <div className="mt-3">
        <p className="ez-num text-xl font-bold tracking-tight">{value}</p>
        {hint && <p className="ez-num mt-1 text-[11px] font-medium text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
