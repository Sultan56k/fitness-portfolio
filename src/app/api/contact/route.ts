import { NextResponse } from "next/server";
import { siteConfig } from "@/data/site";

export const runtime = "nodejs";

/**
 * Contact form endpoint.
 *
 * Every rule here is enforced server-side regardless of what the client
 * checked — the browser form mirrors these constraints purely so users get
 * instant feedback, not as a security boundary.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";

/** Rate limit: 3 submissions per IP per 10 minutes. */
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/**
 * In-memory rate limiter. Deliberately simple: this resets on redeploy and is
 * per-instance, so it is a speed bump rather than a guarantee. The honeypot is
 * the primary spam defence. Swap for Upstash/Redis if traffic justifies it.
 */
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const recent = (requestLog.get(ip) ?? []).filter((t) => t > cutoff);

  // Opportunistic sweep so the map cannot grow without bound across the
  // lifetime of the instance.
  if (requestLog.size > 500) {
    for (const [key, times] of requestLog) {
      if (times.every((t) => t <= cutoff)) requestLog.delete(key);
    }
  }

  if (recent.length >= RATE_LIMIT_MAX) {
    requestLog.set(ip, recent);
    return true;
  }

  recent.push(now);
  requestLog.set(ip, recent);
  return false;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Pragmatic email shape check — deliverability is Resend's problem. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface ContactPayload {
  name: string;
  email: string;
  goal: string;
  message: string;
  /**
   * Pricing plan the visitor clicked before landing on the form. Optional and
   * never validated against the plan list — it is qualifying context for the
   * recipient, not a field the visitor filled in, so a stale or absent value
   * must not block a legitimate enquiry.
   */
  plan?: string | null;
  /** Honeypot. Real users never see it, so a value here means a bot. */
  website?: string;
}

type Errors = Partial<Record<"name" | "email" | "goal" | "message", string>>;

function validate(body: Partial<ContactPayload>): {
  errors: Errors;
  values: ContactPayload;
} {
  const errors: Errors = {};

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const goal = typeof body.goal === "string" ? body.goal.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 2 || name.length > 80) {
    errors.name = "Please enter your name (2–80 characters).";
  }
  if (!EMAIL_PATTERN.test(email) || email.length > 160) {
    errors.email = "Please enter a valid email address.";
  }
  if (!(siteConfig.contact.goals as readonly string[]).includes(goal)) {
    errors.goal = "Please choose a goal.";
  }
  if (message.length < 10 || message.length > 2000) {
    errors.message = "Please write a message between 10 and 2000 characters.";
  }

  // Clamped rather than rejected — see the `plan` field note above. The limit
  // accommodates a category-qualified plan name ("Nutrition — 3 Month Plan"),
  // which is the form the pricing CTAs now publish.
  const plan =
    typeof body.plan === "string" && body.plan.trim()
      ? body.plan.trim().slice(0, 80)
      : null;

  return { errors, values: { name, email, goal, message, plan } };
}

/** Prevents user input from breaking out of the HTML email body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  let body: Partial<ContactPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid request." },
      { status: 400 },
    );
  }

  // Honeypot: respond exactly like the success path so bots get no signal to
  // tune against, but send nothing.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Please try again shortly." },
      { status: 429 },
    );
  }

  const { errors, values } = validate(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, error: "Please check the highlighted fields.", errors },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? siteConfig.brand.email;

  // The site must build and run without credentials, so a missing key is a
  // clean runtime 503 rather than a build-time failure.
  if (!apiKey) {
    console.warn("[contact] RESEND_API_KEY is not set — message not sent.");
    // Distinct copy from the failure path: nothing is broken and the visitor
    // did nothing wrong, the send channel simply is not configured yet. The
    // client keys off the 503 status to offer WhatsApp and email instead.
    return NextResponse.json(
      { ok: false, error: siteConfig.contact.unavailableMessage },
      { status: 503 },
    );
  }

  try {
    const send = () =>
      fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Must be a domain verified in Resend. onboarding@resend.dev works
          // for testing before the real domain is connected.
          from: process.env.CONTACT_FROM_EMAIL ?? "onboarding@resend.dev",
          to: [to],
          reply_to: values.email,
          // Plan goes in the subject: it is the strongest buying signal in the
          // payload and belongs where it is visible without opening the mail.
          subject: values.plan
            ? `New enquiry [${values.plan}]: ${values.goal} — ${values.name}`
            : `New enquiry: ${values.goal} — ${values.name}`,
          html: [
            "<h2>New contact form submission</h2>",
            `<p><strong>Name:</strong> ${escapeHtml(values.name)}</p>`,
            `<p><strong>Email:</strong> ${escapeHtml(values.email)}</p>`,
            `<p><strong>Goal:</strong> ${escapeHtml(values.goal)}</p>`,
            values.plan
              ? `<p><strong>Plan of interest:</strong> ${escapeHtml(values.plan)}</p>`
              : "",
            `<p><strong>Message:</strong></p>`,
            `<p>${escapeHtml(values.message).replace(/\n/g, "<br />")}</p>`,
          ].join(""),
        }),
      });

    let response = await send();

    // Resend's free tier allows 2 requests/second. A visitor double-clicking
    // Send, or two enquiries landing together, trips it — and a transient
    // throttle should not read to them as a failed message. One retry after a
    // short pause clears it; anything still failing is a real error.
    if (response.status === 429) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      response = await send();
    }

    if (!response.ok) {
      // Log the provider's own reason server-side; never surface it to the
      // client. The status alone is not enough to diagnose a failed send —
      // 403 in particular means "domain not verified", which is invisible
      // without the body.
      //
      // Cloned before reading: a Response body is a single-use stream, and
      // consuming the original here would throw on any later read of it.
      let detail = "<unreadable>";
      try {
        detail = await response.clone().text();
      } catch {
        // Body already consumed or unreadable — the status still tells us
        // something, so carry on rather than turning this into a 500.
      }
      console.error(
        `[contact] Resend rejected the send: ${response.status} ${detail}`,
      );

      // 403 means the sending domain is not verified — a setup problem, not a
      // transient failure and nothing the visitor did. Treat it like the
      // missing-key case: same 503, same copy, so the form routes them to
      // WhatsApp or email instead of showing an error they cannot act on.
      if (response.status === 403) {
        console.error(
          "[contact] The sending domain is not verified in Resend. Verify it " +
            "at https://resend.com/domains, or unset CONTACT_FROM_EMAIL to " +
            "fall back to onboarding@resend.dev.",
        );
        return NextResponse.json(
          { ok: false, error: siteConfig.contact.unavailableMessage },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { ok: false, error: siteConfig.contact.errorMessage },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] Unexpected error sending message:", error);
    return NextResponse.json(
      { ok: false, error: siteConfig.contact.errorMessage },
      { status: 500 },
    );
  }
}
