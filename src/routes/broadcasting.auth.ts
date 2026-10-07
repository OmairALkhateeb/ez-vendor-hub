import { createFileRoute } from "@tanstack/react-router";

/**
 * Same-origin proxy for Pusher private-channel auth.
 * The backend's POST /broadcasting/auth works but sends no CORS headers, so the
 * browser can't call it cross-origin. pusher-js posts here instead and we
 * forward the request (with the vendor's Bearer token) server-side.
 */
const TARGET = `${(process.env.API_BASE_URL ?? process.env.VITE_API_BASE_URL ?? "https://ez.aazer.app").replace(/\/+$/, "")}/broadcasting/auth`;

export const Route = createFileRoute("/broadcasting/auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers: Record<string, string> = {
          Accept: "application/json",
          "Content-Type":
            request.headers.get("content-type") ?? "application/x-www-form-urlencoded",
        };
        const auth = request.headers.get("authorization");
        if (auth) headers.Authorization = auth;

        const upstream = await fetch(TARGET, {
          method: "POST",
          headers,
          body: await request.text(),
        });
        return new Response(await upstream.text(), {
          status: upstream.status,
          headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
        });
      },
    },
  },
});
