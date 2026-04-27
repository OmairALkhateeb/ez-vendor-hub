import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useApp } from "@/i18n/AppProviders";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const { dir } = useApp();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col",
          dir === "rtl" ? "lg:mr-[260px]" : "lg:ml-[260px]"
        )}
      >
        <Topbar />
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
