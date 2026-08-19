import { Hero } from "@/components/sections/Hero";
import { Marquee } from "@/components/sections/Marquee";
import { About } from "@/components/sections/About";
import { Services } from "@/components/sections/Services";
import { Expertise } from "@/components/sections/Expertise";
import { Pricing } from "@/components/sections/Pricing";
import { FitnessApp } from "@/components/sections/FitnessApp";
import { Booking } from "@/components/sections/Booking";
import { Testimonials } from "@/components/sections/Testimonials";
import { FAQ } from "@/components/sections/FAQ";
import { Contact } from "@/components/sections/Contact";
import { SectionTracker } from "@/components/analytics/SectionTracker";

/**
 * Section order follows the conversion path: establish value (Hero → Services),
 * answer "how much?" (Pricing) immediately before the booking CTA, prove it
 * (Testimonials), clear objections (FAQ), then catch everyone who still isn't
 * ready to book with the contact form.
 *
 * The app sits between Pricing and Booking on purpose: it is the free entry
 * point, so it lands right where a visitor has just seen the paid plans and
 * either converts to a booking or leaves. A no-cost download keeps that second
 * group in the ecosystem instead of losing them at the price table.
 *
 * Each section is wrapped in a SectionTracker so the order above is not just an
 * intention but something measurable: `section_view` per step turns this into a
 * funnel where the drop-off point is visible rather than inferred. Marquee is
 * deliberately unwrapped — it is a decorative band between sections, not a step.
 */
export default function Home() {
  return (
    <>
      <SectionTracker section="hero">
        <Hero />
      </SectionTracker>
      <Marquee />
      <SectionTracker section="about">
        <About />
      </SectionTracker>
      <SectionTracker section="services">
        <Services />
      </SectionTracker>
      <SectionTracker section="expertise">
        <Expertise />
      </SectionTracker>
      <SectionTracker section="pricing">
        <Pricing />
      </SectionTracker>
      <SectionTracker section="app">
        <FitnessApp />
      </SectionTracker>
      <SectionTracker section="booking">
        <Booking />
      </SectionTracker>
      <SectionTracker section="testimonials">
        <Testimonials />
      </SectionTracker>
      <SectionTracker section="faq">
        <FAQ />
      </SectionTracker>
      <SectionTracker section="contact">
        <Contact />
      </SectionTracker>
    </>
  );
}
