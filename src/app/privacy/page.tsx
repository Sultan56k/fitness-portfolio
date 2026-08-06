import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/layout/LegalPage";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteConfig.brand.name}`,
  description: `How ${siteConfig.brand.name} collects, uses, and protects your personal information.`,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

/**
 * Copy describes what the contact form genuinely does today — name, email,
 * goal and message, delivered by email through Resend. Keep it in sync if the
 * form's fields or processors change.
 */
const sections: LegalSection[] = [
  {
    heading: "Information We Collect",
    body: [
      "We collect only the information you choose to give us. When you submit the contact form, we receive:",
    ],
    bullets: [
      "Your name",
      "Your email address",
      "The fitness goal you select",
      "The content of your message",
    ],
  },
  {
    heading: "How We Use Your Information",
    body: [
      "Your information is used solely to respond to your enquiry and, if you become a client, to deliver the coaching services you have requested.",
      "We do not sell, rent, or trade your personal information to third parties. We do not use your details for advertising, and we will not add you to a marketing list without your explicit consent.",
    ],
  },
  {
    heading: "Third-Party Services",
    body: [
      "Contact form submissions are delivered to us by email through Resend, an email delivery provider. Your message passes through their systems in order to reach our inbox.",
      "If you book a consultation, scheduling is handled by Calendly, and any information you provide during booking is governed by Calendly's own privacy policy. Messages you send us via WhatsApp are governed by WhatsApp's privacy policy.",
    ],
  },
  {
    heading: "Data Retention",
    body: [
      "We keep enquiry emails for as long as needed to respond and to maintain a record of our correspondence. You may ask us to delete your information at any time and we will do so, unless we are required to retain it for legal or accounting reasons.",
    ],
  },
  {
    heading: "Cookies and Analytics",
    body: [
      "This site does not currently set advertising or tracking cookies. If analytics are introduced in future, this policy will be updated before those tools go live.",
    ],
  },
  {
    heading: "Your Rights",
    body: [
      "Depending on where you live, you may have the right to access, correct, or delete the personal information we hold about you, and to object to how we use it. To exercise any of these rights, contact us using the email address below.",
    ],
  },
  {
    heading: "Children's Privacy",
    body: [
      "Our services are not directed at children under 16, and we do not knowingly collect information from them. If you believe a child has provided us with personal information, please contact us so we can remove it.",
    ],
  },
  {
    heading: "Changes to This Policy",
    body: [
      "We may update this policy from time to time. The date at the top of this page reflects the most recent revision.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={`This policy explains what information ${siteConfig.brand.name} collects, why we collect it, and what we do with it.`}
      sections={sections}
    />
  );
}
