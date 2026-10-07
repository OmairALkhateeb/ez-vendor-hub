import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, getToken, onUnauthorized, setToken } from "@/lib/api/client";
import { authApi } from "@/lib/api/vendor";
import type { Permissions, Vendor } from "@/lib/api/types";
import { useApp } from "@/i18n/AppProviders";
import type { Locale } from "@/i18n/translations";

type Status = "loading" | "authenticated" | "anonymous" | "offline";

interface AuthContextValue {
  status: Status;
  vendor: Vendor | null;
  permissions: Permissions | null;
  restaurantId: number | null;
  can: (p: keyof Permissions) => boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  /** Changes the UI language and persists it on the account (PUT /profile { locale }). */
  changeLocale: (l: Locale) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setLocale } = useApp();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<Status>("loading");
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const localeApplied = useRef(false);
  // setLocale is recreated on every AppProviders render — keep it out of effect deps.
  const setLocaleRef = useRef(setLocale);
  setLocaleRef.current = setLocale;

  const clearSession = useCallback(() => {
    setToken(null);
    setVendor(null);
    setPermissions(null);
    setStatus("anonymous");
    localeApplied.current = false;
    queryClient.clear();
  }, [queryClient]);

  const loadMe = useCallback(async () => {
    const me = await authApi.me();
    setVendor(me.vendor);
    setPermissions(me.permissions);
    setStatus("authenticated");
    // The account's saved language comes back on any device.
    if (!localeApplied.current && me.vendor.locale) {
      setLocaleRef.current(me.vendor.locale);
      localeApplied.current = true;
    }
  }, []);

  // Restore the session on first client render.
  useEffect(() => {
    if (!getToken()) {
      setStatus("anonymous");
      return;
    }
    // Offline at startup keeps the token (retry later); anything else means the session is gone.
    loadMe().catch((e) =>
      e instanceof ApiError && e.network ? setStatus("offline") : clearSession(),
    );
  }, [loadMe, clearSession]);

  // Refresh failed somewhere in the app → back to login.
  useEffect(() => onUnauthorized(clearSession), [clearSession]);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const res = await authApi.login(identifier, password);
      setToken(res.token);
      await loadMe();
    },
    [loadMe],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* token may already be invalid */
    }
    clearSession();
  }, [clearSession]);

  const changeLocale = useCallback((l: Locale) => {
    setLocaleRef.current(l);
    if (getToken()) authApi.updateProfile({ locale: l }).catch(() => {});
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      vendor,
      permissions,
      restaurantId: vendor?.restaurant.id ?? null,
      can: (p) => !!permissions?.[p],
      login,
      logout,
      refreshMe: loadMe,
      changeLocale,
    }),
    [status, vendor, permissions, login, logout, loadMe, changeLocale],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Route → permission required to open the page (docs/VENDOR_API.md §1 roles table). */
export const ROUTE_PERMISSIONS: Record<string, keyof Permissions> = {
  "/wallet": "view_finance",
  "/reports": "view_reports",
  "/performance": "view_reports",
};
