import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags } from "@/lib/blog";
import { siteConfig } from "@/data/site";
import { TagIndex } from "@/components/blog/TagIndex";

export function generateStaticParams() {
  return getAllTags().map((entry) => ({ tag: entry.slug }));
}

export const dynamicParams = false;

/** The display name for a slug, from the tag index. */
function resolveTag(slug: string) {
  return getAllTags().find((entry) => entry.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const entry = resolveTag(tag);

  if (!entry) return { title: "Topic Not Found" };

  // `title` is bare — the root layout's template appends the brand name. The
  // OG/Twitter fields below are not templated, so they carry it explicitly.
  const title = `${entry.tag} Articles`;
  const socialTitle = `${title} | ${siteConfig.brand.name}`;
  const description = `${entry.count} ${
    entry.count === 1 ? "article" : "articles"
  } on ${entry.tag.toLowerCase()} — practical fitness and nutrition guidance from certified coach ${siteConfig.brand.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/blog/tag/${entry.slug}` },
    openGraph: {
      type: "website",
      url: `${siteConfig.brand.url}/blog/tag/${entry.slug}`,
      title: socialTitle,
      description,
      siteName: siteConfig.brand.name,
    },
    twitter: { card: "summary_large_image", title: socialTitle, description },
  };
}

/**
 * One page per topic. These exist to rank: a visitor searching "fat loss
 * advice" should be able to land on a page that is entirely about fat loss,
 * rather than on a mixed index where the topic is one card among thirty.
 */
export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const entry = resolveTag(tag);

  if (!entry) notFound();

  return <TagIndex entry={entry} page={1} />;
}
