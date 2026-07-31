#!/usr/bin/env node
/**
 * Copy PGlite binary assets into the Vercel serverless function output.
 * Fixes: ENOENT open '/var/task/_libs/pglite.data'
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const funcRoot = join(root, ".vercel/output/functions/__server.func");

if (!existsSync(funcRoot)) {
  console.log("[pglite-assets] no vercel function output — skip");
  process.exit(0);
}

const req = createRequire(import.meta.url);
let distDir;
try {
  distDir = dirname(req.resolve("@electric-sql/pglite"));
} catch {
  distDir = join(root, "node_modules/@electric-sql/pglite/dist");
}

const required = ["pglite.data", "pglite.wasm", "initdb.wasm"];
for (const name of required) {
  if (!existsSync(join(distDir, name))) {
    console.error("[pglite-assets] missing", join(distDir, name));
    process.exit(1);
  }
}

// Path A: _libs/ (matches Nitro's rewritten import.meta.url lookup)
const libs = join(funcRoot, "_libs");
mkdirSync(libs, { recursive: true });
for (const name of required) {
  cpSync(join(distDir, name), join(libs, name));
  console.log("[pglite-assets] -> _libs/" + name);
}

// Path B: full package for require.resolve / dynamic import
const pkgRoot = join(funcRoot, "node_modules/@electric-sql/pglite");
const pkgDist = join(pkgRoot, "dist");
mkdirSync(pkgDist, { recursive: true });
cpSync(distDir, pkgDist, { recursive: true });
const pkgJson = join(distDir, "..", "package.json");
if (existsSync(pkgJson)) {
  cpSync(pkgJson, join(pkgRoot, "package.json"));
}
console.log("[pglite-assets] -> node_modules/@electric-sql/pglite");

// Sanity
for (const name of required) {
  if (!existsSync(join(libs, name))) {
    console.error("[pglite-assets] failed to copy", name);
    process.exit(1);
  }
}
console.log("[pglite-assets] done");
