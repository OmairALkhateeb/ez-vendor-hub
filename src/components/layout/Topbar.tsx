import {
  Bell,
  Moon,
  Sun,
  Search,
  ChevronDown,
  Menu,
  LogOut,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useApp } from "@/i18n/AppProviders";
import { LOCALES, type Locale } from "@/i18n/translations";
import { useAuth } from "@/lib/auth";
import { notificationsApi, storeApi } from "@/lib/api/vendor";
import { errorMessage } from "@/components/ui-ez/QueryState";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onMenuClick?: () => void;
}

function useOutsideClose(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, close]);
  return ref;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { t, theme, toggleTheme, locale } = useApp();
  const { vendor, refreshMe, logout, changeLocale } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const langRef = useOutsideClose(langOpen, () => setLangOpen(false));
  const bellRef = useOutsideClose(bellOpen, () => setBellOpen(false));
  const profileRef = useOutsideClose(profileOpen, () => setProfileOpen(false));

  const isOpen = vendor?.restaurant.is_open ?? false;

  // Open / close the store — customers can't order while closed.
  const storeStatus = useMutation({
    mutationFn: (next: boolean) => storeApi.setStatus(next),
    onSuccess: async () => {
      await refreshMe();
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (e) => toast.error(errorMessage(e, t("states.errorDesc"))),
  });

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationsApi.list,
    refetchInterval: 60_000,
  });
  const unread = notifications.data?.unread_count ?? 0;

  const markRead = useMutation({
    mutationFn: (id: number) => notificationsApi.read(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const markAll = useMutation({
    mutationFn: notificationsApi.readAll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur-md md:gap-3 md:px-6">
      {/* Mobile menu trigger */}
      <button
        type="button"
        onClick={onMenuClick}
        className="grid h-10 w-10 place-items-center rounded-lg border border-input bg-card hover:bg-accent transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      {/* Search → orders search (number EZ-00042 / 42, customer name or phone) */}
      <form
        className="relative flex-1 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/orders", search: { q: search.trim() || undefined } as never });
        }}
      >
        <Search className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("common.searchOrders")}
          className="h-10 w-full rounded-lg border border-input bg-secondary/60 ps-10 pe-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-ring focus:bg-background focus:ring-2 focus:ring-ring/20"
        />
      </form>

      {/* Open/Closed */}
      <button
        type="button"
        disabled={!vendor || storeStatus.isPending}
        onClick={() => storeStatus.mutate(!isOpen)}
        className={cn(
          "hidden items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-60 md:inline-flex",
          isOpen
            ? "border-success/30 bg-success/10 text-success hover:bg-success/15"
            : "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15",
        )}
      >
        {storeStatus.isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isOpen ? "bg-success animate-pulse" : "bg-destructive",
            )}
          />
        )}
        {isOpen ? t("topbar.storeOpen") : t("topbar.storeClosed")}
      </button>

      {/* Language */}
      <div className="relative" ref={langRef}>
        <button
          type="button"
          onClick={() => setLangOpen((v) => !v)}
          className="flex h-10 items-center gap-1.5 rounded-lg border border-input bg-card px-2.5 text-sm font-medium hover:bg-accent transition-colors md:px-3"
        >
          <span>{LOCALES.find((l) => l.code === locale)?.label}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              langOpen && "rotate-180",
            )}
          />
        </button>
        {langOpen && (
          <div className="absolute end-0 top-12 z-30 min-w-[140px] overflow-hidden rounded-lg border border-border bg-popover p-1 ez-shadow">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => {
                  changeLocale(l.code as Locale);
                  setLangOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent",
                  locale === l.code && "bg-accent text-accent-foreground",
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
        type="button"
        onClick={toggleTheme}
        className="grid h-10 w-10 place-items-center rounded-lg border border-input bg-card hover:bg-accent transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notifications */}
      <div className="relative" ref={bellRef}>
        <button
          type="button"
          onClick={() => setBellOpen((v) => !v)}
          className="relative grid h-10 w-10 place-items-center rounded-lg border border-input bg-card hover:bg-accent transition-colors"
          aria-label={t("topbar.notifications")}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 end-1 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
          )}
        </button>
        {bellOpen && (
          <div className="absolute end-0 top-12 z-30 w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-popover ez-shadow">
            <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
              <p className="text-sm font-semibold">
                {t("topbar.notifications")}
                {unread > 0 && (
                  <span className="ez-num ms-1.5 text-xs text-primary">({unread})</span>
                )}
              </p>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> {t("notif.markAllRead")}
                </button>
              )}
            </div>
            <ul className="max-h-[360px] divide-y divide-border overflow-y-auto">
              {notifications.isPending && (
                <li className="grid place-items-center p-6">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </li>
              )}
              {notifications.isError && (
                <li className="p-4 text-center text-xs text-destructive">
                  {errorMessage(notifications.error, t("states.errorDesc"))}
                </li>
              )}
              {notifications.data?.notifications.length === 0 && (
                <li className="p-6 text-center text-xs text-muted-foreground">
                  {t("notif.empty")}
                </li>
              )}
              {notifications.data?.notifications.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!n.read) markRead.mutate(n.id);
                      const orderId = n.data?.order_id;
                      if (orderId) {
                        navigate({ to: "/orders", search: { order: orderId } as never });
                        setBellOpen(false);
                      }
                    }}
                    className={cn(
                      "block w-full px-3 py-2.5 text-start hover:bg-accent/60",
                      !n.read && "bg-primary-soft/40",
                    )}
                  >
                    <p className="flex items-center gap-1.5 text-sm font-semibold">
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                    <p className="ez-num mt-1 text-[10px] text-muted-foreground">
                      {formatDate(n.created_at, locale, true)}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative" ref={profileRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((v) => !v)}
          className="ms-1 hidden items-center gap-2 rounded-lg border border-input bg-card px-2 py-1.5 hover:bg-accent sm:flex"
        >
          {vendor?.restaurant.logo ? (
            <img
              src={vendor.restaurant.logo}
              alt=""
              className="h-7 w-7 rounded-full object-cover"
            />
          ) : (
            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {vendor?.restaurant.name.charAt(0) ?? "E"}
            </div>
          )}
          <div className="hidden leading-tight text-start md:block">
            <p className="text-xs font-semibold">{vendor?.restaurant.name}</p>
            <p className="text-[10px] text-muted-foreground">{vendor?.role_label}</p>
          </div>
        </button>
        {profileOpen && (
          <div className="absolute end-0 top-12 z-30 min-w-[200px] overflow-hidden rounded-lg border border-border bg-popover p-1 ez-shadow">
            <div className="border-b border-border px-3 py-2">
              <p className="truncate text-sm font-semibold">{vendor?.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {vendor?.email ?? vendor?.phone}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" /> {t("topbar.logout")}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
