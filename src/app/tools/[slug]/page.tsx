import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTool, tools, SITE_NAME, SITE_URL } from "@/lib/tools";
import { ToolClient } from "@/components/ToolClient";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return { title: "Tool not found" };

  const title =
    tool.seoTitle ??
    `${tool.name} — Free online ${tool.tagline.toLowerCase()} | ${SITE_NAME}`;
  const url = `${SITE_URL}/tools/${tool.slug}`;

  return {
    title,
    description: tool.description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: tool.description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description: tool.description,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    alternateName: tool.keywords?.slice(0, 4),
    description: tool.description,
    url: `${SITE_URL}/tools/${tool.slug}`,
    applicationCategory:
      tool.category === "games" ? "GameApplication" : "UtilitiesApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolClient slug={slug} />
    </>
  );
}
