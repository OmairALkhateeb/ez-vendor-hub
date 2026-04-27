import { createFileRoute } from "@tanstack/react-router";
import { Star, Reply } from "lucide-react";
import { useApp } from "@/i18n/AppProviders";
import { PageHeader } from "@/components/ui-ez/Primitives";
import { REVIEWS, pickName } from "@/data/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "التقييمات — EZ Vendor" },
      { name: "description", content: "اقرأ ورد على ملاحظات زبائنك" },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { t, locale } = useApp();
  const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  return (
    <div>
      <PageHeader title={t("reviews.title")} subtitle={t("reviews.subtitle")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <div className="ez-card ez-shadow p-6">
          <p className="text-xs font-semibold uppercase text-muted-foreground">{t("perf.avgRating")}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="ez-num text-5xl font-bold">{avg}</span>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
          <div className="mt-2 flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={cn("h-4 w-4", i <= Math.round(+avg) ? "fill-warning text-warning" : "text-muted")} />
            ))}
          </div>
          <p className="ez-num mt-3 text-xs text-muted-foreground">{REVIEWS.length} reviews</p>

          <div className="mt-5 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const c = REVIEWS.filter((r) => r.rating === stars).length;
              const pct = (c / REVIEWS.length) * 100;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="ez-num w-3">{stars}</span>
                  <Star className="h-3 w-3 text-warning" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="ez-num w-4 text-end text-muted-foreground">{c}</span>
                </div>
              );
            })}
          </div>
        </div>

        <ul className="space-y-3">
          {REVIEWS.map((r) => (
            <li key={r.id} className="ez-card ez-shadow p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-primary">
                  {pickName(r.customer, locale).charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{pickName(r.customer, locale)}</p>
                    <span className="ez-num text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <div className="mt-0.5 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={cn("h-3.5 w-3.5", i <= r.rating ? "fill-warning text-warning" : "text-muted")} />
                    ))}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">{pickName(r.comment, locale)}</p>
                  <button className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-input bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent">
                    <Reply className="h-3.5 w-3.5" /> {t("reviews.reply")}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
