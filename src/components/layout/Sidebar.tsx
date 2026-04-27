import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  BarChart3,
  Wallet,
  Star,
  Settings,
  LifeBuoy,
  Palette,
} from "lucide-react";
import { useApp } from "@/i18n/AppProviders";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  icon: typeof LayoutDashboard;
  key: string;
  badge?: number;
};

type NavSection = {
  labelKey: string;
  items: NavItem[];
};

const SECTIONS: NavSection[] = [
  {
    labelKey: "nav.section.operations",
    items: [
      { to: "/", icon: LayoutDashboard, key: "nav.dashboard" },
      { to: "/orders", icon: ShoppingBag, key: "nav.orders", badge: 4 },
      { to: "/menu", icon: UtensilsCrossed, key: "nav.menu" },
    ],
  },
  {
    labelKey: "nav.section.business",
    items: [
      { to: "/reports", icon: BarChart3, key: "nav.reports" },
      { to: "/performance", icon: BarChart3, key: "nav.performance" },
      { to: "/wallet", icon: Wallet, key: "nav.wallet" },
      { to: "/reviews", icon: Star, key: "nav.reviews" },
    ],
  },
  {
    labelKey: "nav.section.account",
    items: [
      { to: "/settings", icon: Settings, key: "nav.settings" },
      { to: "/design-system", icon: Palette, key: "nav.designSystem" },
      { to: "/states", icon: LifeBuoy, key: "nav.states" },
    ],
  },
];

export function Sidebar() {
  const { t, dir } = useApp();
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 z-30 hidden w-[260px] flex-col bg-sidebar text-sidebar-foreground lg:flex",
        dir === "rtl"
          ? "right-0 border-l border-sidebar-border"
          : "left-0 border-r border-sidebar-border"
      )}
    >
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
        <div className="grid h-10 w-10 place-items-center rounded-xl ez-gradient text-primary-foreground font-bold">
          EZ
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-sidebar-primary-foreground">
            {t("app.name")}
          </span>
          <span className="text-[11px] text-sidebar-foreground/60">
            {t("app.tagline")}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {SECTIONS.map((section, i) => (
          <div key={section.labelKey} className={cn(i > 0 && "mt-5")}>
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
              {t(section.labelKey)}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground ez-shadow"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1">{t(item.key)}</span>
                      {item.badge ? (
                        <span
                          className={cn(
                            "ez-num grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold",
                            active
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : "bg-primary text-primary-foreground"
                          )}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Support + profile */}
      <div className="border-t border-sidebar-border p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LifeBuoy className="h-[18px] w-[18px]" />
          <span>{t("nav.support")}</span>
        </button>
        <div className="mt-3 rounded-lg bg-sidebar-accent p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              م
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-sidebar-primary-foreground">
                مطعم البركة
              </p>
              <p className="truncate text-[11px] text-sidebar-foreground/60">
                vendor@ez.app
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
