import type { MetadataRoute } from "next";
import { getPublishedV2Pages } from "@/lib/source";
import { absoluteDocsUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getPublishedV2Pages();

  return pages
    .slice()
    .sort((a, b) => a.url.localeCompare(b.url))
    .map((page) => ({
      url: absoluteDocsUrl(page.url),
      lastModified: page.data.lastModified,
      changeFrequency: "weekly" as const,
      priority:
        page.url === "/v2"
          ? 1
          : page.url === "/v2/quickstart"
            ? 0.95
            : page.url === "/v2/prompts"
              ? 0.9
              : 0.8,
    }));
}
