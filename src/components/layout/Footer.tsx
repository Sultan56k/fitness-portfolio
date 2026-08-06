import Link from "next/link";
import { siteConfig } from "@/data/site";
import { FooterContactLinks } from "./FooterContactLinks";

export function Footer() {
  return (
    <footer id="contact" className="border-t border-white/8 bg-bg-secondary">
      <div className="section-container py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <h2 className="font-display text-3xl tracking-wide text-white">
              {siteConfig.brand.name}
            </h2>
            <p className="mt-3 max-w-md text-text-secondary">{siteConfig.brand.tagline}</p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-text-muted">
              {siteConfig.brand.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-3">
              {siteConfig.navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary transition-colors hover:text-accent-lime"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Connect
            </h3>
            <FooterContactLinks />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-white/8 pt-8 text-sm text-text-muted md:flex-row md:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.brand.name}. All rights
            reserved.
          </p>
          <nav className="flex items-center gap-6" aria-label="Legal">
            <Link
              href="/privacy"
              className="transition-colors hover:text-accent-lime"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-accent-lime"
            >
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
