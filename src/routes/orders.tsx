import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Eye, MapPin, Phone } from "lucide-react";
import { useApp } from "@/i18n/AppProviders";
import { PageHeader, StatusPill } from "@/components/ui-ez/Primitives";
import { ORDERS, pickName, formatMoney, type OrderStatus } from "@/data/mock";
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

const TABS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "common.all" },
  { key: "new", label: "common.new" },
  { key: "preparing", label: "common.preparing" },
  { key: "ready", label: "common.ready" },
  { key: "delivering", label: "common.delivering" },
  { key: "completed", label: "common.completed" },
  { key: "cancelled", label: "common.cancelled" },
];

function OrdersPage() {
  const { t, locale } = useApp();
  const [tab, setTab] = useState<OrderStatus | "all">("all");
  const filtered = tab === "all" ? ORDERS : ORDERS.filter((o) => o.status === tab);

  return (
    <div>
      <PageHeader title={t("orders.title")} subtitle={t("orders.subtitle")} />

      {/* Search + tabs */}
      <div className="ez-card ez-shadow mb-4 p-4">
        <input
          type="search"
          placeholder={t("common.searchOrders")}
          className="h-10 w-full rounded-lg border border-input bg-secondary/60 px-3 text-sm outline-none focus:border-ring focus:bg-background"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {TABS.map((tb) => {
            const count = tb.key === "all" ? ORDERS.length : ORDERS.filter((o) => o.status === tb.key).length;
            const active = tab === tb.key;
            return (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {t(tb.label)}
                <span className={cn("ez-num rounded-full px-1.5 text-[10px]", active ? "bg-primary-foreground/20" : "bg-muted")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders table */}
      <div className="ez-card ez-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">{t("orders.id")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("orders.customer")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("orders.items")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("orders.total")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("common.status")}</th>
                <th className="px-4 py-3 text-start font-semibold">{t("orders.time")}</th>
                <th className="px-4 py-3 text-end font-semibold">{t("orders.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <span className="ez-num font-semibold text-primary">{o.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{pickName(o.customer, locale)}</p>
                    <p className="ez-num mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {o.phone}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="ez-num text-xs text-muted-foreground">{o.items.length} منتج</p>
                    <p className="mt-0.5 truncate max-w-[220px] text-xs">
                      {o.items.map((i) => pickName(i.name, locale)).join("، ")}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="ez-num font-semibold">{formatMoney(o.total)}</span>
                    <span className="ms-1 text-xs text-muted-foreground">{t("common.currency")}</span>
                  </td>
                  <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-4 py-3">
                    <span className="ez-num text-xs text-muted-foreground">{o.minutesAgo} min</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {o.status === "new" && (
                        <>
                          <button className="inline-flex items-center gap-1 rounded-md bg-success px-2.5 py-1.5 text-xs font-semibold text-success-foreground hover:opacity-90">
                            <Check className="h-3.5 w-3.5" /> {t("common.accept")}
                          </button>
                          <button className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/15">
                            <X className="h-3.5 w-3.5" /> {t("common.reject")}
                          </button>
                        </>
                      )}
                      {o.status === "preparing" && (
                        <button className="rounded-md bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
                          {t("orders.markReady")}
                        </button>
                      )}
                      {o.status === "ready" && (
                        <button className="rounded-md bg-info px-2.5 py-1.5 text-xs font-semibold text-info-foreground hover:opacity-90">
                          {t("orders.markDelivering")}
                        </button>
                      )}
                      <button className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-accent" title={t("common.view")}>
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="grid place-items-center p-12 text-sm text-muted-foreground">
            <MapPin className="mb-2 h-8 w-8 opacity-40" />
            لا توجد طلبات في هذه الحالة
          </div>
        )}
      </div>
    </div>
  );
}
