<p align="center">
  <strong>Lumen Crawler documentation</strong>
</p>

<p align="center">
  The source of the public documentation for Lumen Crawler.
</p>

<p align="center">
  <a href="https://docs.crawler.lumen-labs.ai/docs">Read the documentation</a>
  ·
  <a href="CONTRIBUTING.md">Contribute</a>
  ·
  <a href="SECURITY.md">Report a vulnerability</a>
</p>

## About this repository

This repository builds the Lumen Crawler documentation portal with Next.js 16 and Fumadocs. It contains task-oriented guides, a generated API reference, searchable Markdown, and interfaces designed for both people and AI tools.

Use this repository to:

- improve the public Lumen Crawler guides and reference material;
- preview documentation changes locally;
- review the OpenAPI contract used to generate the reference;
- verify that navigation, links, examples, and publication rules remain consistent;
- maintain the documentation search, LLM indexes, sitemap, and Docs MCP endpoint.

This repository contains documentation only. Crawl runtime is implemented in the separate `lumen-crawler2` source repository. The mechanics were adapted from the BrainAPI docs app.

## Start locally

### Requirements

- Node.js 22 (see [`.nvmrc`](.nvmrc))
- npm 10 or later

### Run the site

```bash
nvm use
npm ci
npm run dev
```

Open [http://localhost:3001/docs](http://localhost:3001/docs). Port **3001** avoids colliding with the Lumen Crawler web app on 3000.

No environment file is required for local development. [`.env.example`](.env.example) documents the optional `NEXT_PUBLIC_DOCS_ORIGIN` setting used to generate canonical metadata and the sitemap.

## Agent surfaces

| URL | Purpose |
| --- | --- |
| `/docs/llms.txt` | Short TOC for language models |
| `/docs/llms/v2.txt` | Index of published pages |
| `/docs/llms-full.txt` | Consolidated published markdown |
| `/docs/v2/...md` | Per-page markdown mirror |
| `/docs/mcp` | Docs MCP (search_docs, list_sections, get_page, get_code_example) |
| `/docs/.well-known/mcp.json` | MCP discovery |
| `/docs/skill.md` | Agent skill |
| `/docs/openapi.json` | OpenAPI 3.1 snapshot |
| `/docs/api/search` | Documentation search |

## Quality checks

| Command | What it verifies |
| --- | --- |
| `npm run dev` | Local documentation server on port 3001 |
| `npm run docs:check` | Visible route tree, internal links, anchors, JSON examples, OpenAPI snapshot |
| `npm run public:check` | Tracked files for secrets and private material |
| `npm run api:check` | Checked-in OpenAPI snapshot matches sibling `lumen-crawler2` |
| `npm run api:generate` | Regenerates reference MDX from the snapshot |
| `npm run build` | Production site |

```bash
npm run docs:check
npm run public:check
npm run build
```

## Synchronize the API reference

By default, synchronization expects `lumen-crawler2` to be a sibling of this repository:

```bash
npm run api:sync
npm run api:generate
npm run docs:check
```

Override the source checkout with `LUMEN_CRAWLER_SOURCE`.

## License

Copyright © Lumen Labs contributors.

Licensed under the [Apache License 2.0](LICENSE). Product names and third-party trademarks remain the property of their respective owners; see [`NOTICE`](NOTICE).
