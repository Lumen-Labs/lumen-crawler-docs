import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getPublishedV2Page, getPublishedV2Pages } from "@/lib/source";
import { getLLMText } from "@/lib/get-llm-text";
import { absoluteDocsUrl } from "@/lib/site";
import { searchAPI } from "@/lib/search-api";

async function searchDocs(query: string) {
  return searchAPI.search(query, { tag: "v2" });
}

function resolvePage(path: string) {
  const cleaned = path
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/^\/docs/, "")
    .replace(/\.mdx?$/i, "")
    .replace(/\/$/, "");

  if (cleaned.startsWith("/v2") || cleaned.startsWith("v2")) {
    const slug = cleaned
      .replace(/^\/?v2\/?/, "")
      .split("/")
      .filter(Boolean);
    return getPublishedV2Page(slug.length ? slug : undefined);
  }

  return getPublishedV2Page(
    cleaned.replace(/^\//, "").split("/").filter(Boolean),
  );
}

function listSections() {
  return getPublishedV2Pages()
    .map((page) => ({
      version: "v2",
      title: page.data.title,
      url: absoluteDocsUrl(page.url),
      description:
        "description" in page.data
          ? (page.data.description as string | undefined)
          : undefined,
    }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

function extractFirstCodeFence(markdown: string, language?: string) {
  const re = /```([^\n`]*)\n([\s\S]*?)```/;
  const all = [...markdown.matchAll(new RegExp(re, "g"))];
  for (const match of all) {
    const lang = (match[1] || "").trim().toLowerCase();
    if (
      !language ||
      lang === language.toLowerCase() ||
      lang.startsWith(language.toLowerCase())
    ) {
      return { language: lang || "text", code: match[2].trim() };
    }
  }
  if (all[0]) {
    return {
      language: (all[0][1] || "text").trim() || "text",
      code: all[0][2].trim(),
    };
  }
  return null;
}

export function createDocsMcpServer() {
  const server = new McpServer({
    name: "lumen-crawler-docs",
    version: "1.0.0",
  });

  server.tool(
    "search_docs",
    "Search Lumen Crawler documentation.",
    {
      query: z.string().describe("Search query"),
    },
    async ({ query }) => {
      const results = await searchDocs(query);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "list_sections",
    "List published documentation pages.",
    {},
    async () => {
      const sections = listSections();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(sections, null, 2),
          },
        ],
      };
    },
  );

  server.tool(
    "get_page",
    "Fetch a documentation page as markdown. Pass a docs path like /v2/quickstart or a full docs URL.",
    {
      path: z
        .string()
        .describe("Docs path or URL, e.g. /v2/quickstart"),
    },
    async ({ path }) => {
      const page = resolvePage(path);
      if (!page) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Page not found: ${path}. Try list_sections or search_docs.`,
            },
          ],
          isError: true,
        };
      }
      const markdown = await getLLMText(page);
      return {
        content: [{ type: "text" as const, text: markdown }],
      };
    },
  );

  server.tool(
    "get_code_example",
    "Extract the first (or language-matched) fenced code example from a docs page.",
    {
      path: z.string().describe("Docs path or URL"),
      language: z
        .string()
        .optional()
        .describe("Preferred fence language, e.g. bash, json"),
    },
    async ({ path, language }) => {
      const page = resolvePage(path);
      if (!page) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Page not found: ${path}`,
            },
          ],
          isError: true,
        };
      }
      const markdown = await getLLMText(page);
      const example = extractFirstCodeFence(markdown, language);
      if (!example) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No code fence found on ${path}`,
            },
          ],
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: `\`\`\`${example.language}\n${example.code}\n\`\`\``,
          },
        ],
      };
    },
  );

  return server;
}
