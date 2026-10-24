# Production host

Public origin: `https://crawler-docs.lumen-labs.ai` with Next `basePath` `/docs`.

The docs app is a Node server (MCP and `llms.txt` read `content/` at request time). Do not attach this site to `crawler.lumen-labs.ai` (API Gateway).

`docs.crawler.lumen-labs.ai` is not used. Cloudflare Universal SSL covers `*.lumen-labs.ai` only, not nested `docs.crawler.lumen-labs.ai`.

## DNS

Cloudflare zone `lumen-labs.ai`:

- Type: CNAME
- Name: `crawler-docs`
- Content: `f8498e64-f410-45b5-aec0-6aaa1d86768d.cfargotunnel.com`
- Proxy: proxied

## Runtime

On `217.160.52.62` as `chriscoder`:

- PM2 app `lumen-crawler-docs` on port **3878**
- PM2 app `lumen-crawler-docs-tunnel` (`cloudflared tunnel run`) to the remotely managed tunnel `lumen-crawler-docs`

Release tarball must include `.next` (without `cache`/`dev`), `content`, `public`, `.source`, `package.json`, `package-lock.json`, `ecosystem.config.js`, and `next.config.mjs`. After extract, `pm2 delete` then `pm2 start ecosystem.config.js` from the new `current` directory so the cwd updates.

Health check: `http://127.0.0.1:3878/docs/v2/quickstart`

Public checks:

- `https://crawler-docs.lumen-labs.ai/docs/llms.txt`
- `https://crawler-docs.lumen-labs.ai/docs/mcp`
- `https://crawler-docs.lumen-labs.ai/docs/.well-known/mcp.json`
- `https://crawler-docs.lumen-labs.ai/docs/v2/quickstart`

Deploy is manual (`workflow_dispatch`) after GitHub `production` SSH secrets exist.
