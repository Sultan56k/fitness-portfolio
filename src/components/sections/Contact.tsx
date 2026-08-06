"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { CheckCircle2, Loader2, Send, Tag, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Magnetic } from "@/components/motion/Magnetic";
import { cn, getWhatsAppLink } from "@/lib/utils";
import { getPlanIntent, setPlanIntent, subscribePlanIntent } from "@/lib/planIntent";
import { trackEvent } from "@/lib/analytics";

/**
 * `unavailable` is deliberately distinct from `error`. A 503 means the mail
 * provider is not configured — nothing the visitor did is wrong and nothing is
 * broken, so that state gets its own recovery copy pointing at WhatsApp and
 * email rather than an apology for a failure.
 */
type Status = "idle" | "submitting" | "success" | "error" | "unavailable";
type FieldErrors = Partial<Record<"name" | "email" | "goal" | "message", string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const initialValues = { name: "", email: "", goal: "", message: "", website: "" };

const inputStyles =
  "w-full rounded-xl border border-white/10 bg-bg-elevated px-4 py-3 text-sm text-white " +
  "placeholder:text-text-muted transition-colors duration-200 " +
  "focus:border-accent-lime focus:outline-none focus:ring-2 focus:ring-accent-lime/30";

/**
 * Signature entrance: the panel swings in on the Y axis from the right, a
 * gesture used nowhere else on the page.
 *
 * Client-side validation here mirrors the API route purely for instant
 * feedback — the server re-validates everything and is the real boundary.
 */
export function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const orbY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  /** Plan the visitor clicked in Pricing, if they arrived from there. */
  const [plan, setPlan] = useState<string | null>(null);

  // Pricing CTAs publish the clicked plan; mirror it into local state so the
  // banner renders and the value rides along with the submission.
  useEffect(() => {
    setPlan(getPlanIntent());
    return subscribePlanIntent(setPlan);
  }, []);

  // A failed send must never strand the lead. Both fallbacks carry whatever
  // the visitor already typed so they do not retype it in another app.
  const composedMessage = [
    plan ? `Plan of interest: ${plan}` : null,
    values.goal ? `Goal: ${values.goal}` : null,
    values.message.trim() || null,
  ]
    .filter(Boolean)
    .join("\n");

  const whatsappLink = getWhatsAppLink(
    siteConfig.social.whatsapp.number,
    composedMessage
      ? `Hi! ${composedMessage}`
      : siteConfig.social.whatsapp.message,
  );

  const mailtoLink = `mailto:${siteConfig.brand.email}?subject=${encodeURIComponent(
    `Enquiry${plan ? ` — ${plan} plan` : ""}${values.goal ? `: ${values.goal}` : ""}`,
  )}&body=${encodeURIComponent(composedMessage)}`;

  function validate(): FieldErrors {
    const next: FieldErrors = {};
    const name = values.name.trim();
    const email = values.email.trim();
    const message = values.message.trim();

    if (name.length < 2 || name.length > 80) {
      next.name = "Please enter your name (2–80 characters).";
    }
    if (!EMAIL_PATTERN.test(email)) {
      next.email = "Please enter a valid email address.";
    }
    if (!values.goal) {
      next.goal = "Please choose a goal.";
    }
    if (message.length < 10 || message.length > 2000) {
      next.message = "Please write a message between 10 and 2000 characters.";
    }
    return next;
  }

  function update(field: keyof typeof initialValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear a field's error as soon as the user starts correcting it.
    if (field in errors) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FieldErrors];
        return next;
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setStatus("submitting");
    trackEvent("contact_form_submit", {
      goal: values.goal,
      plan: plan ?? "none",
    });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // `plan` rides along so the enquiry email says which tier prompted it.
        body: JSON.stringify({ ...values, plan }),
      });
      const data = await response.json().catch(() => ({ ok: false }));

      if (!response.ok || !data.ok) {
        if (data.errors) setErrors(data.errors as FieldErrors);

        // 503 = provider not configured. Not a failure the visitor caused, and
        // it needs different copy and a different recovery path.
        if (response.status === 503) {
          setFormError(siteConfig.contact.unavailableMessage);
          setStatus("unavailable");
        } else {
          setFormError(data.error ?? siteConfig.contact.errorMessage);
          setStatus("error");
        }
        trackEvent("contact_form_error", { status: response.status });
        return;
      }

      setValues(initialValues);
      setErrors({});
      setPlanIntent(null);
      setStatus("success");
      trackEvent("contact_form_success", {
        goal: values.goal,
        plan: plan ?? "none",
      });
    } catch {
      setFormError(siteConfig.contact.errorMessage);
      setStatus("error");
      trackEvent("contact_form_error", { status: 0 });
    }
  }

  return (
    <section
      ref={sectionRef}
      id="contact-form"
      className="relative overflow-hidden border-b border-white/8 py-24 md:py-32"
      aria-labelledby="contact-heading"
    >
      <motion.div
        className="glow-orb -left-40 top-1/3 h-[420px] w-[420px] bg-accent-lime/8"
        style={{ y: orbY }}
        aria-hidden="true"
      />

      <div className="section-container relative z-10">
        <SectionHeading
          id="contact-heading"
          label="Get In Touch"
          title={siteConfig.contact.title}
          subtitle={siteConfig.contact.subtitle}
          align="center"
          className="mx-auto"
        />

        <Reveal preset="swing" className="mx-auto mt-12 max-w-2xl">
          <div className="glass-panel p-6 md:p-10">
            {status === "success" ? (
              <div
                className="flex flex-col items-center py-8 text-center"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2
                  className="h-14 w-14 text-accent-lime"
                  aria-hidden="true"
                />
                <h3 className="mt-4 font-display text-3xl tracking-wide text-white">
                  {siteConfig.contact.successTitle}
                </h3>
                <p className="mt-2 text-text-secondary">
                  {siteConfig.contact.successMessage}
                </p>
                <button
                  type="button"
                  className="mt-6 text-sm font-medium text-accent-lime underline-offset-4 hover:underline"
                  onClick={() => setStatus("idle")}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="relative">
                {/* Arrived from a pricing CTA — show which plan, and let them
                    clear it if they changed their mind. */}
                {plan && (
                  <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-accent-lime/30 bg-accent-lime/5 px-4 py-3">
                    <p className="flex items-center gap-2 text-sm font-medium text-accent-lime">
                      <Tag className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {siteConfig.contact.planPrefillLabel.replace(
                        "{plan}",
                        plan,
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPlanIntent(null)}
                      aria-label={`Clear the ${plan} plan selection`}
                      className="shrink-0 rounded-full p-1 text-accent-lime/70 transition-colors hover:text-accent-lime focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime/50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Honeypot. Hidden from users and assistive tech; only bots
                    fill it, and the server silently discards those. Positioned
                    off-canvas rather than display:none, which some bots skip. */}
                <div className="absolute left-[-9999px] top-0" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={values.website}
                    onChange={(e) => update("website", e.target.value)}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      className={cn(
                        inputStyles,
                        errors.name && "border-red-500/70 focus:border-red-500",
                      )}
                      placeholder="Your name"
                      value={values.name}
                      onChange={(e) => update("name", e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-2 text-xs text-red-400">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-white"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className={cn(
                        inputStyles,
                        errors.email && "border-red-500/70 focus:border-red-500",
                      )}
                      placeholder="you@example.com"
                      value={values.email}
                      onChange={(e) => update("email", e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-2 text-xs text-red-400">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="goal"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Your goal
                  </label>
                  <select
                    id="goal"
                    name="goal"
                    className={cn(
                      inputStyles,
                      !values.goal && "text-text-muted",
                      errors.goal && "border-red-500/70 focus:border-red-500",
                    )}
                    value={values.goal}
                    onChange={(e) => update("goal", e.target.value)}
                    aria-invalid={Boolean(errors.goal)}
                    aria-describedby={errors.goal ? "goal-error" : undefined}
                  >
                    <option value="">Select a goal…</option>
                    {siteConfig.contact.goals.map((goal) => (
                      <option key={goal} value={goal}>
                        {goal}
                      </option>
                    ))}
                  </select>
                  {errors.goal && (
                    <p id="goal-error" className="mt-2 text-xs text-red-400">
                      {errors.goal}
                    </p>
                  )}
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="message"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className={cn(
                      inputStyles,
                      "resize-y",
                      errors.message && "border-red-500/70 focus:border-red-500",
                    )}
                    placeholder="Tell us about your goals and where you're starting from…"
                    value={values.message}
                    onChange={(e) => update("message", e.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={
                      errors.message ? "message-error" : "message-hint"
                    }
                  />
                  {errors.message ? (
                    <p id="message-error" className="mt-2 text-xs text-red-400">
                      {errors.message}
                    </p>
                  ) : (
                    <p id="message-hint" className="mt-2 text-xs text-text-muted">
                      {values.message.trim().length}/2000
                    </p>
                  )}
                </div>

                {/* Live region so screen readers announce submit failures.
                    Both branches carry the visitor's typed message into the
                    fallback links, so a failed send never costs them the text
                    they already wrote. */}
                <div role="status" aria-live="polite">
                  {formError && (
                    <div
                      className={cn(
                        "mt-5 rounded-xl border px-4 py-4 text-sm",
                        status === "unavailable"
                          ? "border-accent-cyan/30 bg-accent-cyan/5 text-text-secondary"
                          : "border-red-500/30 bg-red-500/10 text-red-300",
                      )}
                    >
                      <p>{formError}</p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackEvent("whatsapp_click", {
                              source: "contact_form_fallback",
                            })
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          <WhatsAppIcon className="h-4 w-4" aria-hidden="true" />
                          Send via WhatsApp
                        </a>
                        <a
                          href={mailtoLink}
                          onClick={() =>
                            trackEvent("email_click", {
                              source: "contact_form_fallback",
                            })
                          }
                          className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-colors hover:border-white/40"
                        >
                          Send via Email
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                  <p className="order-2 text-xs text-text-muted sm:order-1">
                    We reply within 24 hours.
                  </p>
                  <Magnetic className="order-1 w-full sm:order-2 sm:w-auto" strength={8}>
                    <Button
                      type="submit"
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-2 sm:w-auto",
                        status === "submitting" && "pointer-events-none opacity-70",
                      )}
                    >
                      {status === "submitting" ? (
                        <>
                          <Loader2
                            className="h-4 w-4 animate-spin"
                            aria-hidden="true"
                          />
                          Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" aria-hidden="true" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </Magnetic>
                </div>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
