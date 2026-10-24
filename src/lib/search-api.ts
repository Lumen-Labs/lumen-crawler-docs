import { getPublishedV2Pages, sourceV2 } from "@/lib/source";
import { createSearchAPI } from "fumadocs-core/search/server";
import type { InferPageType } from "fumadocs-core/source";

type DocPage = InferPageType<typeof sourceV2>;

function toIndex(page: DocPage, tag: "v2") {
  if (!("structuredData" in page.data) || !page.data.structuredData) {
    return null;
  }

  return {
    id: page.url,
    title: page.data.title,
    description:
      "description" in page.data ? page.data.description : undefined,
    url: page.url,
    structuredData: page.data.structuredData,
    tag,
  };
}

const indexes = getPublishedV2Pages()
  .map((page) => toIndex(page, "v2"))
  .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

export const searchAPI = createSearchAPI("advanced", {
  language: "english",
  indexes,
});
