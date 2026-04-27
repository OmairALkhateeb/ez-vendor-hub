import { useState, type ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useApp } from "@/i18n/AppProviders";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { dir } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div
        className={cn(
          "flex min-h-screen flex-col",
          dir === "rtl" ? "lg:mr-[260px]" : "lg:ml-[260px]"
        )}
      >
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main key={location.pathname} className="ez-fade-in flex-1 px-4 py-6 md:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
