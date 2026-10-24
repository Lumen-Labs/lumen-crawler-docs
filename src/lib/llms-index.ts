import { getPublishedV2Pages } from "@/lib/source";
import { DOCS_BASE, markdownDocsUrl } from "@/lib/site";
import { pageIndexLineClean } from "@/lib/get-llm-text";

export function buildRootLlmsTxt(): string {
  return `# Lumen Crawler

> Task API for agents. Create a crawl, poll until it finishes, then read Markdown, a site map, doors, and optional cleaned JSON.

**When to use Lumen Crawler:** Use it when an agent or application needs Playwright-rendered pages from a public website as clean Markdown or typed JSON, with robots and SSRF fail-closed.

**When not to use Lumen Crawler:** Do not use it to crawl private networks, authenticated targets, or off-universe hosts in the same job. \`follow_doors\` is unsupported. There are no webhooks or search.

**Preferred call pattern:** Create a key at the console. POST /v1/crawls with Bearer \`lc_live_…\` and a unique Idempotency-Key. Expect HTTP 202. Poll GET /v1/crawls/{id} until status is completed, cancelled, or failed. Then GET pages with include=markdown. On 402, check usage or raise the plan; do not retry the same max_pages. Off-universe links are doors — start a new crawl to enter them.

## Start here

- [Lumen Crawler documentation](${markdownDocsUrl("/v2")}): Overview and product guarantees
- [Quickstart](${markdownDocsUrl("/v2/quickstart")}): Create a key, start a crawl, poll, read Markdown
- [Installation](${markdownDocsUrl("/v2/installation")}): Console account and API keys
- [Lumen Crawler OpenAPI 3.1 specification](${DOCS_BASE}/openapi.json): Machine-readable REST contract
- [Console](https://crawlapp.lumen-labs.ai): Usage, keys, billing
- [Crawl API](https://crawler.lumen-labs.ai): Production host

## Task-shaped entry points

- [Create and poll](${markdownDocsUrl("/v2/create-and-poll")}): POST 202, status, cancel, idempotency
- [Pages and map](${markdownDocsUrl("/v2/pages-and-map")}): Markdown bodies and the in-universe graph
- [Doors and universe](${markdownDocsUrl("/v2/doors")}): Off-site links are listed, never fetched
- [Cleanup JSON](${markdownDocsUrl("/v2/cleanup")}): Typed page and site rollups
- [FAQ](${markdownDocsUrl("/v2/faq")}): Keys, 402 quota, robots, doors, retention

## Agent interfaces

- [Copy-paste prompts](${markdownDocsUrl("/v2/prompts")}): Cursor MCP JSON and a paste-ready agent prompt
- [Docs MCP](${markdownDocsUrl("/v2/docs-mcp")}): Unauthenticated Streamable HTTP MCP for this documentation
- [Docs MCP discovery](${DOCS_BASE}/.well-known/mcp.json): Machine-readable Docs MCP endpoint metadata
- [Docs skill](${DOCS_BASE}/skill.md): Short skill for coding agents
- [Error catalog](${markdownDocsUrl("/v2/errors")}): RFC 7807 problem types including 402 quota_exceeded

## Area indexes

- [This agent index](${DOCS_BASE}/llms.txt): Product-level discovery and usage guidance
- [V2 docs](${DOCS_BASE}/llms/v2.txt): Current Lumen Crawler documentation
- [Full V2 markdown feed](${DOCS_BASE}/llms-full.txt): Consolidated public documentation for indexing
`;
}

export function buildVersionLlmsTxt(): string {
  const pages = getPublishedV2Pages();
  const lines = pages
    .slice()
    .sort((a, b) => a.url.localeCompare(b.url))
    .map(pageIndexLineClean);

  return `# Lumen Crawler V2 Documentation

> Full index: ${DOCS_BASE}/llms.txt · Markdown: append .md to any URL below

${lines.join("\n")}
`;
}
