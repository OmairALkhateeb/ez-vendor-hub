import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, Clock, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useApp } from "@/i18n/AppProviders";
import { PageHeader, StatCard } from "@/components/ui-ez/Primitives";
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

function WalletPage() {
  const { t, locale } = useApp();
  return (
    <div>
      <PageHeader
        title={t("wallet.title")}
        subtitle={t("wallet.subtitle")}
        actions={
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <ArrowDownLeft className="h-4 w-4" /> {t("wallet.withdraw")}
          </button>
        }
      />

      {/* Hero balance card */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="ez-gradient relative overflow-hidden rounded-2xl p-6 text-primary-foreground ez-shadow lg:col-span-1">
          <div className="absolute -end-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -start-6 -bottom-12 h-32 w-32 rounded-full bg-black/10" />
          <div className="relative">
            <p className="text-xs font-medium uppercase opacity-80">{t("wallet.balance")}</p>
            <p className="ez-num mt-3 text-4xl font-bold tracking-tight">
              4,820,000
              <span className="ms-1 text-lg font-medium opacity-80">{t("common.currency")}</span>
            </p>
            <div className="mt-6 flex items-center justify-between text-xs opacity-90">
              <span>EZ Vendor Wallet</span>
              <span className="ez-num">•••• 4521</span>
            </div>
          </div>
        </div>

        <StatCard label={t("wallet.pending")} value={`815,000 ${t("common.currency")}`} icon={<Clock className="h-5 w-5" />} tone="warning" />
        <StatCard label={t("wallet.totalEarned")} value={`28,450,000 ${t("common.currency")}`} delta="+12.4% ↑" icon={<TrendingUp className="h-5 w-5" />} tone="success" />
      </div>

      {/* Transactions */}
      <div className="ez-card ez-shadow mt-6">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h3 className="text-base font-semibold">{t("wallet.transactions")}</h3>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("wallet.date")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("wallet.type")}</th>
                <th className="px-4 py-3 text-start font-semibold">Description</th>
                <th className="px-4 py-3 text-end font-semibold">{t("wallet.amount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-accent/30">
                  <td className="ez-num px-4 py-3 text-xs text-muted-foreground">{tx.date}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      tx.type === "in" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                    )}>
                      {tx.type === "in" ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                      {tx.type === "in" ? t("wallet.in") : t("wallet.out")}
                    </span>
                  </td>
                  <td className="px-4 py-3">{pickName(tx.desc, locale)}</td>
                  <td className={cn(
                    "ez-num px-4 py-3 text-end font-bold",
                    tx.type === "in" ? "text-success" : "text-destructive"
                  )}>
                    {tx.type === "in" ? "+" : "-"}{formatMoney(tx.amount)} {t("common.currency")}
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
