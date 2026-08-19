import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";

/**
 * Daily publish trigger, called by the Vercel cron defined in `vercel.json`.
 *
 * The scheduling itself is already handled by `getAllPosts()`, which hides any
 * post dated in the future. The only thing missing on a statically generated
 * site is a reason to rebuild — without one, a post dated tomorrow stays
 * invisible until the next deploy, whenever that happens to be.
 *
 * So this endpoint's job is narrow: notice that today's post is due and ask
 * Vercel to rebuild. It deliberately does not write files, pick posts, or
 * commit anything — the Markdown in the repo remains the single source of
 * truth for what publishes and when.
 */

// Must not be cached: a cached response would report yesterday's state and the
// rebuild would never fire.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  /**
   * Vercel signs cron invocations with CRON_SECRET. Without this check the
   * endpoint is a public URL that anyone could hammer to trigger unlimited
   * rebuilds — each one billable.
   *
   * Fails closed: if the secret is not configured, the endpoint refuses rather
   * than running unauthenticated.
   */
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET is not configured." },
      { status: 500 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const posts = getAllPosts();

  // `getAllPosts()` already filtered out anything dated later than today, so
  // a post dated today is one that became visible on this run.
  const dueToday = posts.filter((post) => post.date === today);

  /**
   * The deploy hook is what actually rebuilds the site. Created in the Vercel
   * dashboard (Settings → Git → Deploy Hooks) and stored as an env var.
   */
  const deployHook = process.env.VERCEL_DEPLOY_HOOK_URL;

  if (!deployHook) {
    return NextResponse.json(
      {
        ok: false,
        error: "VERCEL_DEPLOY_HOOK_URL is not configured.",
        dueToday: dueToday.map((post) => post.slug),
      },
      { status: 500 },
    );
  }

  // Nothing scheduled for today — skip the rebuild rather than burning a
  // deployment to produce byte-identical output.
  if (dueToday.length === 0) {
    return NextResponse.json({
      ok: true,
      rebuilt: false,
      reason: "No post scheduled for today.",
      date: today,
      totalPublished: posts.length,
    });
  }

  try {
    const response = await fetch(deployHook, { method: "POST" });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: `Deploy hook returned ${response.status}.`,
          dueToday: dueToday.map((post) => post.slug),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      rebuilt: true,
      date: today,
      published: dueToday.map((post) => ({ slug: post.slug, title: post.title })),
      totalPublished: posts.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Deploy hook failed.",
      },
      { status: 502 },
    );
  }
}
