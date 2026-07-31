import type { Plugin } from "vite";
import { defineConfig } from "vite";
import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
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
          if (pathOnly === "/api/zynlo/messages" && method === "POST") {
            return send(200, await mod.upsertMessage(body));
          }
          if (pathOnly.startsWith("/api/zynlo/messages/") && method === "DELETE") {
            const id = decodeURIComponent(pathOnly.split("/").pop() || "");
            await mod.removeMessage(id);
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


/**
 * After the Vercel/Nitro build, copy PGlite binary assets into the serverless
 * function so production can open them (fixes ENOENT on pglite.data).
 */
function copyPgliteAssetsPlugin(): Plugin {
  return {
    name: "app-builder:copy-pglite-assets",
    apply: "build",
    closeBundle() {
      // Nitro emits to .vercel/output/functions/__server.func for the vercel preset.
      const funcRoot = join(process.cwd(), ".vercel/output/functions/__server.func");
      if (!existsSync(funcRoot)) {
        console.warn("[pglite-assets] function dir not found yet:", funcRoot);
        return;
      }
      let distDir: string;
      try {
        const req = createRequire(import.meta.url);
        distDir = dirname(req.resolve("@electric-sql/pglite"));
      } catch {
        distDir = join(
          process.cwd(),
          "node_modules/@electric-sql/pglite/dist",
        );
      }
      if (!existsSync(join(distDir, "pglite.data"))) {
        console.error("[pglite-assets] source pglite.data missing at", distDir);
        return;
      }
      // 1) Put binaries where Nitro's rewritten import.meta.url would look
      const libs = join(funcRoot, "_libs");
      mkdirSync(libs, { recursive: true });
      for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
        const from = join(distDir, name);
        if (existsSync(from)) {
          cpSync(from, join(libs, name));
          console.log("[pglite-assets] copied", name, "-> _libs/");
        }
      }
      // 2) Also install a minimal package tree so require.resolve works
      const pkgDist = join(
        funcRoot,
        "node_modules/@electric-sql/pglite/dist",
      );
      mkdirSync(pkgDist, { recursive: true });
      // Copy whole dist (js + wasm + data) — needed for dynamic import external
      cpSync(distDir, pkgDist, { recursive: true });
      // package.json for resolve
      const pkgJsonSrc = join(distDir, "..", "package.json");
      if (existsSync(pkgJsonSrc)) {
        cpSync(
          pkgJsonSrc,
          join(funcRoot, "node_modules/@electric-sql/pglite/package.json"),
        );
      }
      console.log("[pglite-assets] installed @electric-sql/pglite into function");
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
    ...(command === "build" ? [nitro({ preset: "vercel" })] : []),
    // Runs after Nitro emits .vercel/output so PGlite .data/.wasm land in the function
    ...(command === "build" ? [copyPgliteAssetsPlugin()] : []),
    viteReact(),
  ],
}));
