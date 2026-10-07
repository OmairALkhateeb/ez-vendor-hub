import { useEffect, useState, type ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { useApp } from "@/i18n/AppProviders";
import { ApiError } from "@/lib/api/client";
import { ErrorState, LoadingState, OfflineBanner, OfflineState } from "./States";

export function isOfflineError(e: unknown) {
  return (
    (e instanceof ApiError && e.network) || (typeof navigator !== "undefined" && !navigator.onLine)
  );
}

/** Server message as-is (403/404/409/422 are ready for display), else the generic text. */
export function errorMessage(e: unknown, fallback: string) {
  if (e instanceof ApiError && !e.network) return e.status === 422 ? e.firstError : e.message;
  return fallback;
}

/**
 * Renders the /states components for a query: loading → `loading` (or LoadingState),
 * network failure → OfflineState, other errors → ErrorState with the server message.
 */
export function QueryState<T>({
  query,
  loading,
  children,
}: {
  query: UseQueryResult<T>;
  loading?: ReactNode;
  children: (data: T) => ReactNode;
}) {
  const { t } = useApp();
  if (query.isPending) return <>{loading ?? <LoadingState label={t("states.loadingLabel")} />}</>;
  if (query.isError) {
    if (isOfflineError(query.error)) {
      return (
        <OfflineState
          title={t("states.offlineTitle")}
          description={t("states.offlineDesc")}
          retryLabel={t("states.retry")}
          onRetry={() => query.refetch()}
        />
      );
    }
    return (
      <ErrorState
        title={t("states.errorTitle")}
        description={errorMessage(query.error, t("states.errorDesc"))}
        retryLabel={t("states.retry")}
        onRetry={() => query.refetch()}
      />
    );
  }
  return <>{children(query.data as T)}</>;
}

/** Inline banner shown app-wide while the browser is offline. */
export function OfflineWatcher() {
  const { t } = useApp();
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online ? null : <OfflineBanner label={t("states.offlineBanner")} />;
}
