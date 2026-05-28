#!/usr/bin/env node
// Fails if any source file under src/ mentions known secret env var names.
// Name-based check only — does not look at values.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src";
const FORBIDDEN = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SERVICE_ROLE",
  "PRIVATE_KEY",
  "SECRET_KEY",
  "STRIPE_SECRET_KEY",
];

const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".css"]);

/** @type {Array<{file:string, name:string, line:number}>} */
const hits = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) {
      walk(p);
    } else {
      // Skip server-only files (.server.ts/.tsx) — never bundled to the client.
      if (/\.server\.(ts|tsx|js|jsx|mjs|cjs)$/.test(p)) continue;
      const dot = p.lastIndexOf(".");
      if (dot < 0 || !EXTS.has(p.slice(dot))) continue;
      const lines = readFileSync(p, "utf8").split("\n");
      for (let i = 0; i < lines.length; i++) {
        for (const name of FORBIDDEN) {
          if (lines[i].includes(name)) {
            hits.push({ file: p, name, line: i + 1 });
          }
        }
      }
    }
  }
}

walk(ROOT);

if (hits.length > 0) {
  console.error("Secret-name check FAILED. Forbidden identifiers found in src/:");
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  -> ${h.name}`);
  }
  console.error(
    "\nFrontend code must never reference server-only secret env vars. Move usage to a server function or remove the reference.",
  );
  process.exit(1);
}

console.log("Secret-name check passed (no forbidden identifiers in src/).");
