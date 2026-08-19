export interface Service {
  id: string;
  title: string;
  description: string;
  icon: "apple" | "dumbbell" | "user";
  /**
   * Anchor for the matching pricing category, so the modal can send a
   * convinced visitor straight to the tiers and prices for this service
   * rather than making them hunt for it.
   */
  planHref: string;
  /**
   * Long-form content shown in the service detail modal. "Learn More" used to
   * scroll to the booking section, which promised depth the page never
   * delivered — this is that depth.
   */
  detail: {
    /** Opening paragraph of the modal body. */
    intro: string;
    /** Concrete deliverables. Rendered as a checked list. */
    includes: string[];
    /** Who the service is a fit for. */
    bestFor: string;
    /** Realistic outcome framing — deliberately not a guarantee. */
    outcome: string;
  };
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
}

/**
 * One row of a plan's full specification — the "Feature / Details" pairs from
 * the published rate card. Rendered as a definition list in the plan detail
 * modal rather than on the card, which only has room for the highlights.
 */
export interface PlanDetailRow {
  label: string;
  value: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  /** Short qualifier beside the name, e.g. "Kickstart", "Self-Paced". */
  tagline: string;
  price: number;
  /**
   * Billing qualifier shown next to the price. Most plans are a one-off fee
   * for a fixed-length program, so this is "one-time" rather than "/month" —
   * these are not subscriptions and must not read as one.
   */
  priceNote: string;
  /** Program length, surfaced on the card as a badge. */
  timeline: string;
  description: string;
  /** Card-level highlights. Keep to 4–5; the rest belongs in `details`. */
  features: string[];
  /** Complete spec table shown in the detail modal. */
  details: PlanDetailRow[];
  /** Extra included at the end of the program, if any. */
  bonus?: string;
  /** At most one plan per category — it drives the anchoring styles. */
  featured: boolean;
  ctaLabel: string;
  ctaHref: string;
  /** True when `ctaHref` leaves the site (Calendly, WhatsApp). */
  ctaExternal?: boolean;
}

/**
 * A product line. The three offerings are separate products each with their
 * own internal tiers, not three price points on one ladder — so pricing is
 * grouped rather than flat, and each group renders its own row of cards.
 */
export interface PricingCategory {
  id: string;
  name: string;
  /** Sub-heading label above the category name. */
  label: string;
  blurb: string;
  icon: "apple" | "dumbbell" | "user";
  /** Category-specific caveat rendered under its card row. */
  note?: string;
  plans: PricingPlan[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/** One capability of the companion app, rendered as an icon + copy row. */
export interface AppFeature {
  id: string;
  title: string;
  description: string;
  icon: "calculator" | "activity" | "utensils" | "dumbbell" | "bell" | "footprints";
}

export interface NavLink {
  label: string;
  /**
   * Root-relative so the link resolves from any route. From `/` Next keeps
   * `/#about` as a same-page hash (intercepted by SmoothScrollProvider and
   * eased); from `/privacy` it navigates home and the landing effect scrolls
   * to the section. A bare `#about` would silently do nothing off-homepage.
   */
  href: string;
}

export const siteConfig = {
  brand: {
    name: "Fit with Faisal Noor",
    /**
     * For space-constrained contexts — the PWA manifest's `short_name`, which
     * is what a home-screen icon is labelled with and where anything past
     * roughly twelve characters gets truncated by the launcher anyway.
     */
    shortName: "Faisal Noor",
    tagline: "Transform Your Body. Elevate Your Life.",
    description:
      "Certified fitness coach & nutrition specialist helping clients build strength, lose fat, and live healthier — online and 1-on-1.",
    email: "hey@faisalnoor.com",
    /**
     * Feeds `metadataBase`, the sitemap, canonical URLs, OG tags, and the
     * Person JSON-LD — every absolute URL the site emits derives from this.
     */
    url: "https://faisalnoor.com",
  },
  social: {
    instagram: "https://www.instagram.com/faisalnoor8/",
    instagramHandle: "@faisalnoor8",
    whatsapp: {
      /**
       * International format, no leading zero and no `+` — this is what the
       * `wa.me` path segment requires. Local form is 0322 408 6315; the leading
       * 0 is replaced by Pakistan's country code 92.
       */
      number: "923224086315",
      message: "Hi! I'm interested in your fitness services.",
    },
  },
  calendly: {
    /**
     * One published event handles every session length. The 15/30/60-minute
     * tiers are a pricing and expectation distinction rather than three
     * separate Calendly event types, so all three CTAs resolve here and the
     * agreed duration is confirmed when the booking comes through.
     *
     * Single source of truth deliberately: the earlier per-duration URLs
     * pointed at event types that were never published and would have 404'd.
     */
    booking: "https://calendly.com/faisalnoor/booksessionwithfaisal",
  },
  navLinks: [
    { label: "Home", href: "/#home" },
    { label: "About", href: "/#about" },
    { label: "Services", href: "/#services" },
    { label: "Pricing", href: "/#pricing" },
    { label: "App", href: "/#app" },
    { label: "Blog", href: "/blog" },
    { label: "Book", href: "/#booking" },
    { label: "FAQ", href: "/#faq" },
    { label: "Contact", href: "/#contact-form" },
  ] satisfies NavLink[],
  /**
   * The blog. Posts themselves are Markdown files under `content/blog/` — this
   * only holds the copy around them (index headings, CTA, empty state), so
   * publishing never means editing this file.
   */
  blog: {
    label: "Journal",
    title: "Fitness & Nutrition Blog",
    subtitle:
      "Practical, no-nonsense guidance on training, nutrition, and building habits that hold — updated regularly.",
    /**
     * Meta description for /blog. Written separately from `subtitle`: the
     * on-page line is a promise to a reader already here, this one has to earn
     * a click in a results page against nine other results.
     */
    metaDescription:
      "Evidence-based fitness and nutrition articles from certified coach Faisal Noor — training programmes, diet strategy, fat loss, and habits that actually last.",
    /** Shown on the index before the first post is published. */
    emptyState:
      "The first articles are being written. Check back shortly, or follow along on Instagram in the meantime.",
    /** Label for the "all posts" pill in the tag filter. */
    allTagsLabel: "All Posts",
    /**
     * Funnel buckets from the content calendar. Each article declares one in
     * its frontmatter (`bucket: "DIET"`) and the matching CTA closes the post.
     *
     * This is the mechanism that connects an article to revenue: a diet
     * article that ends by offering a strength course is a wasted conversion,
     * so the bucket is what decides the closing offer rather than one generic
     * block on every post.
     *
     * Copy follows the template's soft-sell framing — the next step for
     * someone who wants this personalised, never a hard pitch.
     */
    buckets: {
      DIET: {
        title: "Want this built around your routine?",
        body: "A plan that works has to fit the food you actually eat and the schedule you actually keep. That is what diet coaching is — your targets, your groceries, adjusted as you go.",
        primary: "Start with a Diet Plan",
        primaryHref: "/#pricing-diet",
      },
      STRENGTH: {
        title: "Want form checks instead of guessing?",
        body: "Reading about progressive overload is one thing; having someone watch your form and adjust the programme as you get stronger is another. That is what the course covers.",
        primary: "See the Strength Course",
        primaryHref: "/#pricing-strength",
      },
      CONSULT: {
        title: "Still not sure what is stalling your progress?",
        body: "Most plateaus come down to one or two specific things, and they are usually not what people assume. A single session is normally enough to pinpoint it.",
        primary: "Book a Session",
        primaryHref: "/#pricing-consultancy",
      },
      APP: {
        title: "Want to track this without a spreadsheet?",
        body: "Every calculator in this article is built into FitLife — BMI, TDEE, calorie targets, and daily tracking in one place. Free on iPhone, iPad, and Mac.",
        primary: "Download FitLife",
        primaryHref: "https://apps.apple.com/us/app/fitlife-health-calculator/id6791146508",
        /** Leaves the site, so the button opens in a new tab. */
        primaryExternal: true,
      },
    },
    /**
     * Fallback for a post with no `bucket` set. Deliberately CONSULT-shaped:
     * it is the lowest-friction offer, so it is the safest default when an
     * article has not declared its funnel target.
     */
    cta: {
      title: "Want a plan built around you?",
      body: "Articles give you the principles. A plan applies them to your body, your schedule, and your goal — book a consultation and we'll map it out together.",
      primary: "Book a Consultation",
      primaryHref: "/#booking",
      secondary: "Ask on WhatsApp",
    },
  },
  services: [
    {
      id: "diet-plans",
      title: "Diet Coaching",
      description:
        "Personalised nutrition for weight loss and body composition, built around the food you actually eat.",
      icon: "apple",
      planHref: "/#pricing-diet",
      detail: {
        intro:
          "Your plan is built around the food you actually eat, not a generic template. We start by mapping your current diet, schedule, and preferences, then work backwards from your goal to a daily calorie and macro target you can hit without weighing every meal.",
        includes: [
          "Full intake: current diet, medical notes, allergies, preferences",
          "Personalised calorie and macronutrient targets",
          "Weekly meal structure with portion guidance",
          "Grocery list and simple prep instructions",
          "Swap options so a plan survives eating out or travel",
          "Monthly recalculation as your body weight changes",
        ],
        bestFor:
          "Anyone who trains but sees no change on the scale, or who has tried restrictive diets that did not hold.",
        outcome:
          "Most clients settle into the plan within two weeks and stop thinking about food as a daily decision.",
      },
    },
    {
      id: "strength-course",
      title: "Strength Training Course",
      description:
        "A structured course covering full-body training, progressive overload, and form — at home or in the gym.",
      icon: "dumbbell",
      planHref: "/#pricing-strength",
      detail: {
        intro:
          "A complete video course plus, on the supported tiers, a written program matched to the equipment you have and the days you can realistically train. Every session specifies sets, reps, tempo, and target effort, so you are never guessing in the gym.",
        includes: [
          "Full exercise library with a form guide for every movement",
          "Structured workout splits in home and full-gym versions",
          "Progressive overload built into each training block",
          "Form checks from video clips you submit (supported tiers)",
          "Live and 1-on-1 coaching sessions (supported tiers)",
          "Warm-up and mobility work built into each session",
        ],
        bestFor:
          "Beginners who want structure, and intermediates stuck repeating the same workout without progressing.",
        outcome:
          "Strength on the main lifts typically moves within the first block, with visible change following consistent nutrition.",
      },
    },
    {
      id: "consultancy",
      title: "1-on-1 Consultancy",
      description:
        "Focused sessions for direct guidance, a second opinion, or a plan review — no long-term commitment.",
      icon: "user",
      planHref: "/#pricing-consultancy",
      detail: {
        intro:
          "Direct one-to-one time, booked by the session. We review where you are, define a goal that is actually achievable in the time you have, and map the training and nutrition direction to reach it — without signing up to a program first.",
        includes: [
          "Private video sessions at a time that suits you",
          "15, 30, or 60 minutes depending on how much ground to cover",
          "Combined training and nutrition review",
          "Goal setting with realistic milestones and timelines",
          "Troubleshooting a plateau or a stalled routine",
          "A clear roadmap you leave the call holding",
        ],
        bestFor:
          "Anyone who wants expert input on a specific problem, or a second opinion before committing to a program.",
        outcome:
          "You leave with a direction and the reasoning behind it, not a document handed over once.",
      },
    },
  ] satisfies Service[],
  expertise: [
    "Fitness",
    "Health",
    "Nutrition",
    "Diet",
    "Strength Training",
    "Exercises",
  ],
  /**
   * The About section's prose. Held as paragraphs rather than one blob so the
   * layout can breathe between them, with the closing belief pulled out as a
   * quote — it is the thesis the rest of the bio supports.
   */
  bio: {
    /** Sits above the section heading, framing the unconventional route in. */
    eyebrow: "From software engineer to fitness coach",
    paragraphs: [
      "I'm a certified fitness coach who took an unconventional path into health and fitness. Before this, I spent years as a software engineer, eventually founding and running a gaming studio and software company, building games and mobile apps from the ground up. That background taught me how to break complex problems into simple, repeatable systems — a mindset I now bring to fitness.",
      "Today, I help people lose weight and build sustainable healthy habits through practical guidance on diet, weight training, and home workouts that fit into real life — no fancy equipment or unrealistic routines required. My approach blends the discipline and structured thinking of my engineering background with real-world coaching experience and certification in fitness.",
      "I train people the way I'd build a product: start with the fundamentals, iterate based on what's working, and stay consistent.",
    ],
    pullQuote:
      "Lasting results come from simple systems, not extremes — and anyone can get there with the right guidance.",
  },
  stats: [
    { value: 50, suffix: "+", label: "Clients Trained" },
    { value: 7, suffix: "+", label: "Years Experience" },
    { value: 50, suffix: "+", label: "Sessions Completed" },
  ] satisfies Stat[],
  credentials: [
    "Certified Personal Trainer",
    "Nutrition Specialist",
    "Ex-Software Engineer",
    "Founder, Gaming Studio",
  ],
  testimonials: [
    {
      id: "testimonial-1",
      name: "Sarah K.",
      role: "Weight Loss Client",
      quote:
        "Faisal completely changed my approach to fitness. The diet plan was easy to follow and the results speak for themselves.",
      rating: 5,
    },
    {
      id: "testimonial-2",
      name: "Ahmed R.",
      role: "Strength Training Client",
      quote:
        "The strength training program pushed me beyond what I thought was possible. Professional, motivating, and results-driven.",
      rating: 5,
    },
    {
      id: "testimonial-3",
      name: "Maria L.",
      role: "1-on-1 Consultancy Client",
      quote:
        "One 60-minute session cleared up months of guesswork. I left with a clear plan and finally understood why my progress had stalled.",
      rating: 5,
    },
  ] satisfies Testimonial[],
  classes: {
    schedule: "Monday, Wednesday, Friday — 7:00 PM PKT",
    description: "Join live online sessions from anywhere. All levels welcome.",
    /**
     * Intro/preview video. Set `url` to a YouTube or Vimeo *embed* URL (or an
     * .mp4) and the play button opens it in a modal. While `url` is null the
     * button still works — it opens the modal and explains that the clip is
     * coming, then offers the WhatsApp and booking routes instead. That keeps
     * the control honest rather than decorative.
     */
    video: {
      url: null as string | null,
      title: "Inside a live online class",
      pendingTitle: "Class preview coming soon",
      pendingMessage:
        "The class walkthrough video is being filmed. In the meantime, message directly with any question about how the live sessions run, or book a call to talk it through.",
    },
  },
  /**
   * The companion iOS app. Coaching does not run 24/7, but the numbers a
   * client needs between check-ins — calories, TDEE, water, steps — do. The
   * app is where that lives, so the section is positioned as an extension of
   * the coaching rather than an unrelated product being cross-sold.
   *
   * The App Store link carries no campaign parameters deliberately: Apple
   * strips unknown query strings on `apps.apple.com` redirects, so tracking
   * belongs in the `app_store_click` analytics event, not the URL.
   */
  app: {
    label: "Companion App",
    name: "FitLife",
    /** Apple's own subtitle for the listing — kept verbatim. */
    subtitle: "Health Calculator",
    tagline: "BMI, TDEE, Calorie & Diet",
    title: "Track It All in One App",
    /** Section subheading. */
    intro:
      "The numbers that decide your progress shouldn't live in a notes app. FitLife puts every calculator, tracker, and plan in one place — free on iPhone, iPad, Mac, and Apple Vision.",
    /**
     * The pitch for why this sits on a coaching site: the app carries the
     * plan between check-ins rather than replacing the coaching.
     */
    positioning:
      "Built from the same approach used with coaching clients — work out where you actually are, set a target you can hit, then track the handful of numbers that move it. Use it alongside a plan, or on its own to get started.",
    url: "https://apps.apple.com/us/app/fitlife-health-calculator/id6791146508",
    price: "Free",
    platforms: "iPhone · iPad · Mac · Apple Vision",
    requirements: "Requires iOS 15.1 or later",
    features: [
      {
        id: "calculators",
        title: "Health Calculators",
        description:
          "BMI, TDEE, body fat percentage, waist-to-height ratio, and daily calorie targets — with a visual body-fat estimator instead of guesswork.",
        icon: "calculator",
      },
      {
        id: "dashboard",
        title: "Daily Dashboard",
        description:
          "Weight, sleep, water, and workouts on one screen, with progress rings and clean charts that show the trend rather than a single day.",
        icon: "activity",
      },
      {
        id: "meal-plans",
        title: "Personalised Meal Plans",
        description:
          "Generated meal plans with a full macro breakdown, plus swappable budget-friendly options so the plan survives a real grocery bill.",
        icon: "utensils",
      },
      {
        id: "workouts",
        title: "Custom Workouts",
        description:
          "Workout programmes with sets, reps, and estimated calorie burn — matched to your goal, not a generic template.",
        icon: "dumbbell",
      },
      {
        id: "steps",
        title: "Step Tracker",
        description:
          "Daily steps on a live progress chart, with Quick Add and haptic feedback for logging that takes a second, not a minute.",
        icon: "footprints",
      },
      {
        id: "reminders",
        title: "Smart Reminders",
        description:
          "Nudges for hydration, meals, workouts, and sleep — the four habits that quietly decide whether a plan works.",
        icon: "bell",
      },
    ] satisfies AppFeature[],
    /** Quick specs rendered as a small stat row beside the CTA. */
    facts: [
      { label: "Price", value: "Free" },
      { label: "Category", value: "Health & Fitness" },
      { label: "Age Rating", value: "4+" },
      { label: "Size", value: "37.8 MB" },
    ],
    cta: "Download on the App Store",
    /**
     * Android has no build yet. Stated plainly rather than left for a visitor
     * to discover after tapping — an unanswered "is there an Android version?"
     * is a support message the site can absorb here instead.
     */
    androidNote: "iOS only for now — an Android version is not yet available.",
  },
  booking: {
    title: "Book Your Consultation",
    subtitle:
      "All sessions are conducted online — WhatsApp video call, Zoom, or Google Meet. Payment confirms the slot.",
    /**
     * The three session lengths, presented as tabs. Every one books through
     * the same Calendly event (`calendly.booking`) — the duration is a pricing
     * and scope distinction agreed at booking, not a separate event type.
     */
    options: [
      {
        id: "15min",
        label: "Quick Chat",
        duration: "15 min",
        price: 1500,
        description:
          "One topic, answered properly. Ideal for a specific question, a quick form check, or a single sticking point you want cleared up.",
        bestFor: [
          "A specific question answered directly",
          "A quick form check on one movement",
          'Single-topic focus, e.g. "how much protein do I need?"',
        ],
        /** Drives the CTA label and the analytics event name. */
        cta: "Book 15 Minutes",
      },
      {
        id: "30min",
        label: "Standard Session",
        duration: "30 min",
        price: 2500,
        description:
          "Room to cover both sides — diet and training reviewed together, with goal-setting and a plan for whatever has stalled.",
        bestFor: [
          "General diet and training review",
          "Goal-setting with realistic milestones",
          "Troubleshooting a plateau",
        ],
        cta: "Book 30 Minutes",
      },
      {
        id: "60min",
        label: "In-Depth Session",
        duration: "60 min",
        price: 4500,
        description:
          "A full consultation — assessment, custom plan direction, open Q&A, and a detailed roadmap you leave the call holding.",
        bestFor: [
          "Full assessment of where you are now",
          "Custom plan direction and detailed roadmap",
          "Open Q&A across diet and training",
        ],
        cta: "Book 60 Minutes",
      },
    ],
    /**
     * Escape hatch for visitors who want an answer without committing to a
     * paid slot. Kept out of `options` so it never reads as a fourth tier.
     */
    fallback: {
      prompt: "Not ready to book a session?",
      cta: "Ask a question on WhatsApp",
    },
  },
  pricing: {
    title: "Plans & Pricing",
    subtitle:
      "Three ways to work together — nutrition, strength, or a direct conversation. Pick the one that matches where you are.",
    /**
     * Prices are quoted in Pakistani rupees. Rendered as a prefix with a
     * thousands-separated amount, so this is "Rs." rather than a bare symbol.
     */
    currency: "Rs.",
    /**
     * The published terms. These are commitments, not marketing copy — the
     * medical-advice line in particular exists so guidance is never mistaken
     * for clinical care, and it should not be softened or dropped.
     */
    disclaimers: [
      "Prices are listed in PKR and may be adjusted for market rates, currency changes, or promotional offers.",
      "Sessions are conducted online via WhatsApp video call, Zoom, or Google Meet — your choice.",
      "Diet and training plans are educational guidance, not medical advice. If you have a pre-existing condition, consult a doctor first.",
      "Payment is required in advance to confirm your booking or enrolment; plans begin once payment is confirmed.",
      "Bundle discounts (for example a diet plan and the training course together) are available on request.",
    ],
    categories: [
      {
        id: "diet",
        name: "Diet & Weight-Loss Transformation",
        label: "Nutrition",
        blurb:
          "Personalised diet guidance built around your daily routine, food preferences, and goals — no crash diets, no unsustainable restriction. Every plan includes a custom macro and calorie target, food lists suited to local availability, and ongoing adjustments as you progress.",
        icon: "apple",
        plans: [
          {
            id: "diet-1-month",
            name: "1 Month Plan",
            tagline: "Kickstart",
            price: 6000,
            priceNote: "one-time",
            timeline: "4 weeks",
            description:
              "A clean start — your first custom plan, with weekly accountability while the habits set.",
            features: [
              "Custom diet plan with calorie and macro targets",
              "Grocery and food list built for local availability",
              "Weekly check-ins on progress photos and weight log",
              "WhatsApp text support, replies within 24 hrs",
              "1 plan revision mid-month if needed",
            ],
            details: [
              { label: "Timeline", value: "4 weeks" },
              {
                label: "What you get",
                value:
                  "Custom diet plan (calories & macros), grocery/food list, weekly check-ins, WhatsApp support",
              },
              {
                label: "Check-ins",
                value: "1 per week — progress photos and weight log review",
              },
              { label: "Plan revisions", value: "1 revision if needed mid-month" },
              {
                label: "Support hours",
                value: "Text support, replies within 24 hrs",
              },
            ],
            featured: false,
            ctaLabel: "Start This Plan",
            ctaHref: "/#contact-form",
          },
          {
            id: "diet-2-month",
            name: "2 Month Plan",
            tagline: "Momentum",
            price: 11000,
            priceNote: "one-time",
            timeline: "8 weeks",
            description:
              "Long enough for your metabolism to shift — so the plan shifts with it, every two weeks.",
            features: [
              "Everything in the 1 Month plan",
              "Full diet plan updated every 2 weeks as your weight changes",
              "Weekly check-ins plus a 15-minute live call at the midpoint",
              "2 plan revisions across the program",
              "WhatsApp text support, replies within 24 hrs",
            ],
            details: [
              { label: "Timeline", value: "8 weeks" },
              {
                label: "What you get",
                value:
                  "Everything in the 1 Month plan, plus a full diet plan updated every 2 weeks as weight and metabolism shift",
              },
              {
                label: "Check-ins",
                value: "Weekly check-ins + 1 live call (15 min) at the midpoint",
              },
              { label: "Plan revisions", value: "2 revisions across the program" },
              {
                label: "Support hours",
                value: "Text support, replies within 24 hrs",
              },
            ],
            featured: true,
            ctaLabel: "Start This Plan",
            ctaHref: "/#contact-form",
          },
          {
            id: "diet-3-month",
            name: "3 Month Plan",
            tagline: "Full Transformation",
            price: 15000,
            priceNote: "one-time",
            timeline: "12 weeks",
            description:
              "The full arc — plan, habits, and the maintenance strategy that holds the result after it ends.",
            features: [
              "Fully customised diet plan, updated every 2 weeks",
              "Habit coaching and supplement guidance where relevant",
              "Weekly check-ins plus 2 live calls (15 min each)",
              "Unlimited plan revisions as needed",
              "Priority text support, replies within 12 hrs",
            ],
            details: [
              { label: "Timeline", value: "12 weeks" },
              {
                label: "What you get",
                value:
                  "Full customised diet plan updated every 2 weeks, habit coaching, supplement guidance (if relevant)",
              },
              {
                label: "Check-ins",
                value:
                  "Weekly check-ins + 2 live calls (15 min each) — month 1 and month 2",
              },
              { label: "Plan revisions", value: "Unlimited revisions as needed" },
              {
                label: "Support hours",
                value: "Priority text support, replies within 12 hrs",
              },
            ],
            bonus: "Free maintenance guide at the end of the program",
            featured: false,
            ctaLabel: "Start This Plan",
            ctaHref: "/#contact-form",
          },
        ],
      },
      {
        id: "strength",
        name: "Complete Body / Strength Training Course",
        label: "Training",
        blurb:
          "A structured strength-training course covering full-body workouts, progressive overload, form correction, and routines for home or gym depending on your setup.",
        icon: "dumbbell",
        plans: [
          {
            id: "course-basic",
            name: "Basic Course",
            tagline: "Self-Paced",
            price: 4500,
            priceNote: "one-time",
            timeline: "Lifetime access",
            description:
              "The complete course, yours to keep. Self-guided, at whatever pace your schedule allows.",
            features: [
              "Full video course with a complete exercise library",
              "Form guides for every movement",
              "Structured workout splits — home and gym versions",
              "Lifetime access to all course content",
              "Self-guided — no direct coaching support",
            ],
            details: [
              { label: "Timeline", value: "Lifetime access to course content" },
              {
                label: "What you get",
                value:
                  "Full video course: exercise library, form guides, structured workout splits (home & gym versions)",
              },
              { label: "Support", value: "No direct support — self-guided" },
            ],
            featured: false,
            ctaLabel: "Enrol Now",
            ctaHref: "/#contact-form",
          },
          {
            id: "course-2-month",
            name: "Course + 2 Months",
            tagline: "Guided Support",
            price: 12000,
            priceNote: "one-time",
            timeline: "8 weeks of support",
            description:
              "The course plus a coach watching your form — where most people stop guessing and start progressing.",
            features: [
              "Full course, plus a workout plan matched to your level",
              "Form checks via video submissions",
              "2 live sessions per month (4 total)",
              "WhatsApp/DM support, replies within 24 hrs",
              "8 weeks of guided support after enrolment",
            ],
            details: [
              { label: "Timeline", value: "8 weeks of guided support after enrolment" },
              {
                label: "What you get",
                value:
                  "Full course + workout plan customised to your level + form checks via video submissions",
              },
              {
                label: "Online sessions",
                value: "2 live group/dedicated sessions per month (4 total)",
              },
              {
                label: "Support",
                value: "WhatsApp/DM support, replies within 24 hrs",
              },
            ],
            featured: true,
            ctaLabel: "Enrol Now",
            ctaHref: "/#contact-form",
          },
          {
            id: "course-3-month",
            name: "Course + 3 Months",
            tagline: "1-on-1 Coaching",
            price: 17500,
            priceNote: "one-time",
            timeline: "12 weeks of support",
            description:
              "Private coaching on top of the course, with a programme that progresses every month and a strength re-test to prove it worked.",
            features: [
              "Full course + progressive programme updated monthly",
              "Form checks and structured progress tracking",
              "2 dedicated 1-on-1 sessions per month (6 total, 20 min each)",
              "Priority WhatsApp/DM support, replies within 12 hrs",
              "12 weeks of guided support after enrolment",
            ],
            details: [
              { label: "Timeline", value: "12 weeks of guided support after enrolment" },
              {
                label: "What you get",
                value:
                  "Full course + progressive programme updated monthly + form checks + progress tracking",
              },
              {
                label: "Online sessions",
                value: "2 dedicated 1-on-1 sessions per month (6 total, 20 min each)",
              },
              {
                label: "Support",
                value: "Priority WhatsApp/DM support, replies within 12 hrs",
              },
            ],
            bonus: "Free strength testing and re-assessment at the end",
            featured: false,
            ctaLabel: "Enrol Now",
            ctaHref: "/#contact-form",
          },
        ],
      },
      {
        id: "consultancy",
        name: "1-on-1 Consultancy Sessions",
        label: "Direct Guidance",
        blurb:
          "Quick, focused sessions for anyone who wants direct guidance, questions answered, or a second opinion on their training or diet — no long-term commitment needed.",
        icon: "user",
        note: "Sessions are booked online. Payment is required in advance to confirm the slot.",
        plans: [
          {
            id: "session-15",
            name: "Quick Chat",
            tagline: "15 minutes",
            price: 1500,
            priceNote: "per session",
            timeline: "15 minutes",
            description:
              "One topic, answered properly — a specific question, a quick form check, or a single sticking point.",
            features: [
              "Specific questions answered directly",
              "Quick form check on a movement",
              "Single-topic focus, e.g. daily protein targets",
              "Online via WhatsApp video, Zoom, or Google Meet",
            ],
            details: [
              { label: "Duration", value: "15 minutes" },
              {
                label: "Best for",
                value:
                  'Specific questions, a quick form check, or a single topic (e.g. "how much protein do I need?")',
              },
              {
                label: "Format",
                value: "Online via WhatsApp video call, Zoom, or Google Meet",
              },
            ],
            featured: false,
            ctaLabel: "Book 15 Minutes",
            ctaHref: "https://calendly.com/faisalnoor/booksessionwithfaisal",
            ctaExternal: true,
          },
          {
            id: "session-30",
            name: "Standard Session",
            tagline: "30 minutes",
            price: 2500,
            priceNote: "per session",
            timeline: "30 minutes",
            description:
              "Room to cover both sides — diet and training reviewed together, with a plan for whatever has stalled.",
            features: [
              "General diet and training review",
              "Goal-setting with realistic milestones",
              "Troubleshooting a plateau",
              "Online via WhatsApp video, Zoom, or Google Meet",
            ],
            details: [
              { label: "Duration", value: "30 minutes" },
              {
                label: "Best for",
                value:
                  "General discussion — diet and training review, goal-setting, troubleshooting a plateau",
              },
              {
                label: "Format",
                value: "Online via WhatsApp video call, Zoom, or Google Meet",
              },
            ],
            featured: true,
            ctaLabel: "Book 30 Minutes",
            ctaHref: "https://calendly.com/faisalnoor/booksessionwithfaisal",
            ctaExternal: true,
          },
          {
            id: "session-60",
            name: "In-Depth Session",
            tagline: "60 minutes",
            price: 4500,
            priceNote: "per session",
            timeline: "60 minutes",
            description:
              "A full consultation — assessment, plan direction, and a roadmap you leave holding.",
            features: [
              "Full assessment of your current position",
              "Custom plan direction and detailed roadmap",
              "Open Q&A across diet and training",
              "Online via WhatsApp video, Zoom, or Google Meet",
            ],
            details: [
              { label: "Duration", value: "60 minutes" },
              {
                label: "Best for",
                value:
                  "Full consultation — assessment, custom plan direction, Q&A, detailed roadmap",
              },
              {
                label: "Format",
                value: "Online via WhatsApp video call, Zoom, or Google Meet",
              },
            ],
            featured: false,
            ctaLabel: "Book 60 Minutes",
            ctaHref: "https://calendly.com/faisalnoor/booksessionwithfaisal",
            ctaExternal: true,
          },
        ],
      },
    ] satisfies PricingCategory[],
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know before getting started.",
    items: [
      {
        id: "beginner",
        question: "I'm a complete beginner. Is this right for me?",
        answer:
          "Absolutely. Most clients start with little or no training experience. Every plan begins with an assessment of your current fitness level, and programs scale up gradually as you build strength and confidence.",
      },
      {
        id: "equipment",
        question: "What equipment do I need?",
        answer:
          "You can start with nothing but your bodyweight. Plans are built around the equipment you actually have — whether that's a full gym, a pair of dumbbells at home, or nothing at all.",
      },
      {
        id: "results",
        question: "How quickly will I see results?",
        answer:
          "Most clients notice improvements in energy and strength within 2–3 weeks. Visible physical changes typically appear around weeks 6–8, provided training and nutrition stay consistent.",
      },
      {
        id: "online",
        question: "How do online sessions actually work?",
        answer:
          "Sessions run over video call at a scheduled time. You get real-time form correction and coaching, exactly like in-person training. All you need is a phone or laptop and a bit of space.",
      },
      {
        id: "diet",
        question: "Can you work around dietary restrictions?",
        answer:
          "Yes. Meal plans are built around your preferences, allergies, and any cultural or religious requirements. Vegetarian, vegan, halal, and other approaches are all fully supported.",
      },
      {
        id: "reschedule",
        question: "What if I need to reschedule a session?",
        answer:
          "Just give at least 24 hours notice and we'll move the session at no charge. Life happens — flexibility is built into every plan.",
      },
      {
        id: "payment",
        question: "How does payment work?",
        answer:
          "All prices are in PKR, and payment is required in advance to confirm your booking or enrolment — your plan begins once payment is confirmed. Bank transfer and regional mobile payment options are accepted. Plans are a one-time fee for a fixed term, not a recurring subscription, so nothing auto-renews.",
      },
      {
        id: "bundle",
        question: "Can I combine a diet plan with the training course?",
        answer:
          "Yes, and most people who want both should. Bundle pricing is offered on request rather than listed — message on WhatsApp with the two plans you're considering and you'll get a combined price.",
      },
      {
        id: "medical",
        question: "Is this suitable if I have a medical condition?",
        answer:
          "Diet and training plans provided here are educational guidance, not medical advice. If you have a pre-existing condition, are pregnant, or are on medication, please consult your doctor first — and share any restrictions they give you so the plan can be built around them.",
      },
    ] satisfies FaqItem[],
  },
  contact: {
    title: "Send a Message",
    subtitle:
      "Not ready to book a call? Tell us your goal and we'll get back to you within 24 hours.",
    /**
     * The API validates the submitted goal against this exact list, so the two
     * must stay in sync — adding an option here is what makes it selectable
     * server-side.
     */
    goals: [
      "Diet & Weight Loss",
      "Strength Training Course",
      "1-on-1 Consultancy",
      "Muscle Gain",
      "General Fitness",
      "Other",
    ],
    successTitle: "Message sent",
    successMessage:
      "Thanks for reaching out. We'll be in touch within 24 hours.",
    errorMessage:
      "Something went wrong sending your message. Please try WhatsApp or email us directly.",
    /**
     * Shown when the mail provider is not configured (HTTP 503). This is a
     * different situation from a genuine failure: nothing is broken, the send
     * channel simply is not live yet, so the copy routes the lead to WhatsApp
     * or email rather than implying the visitor did something wrong.
     */
    unavailableMessage:
      "Direct messaging isn't live on the site just yet. Your message hasn't been lost — send it through WhatsApp or email and it'll be answered the same way.",
    /** Prefill banner when a visitor arrives here from a pricing plan CTA. */
    planPrefillLabel: "Enquiring about the {plan} plan",
  },
  notFound: {
    title: "Page Not Found",
    message:
      "That page doesn't exist — it may have been moved or the link may be wrong.",
    cta: "Back to Home",
  },
  errorPage: {
    title: "Something Went Wrong",
    message:
      "An unexpected error occurred on our end. Trying again usually resolves it.",
    retry: "Try Again",
    home: "Back to Home",
  },
  legal: {
    /** Shown at the top of /privacy and /terms until real copy is supplied. */
    placeholderNotice:
      "This is placeholder text. Have it reviewed by a legal professional before launch.",
    lastUpdated: "August 3, 2026",
  },
  marquee: [
    "STRENGTH",
    "NUTRITION",
    "DISCIPLINE",
    "RESULTS",
    "FITNESS",
    "HEALTH",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
