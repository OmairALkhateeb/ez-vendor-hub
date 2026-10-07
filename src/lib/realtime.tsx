import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type Pusher from "pusher-js";
import { BROADCAST_AUTH_URL, PUSHER_CLUSTER, PUSHER_KEY } from "@/lib/api/config";
import { getToken } from "@/lib/api/client";
import type { FoodOrderStatusEvent } from "@/lib/api/types";
import { useAuth } from "@/lib/auth";
import { useApp } from "@/i18n/AppProviders";

/**
 * docs/VENDOR_API.md §12 + docs/PUSHER_REALTIME.md:
 * - private-restaurant.{restaurant_id}, auth via /broadcasting/auth with the vendor token.
 * - FoodOrderStatusUpdated → refetch the order (+ list/counts/dashboard).
 * - status = restaurant_received → new order → play an alert sound.
 * - Pusher is best-effort: refetch after every (re)connect; pages also poll as a fallback.
 */

type ConnState = "idle" | "connecting" | "connected" | "unavailable" | "failed";
const RealtimeContext = createContext<ConnState>("idle");

export function useRealtimeState() {
  return useContext(RealtimeContext);
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { status, restaurantId } = useAuth();
  const { t } = useApp();
  const queryClient = useQueryClient();
  const [state, setState] = useState<ConnState>("idle");
  // `t` changes identity on every theme/locale change — don't reconnect for that.
  const tRef = useRef(t);
  tRef.current = t;

  useEffect(() => {
    if (status !== "authenticated" || !restaurantId || typeof window === "undefined") return;
    let pusher: Pusher | null = null;
    let cancelled = false;
    let wasConnected = false;
    const channelName = `private-restaurant.${restaurantId}`;

    const refetchLists = () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };

    import("pusher-js").then(({ default: PusherCtor }) => {
      if (cancelled) return;
      pusher = new PusherCtor(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        forceTLS: true,
        channelAuthorization: {
          endpoint: BROADCAST_AUTH_URL,
          transport: "ajax",
          // Read the token at auth time so a refreshed token is used.
          headersProvider: () => ({
            Authorization: `Bearer ${getToken() ?? ""}`,
            Accept: "application/json",
          }),
        },
      });

      pusher.connection.bind("state_change", ({ current }: { current: string }) => {
        if (current === "connected") {
          setState("connected");
          // Refetch after any reconnect — events may have been missed.
          if (wasConnected) refetchLists();
          wasConnected = true;
        } else if (current === "connecting") setState("connecting");
        else if (current === "unavailable") setState("unavailable");
        else if (current === "failed") setState("failed");
      });

      const channel = pusher.subscribe(channelName);
      channel.bind("pusher:subscription_error", (e: unknown) =>
        console.warn("[realtime] subscription failed", e),
      );
      channel.bind("FoodOrderStatusUpdated", (e: FoodOrderStatusEvent) => {
        // Idempotent: we only ever refetch, so duplicate / out-of-order events are harmless.
        queryClient.invalidateQueries({ queryKey: ["order", e.order_id] });
        refetchLists();
        if (e.status === "restaurant_received") {
          playNewOrderSound();
          toast(tRef.current("orders.newOrderToast"), { description: `#${e.order_id}` });
        }
      });
    });

    return () => {
      cancelled = true;
      if (pusher) {
        pusher.unsubscribe(channelName);
        pusher.disconnect();
      }
      setState("idle");
    };
  }, [status, restaurantId, queryClient]);

  return <RealtimeContext.Provider value={state}>{children}</RealtimeContext.Provider>;
}

/* ---------- alert sound (WebAudio, no asset needed) ---------- */

let audioCtx: AudioContext | null = null;

/** Browsers only allow audio after a user gesture — unlock the context on the first click. */
if (typeof window !== "undefined") {
  const unlock = () => {
    try {
      audioCtx ??= new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )();
      void audioCtx.resume();
    } catch {
      /* no audio support */
    }
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

export function playNewOrderSound() {
  if (!audioCtx) return;
  const ctx = audioCtx;
  const now = ctx.currentTime;
  // Three short rising beeps.
  [0, 0.22, 0.44].forEach((offset, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880 + i * 220;
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.35, now + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + offset);
    osc.stop(now + offset + 0.2);
  });
}
