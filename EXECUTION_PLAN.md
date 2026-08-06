# FitPro Studio — Execution Plan (Tier 1: Conversion)

**Version:** 1.0
**Date:** August 3, 2026
**Status:** Approved — ready to execute
**Supersedes:** Nothing. Complements `DEVELOPMENT_PLAN.md` (which gets rewritten to v2.0 as Step 7).

---

## Decisions locked

| Decision | Choice | Consequence |
| --- | --- | --- |
| Form backend | **Resend** via Next.js route handler | Needs `RESEND_API_KEY` in `.env.local`. Full control of validation + UX. |
| Architecture | **Hybrid** | Pricing / FAQ / Contact stay as homepage sections. Only `/privacy`, `/terms` become routes now; `/blog` + `/services/[slug]` are Tier 2. |
| Sequence | **Tier 1 conversion trio first** | Routing fix → Contact → Pricing → FAQ → plan doc. |

---

## 0. Codebase facts this plan is built on

Established by reading the source, not assumed:

- **Content model:** everything lives in `src/data/site.ts` as one `siteConfig` object with `as const` and `satisfies` interface checks. New content extends this object — no new data files.
- **Section anatomy** (from `Services.tsx`, `Booking.tsx`): `"use client"` → `useRef<HTMLElement>` → `useScroll({ target, offset: ["start end", "end start"] })` → `<section id className="relative overflow-hidden border-b border-white/8 py-24 md:py-32" aria-labelledby>` → a `motion.div.glow-orb` → `.section-container.relative.z-10` → `<SectionHeading>` → `<RevealGroup>` + `<RevealItem>`.
- **Reveal preset discipline:** every section uses a *different* entrance so scrolling never repeats a gesture. Already taken: `flip` (Services), `drift` (Booking), spring pop (Expertise), `ScrollScene` blur-scale (Expertise wrapper).
  **Still unused and reserved for new sections:** `swing`, `clip-up`, `clip-left`, `rotate`, `scale-down`.
- **Orb colours** alternate by section: cyan (Services), orange (Booking). New sections continue the rotation.
- **Button** (`ui/Button.tsx`) already supports `type="submit"`, `onClick`, and `variant`. It renders `<button>` when no `href`. **No changes needed for the form.**
- **Reduced motion** is handled globally by `MotionProvider`'s `MotionConfig reducedMotion="user"` plus a CSS block in `globals.css`. New CSS animations must be added to that `@media (prefers-reduced-motion: reduce)` block.
- **Favicon is already done** — `src/app/icon.tsx` generates a lime "F" monogram. The unchecked box in `DEVELOPMENT_PLAN.md` §14 Phase 5 is stale.

---

## 1. Step 1 — Fix the routing blocker  ⚠️ **must land before any new route**

### The bug

`SmoothScrollProvider.tsx:65-85` attaches a **document-wide** click listener that matches `a[href^="#"]`, calls `preventDefault()`, and hands off to `lenis.scrollTo(...)`:

```ts
const target = document.querySelector(id);
if (!target) return;      // ← only guard
event.preventDefault();
```

On the homepage this is correct. On `/privacy`, `#services` does not exist in the DOM, so `document.querySelector` returns null and the handler bails — but `Navbar` still renders a `<Link href="#services">`, which Next resolves as *"stay on /privacy, set the hash"*. **Result: every nav link and the "Book Now" CTA silently do nothing on any non-home route.** The footer's Quick Links have the identical defect.

### The fix

Make nav hrefs origin-aware and route-safe.

1. **`src/data/site.ts`** — change `navLinks` from bare hashes to section ids:
   ```ts
   navLinks: [
     { label: "Home",     href: "/",           section: "home" },
     { label: "About",    href: "/#about",     section: "about" },
     …
   ]
   ```
   Adding `/#…` makes the link absolute: from `/privacy` it navigates home *and* scrolls; from `/` Next keeps it a same-page hash.

2. **`SmoothScrollProvider.tsx`** — widen the selector to catch `/#…` too, and only intercept when the target actually exists on the current page:
   ```ts
   const raw = anchor.getAttribute("href");
   const hash = raw?.startsWith("#") ? raw
              : raw?.startsWith("/#") ? raw.slice(1)
              : null;
   if (!hash || hash === "#") return;          // let Next handle real routes
   const target = document.querySelector(hash);
   if (!target) return;                        // cross-page → native nav
   event.preventDefault();
   lenis.scrollTo(target as HTMLElement, { … });
   ```

3. **Landing-with-hash scroll.** Arriving at `/#booking` from `/privacy` mounts the homepage with Lenis at scroll 0 and the browser's native hash jump suppressed by Lenis. Add a mount effect: if `window.location.hash` resolves to an element, `lenis.scrollTo(el, { immediate: false, offset: -80 })` after a frame.

4. **Navbar/Footer** consume the new `href` values — no structural change, they already `.map()` over `navLinks`.

**Verification:** from `/privacy`, click every nav link and "Book Now" → each lands on the right homepage section. On `/`, all links still ease smoothly with no full navigation.

---

## 2. Step 2 — Contact form (`#contact-form`)

The single biggest conversion leak: today the only paths to you are WhatsApp and Calendly. Anyone not ready to book a call has **no** way to reach you.

### Data — `site.ts`

```ts
contact: {
  title: "Send a Message",
  subtitle: "Not ready to book? Tell us your goal and we'll reply within 24 hours.",
  goals: ["Weight Loss", "Muscle Gain", "General Fitness", "Nutrition / Diet", "Other"],
  successMessage: "Thanks! We'll be in touch within 24 hours.",
  errorMessage: "Something went wrong. Please try WhatsApp or email us directly.",
}
```

### Server — `src/app/api/contact/route.ts`

- `POST` handler, `runtime = "nodejs"`.
- Validation **server-side** (never trust the client): name 2–80 chars, email via RFC-ish regex, goal ∈ allowlist, message 10–2000 chars.
- **Honeypot**: a visually-hidden `website` field. Non-empty → return `200 OK` and silently discard. Bots think they succeeded; no signal to tune against.
- **Rate limit**: in-memory `Map<ip, timestamps[]>`, 3 requests / 10 min. Documented as per-instance only — good enough for a portfolio, swap for Upstash if traffic grows.
- Resend send with `reply_to` set to the submitter so you can reply directly from your inbox.
- Return typed `{ ok: true }` or `{ ok: false, error }`. **Never** leak the Resend error to the client.
- If `RESEND_API_KEY` is absent, log a warning and return a clear 503 — the site must still build and run without the key.

### Client — `src/components/sections/Contact.tsx`

- Follows the standard section anatomy. **Preset: `swing`** (unused). **Orb: lime**, left side.
- `useState` form state, `status: "idle" | "submitting" | "success" | "error"`.
- Inline per-field errors, mirroring server rules so users get instant feedback.
- Submit button reuses `<Button type="submit">` wrapped in `<Magnetic>`, consistent with Booking.
- **Accessibility (matches the site's existing bar):** every input has a real `<label>`; errors wired via `aria-describedby` + `aria-invalid`; the status region is `role="status" aria-live="polite"`; the honeypot is `aria-hidden` with `tabIndex={-1}`.
- Success state replaces the form with a confirmation card + WhatsApp fallback link.

### Env

`.env.example` committed with `RESEND_API_KEY=` and `CONTACT_TO_EMAIL=`; real values in `.env.local` (already gitignored).

---

## 3. Step 3 — Pricing section (`#pricing`)

No pricing = visitors assume expensive and bounce. Every competitor shows tiers or "from $X".

### Data — `site.ts`

```ts
pricing: {
  title: "Plans & Pricing",
  subtitle: "Straightforward plans. No lock-in, cancel anytime.",
  note: "All plans include a free 15-minute intro call.",
  currency: "$",
  plans: [
    { id, name, price, period, description,
      features: string[], featured: boolean, ctaLabel, ctaHref },
  ],
}
```

Three placeholder tiers — **Starter / Pro (featured) / Elite** — with `featured: true` on the middle one, following the standard anchoring pattern.

### Component — `src/components/sections/Pricing.tsx`

- **Preset: `clip-up`** (unused). **Orb: orange**, right side.
- 1 → 3 responsive grid, reusing `<Card>` + `<TiltCard>`.
- Featured tier: lime border, `lg:scale-105`, and a "Most Popular" pill.
- Feature lists use `<Check>` from lucide (already a dependency), lime icons.
- Each CTA routes to `#booking` or `#contact-form`.
- Placed **immediately before `<Booking />`** so pricing answers "how much?" right as the booking CTA appears.
- **JSON-LD:** extend the existing `Person` schema's `makesOffer` in `layout.tsx` with real `priceSpecification` entries — free rich-result eligibility.

---

## 4. Step 4 — FAQ section (`#faq`)

Kills the objections that silently stop bookings.

### Data — `site.ts`

8 placeholder Q&As covering the real blockers: beginner-friendliness, equipment needed, time-to-results, online-vs-in-person, diet restrictions, rescheduling, payment methods, cancellation.

### Component — `src/components/sections/FAQ.tsx`

- **Preset: `rotate`** (unused). **Orb: cyan**, left side.
- Accordion built with `AnimatePresence` + `motion.div` animating `height: auto` — Motion is already a dependency, no new package.
- **Accessibility:** `<button aria-expanded aria-controls>` per item, panel `role="region" aria-labelledby`. Chevron rotates 180°, full keyboard support.
- Single-open behaviour (opening one closes the rest).
- **JSON-LD `FAQPage` schema** — this is what wins the expanded FAQ rich result in Google. Emitted as a second `<script type="application/ld+json">` in the FAQ component itself.

---

## 5. Step 5 — Legal routes `/privacy` + `/terms`

Legally required the moment the contact form collects data, and mandatory for Meta/Google ad accounts.

- `src/app/privacy/page.tsx` and `src/app/terms/page.tsx`.
- A shared `src/components/layout/LegalPage.tsx` shell: `section-container`, prose styling, back-to-home link, `py-32` to clear the sticky navbar.
- Per-route `metadata` with `robots: { index: true }`.
- Content: honest placeholder covering what the form collects (name, email, goal, message), that it's sent via Resend, that no data is sold, plus contact-for-deletion. Clearly marked **"Placeholder — review with a legal professional before launch."**
- **`sitemap.ts` gets both routes** (currently returns only the homepage).
- Footer gains a legal row linking both.

**This is the first real test of the Step 1 routing fix.**

---

## 6. Step 6 — Wire it together

- `src/app/page.tsx` section order becomes:
  `Hero → Marquee → About → Services → Expertise → OnlineClasses → Pricing → Booking → Testimonials → FAQ → Contact`
  Rationale: value → proof → price → book, then FAQ to catch the hesitant, then the form as the final catch-all.
- `navLinks` gains **Pricing** and **FAQ**. Desktop nav is at 6 items already; at 8 it needs a tightened gap (`gap-6`) to avoid crowding at `lg`. Mobile drawer is a vertical stack and scales fine.
- Footer Quick Links pick both up automatically via `.map()`.
- `npx tsc --noEmit` and `npm run build` must both pass clean.

---

## 7. Step 7 — Rewrite `DEVELOPMENT_PLAN.md` to v2.0

The plan has drifted from the code and will mislead the next person:

| § | Defect | Fix |
| --- | --- | --- |
| 7.1, 7.2 | Lists **GSAP** as motion Layer 2 and cites `power3.out`, contradicting §5.1 which says GSAP was dropped | Rewrite the layer stack as Lenis → Motion → R3F |
| 12 | Lists `lib/gsap.ts` + `tailwind.config.ts` — neither exists (Tailwind 4 is CSS-first). Omits ~15 shipped components | Regenerate the tree from the real `src/` |
| 15.1 | "Minimize GSAP plugins to ScrollTrigger only" | Delete |
| 20.1 | Deps stale: Next 14 / React 18 / Three 0.16 vs. actual Next 15.3 / React 19.1 / Three 0.185 | Sync to `package.json` |
| 20.2 | Shows a `tailwind.config.ts` snippet | Replace with the real `@theme` block from `globals.css` |
| 14 P5 | Favicon unchecked, but `icon.tsx` ships | Check it |
| 1.2 | Scope table says contact form is out of scope | Move to in-scope |
| 17 | Contact form / pricing / before-after listed as v2 | Promote to v1; add the Tier 2/3 roadmap |

Plus: a new **§21 Post-v1 Roadmap** carrying the Tier 2 and Tier 3 backlog (lead magnet, blog, service detail pages, Calendly embed, video, transformation gallery, analytics, PWA, i18n, BMI calculator, cookie consent, 404 page).

---

## 8. Deliberately NOT in this pass

Named so nothing looks forgotten:

| Item | Tier | Why deferred |
| --- | --- | --- |
| Transformation gallery | 1 | Needs real client photos + written consent. Structure ships, content can't. |
| Analytics | 1 | 15-min task once you pick Vercel Analytics vs. Plausible vs. GA4. |
| Blog | 2 | Largest single effort; needs MDX + a content pipeline. |
| `/services/[slug]` pages | 2 | Depends on real per-service copy from you. |
| Calendly inline embed | 2 | Straightforward, but adds ~90KB — worth measuring against the link-out first. |
| Lead magnet | 2 | Needs the actual PDF asset. |
| Cookie consent | 3 | Only required once analytics ships. |

---

## 9. Risks

| Risk | Mitigation |
| --- | --- |
| Routing fix breaks working homepage anchors | Fix and verify Step 1 in isolation before any route exists |
| Two new sections make the page too long | Both sit late (post-Booking); Hero→Booking path stays as short as today |
| Resend key missing in dev/CI | Route degrades to a clean 503; build never depends on the key |
| In-memory rate limit resets per instance | Documented; honeypot is the primary spam defence |
| 8 nav items crowd the desktop bar | Tighten to `gap-6` at `lg`; verified at 1024px |
| Placeholder legal text mistaken for real | Explicit warning banner in-page and in the doc |

---

## 10. Execution order

```
1. Routing fix (site.ts navLinks + SmoothScrollProvider + hash-on-load)   ← blocker
2. Contact  — data → api/contact/route.ts → Contact.tsx → .env.example
3. Pricing  — data → Pricing.tsx → JSON-LD offers
4. FAQ      — data → FAQ.tsx → FAQPage JSON-LD
5. Legal    — LegalPage.tsx → /privacy → /terms → sitemap → footer
6. Wire     — page.tsx order, navLinks, tsc --noEmit, npm run build
7. Docs     — DEVELOPMENT_PLAN.md v2.0
```

Each step leaves the site in a working, buildable state.
