import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Store,
  Clock,
  Bell,
  UserCog,
  Palette,
  Sun,
  Moon,
  Upload,
  Check,
  X,
} from "lucide-react";
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

type SectionKey = "store" | "hours" | "account" | "notifications" | "appearance";

const SECTIONS: { key: SectionKey; icon: typeof Store; labelKey: string }[] = [
  { key: "store", icon: Store, labelKey: "settings.storeInfo" },
  { key: "hours", icon: Clock, labelKey: "settings.workingHours" },
  { key: "account", icon: UserCog, labelKey: "settings.account" },
  { key: "notifications", icon: Bell, labelKey: "settings.notifications" },
  { key: "appearance", icon: Palette, labelKey: "settings.appearance" },
];

function SettingsPage() {
  const { t, locale, setLocale, theme, setTheme } = useApp();
  const [active, setActive] = useState<SectionKey>("store");

  return (
    <div>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        {/* Side nav */}
        <aside className="ez-card ez-shadow h-fit p-2 lg:sticky lg:top-20">
          <ul className="space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.key;
              return (
                <li key={s.key}>
                  <button
                    onClick={() => setActive(s.key)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
                      isActive
                        ? "bg-primary-soft font-semibold text-primary"
                        : "hover:bg-accent/60"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    {t(s.labelKey)}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Content */}
        <div className="space-y-4">
          {active === "store" && <StoreInfoSection />}
          {active === "hours" && <WorkingHoursSection />}
          {active === "account" && <AccountSection />}
          {active === "notifications" && <NotificationsSection />}
          {active === "appearance" && (
            <AppearanceSection
              locale={locale}
              setLocale={setLocale}
              theme={theme}
              setTheme={setTheme}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Sections ---------------- */

function StoreInfoSection() {
  const { t } = useApp();
  return (
    <SectionCard
      title={t("settings.storeInfo")}
      description={t("settings.storeInfoHint")}
    >
      {/* Logo + cover */}
      <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-primary-soft text-2xl font-bold text-primary ring-2 ring-primary/20">
          مط
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{t("settings.storeLogo")}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("settings.storeLogoHint")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent">
              <Upload className="h-3.5 w-3.5" /> {t("settings.uploadLogo")}
            </button>
            <button className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent">
              {t("common.delete")}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t("settings.storeName")} defaultValue="مطعم البركة" />
        <Field label={t("settings.storeType")} defaultValue="عربي / مشاوي" />
        <Field label={t("settings.phone")} defaultValue="+964 770 555 1234" />
        <Field label={t("settings.email")} defaultValue="vendor@ez.app" />
        <div className="sm:col-span-2">
          <Field
            label={t("settings.address")}
            defaultValue="بغداد - الكرادة، شارع 62، مجاور صيدلية النور"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              {t("settings.bio")}
            </span>
            <textarea
              rows={3}
              defaultValue="مطعم متخصص بالمأكولات الشرقية والمشاوي على الفحم منذ 1998."
              className="w-full rounded-lg border border-input bg-secondary/40 p-3 text-sm outline-none transition focus:border-ring focus:bg-background"
            />
          </label>
        </div>
      </div>

      <Footer />
    </SectionCard>
  );
}

const DAYS_KEYS = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;
type DayKey = (typeof DAYS_KEYS)[number];

function WorkingHoursSection() {
  const { t } = useApp();
  const [days, setDays] = useState<
    Record<DayKey, { open: boolean; from: string; to: string }>
  >({
    sat: { open: true, from: "10:00", to: "23:00" },
    sun: { open: true, from: "10:00", to: "23:00" },
    mon: { open: true, from: "10:00", to: "23:00" },
    tue: { open: true, from: "10:00", to: "23:00" },
    wed: { open: true, from: "10:00", to: "23:00" },
    thu: { open: true, from: "10:00", to: "00:00" },
    fri: { open: false, from: "12:00", to: "23:00" },
  });

  return (
    <SectionCard
      title={t("settings.workingHours")}
      description={t("settings.workingHoursHint")}
    >
      <ul className="divide-y divide-border">
        {DAYS_KEYS.map((d) => {
          const day = days[d];
          return (
            <li key={d} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
              <div className="flex w-32 items-center gap-3">
                <Toggle
                  checked={day.open}
                  onChange={(v) =>
                    setDays((prev) => ({ ...prev, [d]: { ...prev[d], open: v } }))
                  }
                />
                <span className="text-sm font-medium">{t(`day.${d}`)}</span>
              </div>
              {day.open ? (
                <div className="flex items-center gap-2">
                  <TimeInput
                    value={day.from}
                    onChange={(v) =>
                      setDays((prev) => ({ ...prev, [d]: { ...prev[d], from: v } }))
                    }
                  />
                  <span className="text-xs text-muted-foreground">
                    {t("settings.to")}
                  </span>
                  <TimeInput
                    value={day.to}
                    onChange={(v) =>
                      setDays((prev) => ({ ...prev, [d]: { ...prev[d], to: v } }))
                    }
                  />
                </div>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">
                  {t("settings.closedDay")}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <Footer />
    </SectionCard>
  );
}

function AccountSection() {
  const { t } = useApp();
  return (
    <>
      <SectionCard
        title={t("settings.ownerInfo")}
        description={t("settings.ownerInfoHint")}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("settings.fullName")} defaultValue="محمد علي البركة" />
          <Field label={t("settings.role")} defaultValue={t("settings.owner")} />
          <Field label={t("settings.email")} defaultValue="owner@ez.app" />
          <Field label={t("settings.phone")} defaultValue="+964 770 555 1234" />
        </div>
        <Footer />
      </SectionCard>

      <SectionCard
        title={t("settings.security")}
        description={t("settings.securityHint")}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={t("settings.currentPassword")} type="password" defaultValue="••••••••" />
          <div />
          <Field label={t("settings.newPassword")} type="password" />
          <Field label={t("settings.confirmPassword")} type="password" />
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            {t("settings.updatePassword")}
          </button>
        </div>
      </SectionCard>
    </>
  );
}

function NotificationsSection() {
  const { t } = useApp();
  const items: { key: string; descKey: string; defaultOn: boolean }[] = [
    { key: "settings.notifNewOrder", descKey: "settings.notifNewOrderHint", defaultOn: true },
    { key: "settings.notifCancel", descKey: "settings.notifCancelHint", defaultOn: true },
    { key: "settings.notifReview", descKey: "settings.notifReviewHint", defaultOn: true },
    { key: "settings.notifPayout", descKey: "settings.notifPayoutHint", defaultOn: true },
    { key: "settings.notifPromo", descKey: "settings.notifPromoHint", defaultOn: false },
  ];
  const channels: { key: string; defaultOn: boolean }[] = [
    { key: "settings.channelPush", defaultOn: true },
    { key: "settings.channelEmail", defaultOn: true },
    { key: "settings.channelSms", defaultOn: false },
  ];

  return (
    <>
      <SectionCard
        title={t("settings.notifEvents")}
        description={t("settings.notifEventsHint")}
      >
        <ul className="divide-y divide-border">
          {items.map((it) => (
            <ToggleRow
              key={it.key}
              title={t(it.key)}
              description={t(it.descKey)}
              defaultOn={it.defaultOn}
            />
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        title={t("settings.notifChannels")}
        description={t("settings.notifChannelsHint")}
      >
        <ul className="divide-y divide-border">
          {channels.map((c) => (
            <ToggleRow key={c.key} title={t(c.key)} defaultOn={c.defaultOn} />
          ))}
        </ul>
      </SectionCard>
    </>
  );
}

function AppearanceSection({
  locale,
  setLocale,
  theme,
  setTheme,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}) {
  const { t } = useApp();
  return (
    <SectionCard title={t("settings.appearance")}>
      <div className="mb-6">
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
              <span className="ms-1 text-[10px] uppercase text-muted-foreground">
                ({l.code})
              </span>
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
              theme === "light"
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card hover:bg-accent"
            )}
          >
            <Sun className="h-4 w-4" /> {t("settings.themeLight")}
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition",
              theme === "dark"
                ? "border-primary bg-primary-soft text-primary"
                : "border-border bg-card hover:bg-accent"
            )}
          >
            <Moon className="h-4 w-4" /> {t("settings.themeDark")}
          </button>
        </div>
      </div>
    </SectionCard>
  );
}

/* ---------------- Reusable bits ---------------- */

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ez-card ez-shadow p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        defaultValue={defaultValue}
        className="h-10 w-full rounded-lg border border-input bg-secondary/40 px-3 text-sm outline-none transition focus:border-ring focus:bg-background"
      />
    </label>
  );
}

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="ez-num h-9 w-28 rounded-lg border border-input bg-secondary/40 px-2 text-sm outline-none transition focus:border-ring focus:bg-background"
    />
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-primary" : "bg-muted"
      )}
      aria-pressed={checked}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0.5 rtl:-translate-x-0.5"
        )}
      >
        {checked ? (
          <Check className="h-3 w-3 text-primary" />
        ) : (
          <X className="h-3 w-3 text-muted-foreground" />
        )}
      </span>
    </button>
  );
}

function ToggleRow({
  title,
  description,
  defaultOn,
}: {
  title: string;
  description?: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(!!defaultOn);
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Toggle checked={on} onChange={setOn} />
    </li>
  );
}

function Footer() {
  const { t } = useApp();
  return (
    <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
      <button className="rounded-lg border border-input bg-card px-4 py-2 text-sm font-semibold hover:bg-accent">
        {t("common.cancel")}
      </button>
      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
        {t("common.save")}
      </button>
    </div>
  );
}
