import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: `Terms of Service | ${siteConfig.brand.name}`,
  description: `The terms that apply when you use ${siteConfig.brand.name} coaching services.`,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const sections: LegalSection[] = [
  {
    heading: "Acceptance of Terms",
    body: [
      `By using this website or engaging ${siteConfig.brand.name} for coaching, nutrition, or consultation services, you agree to these terms. If you do not agree, please do not use the services.`,
    ],
  },
  {
    heading: "Health Disclaimer",
    body: [
      "Our coaching, training programs, and nutrition guidance are provided for general fitness purposes only. They are not medical advice, diagnosis, or treatment, and they are not a substitute for care from a qualified healthcare professional.",
      "Consult a physician before starting any new exercise or nutrition program, particularly if you are pregnant, have an existing medical condition, are taking medication, or are recovering from injury. You participate at your own risk, and you are responsible for stopping any activity that causes pain or discomfort.",
    ],
  },
  {
    heading: "No Guarantee of Results",
    body: [
      "Fitness and nutrition outcomes vary from person to person and depend on factors including your starting point, genetics, consistency, sleep, stress, and adherence to the plan. Any results, timelines, or testimonials shown on this site are examples, not promises of what you will achieve.",
    ],
  },
  {
    heading: "Bookings and Sessions",
    body: [
      "Consultations are scheduled through Calendly and conducted online by video call unless agreed otherwise. Please give at least 24 hours notice to reschedule a session at no charge. Sessions missed without notice may be counted as delivered.",
    ],
  },
  {
    heading: "Payment and Cancellation",
    body: [
      "Coaching plans are billed monthly in advance. You may cancel at any time with no cancellation fee, and your plan will remain active through the end of the period you have already paid for.",
      "Prices shown on this site are subject to change, but any change will be communicated before it applies to your plan.",
    ],
  },
  {
    heading: "Client Responsibilities",
    body: ["To get the most from coaching, you agree to:"],
    bullets: [
      "Give accurate information about your health, injuries, and medical history",
      "Tell us promptly if your health status changes",
      "Follow the guidance provided, and ask when something is unclear",
      "Use any provided materials for your own personal use only",
    ],
  },
  {
    heading: "Intellectual Property",
    body: [
      "All training plans, meal plans, videos, and written materials we provide remain our intellectual property. They are licensed to you for personal use and may not be resold, republished, or shared with others without written permission.",
    ],
  },
  {
    heading: "Limitation of Liability",
    body: [
      "To the fullest extent permitted by law, we are not liable for any injury, loss, or damage arising from your use of our services or from following any program or guidance provided, except where that liability cannot legally be excluded.",
    ],
  },
  {
    heading: "Changes to These Terms",
    body: [
      "We may revise these terms from time to time. The date at the top of this page reflects the most recent revision, and continued use of our services after a change constitutes acceptance of the updated terms.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={`These terms govern your use of the ${siteConfig.brand.name} website and coaching services.`}
      sections={sections}
    />
  );
}
