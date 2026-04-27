import { createFileRoute } from "@tanstack/react-router";
import { Store, Clock, Truck, CreditCard, Users, Palette, Sun, Moon } from "lucide-react";
import { useApp } from "@/i18n/AppProviders";
import { LOCALES, type Locale } from "@/i18n/translations";
import { PageHeader } from "@/components/ui-ez/Primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "الإعدادات — EZ Vendor" },
      { name: "description", content: "أدر معلومات وإعدادات مطعمك" },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t, locale, setLocale, theme, setTheme } = useApp();

  const sections = [
    { icon: Store, key: "settings.storeInfo" },
    { icon: Clock, key: "settings.workingHours" },
    { icon: Truck, key: "settings.delivery" },
    { icon: CreditCard, key: "settings.payments" },
    { icon: Users, key: "settings.team" },
    { icon: Palette, key: "settings.appearance" },
  ];

  return (
    <div>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <aside className="ez-card ez-shadow p-2">
          <ul className="space-y-1">
            {sections.map((s, i) => {
              const Icon = s.icon;
              const active = i === 0 || s.key === "settings.appearance";
              return (
                <li key={s.key}>
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
                      active ? "bg-accent font-semibold" : "hover:bg-accent/60"
                    )}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {t(s.key)}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="space-y-4">
          {/* Store info */}
          <section className="ez-card ez-shadow p-6">
            <h3 className="mb-4 text-base font-semibold">{t("settings.storeInfo")}</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="اسم المتجر" defaultValue="مطعم البركة" />
              <Field label="رقم الهاتف" defaultValue="+964 770 555 1234" />
              <Field label="البريد الإلكتروني" defaultValue="vendor@ez.app" />
              <Field label="نوع المطعم" defaultValue="عربي / مشاوي" />
              <div className="sm:col-span-2">
                <Field label="العنوان" defaultValue="بغداد - الكرادة، شارع 62، مجاور صيدلية النور" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold hover:bg-accent">{t("common.cancel")}</button>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">{t("common.save")}</button>
            </div>
          </section>

          {/* Appearance */}
          <section className="ez-card ez-shadow p-6">
            <h3 className="mb-4 text-base font-semibold">{t("settings.appearance")}</h3>

            <div className="mb-5">
              <p className="mb-2 text-sm font-medium">{t("settings.language")}</p>
              <div className="grid grid-cols-3 gap-2">
                {LOCALES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLocale(l.code as Locale)}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-sm font-semibold transition",
                      locale === l.code
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-card hover:bg-accent"
                    )}
                  >
                    {l.label}
                    <span className="ms-1 text-[10px] uppercase text-muted-foreground">({l.code})</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">{t("settings.theme")}</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition",
                    theme === "light" ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-accent"
                  )}
                >
                  <Sun className="h-4 w-4" /> {t("settings.themeLight")}
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition",
                    theme === "dark" ? "border-primary bg-primary-soft text-primary" : "border-border bg-card hover:bg-accent"
                  )}
                >
                  <Moon className="h-4 w-4" /> {t("settings.themeDark")}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        defaultValue={defaultValue}
        className="h-10 w-full rounded-lg border border-input bg-secondary/40 px-3 text-sm outline-none transition focus:border-ring focus:bg-background"
      />
    </label>
  );
}
