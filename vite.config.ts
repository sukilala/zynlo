import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

/**
 * Finish PGLite bootstrap during dev-server setup (before traffic). Vite awaits
 * async `configureServer` hooks. Production: `src/lib/db` kicks `ensureDbReady`
 * on import.
 */
function pgliteBootstrapPlugin(): Plugin {
  return {
    name: "app-builder:pglite-bootstrap",
    apply: "serve",
    async configureServer(server) {
      try {
        const mod = (await server.ssrLoadModule("/src/lib/db.ts")) as {
          ensureDbReady?: () => Promise<void>;
        };
        if (typeof mod.ensureDbReady === "function") {
          await mod.ensureDbReady();
        }
      } catch (err) {
        console.error("[app-builder] DB bootstrap failed:", err);
        throw err;
      }
    },
  };
}

/** REST API for downloadable HTML client + multi-IP persistence tests. */
function zynloApiPlugin(): Plugin {
  return {
    name: "zynlo-rest-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        const pathOnly = url.split("?", 1)[0] ?? "";
        if (!pathOnly.startsWith("/api/zynlo")) {
          next();
          return;
        }
        try {
          const mod = (await server.ssrLoadModule(
            "/src/lib/zynlo/store-api.ts",
          )) as Record<string, (...args: unknown[]) => Promise<unknown>>;
          const method = (req.method ?? "GET").toUpperCase();
          const send = (status: number, body: unknown) => {
            res.statusCode = status;
            res.setHeader("content-type", "application/json; charset=utf-8");
            res.setHeader("cache-control", "no-store");
            res.end(JSON.stringify(body));
          };
          const readBody = async (): Promise<Record<string, unknown>> => {
            const chunks: Buffer[] = [];
            for await (const chunk of req) {
              chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
            }
            const raw = Buffer.concat(chunks).toString("utf8");
            if (!raw) return {};
            return JSON.parse(raw) as Record<string, unknown>;
          };

          if (pathOnly === "/api/zynlo" || pathOnly === "/api/zynlo/") {
            if (method === "GET") {
              const data = await mod.loadAll();
              return send(200, data);
            }
          }

          const body = method === "GET" ? {} : await readBody();

          if (pathOnly === "/api/zynlo/agents" && method === "POST") {
            return send(200, await mod.upsertAgent(body));
          }
          if (pathOnly.startsWith("/api/zynlo/agents/") && method === "DELETE") {
            const id = decodeURIComponent(pathOnly.split("/").pop() || "");
            await mod.removeAgent(id);
            return send(200, { ok: true });
          }
          if (pathOnly === "/api/zynlo/customers" && method === "POST") {
            return send(200, await mod.upsertCustomer(body));
          }
          if (
            pathOnly.startsWith("/api/zynlo/customers/") &&
            method === "DELETE"
          ) {
            const id = decodeURIComponent(pathOnly.split("/").pop() || "");
            await mod.removeCustomer(id);
            return send(200, { ok: true });
          }
          if (pathOnly === "/api/zynlo/clients" && method === "POST") {
            return send(200, await mod.upsertClient(body));
          }
          if (
            pathOnly.startsWith("/api/zynlo/clients/") &&
            method === "DELETE"
          ) {
            const id = decodeURIComponent(pathOnly.split("/").pop() || "");
            await mod.removeClient(id);
            return send(200, { ok: true });
          }
          if (pathOnly === "/api/zynlo/calls" && method === "POST") {
            return send(200, await mod.upsertCall(body));
          }
          if (pathOnly.startsWith("/api/zynlo/calls/") && method === "DELETE") {
            const id = decodeURIComponent(pathOnly.split("/").pop() || "");
            await mod.removeCall(id);
            return send(200, { ok: true });
          }

          send(404, { error: "Not found" });
        } catch (err) {
          console.error("[zynlo-api]", err);
          res.statusCode = 500;
          res.setHeader("content-type", "application/json");
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : "Server error",
            }),
          );
        }
      });
    },
  };
}

function authPopupPlugin(): Plugin {
  return {
    name: "app-builder:auth-popup",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const rawUrl = req.url ?? "";
          const pathOnly = rawUrl.split("?", 1)[0] ?? "";
          if (pathOnly !== "/auth/popup") {
            next();
            return;
          }
          if ((req.method ?? "GET").toUpperCase() !== "GET") {
            res.statusCode = 405;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("Method Not Allowed");
            return;
          }

          const host = String(
            req.headers["x-forwarded-host"] ?? req.headers.host ?? "localhost:8080",
          );
          const proto = String(
            req.headers["x-forwarded-proto"] ??
              ((req.socket as { encrypted?: boolean } | undefined)?.encrypted
                ? "https"
                : "http"),
          );
          const requestHeaders = new Headers();
          for (const [key, value] of Object.entries(req.headers)) {
            if (value === undefined) continue;
            if (Array.isArray(value)) {
              for (const v of value) requestHeaders.append(key, v);
            } else {
              requestHeaders.set(key, value);
            }
          }
          if (!requestHeaders.has("host")) requestHeaders.set("host", host);

          const request = new Request(`${proto}://${host}${rawUrl}`, {
            method: "GET",
            headers: requestHeaders,
          });

          const mod = (await server.ssrLoadModule(
            "/src/lib/auth/popup.server.ts",
          )) as {
            handleAuthPopupRequest: (req: Request) => Promise<Response>;
          };
          const response = await mod.handleAuthPopupRequest(request);

          res.statusCode = response.status;
          const setCookies =
            typeof response.headers.getSetCookie === "function"
              ? response.headers.getSetCookie()
              : [];
          response.headers.forEach((value, key) => {
            if (key.toLowerCase() === "set-cookie") return;
            res.setHeader(key, value);
          });
          for (const cookie of setCookies) {
            res.appendHeader("set-cookie", cookie);
          }
          const body = Buffer.from(await response.arrayBuffer());
          res.end(body);
        } catch (err) {
          console.error("[app-builder] /auth/popup handler failed:", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("content-type", "text/plain; charset=utf-8");
            res.end("auth popup failed");
          }
        }
      });
    },
  };
}

export default defineConfig(({ command }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  resolve: { tsconfigPaths: true },
  plugins: [
    pgliteBootstrapPlugin(),
    zynloApiPlugin(),
    authPopupPlugin(),
    tailwindcss(),
    tanstackStart(),
    ...(command === "build"
      ? [
          nitro({
            preset: "vercel",
            // Keep @electric-sql/pglite out of the rollup bundle so its
            // pglite.data / .wasm files remain on disk under node_modules
            // (required by loadPgliteBundles in src/lib/db.ts).
            rollupConfig: {
              external: (id: string) =>
                id === "@electric-sql/pglite" ||
                id.startsWith("@electric-sql/pglite/"),
            },
            // Ensure binary assets are traced into the Vercel function.
            externals: {
              traceInclude: [
                "node_modules/@electric-sql/pglite/dist/pglite.data",
                "node_modules/@electric-sql/pglite/dist/pglite.wasm",
                "node_modules/@electric-sql/pglite/dist/initdb.wasm",
                "node_modules/@electric-sql/pglite/package.json",
              ],
            },
          }),
        ]
      : []),
    viteReact(),
  ],
}));
