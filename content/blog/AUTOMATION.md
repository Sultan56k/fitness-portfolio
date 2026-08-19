# Automated Daily Publishing

Write ten posts in one sitting, release one per day, automatically.

## How it works

Two pieces, already built:

1. **Future-dated posts stay hidden.** A post dated `2026-09-05` does not appear on the site, in the sitemap, or in the RSS feed until that date arrives. This is enforced in `src/lib/blog.ts` and needs no configuration.
2. **A daily cron rebuilds the site.** Because pages are statically generated, a scheduled post only becomes visible when the site rebuilds. A Vercel cron calls `/api/cron/publish` each morning; if a post is due that day, it triggers a redeploy. If nothing is due, it skips the build.

Your Markdown files remain the only source of truth. Nothing writes posts for you.

## Your daily workflow

```bash
# 1. Write your posts (any number, in one sitting)

# 2. Spread them across consecutive days — preview first
npm run blog:schedule

# 3. Happy with the dates? Write them
npm run blog:schedule -- --apply

# 4. Review the queue
npm run blog:queue

# 5. Commit and push. That's it.
git add content/blog && git commit -m "Add October posts" && git push
```

From then on, one post goes live each morning with no further action.

## The two commands

### `npm run blog:queue`

Shows what is live, what is scheduled, and when you run out of posts. It also flags three problems that are otherwise invisible:

- posts missing a `title` or `date` (these silently never publish)
- two posts sharing one date (both go live; one buries the other)
- gaps in the run (a day with no post)

Run it after scheduling and before pushing.

### `npm run blog:schedule`

Assigns consecutive dates to posts that are undated or future-dated. **Posts already live are never touched** — re-dating a published article would reorder the index and re-date something readers have already seen.

Without `--apply` it only previews. Options:

| Command | Effect |
| --- | --- |
| `npm run blog:schedule` | Preview, starting tomorrow, one per day |
| `... -- --apply` | Write the dates |
| `... -- --from 2026-09-01 --apply` | Start on a specific date |
| `... -- --every 2 --apply` | Every other day |
| `... -- --every 7 --apply` | Weekly |

Files are processed in filename order, so prefix them (`01-`, `02-`) if you want a specific running order.

## One-time Vercel setup

Three steps, about five minutes.

### 1. Create a deploy hook

Vercel dashboard → your project → **Settings → Git → Deploy Hooks**

Name it `daily-blog`, target your production branch (`main`), click **Create Hook**, and copy the URL.

### 2. Add two environment variables

**Settings → Environment Variables**, both scoped to **Production**:

| Name | Value |
| --- | --- |
| `VERCEL_DEPLOY_HOOK_URL` | The hook URL from step 1 |
| `CRON_SECRET` | A long random string you generate |

For `CRON_SECRET`, any long random string works — for example the output of:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Vercel sends this automatically as the `Authorization` header on cron calls, so you never type it again. Without it the endpoint refuses to run — it is what stops anyone who finds the URL from triggering unlimited billable rebuilds.

### 3. Deploy

`vercel.json` is already committed and registers the cron. Push to `main` and it activates.

Verify under **Settings → Cron Jobs** — you should see `/api/cron/publish` scheduled daily.

## Changing the publish time

In `vercel.json`:

```json
{ "path": "/api/cron/publish", "schedule": "5 3 * * *" }
```

The schedule is **UTC**. `5 3 * * *` is 03:05 UTC = **08:05 AM Pakistan time**.

| Pakistan time (PKT) | Cron value |
| --- | --- |
| 6:00 AM | `0 1 * * *` |
| 8:05 AM | `5 3 * * *` |
| 12:00 PM | `0 7 * * *` |
| 6:00 PM | `0 13 * * *` |

PKT is UTC+5, so subtract 5 hours from your desired local time.

## Checking it ran

Vercel dashboard → **Logs**, filter to `/api/cron/publish`. A successful run returns:

```json
{ "ok": true, "rebuilt": true, "date": "2026-09-05",
  "published": [{ "slug": "how-to-squat", "title": "How to Squat" }] }
```

On a day with nothing scheduled it returns `"rebuilt": false` and skips the build — that is correct behaviour, not a failure.

## Troubleshooting

**A post did not appear.** Check its date first — this is almost always the cause. Run `npm run blog:queue`; if it shows under *Scheduled*, the date is still in the future.

**Nothing publishes at all.** Confirm both environment variables are set for **Production** in Vercel. If `CRON_SECRET` is missing the endpoint returns 500 and refuses to run.

**Everything published at once.** A date in the past publishes immediately. Re-run `npm run blog:schedule -- --apply` to spread them forward.

**The queue ran out.** `blog:queue` warns you when it will. Keep a week or two ahead.

## If you would rather not use cron

The scheduling still works without any of the above — you just deploy manually the day each post should appear. The cron only removes that manual step.
