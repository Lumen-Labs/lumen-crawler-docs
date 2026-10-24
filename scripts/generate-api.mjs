import { generateFiles } from "fumadocs-openapi";
import { createOpenAPI } from "fumadocs-openapi/server";

const openapi = createOpenAPI({
  input: ["schemas/lumen-crawler.openapi.json"],
});

await generateFiles({
  input: openapi,
  output: "./content/v2/reference/api",
  per: "tag",
  includeDescription: true,
  addGeneratedComment:
    "Generated from schemas/lumen-crawler.openapi.json. Run npm run api:generate after syncing the schema.",
  frontmatter(title, description) {
    return {
      title: `${title} API`,
      description: description ?? `Lumen Crawler ${title} endpoints`,
    };
  },
});
