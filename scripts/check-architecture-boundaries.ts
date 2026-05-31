/*
 * Architecture boundary check. Fails the build if a layering rule is violated:
 *
 *  - app/ pages must not import repositories directly
 *  - pure engines must not import React, Prisma, Clerk, or next/*
 *  - pure engines must not import a provider SDK
 *
 * The rules below encode the page to service to repository to Prisma flow and
 * the engine purity guarantees that the rest of the codebase relies on.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();

// Pure engine directories. Code here must not import framework or data layers.
const ENGINE_DIRS = [
  "lib/ai",
  "lib/voice",
  "lib/providers",
  "lib/feature-flags",
  "lib/orchestrator",
  "lib/outcomes",
  "lib/attribution",
  "lib/intelligence",
  "lib/scoring",
  "lib/signals",
  "lib/action-graph",
  "lib/review",
  "lib/analytics",
  "lib/recommendations",
  "lib/execution",
];

const ENGINE_BANNED = [
  { re: /from\s+["']react["']/, label: "engine imports React" },
  { re: /from\s+["']@prisma\/client["']/, label: "engine imports Prisma client" },
  { re: /from\s+["']@\/lib\/db\/prisma["']/, label: "engine imports the Prisma singleton" },
  { re: /from\s+["']@clerk\//, label: "engine imports Clerk" },
  { re: /from\s+["']next\//, label: "engine imports next" },
  { re: /from\s+["']@\/lib\/repositories\//, label: "engine imports a repository" },
  { re: /from\s+["'](openai|@anthropic-ai\/sdk|@google\/generative-ai|elevenlabs|twilio|@sendgrid\/mail|axios)["']/, label: "engine imports a provider SDK" },
];

const PAGE_BANNED = [
  { re: /from\s+["']@\/lib\/repositories\//, label: "page imports a repository directly" },
  { re: /from\s+["']\.\.\/repositories\//, label: "page imports a repository directly" },
];

type Violation = { file: string; line: number; label: string };
const violations: Violation[] = [];

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (extname(entry) === ".ts" || extname(entry) === ".tsx") {
      out.push(full);
    }
  }
  return out;
}

function scan(files: string[], rules: { re: RegExp; label: string }[]) {
  for (const file of files) {
    const rel = file.slice(ROOT.length + 1);
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, index) => {
      for (const { re, label } of rules) {
        if (re.test(line)) {
          violations.push({ file: rel, line: index + 1, label });
        }
      }
    });
  }
}

// Engine purity.
for (const dir of ENGINE_DIRS) {
  scan(walk(join(ROOT, dir)), ENGINE_BANNED);
}

// Pages must not import repositories.
scan(walk(join(ROOT, "app")), PAGE_BANNED);

if (violations.length > 0) {
  console.error(`Architecture check failed with ${violations.length} violation(s):`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line} [${v.label}]`);
  }
  process.exit(1);
}

console.log("Architecture check passed. Layer boundaries are intact.");
