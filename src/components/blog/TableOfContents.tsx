"use client";

import { useEffect, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sticky in-article contents, desktop only. Client component because it tracks
 * which section is on screen — the one thing here that genuinely needs JS.
 *
 * Hidden below `lg`: on a phone a contents list is a wall of links between the
 * reader and the first paragraph, which costs more than it gives.
 */
export function TableOfContents({
  headings,
}: {
  headings: { id: string; text: string; level: number }[];
}) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);

    // The top band is discounted so a heading counts as "current" once it
    // reaches the upper third, rather than only while it is under the navbar.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-88px 0px -66% 0px", threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  // One or two headings is a list, not a structure worth navigating.
  if (headings.length < 3) return null;

  return (
    <nav
      aria-label="On this page"
      className="sticky top-28 hidden max-h-[calc(100vh-9rem)] overflow-y-auto lg:block"
    >
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-accent-lime">
        <List className="h-4 w-4" aria-hidden="true" />
        On this page
      </p>

      <ul className="mt-4 space-y-2.5 border-l border-white/10 pl-4">
        {headings.map((heading) => (
          <li key={heading.id} className={cn(heading.level === 3 && "pl-4")}>
            <a
              href={`#${heading.id}`}
              aria-current={activeId === heading.id ? "location" : undefined}
              className={cn(
                "block text-sm leading-snug transition-colors duration-200",
                activeId === heading.id
                  ? "font-medium text-accent-lime"
                  : "text-text-muted hover:text-white",
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
