/** Which database backend is active. */
export type DbSource = "neon" | "pglite";

// An empty/whitespace DATABASE_URL (an easy misconfig in deploy UIs) must mean
// "unset" — otherwise production would silently run on the PGLite fallback.
const rawDatabaseUrl =
  typeof process !== "undefined" ? process.env.DATABASE_URL : undefined;
const databaseUrl =
  rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : undefined;

/**
 * Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
 * sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
 * the app has a working database even with nothing configured — the live preview
 * included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
 */
export const dbSource: DbSource = databaseUrl ? "neon" : "pglite";

/** True when a real cloud Postgres (Neon) is configured. */
export const isCloudDatabase = dbSource === "neon";

export function storageLabel(): string {
  return dbSource === "neon"
    ? "Cloud Postgres (Neon)"
    : "Preview storage (local durable)";
}

if (typeof process !== "undefined" && process.env.VERCEL && !databaseUrl) {
  console.warn(
    "[db] VERCEL=1 but DATABASE_URL is unset — falling back to PGLite. " +
      "Cloud persistence requires the platform-injected Neon DATABASE_URL.",
  );
}

/**
 * Minimal shared SQL surface, satisfied by both Neon and PGLite. Both the
 * tagged-template and `.query()` forms resolve to an array of row objects:
 *
 *   const sql = await getSql();
 *   const rows = await sql`select * from todos where id = ${id}`; // parameterized
 *   const rows2 = await sql.query("select * from todos where id = $1", [id]);
 */
export interface Sql {
  <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]>;
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<T[]>;
}

/**
 * Init state lives on globalThis as promises: dev HMR creates new instances of
 * this module, and two instances racing module-level state would open a second
 * pool or run two concurrent PGLite migration passes (whose duplicate
 * `_migrations` insert rejects — and would get memoized, poisoning every later
 * `getSql()`). A failed init clears its slot so the next call retries.
 */
const globalRef = globalThis as typeof globalThis & {
  __pgSqlPromise__?: Promise<Sql>;
  __pgliteInstance__?: Promise<import("@electric-sql/pglite").PGlite>;
  __pgliteMigrateChain__?: Promise<void>;
};

/**
 * Result-type parity: Postgres sends every value as text plus a type OID — the
 * JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
 * int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
 * JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
 * production return identical, JSON-safe shapes:
 *   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
 *                                   `::text` if you ever need huge integers)
 *   date                         -> 'YYYY-MM-DD' string
 *   interval                     -> Postgres interval text
 * numeric already comes back as a string on both (arbitrary precision).
 */
const OID_INT8 = 20;
const OID_DATE = 1082;
const OID_INTERVAL = 1186;
const identity = (v: string) => v;

type Run = <T>(text: string, params: unknown[]) => Promise<T[]>;

/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run: Run): Sql {
  const sql = (async <T = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]> => {
    // Rebuild with $1, $2, … placeholders so values stay parameterized.
    let text = strings[0];
    for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
    return run<T>(text, values);
  }) as unknown as Sql;
  sql.query = <T = Record<string, unknown>>(text: string, params: unknown[] = []) =>
    run<T>(text, params);
  return sql;
}

async function applyNeonMigrations(pool: import("pg").Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(
      "CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())",
    );
    const applied = new Set(
      (await client.query("SELECT name FROM _migrations")).rows.map(
        (r: { name: string }) => r.name,
      ),
    );
    const { readdir, readFile } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const dir = join(process.cwd(), "migrations");
    let files: string[] = [];
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
    } catch {
      return;
    }
    for (const name of files) {
      if (applied.has(name)) continue;
      const text = await readFile(join(dir, name), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(text);
        await client.query("INSERT INTO _migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
        console.log("[db] Neon migration applied:", name);
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
  } finally {
    client.release();
  }
}

function createNeonSql(): Promise<Sql> {
  globalRef.__pgSqlPromise__ ??= (async () => {
    // Neon serverless Postgres via node-postgres. One pool per warm instance.
    const { Pool, types } = await import("pg");
    types.setTypeParser(OID_INT8, Number);
    types.setTypeParser(OID_DATE, identity);
    types.setTypeParser(OID_INTERVAL, identity);

    // Neon requires SSL; pooled endpoints work best with a small pool.
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 15_000,
      ssl:
        databaseUrl!.includes("sslmode=disable")
          ? undefined
          : { rejectUnauthorized: false },
    });

    // Verify cloud connection and apply any pending migrations at first use.
    await pool.query("select 1");
    console.log("[db] Connected to Neon cloud Postgres");
    await applyNeonMigrations(pool);

    return toSql(async <T>(text: string, params: unknown[]) => {
      const res = await pool.query(text, params);
      return res.rows as T[];
    });
  })().catch((err) => {
    globalRef.__pgSqlPromise__ = undefined;
    throw err;
  });
  return globalRef.__pgSqlPromise__;
}

/**
 * Load PGlite WASM + data bundles from the installed package path.
 * Nitro/Vercel rewrites `import.meta.url` so PGlite's default relative
 * `./pglite.data` lookup becomes `/var/task/_libs/pglite.data` (ENOENT).
 * Passing fsBundle + precompiled wasm modules skips that path entirely.
 */
async function loadPgliteBundles(): Promise<{
  fsBundle: Blob;
  pgliteWasmModule: WebAssembly.Module;
  initdbWasmModule: WebAssembly.Module;
}> {
  const { createRequire } = await import("node:module");
  const { readFileSync, existsSync } = await import("node:fs");
  const { dirname, join } = await import("node:path");

  const candidates: string[] = [];
  try {
    // Resolve the package entry (exports don't expose package.json), then use
    // its directory as the dist folder containing pglite.data / .wasm.
    const req = createRequire(import.meta.url);
    candidates.push(dirname(req.resolve("@electric-sql/pglite")));
  } catch {
    // ignore — fall through to cwd paths
  }
  candidates.push(
    // Vercel/Nitro function: we copy binaries here at build time
    join(process.cwd(), "_libs"),
    join(process.cwd(), "node_modules/@electric-sql/pglite/dist"),
    join(process.cwd(), "../node_modules/@electric-sql/pglite/dist"),
    join(process.cwd(), "server/node_modules/@electric-sql/pglite/dist"),
  );

  let distDir: string | undefined;
  for (const dir of candidates) {
    if (
      existsSync(join(dir, "pglite.data")) &&
      existsSync(join(dir, "pglite.wasm"))
    ) {
      distDir = dir;
      break;
    }
  }
  if (!distDir) {
    throw new Error(
      "PGlite assets not found (pglite.data / pglite.wasm). Searched: " +
        candidates.join(", "),
    );
  }

  const dataBuf = readFileSync(join(distDir, "pglite.data"));
  const wasmBuf = readFileSync(join(distDir, "pglite.wasm"));
  const initdbPath = join(distDir, "initdb.wasm");
  const initdbBuf = existsSync(initdbPath)
    ? readFileSync(initdbPath)
    : undefined;

  const fsBundle = new Blob([new Uint8Array(dataBuf)]);
  const pgliteWasmModule = await WebAssembly.compile(new Uint8Array(wasmBuf));
  const initdbWasmModule = initdbBuf
    ? await WebAssembly.compile(new Uint8Array(initdbBuf))
    : await WebAssembly.compile(new Uint8Array(wasmBuf));

  return { fsBundle, pgliteWasmModule, initdbWasmModule };
}

/**
 * PGlite runs in-memory under Vite SSR (NodeFS init is unreliable in the
 * bundler). Durable storage for app data is handled by
 * `src/lib/zynlo/persist.ts` which snapshots to `data/zynlo-snapshot.json`
 * after every mutation and restores on boot when the DB is empty.
 */
async function createPgliteSql(): Promise<Sql> {
  globalRef.__pgliteInstance__ ??= (async () => {
    const { PGlite } = await import("@electric-sql/pglite");
    const bundles = await loadPgliteBundles();
    const pg = new PGlite({
      dataDir: "memory://",
      fsBundle: bundles.fsBundle,
      pgliteWasmModule: bundles.pgliteWasmModule,
      initdbWasmModule: bundles.initdbWasmModule,
      parsers: {
        [OID_INT8]: Number,
        [OID_DATE]: identity,
        [OID_INTERVAL]: identity,
      },
    });
    await pg.waitReady;
    await pg.exec(
      "create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())",
    );
    return pg;
  })().catch((err) => {
    globalRef.__pgliteInstance__ = undefined;
    throw err;
  });
  const pg = await globalRef.__pgliteInstance__;


  // Apply migrations/ (the single schema source) so preview matches production.
  // SQL is inlined by the bundler via import.meta.glob (no runtime fs); applied
  // files are tracked in _migrations. Runs once per module instance — so an HMR
  // reload after adding a migration file applies it live — with passes
  // serialized on a global chain so concurrent callers never double-apply.
  const migrate = async (): Promise<void> => {
    const migrations = import.meta.glob("/migrations/*.sql", {
      query: "?raw",
      import: "default",
      eager: true,
    }) as Record<string, string>;
    const doneRows = await pg.query<{ name: string }>(
      "select name from _migrations",
    );
    const done = new Set(doneRows.rows.map((r) => r.name));
    for (const [path, text] of Object.entries(migrations).sort(([a], [b]) =>
      a.localeCompare(b),
    )) {
      const name = path.split("/").pop() as string;
      if (done.has(name)) continue;
      // Apply + record atomically (parity with scripts/migrate.mjs) so a failed
      // statement can't leave a file half-applied but untracked.
      await pg.transaction(async (tx) => {
        await tx.exec(text);
        await tx.query("insert into _migrations (name) values ($1)", [name]);
      });
    }
  };
  const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve())
    .catch(() => undefined) // an earlier failed pass must not wedge the chain
    .then(migrate);
  globalRef.__pgliteMigrateChain__ = pass;
  await pass;

  return toSql(async <T>(text: string, params: unknown[]) => {
    const result = await pg.query<T>(text, params);
    return result.rows;
  });
}

let sqlPromise: Promise<Sql> | null = null;

async function createSql(): Promise<Sql> {
  if (typeof window !== "undefined") {
    throw new Error(
      "@/lib/db is server-only — call getSql() from a createServerFn handler " +
        "or a server route loader, never from client code.",
    );
  }
  return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}

/**
 * Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
 * otherwise the local PGLite fallback. Memoized — safe to call per request.
 *
 * Schema comes from `migrations/*.sql`, auto-applied before the first query on
 * both backends — define tables there, never inline in server functions.
 */
export function getSql(): Promise<Sql> {
  sqlPromise ??= createSql().catch((err) => {
    sqlPromise = null; // don't memoize failures — let the next call retry
    throw err;
  });
  return sqlPromise;
}

/**
 * The shared PGLite instance (preview only), with `migrations/*.sql` applied.
 * Lets Better Auth persist to the SAME embedded DB as app data in preview (via a
 * Kysely dialect). Throws when `DATABASE_URL` is set (that path uses Neon).
 */
export async function getPglite(): Promise<import("@electric-sql/pglite").PGlite> {
  if (dbSource !== "pglite") {
    throw new Error("getPglite() is only available on the PGLite fallback (no DATABASE_URL)");
  }
  await getSql();
  const pg = await globalRef.__pgliteInstance__;
  if (!pg) throw new Error("PGLite instance failed to initialize");
  return pg;
}

/**
 * Finish DB bootstrap before the server handles traffic.
 *
 * - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
 *   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
 * - **Neon**: no-op (pool is created lazily on first query).
 *
 * Vite `configureServer` awaits this at dev startup; production imports of this
 * module kick it off immediately (see bottom of file).
 */
export function ensureDbReady(): Promise<void> {
  if (dbSource !== "pglite") return Promise.resolve();
  return getSql().then(() => undefined);
}

// Server-only eager start: kick PGLite bootstrap as soon as this module loads in
// Node. Client bundles never hit this path (`getSql` throws in the browser).
const globalBoot = globalThis as typeof globalThis & {
  __pgBootstrapPromise__?: Promise<void>;
};
if (typeof window === "undefined" && dbSource === "pglite") {
  globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
    globalBoot.__pgBootstrapPromise__ = undefined;
    console.error("[db] PGLite bootstrap failed:", err);
    throw err;
  });
}
