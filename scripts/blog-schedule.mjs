/**
 * Spreads posts across consecutive days by rewriting their `date` frontmatter.
 *
 * The use case this exists for: you write ten articles in one sitting and want
 * them released one per day rather than all at once. Editing ten dates by hand
 * is where off-by-one errors and duplicate dates come from.
 *
 *   npm run blog:schedule                  # preview (writes nothing)
 *   npm run blog:schedule -- --apply       # write the dates
 *   npm run blog:schedule -- --from 2026-09-01 --apply
 *   npm run blog:schedule -- --every 2 --apply    # every other day
 *
 * Only posts *without* a date, or dated in the future, are touched. Anything
 * already live keeps its date — republishing a post under a new date would
 * change nothing on disk but would reorder the index and re-date an article
 * readers and search engines have already seen.
 */

import fs from "node:fs";
import path from "node:path";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const args = process.argv.slice(2);

const apply = args.includes("--apply");

function flag(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index !== -1 && args[index + 1] ? args[index + 1] : fallback;
}

const today = new Date().toISOString().slice(0, 10);

// Default start is tomorrow: today's slot is usually already taken by whatever
// is live, and scheduling into the past publishes everything at once.
const defaultStart = new Date(`${today}T00:00:00Z`);
defaultStart.setUTCDate(defaultStart.getUTCDate() + 1);

const from = flag("from", defaultStart.toISOString().slice(0, 10));
const every = Number(flag("every", "1"));

if (!/^\d{4}-\d{2}-\d{2}$/.test(from)) {
  console.error(`--from must be YYYY-MM-DD, got "${from}"`);
  process.exit(1);
}

if (!Number.isInteger(every) || every < 1) {
  console.error(`--every must be a positive whole number, got "${every}"`);
  process.exit(1);
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

const files = fs.readdirSync(BLOG_DIR).filter(isPostFile).sort();

const queue = [];

for (const name of files) {
  const raw = fs.readFileSync(path.join(BLOG_DIR, name), "utf8");
  const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
  if (!block) {
    console.warn(`skip ${name} — no frontmatter block`);
    continue;
  }

  const dateLine = /^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m.exec(block[1]);
  const title = /^title:\s*["']?(.*?)["']?\s*$/m.exec(block[1])?.[1] ?? name;

  // Already-published posts are left alone.
  if (dateLine && dateLine[1] <= today) continue;

  queue.push({ name, raw, title, currentDate: dateLine?.[1] ?? null });
}

if (queue.length === 0) {
  console.log("\nNothing to schedule — every post is already live.\n");
  process.exit(0);
}

console.log(
  `\n${apply ? "Scheduling" : "Preview (nothing written — add --apply)"}: ` +
    `${queue.length} post(s), starting ${from}, every ${every} day(s)\n`,
);

const cursor = new Date(`${from}T00:00:00Z`);

for (const item of queue) {
  const target = cursor.toISOString().slice(0, 10);

  let updated;
  if (item.currentDate) {
    updated = item.raw.replace(
      /^date:\s*["']?\d{4}-\d{2}-\d{2}["']?\s*$/m,
      `date: "${target}"`,
    );
  } else {
    // No date field at all — insert one directly after the title so the
    // frontmatter keeps a predictable field order.
    updated = item.raw.replace(
      /^(title:.*)$/m,
      `$1\ndate: "${target}"`,
    );
  }

  const from_ = item.currentDate ?? "(none)";
  console.log(`  ${target}  ${item.title}  \x1b[2m[was ${from_}]\x1b[0m`);

  if (apply) {
    fs.writeFileSync(path.join(BLOG_DIR, item.name), updated, "utf8");
  }

  cursor.setUTCDate(cursor.getUTCDate() + every);
}

console.log(
  apply
    ? `\n✓ Updated ${queue.length} file(s). Run \`npm run blog:queue\` to review, then commit.\n`
    : `\nRe-run with --apply to write these dates.\n`,
);
