import { Bell, Moon, Sun, Search, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/i18n/AppProviders";
import { LOCALES, type Locale } from "@/i18n/translations";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { t, theme, toggleTheme, locale, setLocale } = useApp();
  const [open, setOpen] = useState(true);
  const [langOpen, setLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
        <input
          type="search"
          placeholder={t("common.search")}
          className="h-10 w-full rounded-lg border border-input bg-secondary/60 ps-10 pe-3 text-sm outline-none transition focus:border-ring focus:bg-background"
        />
      </div>

      {/* Open/Closed */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition md:inline-flex",
          open
            ? "border-success/30 bg-success/10 text-success"
            : "border-destructive/30 bg-destructive/10 text-destructive"
        )}
      >
        <span className={cn("h-2 w-2 rounded-full", open ? "bg-success" : "bg-destructive")} />
        {open ? t("topbar.storeOpen") : t("topbar.storeClosed")}
      </button>

      {/* Language */}
      <div className="relative">
        <button
          onClick={() => setLangOpen((v) => !v)}
          className="flex h-10 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-medium hover:bg-accent"
        >
          <span>{LOCALES.find((l) => l.code === locale)?.label}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
        {langOpen && (
          <div className="absolute end-0 top-12 z-30 min-w-[140px] overflow-hidden rounded-lg border border-border bg-popover p-1 ez-shadow">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLocale(l.code as Locale);
                  setLangOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent",
                  locale === l.code && "bg-accent text-accent-foreground"
                )}
              >
                <span>{l.label}</span>
                <span className="text-[10px] uppercase text-muted-foreground">{l.code}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme */}
      <button
        onClick={toggleTheme}
        className="grid h-10 w-10 place-items-center rounded-lg border border-input bg-card hover:bg-accent"
        aria-label="theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notifications */}
      <button className="relative grid h-10 w-10 place-items-center rounded-lg border border-input bg-card hover:bg-accent">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 end-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
      </button>

      {/* Profile */}
      <div className="ms-1 flex items-center gap-2 rounded-lg border border-input bg-card px-2 py-1.5">
        <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          م
        </div>
        <div className="hidden leading-tight sm:block">
          <p className="text-xs font-semibold">مطعم البركة</p>
          <p className="text-[10px] text-muted-foreground">Vendor</p>
        </div>
      </div>
    </header>
  );
}
