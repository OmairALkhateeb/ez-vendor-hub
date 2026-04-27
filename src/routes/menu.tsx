import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Search, MoreVertical, Pencil } from "lucide-react";
import { useApp } from "@/i18n/AppProviders";
import { PageHeader } from "@/components/ui-ez/Primitives";
import { CATEGORIES, ITEMS, pickName, formatMoney } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "القائمة — EZ Vendor" },
      { name: "description", content: "إدارة فئات وأصناف وإضافات قائمة المطعم" },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { t, locale } = useApp();
  const [activeCat, setActiveCat] = useState<string>(CATEGORIES[0].id);
  const items = ITEMS.filter((i) => i.category === activeCat);

  return (
    <div>
      <PageHeader
        title={t("menu.title")}
        subtitle={t("menu.subtitle")}
        actions={
          <>
            <button className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-card px-3 py-2 text-sm font-semibold hover:bg-accent">
              <Plus className="h-4 w-4" /> {t("menu.addCategory")}
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" /> {t("menu.addItem")}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        {/* Categories */}
        <aside className="ez-card ez-shadow p-3">
          <div className="px-2 pb-2 pt-1 text-xs font-semibold uppercase text-muted-foreground">
            {t("menu.categories")}
          </div>
          <ul className="space-y-1">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => setActiveCat(c.id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm transition",
                    activeCat === c.id
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-accent"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("h-1.5 w-1.5 rounded-full", c.active ? "bg-success" : "bg-muted-foreground")} />
                    {pickName(c.name, locale)}
                  </span>
                  <span className={cn("ez-num text-xs", activeCat === c.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {c.itemsCount}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Items */}
        <section className="ez-card ez-shadow p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3" />
              <input
                placeholder={t("common.search")}
                className="h-10 w-full rounded-lg border border-input bg-secondary/60 ps-10 pe-3 text-sm outline-none focus:border-ring focus:bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/30 hover:ez-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-semibold">{pickName(item.name, locale)}</h4>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{pickName(item.desc, locale)}</p>
                  </div>
                  <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-accent">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="ez-num text-lg font-bold text-primary">{formatMoney(item.price)}</span>
                    <span className="ms-1 text-xs text-muted-foreground">{t("common.currency")}</span>
                  </div>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    item.available ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", item.available ? "bg-success" : "bg-muted-foreground")} />
                    {item.available ? t("menu.available") : t("menu.unavailable")}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <span className="ez-num text-muted-foreground">{item.sold} مبيعة</span>
                  <button className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                    <Pencil className="h-3.5 w-3.5" /> {t("common.edit")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
