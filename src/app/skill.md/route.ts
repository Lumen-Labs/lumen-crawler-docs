import { DOCS_BASE } from "@/lib/site";

export const revalidate = false;

const skill = `---
name: lumen-crawler-docs
description: Use Lumen Crawler public documentation and the docs MCP to start crawls correctly.
compatibility: Lumen Crawler v1
metadata:
  docs: ${DOCS_BASE}/llms.txt
  mcp: ${DOCS_BASE}/mcp
allowed-tools: search_docs get_page list_sections get_code_example
---

# Lumen Crawler docs skill

## When to use Lumen Crawler

Use Lumen Crawler when an agent needs Playwright-rendered public pages as Markdown or typed JSON. Use this docs skill to choose an endpoint, construct a request, or recover from an error.

## When not to use Lumen Crawler

Do not crawl private IPs, metadata hosts, or authenticated sites. Do not set follow_doors to true. Do not assume webhooks exist.

## Calling guidance

1. Discover pages via \`${DOCS_BASE}/llms.txt\` or MCP \`search_docs\` / \`list_sections\`.
2. Fetch markdown with MCP \`get_page\` or by appending \`.md\` to a docs URL. Inspect \`${DOCS_BASE}/openapi.json\` before generating REST tools.
3. Create API keys in the console at https://crawlapp.lumen-labs.ai. The secret is shown once and starts with \`lc_live_\`.
4. POST https://crawler.lumen-labs.ai/v1/crawls with \`Authorization: Bearer <key>\` and a unique \`Idempotency-Key\`. Expect **202**.
5. Poll GET /v1/crawls/{id} until status is \`completed\`, \`cancelled\`, or \`failed\`. 404 means unknown crawl, not still queued.
6. Read bodies with GET /v1/crawls/{id}/pages?include=markdown. Paginate with \`cursor\` = last item \`urlHash\`. For typed JSON, \`include=cleaned\` or poll GET /cleaned.
7. Off-universe links are doors. Start a new crawl to enter another host. \`follow_doors: true\` returns **422**.
8. On **402** \`quota_exceeded\`, the requested \`max_pages\` does not fit remaining included pages. Do not retry the same max_pages. Failed fetches and robots skips do not consume quota; successful pages (\`pages_ok\`) do.
9. GET /cleaned may return **409** \`cleanup_not_ready\` while cleanup runs. Wait and retry. **404** if cleanup was skipped. Look up sections by \`areas[].id\`. Page bodies are on GET /pages?include=cleaned. Inspect \`${DOCS_BASE}/v2/cleanup.md\` and OpenAPI \`CleanedPage\` / \`CleanedCrawl\` before parsing.
`;

export function GET() {
  return new Response(skill, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
