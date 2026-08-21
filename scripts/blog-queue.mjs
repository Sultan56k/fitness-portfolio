/**
 * Prints the publishing queue: what is already live, what is scheduled, and
 * which days have no post assigned.
 *
 * Run with `npm run blog:queue`.
 *
 * This exists because the scheduling is invisible otherwise — a post dated
 * next Tuesday simply does not appear on the site, which looks identical to a
 * post that was never written. Two mistakes in particular are easy to make and
 * hard to notice: two posts sharing a date (both publish, one buries the
 * other) and a gap in the run (a silent day with nothing new).
 */

import fs from "node:fs";
import path from "node:path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

if (!fs.existsSync(BLOG_DIR)) {
  console.error(`No blog directory at ${BLOG_DIR}`);
  process.exit(1);
}

/**
 * Minimal frontmatter reader. Deliberately not importing `src/lib/blog.ts`:
 * that module is TypeScript with path aliases and would need a build step to
 * run from a plain Node script, and all this needs is three fields.
 */
function readFrontmatter(filename) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!match) return null;

  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    const pair = /^(\w+):\s*(.*)$/.exec(line);
    if (!pair) continue;
    let value = pair[2].trim();
    // Unwrap the quoting style YAML used, and undo its escaping: doubled
    // apostrophes inside single quotes, backslash-escaped quotes inside double.
    if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1).replace(/''/g, "'");
    } else if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1).replace(/\\"/g, '"');
    }
    fields[pair[1]] = value;
  }
  return fields;
}

/** Mirrors `isPostFile` in src/lib/blog.ts — keep the two in step. */
function isPostFile(name) {
  const base = name.replace(/\.mdx?$/, "");
  return (
    /\.mdx?$/.test(name) &&
    !name.startsWith("_") &&
    !/^[A-Z0-9_-]+$/.test(base)
  );
}

const today = new Date().toISOString().slice(0, 10);

const posts = fs
  .readdirSync(BLOG_DIR)
  .filter(isPostFile)
  .map((name) => {
    const front = readFrontmatter(name);
    if (!front?.title || !front?.date) return { name, broken: true };
    return {
      name,
      title: front.title,
      date: front.date,
      draft: front.published === "false",
    };
  })
  .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

const broken = posts.filter((post) => post.broken);
const valid = posts.filter((post) => !post.broken);
const live = valid.filter((post) => !post.draft && post.date <= today);
const scheduled = valid.filter((post) => !post.draft && post.date > today);
const drafts = valid.filter((post) => post.draft);

console.log(`\n${BOLD}Blog queue${RESET} ${DIM}— today is ${today}${RESET}\n`);

console.log(`${GREEN}● Live${RESET} (${live.length})`);
for (const post of live.slice(-5)) {
  console.log(`  ${DIM}${post.date}${RESET}  ${post.title}`);
}
if (live.length > 5) console.log(`  ${DIM}…and ${live.length - 5} earlier${RESET}`);

console.log(`\n${YELLOW}○ Scheduled${RESET} (${scheduled.length})`);
if (scheduled.length === 0) {
  console.log(`  ${DIM}Nothing queued — the blog goes quiet after today.${RESET}`);
}
for (const post of scheduled) {
  console.log(`  ${DIM}${post.date}${RESET}  ${post.title}`);
}

if (drafts.length > 0) {
  console.log(`\n${DIM}✎ Drafts (published: false) (${drafts.length})${RESET}`);
  for (const post of drafts) {
    console.log(`  ${DIM}${post.date}  ${post.title}${RESET}`);
  }
}

// --- Problems worth flagging -------------------------------------------

const problems = [];

for (const post of broken) {
  problems.push(`${post.name} — missing title or date, will not publish`);
}

// Same-day collisions. Both posts publish, but one buries the other on the
// index and the day's traffic is split between them.
const byDate = new Map();
for (const post of scheduled) {
  byDate.set(post.date, [...(byDate.get(post.date) ?? []), post.title]);
}
for (const [date, titles] of byDate) {
  if (titles.length > 1) {
    problems.push(`${date} — ${titles.length} posts share this date`);
  }
}

// Gaps in the upcoming run.
if (scheduled.length > 0) {
  const dates = new Set(scheduled.map((post) => post.date));
  const last = scheduled[scheduled.length - 1].date;
  const cursor = new Date(`${today}T00:00:00Z`);
  const end = new Date(`${last}T00:00:00Z`);
  const gaps = [];

  cursor.setUTCDate(cursor.getUTCDate() + 1);
  while (cursor <= end) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!dates.has(iso)) gaps.push(iso);
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (gaps.length > 0) {
    problems.push(
      `${gaps.length} day(s) with no post: ${gaps.slice(0, 5).join(", ")}${
        gaps.length > 5 ? "…" : ""
      }`,
    );
  }
}

if (problems.length > 0) {
  console.log(`\n${RED}⚠ Check${RESET}`);
  for (const problem of problems) console.log(`  ${problem}`);
}

const runsOut = scheduled.at(-1)?.date;
console.log(
  `\n${DIM}${scheduled.length} post(s) queued.${
    runsOut ? ` Queue runs out after ${runsOut}.` : ""
  }${RESET}\n`,
);
