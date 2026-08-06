# FitPro Studio — Fitness Web Portfolio

Animated single-page fitness portfolio built with Next.js 15, TypeScript,
Tailwind 4, Three.js (React Three Fiber), Motion, and Lenis.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Windows note.** Do not run `npm run build` while `npm run dev` is live —
> both write to `.next` and the file lock corrupts it. Stop the dev server
> first. To verify a production build, use `npx next start -p 3939`.

## Project Structure

```text
src/
├── app/                    # App Router: page, layout, legal routes, API
│   ├── api/contact/        # Contact form handler (Resend)
│   ├── not-found.tsx       # Custom 404
│   ├── error.tsx           # Route error boundary
│   ├── global-error.tsx    # Root layout error boundary
│   ├── manifest.ts         # Web app manifest
│   └── icon.tsx / apple-icon.tsx
├── components/
│   ├── layout/             # Navbar, Footer, WhatsAppButton
│   ├── sections/           # Hero, Services, Pricing, Booking, FAQ, Contact…
│   ├── motion/             # Reveal presets, parallax, magnetic, tilt
│   ├── providers/          # MotionConfig + Lenis smooth scroll
│   ├── three/              # R3F hero scene
│   └── ui/                 # Button, Card, Modal, SectionHeading, Counter
├── data/
│   └── site.ts             # ALL content and links — single source of truth
└── lib/
    ├── analytics.ts        # Provider-agnostic conversion event layer
    ├── planIntent.ts       # Carries pricing-plan choice to the contact form
    └── utils.ts            # cn() + getWhatsAppLink()
```

## Updating Content

Everything editable lives in [`src/data/site.ts`](./src/data/site.ts) — brand,
links, services (including the long-form detail shown in the "Learn More"
dialog), pricing, FAQ, and testimonials. No component needs touching.

## Remaining Integrations

These are the only steps between the current build and a fully live site.

### 1. Contact form email (required)

The form validates, rate-limits, and blocks bots today, but cannot send mail
until Resend is configured. Without it the API returns 503 and the UI falls
back to WhatsApp and email — leads are not lost, but they do not arrive by
mail.

```bash
cp .env.example .env.local
# then set RESEND_API_KEY, and CONTACT_FROM_EMAIL once a domain is verified
```

### 2. Analytics provider (15 minutes)

Every conversion click already calls `trackEvent()` — Calendly bookings,
WhatsApp taps, Instagram clicks, pricing CTAs, service-detail opens, and form
submissions. No provider is loaded, so the calls currently no-op (they log to
the console in development).

To start collecting, add **one** provider script to `app/layout.tsx`; the
existing call sites need no changes:

- **Vercel Analytics** — `npm i @vercel/analytics`, render `<Analytics />`
- **Plausible** — add the script tag with your domain
- **GA4** — add the gtag.js snippet

### 3. Real 15-minute Calendly event (optional)

Only a 30-minute event exists, so the booking section offers 30 minutes plus a
WhatsApp route. To restore a 15-minute option, create the event and split
`siteConfig.calendly.consultation15`.

### 4. Class preview video (optional)

The play button opens a dialog that currently explains the clip is being
filmed. Set `siteConfig.classes.video.url` to a YouTube/Vimeo **embed** URL or
an `.mp4` and it plays instead.

### 5. Before launch

- Replace placeholder pricing with real figures
- Set `siteConfig.brand.url` to the real domain (feeds metadata, sitemap, JSON-LD)
- Replace placeholder testimonials with real, consented ones
- Have `/privacy` and `/terms` reviewed
- Add real imagery to `public/images/` (trainer photo is a placeholder)

## Development Plan

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the full specification and
the prioritised post-v1 roadmap.
