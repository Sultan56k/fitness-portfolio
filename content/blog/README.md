# Publishing a Blog Post

Every post is one Markdown file in this folder. To publish, add a file and deploy — nothing else to edit.

## The 3 steps

1. **Copy `_TEMPLATE.md`** to a new file. The filename becomes the URL:
   `how-much-protein.md` → `yoursite.com/blog/how-much-protein`
2. **Fill in the frontmatter** (the block between the `---` lines) and write the post.
3. **Commit and deploy.** The post appears on `/blog`, in the sitemap, and in the RSS feed automatically.

> Files starting with `_` (like `_TEMPLATE.md`) are ignored, so the template never publishes.

## Filename = URL = SEO

The filename is your URL slug, and it is a ranking signal. Use lowercase words separated by hyphens, include the phrase people would search for, and keep it short.

- Good: `how-much-protein-do-you-need.md`
- Bad: `Post 1 FINAL (2).md`

**Never rename a published post's file.** That changes its URL and breaks every existing link to it, discarding whatever ranking it had earned.

## Frontmatter reference

| Field | Required | What it does |
| --- | --- | --- |
| `title` | **Yes** | The `<h1>` and the search result headline. |
| `date` | **Yes** | `YYYY-MM-DD`. Sets ordering. A future date keeps the post hidden until that day. |
| `excerpt` | **Yes** | The card summary **and** the meta description Google shows. Aim for 120–160 characters. |
| `tags` | No | Topics, e.g. `["Nutrition", "Fat Loss"]`. Each becomes a filterable page. |
| `bucket` | **Set it** | Funnel bucket — decides the CTA that closes the article. One of `DIET`, `STRENGTH`, `CONSULT`, `APP`. Optional technically, but omitting it falls back to a generic CTA that converts less well. |
| `cover` | No | Image path under `/public`, e.g. `/images/blog/protein.jpg`. |
| `coverAlt` | No | Alt text for the cover. Falls back to the title. |
| `author` | No | Defaults to the site brand name. |
| `published` | No | Set `false` to keep a draft in the repo without publishing it. |
| `updated` | No | `YYYY-MM-DD`, set when you materially revise a post. Shows "Updated" and refreshes the sitemap. |
| `seoTitle` | No | Overrides `title` in the browser tab and search results only. |
| `seoDescription` | No | Overrides `excerpt` as the meta description only. |

### Funnel buckets

Every article should push toward one service, and `bucket` is what decides the CTA block appended to the post. **Do not write a CTA by hand** — it is rendered from this field.

| Bucket | CTA links to | Use for |
| --- | --- | --- |
| `DIET` | Diet coaching plans | Nutrition, fat loss, meal planning |
| `STRENGTH` | Strength training course | Training, form, programming |
| `CONSULT` | 1-on-1 sessions | Broad or top-of-funnel topics — lowest friction |
| `APP` | FitLife App Store listing | Calculators, tracking, TDEE/BMI topics |

A misspelled bucket (`Diet` rather than `DIET`) prints a build warning and falls back to the generic CTA — check your build log if a post closes with the wrong offer.

Mix buckets across consecutive posts so the blog does not push the same offer several days running.

The full structure, word counts, and voice rules live in [`faisalnoor-content-calendar-and-template.md`](../../faisalnoor-content-calendar-and-template.md) in the project root, along with a 30-day title calendar.

### Scheduling ahead

Because a future `date` hides a post, you can write a week's worth at once and commit them together. Each one goes live on its own date — provided the site rebuilds that day (see below).

## Images

Put them in `public/images/blog/` and reference them as `/images/blog/name.jpg`.

- **Size:** 1600×900 (16:9). Larger is wasted; the site never displays more.
- **Compress before committing.** Run them through [squoosh.app](https://squoosh.app) — aim for under 200 KB. Image weight is the most common cause of a slow blog, and page speed affects rankings.
- **Always write `coverAlt`.** It serves screen readers and gives search engines a description of the image.

## Writing for search

- **One topic per post.** A post about protein *and* sleep *and* cardio ranks for none of them.
- **Put the search phrase in the `title`, the first paragraph, and one `##` heading** — naturally. Do not stuff it.
- **Use `##` headings generously.** They build the table of contents and are what Google reads to understand structure.
- **Answer the question early.** Give the answer in the first two paragraphs, then explain it. Burying it costs you the featured snippet.
- **Length:** 800–1,500 words is the sweet spot. Write until the question is answered, then stop.
- **Link to your other posts** where genuinely relevant — it helps readers and spreads ranking strength across the site.

## Tags

Reuse existing tags rather than inventing new ones. Ten posts under `Nutrition` builds one strong topic page; ten posts under ten different tags builds nothing.

Casing does not matter for the URL (`Fat Loss` and `fat loss` resolve to the same page), but the first spelling used is the one displayed — so stay consistent.

## Markdown you can use

Headings (`##`, `###`), **bold**, *italic*, links, bullet and numbered lists, `> blockquotes`, tables, `inline code`, fenced code blocks, images, and `---` dividers. GitHub-flavoured Markdown, so task lists and strikethrough work too.

## Publishing daily on autopilot

Write a batch of posts in one sitting and release them one per day:

```bash
npm run blog:schedule -- --apply   # spread posts across consecutive days
npm run blog:queue                 # review what's live and what's queued
```

A Vercel cron then publishes one each morning with no further action. See **[AUTOMATION.md](AUTOMATION.md)** for the one-time setup (about five minutes).

Because posts are statically generated, a future-dated post only appears once the site rebuilds on or after that date — that rebuild is exactly what the cron triggers. Without it, you simply deploy manually on the day each post is due.
