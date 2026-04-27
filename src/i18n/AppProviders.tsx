import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Locale, LOCALES } from "./translations";

type Theme = "light" | "dark";

interface AppContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_LOCALE = "ez.locale";
const STORAGE_THEME = "ez.theme";

export function AppProviders({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ar");
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const sl = window.localStorage.getItem(STORAGE_LOCALE) as Locale | null;
    const st = window.localStorage.getItem(STORAGE_THEME) as Theme | null;
    if (sl && translations[sl]) setLocaleState(sl);
    if (st === "dark" || st === "light") setThemeState(st);
  }, []);

  const dir = useMemo(() => LOCALES.find((l) => l.code === locale)?.dir ?? "rtl", [locale]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [locale, dir, theme]);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_LOCALE, l);
  };
  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_THEME, t);
  };
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const t = (key: string) => translations[locale][key] ?? translations.en[key] ?? key;

  return (
    <AppContext.Provider value={{ locale, setLocale, dir, t, theme, setTheme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProviders");
  return ctx;
}
