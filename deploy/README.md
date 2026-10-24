# Production host

Public origin: `https://docs.crawler.lumen-labs.ai` with Next `basePath` `/docs`.

The docs app is a Node server (MCP and `llms.txt` read `content/` at request time). Do not attach this site to `crawler.lumen-labs.ai` (API Gateway).

## DNS

Cloudflare zone `lumen-labs.ai` should have:

- Type: A
- Name: `docs.crawler`
- Content: `217.160.52.62` (same origin as `brainapi.lumen-labs.ai`)
- Proxy: DNS only until TLS and the vhost are confirmed

The origin still needs a TLS vhost for `docs.crawler.lumen-labs.ai` and a PM2 process on port 3878. Until that vhost exists, the hostname will not serve this app.

## Runtime

PM2 app `lumen-crawler-docs` on port **3878**. Release tarball must include `.next`, `content`, `public`, `package.json`, `package-lock.json`, and `ecosystem.config.js`.

Health check: `http://127.0.0.1:3878/docs/v2/quickstart`

Public checks after DNS:

- `https://docs.crawler.lumen-labs.ai/docs/llms.txt`
- `https://docs.crawler.lumen-labs.ai/docs/mcp`
- `https://docs.crawler.lumen-labs.ai/docs/.well-known/mcp.json`
- `https://docs.crawler.lumen-labs.ai/docs/v2/quickstart`

Deploy is manual (`workflow_dispatch`) until this host exists.
