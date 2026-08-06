# FitPro Studio — Fitness Web Portfolio

## Development Plan & Specification

**Version:** 2.0  
**Date:** August 3, 2026  
**Status:** Tier 1 (conversion) complete — placeholder content phase  
**Primary goal:** Animated, motion-first fitness portfolio with Three.js, Calendly booking, contact capture, and social contact integration.

> **v2.0 changes.** Synced to the shipped code: GSAP references removed (Motion
> replaced it), dependency list and file tree regenerated from source, and the
> contact form, pricing, and FAQ promoted from "future" to shipped v1 features.
> Post-v1 roadmap added as §21. Execution detail for the Tier 1 work lives in
> `EXECUTION_PLAN.md`.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Success Criteria](#2-goals--success-criteria)
3. [Target Audience](#3-target-audience)
4. [Feature Requirements](#4-feature-requirements)
5. [Tech Stack](#5-tech-stack)
6. [Design System & Theme](#6-design-system--theme)
7. [Animation & Motion Strategy](#7-animation--motion-strategy)
8. [Three.js Implementation Plan](#8-threejs-implementation-plan)
9. [Site Architecture & Sections](#9-site-architecture--sections)
10. [Integrations](#10-integrations)
11. [Placeholder Content Map](#11-placeholder-content-map)
12. [File & Folder Structure](#12-file--folder-structure)
13. [Component Breakdown](#13-component-breakdown)
14. [Development Phases & Timeline](#14-development-phases--timeline)
15. [Performance & Accessibility](#15-performance--accessibility)
16. [SEO & Launch Checklist](#16-seo--launch-checklist)
17. [Future Enhancements](#17-future-enhancements)
18. [Open Items / Client Input Needed Later](#18-open-items--client-input-needed-later)
19. [Risk & Mitigation](#19-risk--mitigation)
20. [Appendix](#20-appendix)
21. [Post-v1 Roadmap](#21-post-v1-roadmap)

---



## 1. Project Overview



### 1.1 Description

A single-page, scroll-driven **fitness web portfolio** for a personal trainer / nutritionist. The site showcases services (diet plans, exercises, online classes, 1-on-1 consultancy), drives bookings via **Calendly**, and provides quick contact via **WhatsApp** and **Instagram**.

The experience must feel like a premium **fitness mobile/web app**: dark theme, neon accents, smooth scroll, scroll-triggered animations, and **Three.js** 3D visuals in the hero and subtle background elements.

### 1.2 Scope (v1)


| In scope                             | Out of scope (v1)          |
| ------------------------------------ | -------------------------- |
| Single-page portfolio + legal routes | User login / member portal |
| Placeholder branding                 | E-commerce / payments      |
| Calendly links                       | Custom booking backend     |
| WhatsApp & Instagram links           | Full CMS                   |
| Animated UI + Three.js hero          | Native mobile app          |
| Responsive (mobile, tablet, desktop) | Blog with admin panel      |
| Contact form (Resend)                | Transformation gallery     |
| Pricing tiers                        | Lead magnet / email list   |
| FAQ accordion                        | Service detail pages       |
| Privacy Policy & Terms               | Analytics                  |




### 1.3 Brand Placeholder

All copy and links use placeholders until client finalizes:

- **Brand name:** FitPro Studio
- **Tagline:** Transform Your Body. Elevate Your Life.

---



## 2. Goals & Success Criteria



### 2.1 Business Goals

- Present services clearly (diet, exercises, online classes, consultancy).
- Convert visitors to **15 min / 30 min Calendly bookings**.
- Enable instant contact via **WhatsApp**.
- Build trust via professional design, motion, and social presence (Instagram).



### 2.2 UX Goals

- First impression: **premium, energetic, fitness-focused**.
- Continuous **flow** via smooth scroll and section transitions.
- Every section animates in on scroll (stagger, parallax, fade).
- CTAs visible and animated (pulse, glow, hover scale).



### 2.3 Technical Success Criteria


| Metric                                     | Target |
| ------------------------------------------ | ------ |
| Lighthouse Performance (mobile)            | ≥ 70   |
| Lighthouse Accessibility                   | ≥ 90   |
| First Contentful Paint                     | < 2.5s |
| Works on Chrome, Safari, Firefox, Edge     | Yes    |
| `prefers-reduced-motion` respected         | Yes    |
| Calendly / WhatsApp / Instagram functional | Yes    |


---



## 3. Target Audience

- Adults seeking **weight loss**, **muscle gain**, or **general fitness**.
- Clients interested in **nutrition / diet plans**.
- Remote users for **online fitness classes**.
- People wanting a **quick consultation** before committing.

**Placeholder positioning:** Online + 1-on-1 coaching for beginners to intermediate levels.

---



## 4. Feature Requirements



### 4.1 Functional Requirements


| ID  | Feature                             | Priority | Notes                                                 |
| --- | ----------------------------------- | -------- | ----------------------------------------------------- |
| F1  | Hero with 3D scene                  | P0       | Three.js via R3F                                      |
| F2  | Smooth scroll                       | P0       | Lenis                                                 |
| F3  | Scroll-triggered section animations | P0       | Motion `whileInView` + `useScroll`                    |
| F4  | Services section (4 cards)          | P0       | Diet, Exercises, Classes, Consultancy                 |
| F5  | Expertise tags                      | P0       | Fitness, Health, Nutrition, Diet, Strength, Exercises |
| F6  | About / bio section                 | P0       | Photo, stats, credentials placeholder                 |
| F7  | Booking: 15 min consultation        | P0       | Calendly link or embed                                |
| F8  | Booking: 30 min consultation        | P0       | Calendly link or embed                                |
| F9  | Sticky WhatsApp button              | P0       | Floating action button                                |
| F10 | Instagram link (header + footer)    | P0       | External link                                         |
| F11 | Online classes teaser               | P1       | CTA to WhatsApp or Calendly                           |
| F12 | Testimonials carousel               | P1       | 3 placeholder quotes                                  |
| F13 | Marquee / ticker text               | P1       | Brand keywords scroll                                 |
| F14 | Mobile navigation menu              | P0       | Hamburger + animated drawer                           |
| F15 | Central config for placeholders     | P0       | Single `site.ts` file                                 |
| F16 | Contact form                        | P0       | Resend via `/api/contact`; honeypot + rate limit      |
| F17 | Pricing tiers (3)                   | P0       | Starter / Pro (featured) / Elite                      |
| F18 | FAQ accordion (8 items)             | P0       | Single-open; emits `FAQPage` JSON-LD                  |
| F19 | Privacy Policy & Terms routes       | P0       | Required once the form collects data                  |
| F20 | Route-safe anchor navigation        | P0       | `/#section` links work from any route                 |




### 4.2 Non-Functional Requirements

- **Performance:** Lazy-load 3D; compress images; code-split.
- **Accessibility:** Semantic HTML, alt text, keyboard nav, reduced motion.
- **Maintainability:** All placeholder content in one config file.
- **Deployability:** Static export or SSR on Vercel/Netlify.

---



## 5. Tech Stack



### 5.1 Core


| Layer            | Technology                | Version (actual) | Purpose                                             |
| ---------------- | ------------------------- | ---------------- | --------------------------------------------------- |
| Framework        | **Next.js** (App Router)  | 15.5             | Routing, SEO, deployment                            |
| Language         | **TypeScript**            | 5.8              | Type safety                                         |
| UI runtime       | **React**                 | 19.1             | Components                                          |
| Styling          | **Tailwind CSS**          | 4.1              | CSS-first `@theme` config — no `tailwind.config.ts` |
| 3D               | **Three.js**              | 0.185            | 3D rendering                                        |
| 3D React         | **@react-three/fiber**    | 9.7              | React integration                                   |
| 3D Helpers       | **@react-three/drei**     | 10.7             | Cameras, controls, loaders                          |
| Animation        | **Motion** (`motion/react`) | 12+            | Scroll reveals, scrubbing, micro-interactions       |
| Smooth scroll    | **Lenis**                 | 1+               | Smooth scrolling                                    |
| Icons            | **Lucide React**          | 0.511            | UI icons                                            |
| Fonts            | **next/font** (Google)    | —                | Bebas Neue, Inter                                   |

> **Stack decision (v1.1):** GSAP + ScrollTrigger was dropped. Motion's
> `useScroll`/`useTransform` covers scroll-scrubbed animation natively, is
> React 19 ready, and removes ~70KB plus a second competing scroll system
> alongside Lenis. Framer Motion is now published as `motion` — the old
> `framer-motion` package name is legacy.




### 5.2 External Services


| Service       | Usage                 |
| ------------- | --------------------- |
| **Calendly**  | 15 & 30 min booking   |
| **WhatsApp**  | `wa.me` deep link     |
| **Instagram** | Profile URL           |
| **Vercel**    | Hosting (recommended) |




### 5.3 Alternative Stack (if preferred)

- **Vite + React** instead of Next.js (lighter, no SSR).
- Trade-off: slightly more manual SEO setup.

**Recommendation:** Next.js for portfolio SEO and easy deployment.

---



## 6. Design System & Theme



### 6.1 Color Palette

```css
/* Primary theme — Fitness app dark mode */
--color-bg-primary:     #0A0A0F;
--color-bg-secondary:   #12121A;
--color-bg-elevated:    #1A1A26;
--color-accent-primary: #39FF14;   /* Electric lime */
--color-accent-secondary: #00D4FF; /* Cyan */
--color-accent-cta:     #FF6B35;   /* Orange — primary buttons */
--color-text-primary:   #FFFFFF;
--color-text-secondary: #8B8B9E;
--color-text-muted:     #5A5A6E;
--color-border:         rgba(255, 255, 255, 0.08);
--color-glass:          rgba(255, 255, 255, 0.05);
```



### 6.2 Typography


| Role            | Font                | Weight  | Size (desktop) |
| --------------- | ------------------- | ------- | -------------- |
| H1 Hero         | Bebas Neue          | 400     | 72–96px        |
| H2 Section      | Bebas Neue / Oswald | 400–600 | 48–56px        |
| H3 Card title   | Inter               | 600     | 20–24px        |
| Body            | Inter               | 400     | 16–18px        |
| Caption / pills | Inter               | 500     | 12–14px        |
| Stats numbers   | Bebas Neue          | 400     | 48–64px        |




### 6.3 Spacing & Layout

- **Max content width:** 1280px (`max-w-7xl`)
- **Section padding:** `py-24 md:py-32`
- **Horizontal padding:** `px-4 md:px-8 lg:px-12`
- **Grid:** 12-column; services 1 → 2 → 4 cols responsive



### 6.4 Component Styles



#### Buttons

- **Primary CTA:** Orange gradient, glow on hover, scale 1.05
- **Secondary:** Outline lime, fill on hover
- **Ghost:** Text + arrow slide on hover



#### Cards (Services)

- Background: `#12121A` + `backdrop-blur`
- Border: 1px `rgba(255,255,255,0.08)`
- Hover: border glow accent, translateY -8px, shadow



#### Glass panels

```css
background: rgba(18, 18, 26, 0.6);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
```



### 6.5 Imagery Style

- High contrast fitness photography (when real assets provided)
- Dark overlays on hero images (60–70% opacity)
- Placeholder: dark blocks with accent text until photos ready

---



## 7. Animation & Motion Strategy



### 7.1 Motion Hierarchy

```
Layer 1: Lenis          → Global smooth scroll + anchor easing
Layer 2: Motion         → Section reveals, scroll scrubbing, parallax,
                          micro-interactions (one system, not two)
Layer 3: R3F / Three.js → 3D hero & ambient effects
Layer 4: CSS keyframes  → Marquee, grain, pulse rings, ambient float
```

> GSAP is **not** used. Motion's `useScroll`/`useTransform` covers scroll-scrubbed
> animation natively, avoiding a second scroll system competing with Lenis.



### 7.2 Global Animation Rules

1. **Duration:** 0.7–1.3s for section enters; 0.2–0.4s for hovers
2. **Easing:** house curves live in `components/motion/variants.ts` —
   `EASE_OUT_EXPO [0.16, 1, 0.3, 1]` for entrances, `EASE_SOFT [0.25, 0.1, 0.25, 1]`
   for opacity/scroll-linked work, `EASE_BACK` for overshoot
3. **Stagger:** 0.06–0.2s between child elements
4. **One gesture per section** — every section uses a *different* `RevealPreset`
   so scrolling never repeats the same entrance twice in a row
5. **Compositor only** — variants animate transform/opacity/filter/clipPath,
   never layout-triggering properties
6. **Never block interaction** — animations are decorative, not gates
7. **Reduced motion:** `MotionConfig reducedMotion="user"` strips transforms
   globally; CSS loops are disabled in the `prefers-reduced-motion` block

**Preset allocation** (from `variants.ts`) — keeps entrances unique:

| Section  | Preset      | Section | Preset               |
| -------- | ----------- | ------- | -------------------- |
| Services | `flip`      | Pricing | `clip-up`            |
| Booking  | `drift`     | FAQ     | `rotate`             |
| Contact  | `swing`     | Expertise | spring pop + `ScrollScene` |

Still unclaimed for future sections: `clip-left`, `scale-down`, `blur-scale`.



### 7.3 Section Animation Spec


| Section      | Enter animation                 | Scroll behavior            | Hover                 |
| ------------ | ------------------------------- | -------------------------- | --------------------- |
| Navbar       | Fade down on load               | Solid bg after 80px scroll | Link underline slide  |
| Hero         | H1 word stagger, CTA scale      | 3D parallax on mouse move  | CTA glow pulse        |
| Marquee      | Infinite horizontal scroll      | —                          | —                     |
| About        | Split: left slide X, right fade | Image parallax 10%         | Stat counter count-up |
| Services     | Cards stagger Y 60px → 0        | —                          | Lift + border glow    |
| Expertise    | Pills scale 0.8 → 1 stagger     | —                          | Pill color invert     |
| Classes      | Fade + scale video thumb        | —                          | Play button pulse     |
| Booking      | Fade up + blur clear            | Optional pin               | Button scale          |
| Testimonials | Horizontal auto-scroll          | —                          | Pause on hover        |
| Footer       | Fade up                         | —                          | Icon bounce           |
| WhatsApp FAB | Bounce in after 2s              | Fixed                      | Pulse ring            |




### 7.4 Loader (Optional v1)

- Duration: 1.5s max
- Logo pulse → progress bar → fade to hero
- Skip if `prefers-reduced-motion` or slow connection

---



## 8. Three.js Implementation Plan



### 8.1 Philosophy

Use 3D **purposefully** — hero impact + ambient depth. Avoid heavy models on mobile.

### 8.2 Hero Scene (P0)

**Option A (recommended for v1):** Abstract energy sphere

- Icosahedron mesh with wireframe + emissive lime material
- Slow Y-axis rotation
- Mouse parallax (camera slight shift)
- Particle field (500–1000 points, accent colors)

**Option B (v2):** GLTF dumbbell or human silhouette

- Requires optimized model (< 500KB)
- Draco compression



### 8.3 Background Ambient (P1)

- Subtle gradient mesh or noise shader behind sections
- Opacity 0.15–0.25 so text stays readable



### 8.4 Performance Rules

```typescript
// Pseudocode strategy
- Dynamic import R3F canvas (ssr: false)
- Suspense fallback: static gradient
- dpr={[1, 1.5]} on mobile, [1, 2] on desktop
- frameloop="demand" when hero off-screen (optional)
- Dispose geometries/materials on unmount
```



### 8.5 Fallback States


| Condition                     | Fallback                        |
| ----------------------------- | ------------------------------- |
| WebGL unsupported             | CSS gradient + SVG illustration |
| `prefers-reduced-motion`      | Static gradient blob            |
| Slow device (optional detect) | Particles only, no mesh         |


---



## 9. Site Architecture & Sections



### 9.1 Information Architecture

```text
/ (single page, anchor navigation)
├── #home          Hero
├── #about         About trainer
├── #services      Services grid
├── #expertise     Specializations
├── #classes       Online classes
├── #pricing       Plans & pricing      ← answers "how much?" before the CTA
├── #booking       Calendly
├── #testimonials  Social proof
├── #faq           Objection handling
├── #contact-form  Contact form         ← catches visitors not ready to book
└── #contact       Footer + links

/privacy           Privacy Policy       (static route)
/terms             Terms of Service     (static route)
/api/contact       Form handler         (POST, Node runtime)
```

**Section order rationale:** establish value → price → book → prove → clear
objections → capture everyone still undecided. Pricing sits immediately before
Booking so the cost question is answered exactly when the CTA appears.

**Anchor navigation is route-safe.** Nav links use `/#section`, not `#section`.
From `/` they are intercepted by `SmoothScrollProvider` and eased; from
`/privacy` the target is absent from the DOM, interception bails, and Next
performs a real navigation home where a landing effect scrolls to the section.



### 9.2 Section Content Spec



#### 9.2.1 Navbar

- Logo: FitPro Studio (text or placeholder SVG)
- Links: Home, About, Services, Classes, Book, Contact
- CTA button: "Book Now" → `#booking`
- Instagram icon → external
- Mobile: hamburger → full-screen overlay menu with stagger links



#### 9.2.2 Hero

- Headline: "Transform Your Body. Elevate Your Life."
- Subhead: 1-line value prop
- CTAs: "Book Consultation" + "View Services"
- 3D canvas: right 50% desktop, background mobile
- Scroll indicator: animated chevron bounce



#### 9.2.3 Marquee

- Infinite scroll text:
`STRENGTH • NUTRITION • DISCIPLINE • RESULTS • FITNESS • HEALTH •`



#### 9.2.4 About

- Trainer photo placeholder
- Bio paragraph (placeholder)
- Stats row: `500+ Clients` | `10+ Years` | `1000+ Sessions`
- Credential badges (placeholder): Certified Trainer, Nutrition Specialist



#### 9.2.5 Services (4 cards)

1. **Diet Plans** — Custom meal plans for your goals
2. **Exercise Programs** — Strength, HIIT, mobility
3. **Online Fitness Classes** — Live & on-demand
4. **1-on-1 Consultancy** — Personalized coaching

Each card: icon, title, description, "Learn More" → scroll to booking

#### 9.2.6 Expertise

Pill grid: Fitness · Health · Nutrition · Diet · Strength Training · Exercises

Optional: short description under each on hover/expand

#### 9.2.7 Online Classes

- Headline + short description
- Schedule placeholder: "Mon/Wed/Fri — 7:00 PM"
- CTA: "Join a Class" → WhatsApp or Calendly



#### 9.2.8 Booking

- Headline: "Book Your Consultation"
- Two prominent buttons:
  - **15 Minutes** — Quick goal review
  - **30 Minutes** — Deep dive + plan outline
- Calendly inline embed OR modal popup on button click
- Note: "All sessions conducted online via video call"



#### 9.2.9 Testimonials

- 3 cards, auto-scroll carousel
- Placeholder names + quotes + star rating



#### 9.2.10 Footer / Contact

- Brand name + tagline
- Links: Services, Booking, Instagram
- Email placeholder
- Copyright © 2026 FitPro Studio
- Social: Instagram, WhatsApp



#### 9.2.11 WhatsApp FAB

- Fixed bottom-right, z-index above all
- Green WhatsApp icon with pulse ring
- Tooltip on hover: "Chat with us"

---



## 10. Integrations



### 10.1 Calendly

**Approach v1:** Link buttons opening Calendly in new tab or embed widget.

```typescript
// Placeholder URLs in site.ts
calendly: {
  consultation15: "https://calendly.com/fitprostudio/15min-consultation",
  consultation30: "https://calendly.com/fitprostudio/30min-consultation",
}
```

**Embed option:**

```html
<!-- Inline widget in #booking section -->
<div class="calendly-inline-widget"
     data-url="https://calendly.com/fitprostudio/30min-consultation"
     style="min-width:320px;height:700px;">
</div>
<script src="https://assets.calendly.com/assets/external/widget.js" async></script>
```



### 10.2 WhatsApp

```typescript
whatsapp: {
  number: "923000000000", // no + or spaces in path
  defaultMessage: "Hi FitPro Studio! I'm interested in your fitness services.",
  link: "https://wa.me/923000000000?text=Hi%20FitPro%20Studio!%20I'm%20interested%20in%20your%20fitness%20services."
}
```



### 10.3 Instagram

```typescript
social: {
  instagram: "https://instagram.com/fitprostudio",
  instagramHandle: "@fitprostudio"
}
```

---



## 11. Placeholder Content Map

**Single source of truth:** `src/data/site.ts`

```typescript
export const siteConfig = {
  brand: {
    name: "FitPro Studio",
    tagline: "Transform Your Body. Elevate Your Life.",
    description: "Certified fitness coach & nutrition specialist...",
    email: "hello@fitprostudio.com",
  },
  social: {
    instagram: "https://instagram.com/fitprostudio",
    instagramHandle: "@fitprostudio",
    whatsapp: {
      number: "923000000000",
      message: "Hi FitPro Studio! I'm interested in your fitness services.",
    },
  },
  calendly: {
    consultation15: "https://calendly.com/fitprostudio/15min-consultation",
    consultation30: "https://calendly.com/fitprostudio/30min-consultation",
  },
  services: [ /* 4 items */ ],
  expertise: [ "Fitness", "Health", "Nutrition", "Diet", "Strength Training", "Exercises" ],
  stats: [
    { value: 500, suffix: "+", label: "Clients Trained" },
    { value: 10, suffix: "+", label: "Years Experience" },
    { value: 1000, suffix: "+", label: "Sessions Completed" },
  ],
  testimonials: [ /* 3 items */ ],
  classes: {
    schedule: "Monday, Wednesday, Friday — 7:00 PM PKT",
    description: "Join live online sessions from anywhere.",
  },
};
```

**Replacement process (post-finalization):**
Edit only `site.ts` + swap image files in `public/images/`.

---



## 12. File & Folder Structure

Regenerated from source at v2.0. No `tailwind.config.ts` — Tailwind 4 is
CSS-first, themed via the `@theme` block in `globals.css`.

```text
fitness por/
├── public/
│   └── images/                   (empty — real assets pending §18)
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout, fonts, metadata, Person JSON-LD
│   │   ├── page.tsx              # Single-page section assembly
│   │   ├── globals.css           # Tailwind @theme + CSS variables + keyframes
│   │   ├── icon.tsx              # Generated favicon (lime "F" monogram)
│   │   ├── opengraph-image.tsx   # Generated 1200x630 OG image
│   │   ├── robots.ts
│   │   ├── sitemap.ts            # /, /privacy, /terms
│   │   ├── api/contact/route.ts  # Resend handler + honeypot + rate limit
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── WhatsAppButton.tsx
│   │   │   └── LegalPage.tsx     # Shared shell for /privacy + /terms
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── HeroHighlights.tsx
│   │   │   ├── Marquee.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Expertise.tsx
│   │   │   ├── OnlineClasses.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Booking.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── FAQ.tsx           # + FAQPage JSON-LD
│   │   │   └── Contact.tsx
│   │   ├── motion/
│   │   │   ├── variants.ts       # Preset vocabulary + easing curves
│   │   │   ├── Reveal.tsx        # Reveal / RevealGroup / RevealItem / MaskReveal
│   │   │   ├── AnimatedHeadline.tsx
│   │   │   ├── TextReveal.tsx
│   │   │   ├── Parallax.tsx      # Parallax + ScrollScene
│   │   │   ├── Magnetic.tsx
│   │   │   ├── TiltCard.tsx
│   │   │   └── ScrollProgress.tsx
│   │   ├── providers/
│   │   │   ├── MotionProvider.tsx        # Global MotionConfig
│   │   │   └── SmoothScrollProvider.tsx  # Lenis + route-safe anchor easing
│   │   ├── three/
│   │   │   ├── HeroCanvas.tsx
│   │   │   ├── HeroScene.tsx
│   │   │   ├── HeroSceneFallback.tsx
│   │   │   ├── HeroLabels.tsx
│   │   │   ├── Dumbbell.tsx
│   │   │   ├── EnergyRings.tsx
│   │   │   ├── ParticleField.tsx
│   │   │   ├── CameraRig.tsx
│   │   │   ├── SceneRig.tsx
│   │   │   └── useResponsiveFraming.ts
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── SectionHeading.tsx
│   │       └── AnimatedCounter.tsx
│   ├── hooks/
│   │   └── useReducedMotion.ts
│   ├── lib/
│   │   ├── utils.ts              # cn() + getWhatsAppLink()
│   │   └── webgl.ts              # WebGL support detection
│   └── data/
│       └── site.ts               # ALL placeholder content
├── DEVELOPMENT_PLAN.md           # This document
├── EXECUTION_PLAN.md             # Tier 1 execution detail
├── .env.example                  # RESEND_API_KEY, CONTACT_TO/FROM_EMAIL
├── README.md
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── package.json
└── tsconfig.json
```

---



## 13. Component Breakdown


| Component         | Responsibility                       | Animation               |
| ----------------- | ------------------------------------ | ----------------------- |
| `Navbar`          | Nav links, mobile menu, scroll state | Fade in, bg transition  |
| `Hero`            | Headline, CTAs, hosts 3D canvas      | Stagger text, CTA scale |
| `HeroScene`       | R3F Canvas wrapper                   | Mouse parallax          |
| `EnergySphere`    | 3D mesh + rotation                   | Continuous rotate       |
| `ParticleField`   | Background particles                 | Float animation         |
| `Marquee`         | Infinite text scroll                 | CSS keyframe loop       |
| `About`           | Bio, image, stats                    | Split reveal, counter   |
| `Services`        | 4 service cards                      | Stagger cards           |
| `Expertise`       | Pill tags                            | Scale stagger           |
| `OnlineClasses`   | Class info + CTA                     | Fade up                 |
| `Booking`         | Calendly buttons/embed               | Fade + pin optional     |
| `Testimonials`    | Quote carousel                       | Auto-scroll             |
| `Footer`          | Links, copyright                     | Fade up                 |
| `WhatsAppButton`  | FAB link                             | Pulse, bounce           |
| `Button`          | Reusable CTA                         | Hover scale/glow        |
| `AnimatedCounter` | Stat numbers                         | Count up on view        |
| `Pricing`         | 3 plan tiers + JSON-LD offers        | `clip-up` wipe, stagger |
| `FAQ`             | Accordion + `FAQPage` JSON-LD        | `rotate`, height auto   |
| `Contact`         | Form, validation, submit states      | `swing`                 |
| `LegalPage`       | Shared /privacy + /terms shell       | None (static)           |
| `Reveal` et al.   | Preset-driven scroll entrances       | See `variants.ts`       |
| `Magnetic`        | Cursor-attracted CTA wrapper         | Spring follow           |
| `TiltCard`        | Pointer-tilt card wrapper            | 3D rotate on hover      |
| `ScrollProgress`  | Top-of-page progress bar             | Scroll-linked scaleX    |


---



## 14. Development Phases & Timeline



### Phase 1 — Foundation (Days 1–3)

- [x] Initialize Next.js + TypeScript + Tailwind
- [x] Configure fonts (Bebas Neue, Inter)
- [x] Set up `globals.css` with theme CSS variables
- [x] Create `site.ts` with all placeholders
- [x] Build layout: Navbar, Footer, WhatsAppButton
- [x] Basic responsive grid

**Deliverable:** Static page skeleton, no animations.

---



### Phase 2 — Design & Static Sections (Days 4–6)

- [x] Hero layout (text + 3D placeholder area)
- [x] Marquee, About, Services, Expertise sections
- [x] Online Classes, Booking, Testimonials
- [x] Reusable Button, Card, SectionHeading
- [x] Mobile navigation drawer

**Deliverable:** Fully styled dark fitness theme, all content visible.

---



### Phase 3 — Three.js Hero (Days 7–9)

- [x] Install R3F, drei, three
- [x] Build EnergySphere + ParticleField
- [x] HeroScene with mouse parallax
- [x] Dynamic import (no SSR) + Suspense fallback
- [x] WebGL fallback for unsupported browsers
- [x] Mobile-optimized dpr and simplified scene
- [x] Scroll-reactive sphere (spin + recede tied to hero scroll progress)

**Deliverable:** Animated 3D hero working on desktop and mobile.

---



### Phase 4 — Motion & Scroll (Days 10–12)

- [x] Integrate Lenis smooth scroll (`SmoothScrollProvider`, eased anchor links)
- [x] Scroll reveals for all sections (`Reveal` / `RevealGroup` / `RevealItem`)
- [x] Motion for hovers and micro-interactions
- [x] AnimatedCounter for stats
- [x] Testimonials auto-scroll carousel (pause on hover/focus)
- [x] `useReducedMotion` hook + global `MotionConfig reducedMotion="user"`
- [x] Per-word masked headline reveal (`AnimatedHeadline`)
- [x] Magnetic CTA buttons (`Magnetic`)
- [x] Scroll-scrubbed hero parallax + About image parallax
- [x] Film-grain overlay + section ambient glow orbs

**Deliverable:** Full animated flow site-wide.

---



### Phase 5 — Integrations & Polish (Days 13–15)

- [x] Wire Calendly 15/30 min buttons (link-out; embed deferred per §19 risk)
- [x] WhatsApp FAB + footer link
- [x] Instagram header/footer links
- [x] SEO metadata + generated OG image (`opengraph-image.tsx`)
- [x] JSON-LD `Person` schema, `sitemap.ts`, `robots.ts`
- [x] Favicon (`app/icon.tsx` — generated lime "F" monogram)
- [ ] Lighthouse audit + performance fixes
- [ ] Cross-browser testing

**Deliverable:** Production-ready v1 with placeholders.

---

### Phase 5.5 — Conversion Layer (Tier 1)

Added at v2.0. Detail in `EXECUTION_PLAN.md`.

- [x] Route-safe anchor navigation (`/#section` + guarded Lenis interception)
- [x] Contact form — `/api/contact`, Resend, honeypot, rate limit, a11y states
- [x] Pricing section — 3 tiers + `priceSpecification` JSON-LD
- [x] FAQ accordion — 8 items + `FAQPage` JSON-LD
- [x] `/privacy` and `/terms` routes + sitemap + footer links
- [x] `.env.example` for Resend credentials
- [x] Typecheck, ESLint, and production build all pass
- [ ] Set `RESEND_API_KEY` and verify a live submission end-to-end
- [ ] Replace placeholder pricing with real figures
- [ ] Legal review of `/privacy` and `/terms` copy

**Deliverable:** The site can capture leads, not just display them.

---



### Phase 6 — Launch (Day 16)

- [ ] Deploy to Vercel
- [ ] Connect custom domain (when available)
- [ ] Final smoke test on real devices

---



## 15. Performance & Accessibility



### 15.1 Performance

- Dynamic import Three.js (`next/dynamic`, `ssr: false`)
- Image: Next.js `<Image>` with WebP
- Font: `next/font` with subset
- Lazy load below-fold sections if needed
- Reveal variants stay on transform/opacity/filter so entrances run on the GPU
- `will-animate` promotes animated wrappers; hover transitions are suppressed
  mid-scroll via `html.is-scrolling`

**Measured at v2.0** (`npm run build`): homepage 22.1 kB route / 185 kB First
Load JS; `/privacy` and `/terms` 106 kB; shared baseline 103 kB.



### 15.2 Accessibility

- Semantic HTML: `<header>`, `<main>`, `<section>`, `<footer>`
- All sections: `aria-labelledby` with visible headings
- Focus states on all interactive elements
- Skip to content link
- Alt text on all images
- WhatsApp/Instagram: `aria-label` on icon-only buttons
- Calendly iframe: title attribute
- Respect `prefers-reduced-motion: reduce`

---



## 16. SEO & Launch Checklist

- [x] `<title>`: FitPro Studio | Fitness Coach & Nutrition Specialist
- [x] Meta description
- [x] Open Graph: title, description, generated image (`opengraph-image.tsx`)
- [x] Twitter card meta
- [x] `robots.ts` + `sitemap.ts` (includes `/privacy`, `/terms`)
- [x] Structured data: `Person` + priced `Offer`s, plus `FAQPage` on the FAQ
- [x] Favicon (`app/icon.tsx`)
- [ ] apple-touch-icon (needs the real logo, §18 item 2)
- [ ] Per-route canonical URLs once the real domain is set
- [ ] HTTPS via Vercel
- [ ] Test link previews (WhatsApp, Instagram share debugger)
- [ ] Submit sitemap to Google Search Console

---



## 17. Future Enhancements (v2+)


Pricing table and contact form shipped in v1 (Phase 5.5) and have moved out of
this table. The full prioritised backlog is §21.

| Feature              | Description                            |
| -------------------- | -------------------------------------- |
| Real 3D model        | GLTF dumbbell / athlete silhouette     |
| Blog                 | Fitness tips, SEO content              |
| Multi-language       | English + Urdu                         |
| Before/after gallery | Transformation slider                  |
| Video background     | Looping workout clip in hero           |
| PWA                  | Add to home screen                     |
| Analytics dashboard  | Track Calendly clicks, WhatsApp taps   |
| CMS                  | Sanity or Contentful for non-dev edits |


---



## 18. Open Items / Client Input Needed Later

When ready to replace placeholders, provide:


| #   | Item                                     | Required for     |
| --- | ---------------------------------------- | ---------------- |
| 1   | Final brand / trainer name               | All copy         |
| 2   | Logo (SVG or PNG)                        | Navbar, favicon  |
| 3   | Professional photo                       | About section    |
| 4   | Real WhatsApp number                     | FAB + footer     |
| 5   | Real Instagram URL                       | Social links     |
| 6   | Calendly account + 15/30 min event URLs  | Booking          |
| 7   | Service descriptions (detailed)          | Services cards   |
| 8   | Credentials / certifications             | About section    |
| 9   | Testimonials (name, quote, photo)        | Testimonials     |
| 10  | Class schedule (real times)              | Online Classes   |
| 11  | Color preference (if changing lime/cyan) | Theme            |
| 12  | Reference websites you like              | Design tweaks    |
| 13  | Domain name                              | Launch           |
| 14  | Privacy policy + terms review            | Legal compliance |
| 15  | Real pricing for the 3 plans             | Pricing section  |
| 16  | Resend account + verified sending domain | Contact form     |
| 17  | Destination inbox for enquiries          | Contact form     |
| 18  | FAQ answer review (payment, cancellation)| FAQ section      |
| 19  | Before/after photos + written consent    | Transformation gallery |


---



## 19. Risk & Mitigation


| Risk                                    | Impact | Mitigation                                          |
| --------------------------------------- | ------ | --------------------------------------------------- |
| Three.js hurts mobile performance       | High   | Lazy load, low dpr, simplified mobile scene         |
| Calendly embed slow                     | Medium | Use link buttons instead of inline embed on mobile  |
| Too many animations feel sluggish       | Medium | Cap concurrent animations; test on mid-range phones |
| Placeholder content forgotten at launch | Low    | Central `site.ts` + checklist before go-live        |
| WebGL not supported                     | Low    | CSS gradient fallback                               |


---



## 20. Appendix



### 20.1 npm Dependencies (estimated)

Actual, synced with `package.json` at v2.0 (no GSAP, no `framer-motion` —
Framer Motion now ships as `motion`):

```json
{
  "dependencies": {
    "next": "^15.3.2",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "three": "^0.185.1",
    "@react-three/fiber": "^9.7.0",
    "@react-three/drei": "^10.7.7",
    "motion": "^12.43.0",
    "lenis": "^1.3.25",
    "lucide-react": "^0.511.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.0"
  },
  "devDependencies": {
    "typescript": "^5.8.3",
    "tailwindcss": "^4.1.7",
    "@tailwindcss/postcss": "^4.1.7",
    "@types/three": "^0.185.3",
    "eslint": "^9.27.0",
    "eslint-config-next": "^15.3.2"
  }
}
```

> The contact form calls the Resend REST API with `fetch`, so **no `resend`
> package is required**. Only `RESEND_API_KEY` in the environment.



### 20.2 Tailwind Theme (actual)

Tailwind 4 is CSS-first. There is **no `tailwind.config.ts`** — the theme is
declared in `src/app/globals.css` and generates utilities such as
`bg-bg-primary`, `text-accent-lime`, `font-display`:

```css
@import "tailwindcss";

@theme inline {
  --color-bg-primary: #0a0a0f;
  --color-bg-secondary: #12121a;
  --color-bg-elevated: #1a1a26;
  --color-accent-lime: #39ff14;
  --color-accent-cyan: #00d4ff;
  --color-accent-orange: #ff6b35;
  --color-text-primary: #ffffff;
  --color-text-secondary: #8b8b9e;
  --color-text-muted: #5a5a6e;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-glass: rgba(255, 255, 255, 0.05);

  --font-display: var(--font-bebas), sans-serif;
  --font-body: var(--font-inter), sans-serif;
}
```



### 20.3 Reference Inspiration

- Nike Training Club (dark, bold typography)
- Freeletics (energy, orange/green accents)
- Peloton web (premium dark UI)
- Awwwards fitness portfolio sites (scroll storytelling)

---



## 21. Post-v1 Roadmap

Prioritised by business return, benchmarked against competitor fitness sites.
Tier 1 shipped in Phase 5.5; what follows is what remains.

### 21.1 Tier 1 remainder — before launch

| # | Item | Why it matters | Blocker |
| - | ---- | -------------- | ------- |
| 1 | Transformation gallery | For fitness, before/after **is** the proof. Testimonials without visuals read as fabricated. | Real photos + written client consent |
| 2 | ~~Analytics~~ | **Shipped (v2.1).** Event layer in `lib/analytics.ts` with all conversion clicks wired. | Dropping a provider script into `layout.tsx` is now the whole integration |
| 3 | Real imagery | `public/images/` is empty. Trainer photo, hero background, OG image. | Client assets |
| 4 | Live form verification | Route is built, typechecked, and now falls back to WhatsApp/email on 503 — but has still never sent a real email. | `RESEND_API_KEY` + verified domain |
| 5 | Real 15-minute Calendly event | Only a 30-minute event exists, so the short option was removed rather than shipped as a link to the wrong duration. | Create the event, then split `calendly.consultation15` |
| 6 | Class preview video | The play button now opens a real dialog that is honest about the clip not existing yet. | Film the clip, set `classes.video.url` |
| 7 | Real domain | `siteConfig.brand.url` is still `fitprostudio.com`, which feeds metadata, sitemap, and JSON-LD. | Domain purchase |

### 21.2 Tier 2 — competitive gaps

| # | Item | Notes |
| - | ---- | ----- |
| 5 | Lead magnet (free PDF + email capture) | Converts the ~95% who will not book today. Standard on every coach site. |
| 6 | Service detail pages `/services/[slug]` | Four cards with one sentence each cannot sell a package. Needs per-service depth. |
| 7 | Blog `/blog/[slug]` | The entire SEO engine. A single page ranks for almost nothing. Largest single effort — needs MDX + content pipeline. |
| 8 | Calendly inline embed | Link-out loses ~20–30% at the tab switch. Adds ~90KB; lazy-load on click and measure against the current link. |
| 9 | Trainer intro video | Highest-trust asset available. The Classes section currently has no video at all. |
| 10 | Certification badge logos | Two text strings today. Competitors show NASM / ACE / ISSA marks. |
| 11 | Specific result stats | "500+ Clients" is generic. "Avg. 8kg lost in 12 weeks" converts. |

### 21.3 Tier 3 — polish & scale

| # | Item | Notes |
| - | ---- | ----- |
| 12 | Multi-language (English + Urdu) | Higher priority than it looks given the PKT-timezone market. |
| 13 | BMI / calorie calculator | Cheap interactive tool; strong dwell-time and SEO win. Common on gym sites. |
| 14 | Real class schedule data | Currently one hardcoded string; wants a calendar grid. |
| 15 | Newsletter signup | Footer capture. |
| 16 | `LocalBusiness` JSON-LD | Add alongside `Person` if a physical location exists. |
| 17 | Cookie consent banner | Required once analytics ships with EU traffic. |
| 18 | Custom 404 page | None exists — currently the Next.js default. |
| 19 | PWA / add to home screen | |
| 20 | CMS (Sanity / Contentful) | Only worth it once non-devs need to edit copy. |

---

## Document Control


| Version | Date       | Author           | Changes                                                                                          |
| ------- | ---------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| 1.0     | 2026-08-03 | Development Team | Initial plan with placeholders                                                                     |
| 2.0     | 2026-08-03 | Development Team | Synced to shipped code: GSAP references removed, deps and file tree regenerated, Phase 5.5 conversion layer added (contact form, pricing, FAQ, legal routes, route-safe anchors), §21 roadmap added |
| 2.1     | 2026-08-04 | Development Team | Functional pass: real Calendly/WhatsApp/Instagram/email credentials wired; dead CTAs replaced with working service-detail and class-video dialogs; plan-aware pricing CTAs; contact-form 503 fallback to WhatsApp/email; analytics event layer; 404, error, global-error and loading routes; manifest + apple-icon |


---

**End of document**