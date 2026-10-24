import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
const check = process.argv.includes("--check");
const sourceRoot =
  process.env.LUMEN_CRAWLER_SOURCE ?? path.resolve(root, "..", "lumen-crawler2");
const sourceYaml = path.join(sourceRoot, "contracts", "openapi.yaml");
const outJson = path.join(root, "schemas", "lumen-crawler.openapi.json");

const descriptions = {
  getAccount: "Return the authenticated console account.",
  getUsage: "Return monthly included-page usage for the account.",
  listApiKeys: "List API key prefixes for the account. Secrets are never returned.",
  createApiKey: "Create an API key. The secret is present only on this response.",
  revokeApiKey: "Revoke an API key. Later crawl calls with that secret return 401.",
  createCheckout: "Create a Stripe Checkout session for Starter or Pro.",
  createPortal: "Create a Stripe Customer Portal session. 404 if the account has no customer.",
  listCrawls: "List crawls for the API key tenant, or for the account when a console JWT is used.",
  createCrawl:
    "Accept a crawl. Returns 202. Requires Idempotency-Key. follow_doors true is 422.",
  getCrawl: "Return crawl status, counts, config, cleanup, and stop_reason.",
  listPages:
    "List page records. Pass include=markdown,cleaned for bodies. cursor is the last urlHash.",
  getMap: "Return the in-universe node/edge graph. Doors are omitted.",
  listDoors: "List off-universe URLs discovered but not fetched. No bodies.",
  getCleaned:
    "Return the site-level cleaned JSON rollup. 409 while cleanup runs; 404 if skipped.",
  cancelCrawl:
    "Cancel a queued or running crawl. Finished crawls return 409.",
};

const tagsByOperation = {
  getAccount: "account",
  getUsage: "account",
  listApiKeys: "account",
  createApiKey: "account",
  revokeApiKey: "account",
  createCheckout: "billing",
  createPortal: "billing",
  listCrawls: "crawls",
  createCrawl: "crawls",
  getCrawl: "crawls",
  listPages: "crawls",
  getMap: "crawls",
  listDoors: "crawls",
  getCleaned: "crawls",
  cancelCrawl: "crawls",
};

if (!existsSync(sourceYaml)) {
  console.error(
    `OpenAPI source not found: ${sourceYaml}. Set LUMEN_CRAWLER_SOURCE to the lumen-crawler2 checkout.`,
  );
  process.exit(1);
}

const spec = parseYaml(await readFile(sourceYaml, "utf8"));

spec.info = {
  ...spec.info,
  title: "Lumen Crawler API",
  description:
    "Task API for Playwright-rendered crawls. Create a crawl, poll status, read Markdown, map, doors, and cleaned JSON.",
};

spec.servers = [
  { url: "https://crawler.lumen-labs.ai/v1", description: "Production" },
];

spec.tags = [
  { name: "crawls", description: "Create, poll, and read crawls" },
  { name: "account", description: "Console account, usage, and API keys" },
  { name: "billing", description: "Stripe Checkout and Customer Portal" },
];

spec.components = spec.components ?? {};
spec.components.securitySchemes = {
  BearerAuth: {
    type: "http",
    scheme: "bearer",
    description:
      "Crawl key (lc_live_…) for /crawls, or Cognito JWT for /account and /billing.",
  },
};

spec.security = [{ BearerAuth: [] }];

const methods = new Set(["get", "put", "post", "delete", "patch"]);

for (const [route, pathItem] of Object.entries(spec.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!methods.has(method) || !operation || typeof operation !== "object") {
      continue;
    }
    const id = operation.operationId;
    if (id && descriptions[id]) {
      operation.description = descriptions[id];
    }
    if (id && tagsByOperation[id]) {
      operation.tags = [tagsByOperation[id]];
    }
    operation.security = [{ BearerAuth: [] }];
  }
}

const create = spec.paths?.["/crawls"]?.post;
if (create?.requestBody?.content?.["application/json"]) {
  create.requestBody.content["application/json"].example = {
    url: "https://example.com",
    max_pages: 50,
    cleanup: true,
  };
}

const body = `${JSON.stringify(spec, null, 2)}\n`;

if (check) {
  if (!existsSync(outJson)) {
    console.error("Missing schemas/lumen-crawler.openapi.json. Run npm run api:sync.");
    process.exit(1);
  }
  const current = await readFile(outJson, "utf8");
  if (current !== body) {
    console.error(
      "OpenAPI snapshot is out of date with sibling lumen-crawler2/contracts/openapi.yaml. Run npm run api:sync.",
    );
    process.exit(1);
  }
  console.log("OpenAPI snapshot matches the sibling contract overlay.");
  process.exit(0);
}

await writeFile(outJson, body);
console.log(`Wrote ${path.relative(root, outJson)}`);
