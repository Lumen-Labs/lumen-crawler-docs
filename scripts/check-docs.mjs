import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const contentRoot = path.join(root, "content", "v2");
const hidden = [];
const redirects = new Set();

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(full) : [full];
    }),
  );
  return nested.flat();
}

function pageRoute(file) {
  const relative = path
    .relative(contentRoot, file)
    .split(path.sep)
    .filter((segment) => !/^\(.+\)$/.test(segment));
  const last = relative.pop().replace(/\.mdx$/, "");
  if (last !== "index") relative.push(last);
  return `/v2${relative.length ? `/${relative.join("/")}` : ""}`;
}

function isPublished(route) {
  return !hidden.some(
    (prefix) => route === prefix || route.startsWith(`${prefix}/`),
  );
}

function headingSlug(heading) {
  return heading
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[`*_~]/g, "")
    .replace(/&[a-z]+;/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const mdxFiles = (await walk(contentRoot)).filter((file) =>
  file.endsWith(".mdx"),
);
const routeFiles = new Map();
const sources = new Map();
const errors = [];
const navigationRoutes = new Map();

for (const file of mdxFiles) {
  const route = pageRoute(file);
  if (!isPublished(route)) continue;
  if (routeFiles.has(route)) {
    errors.push(
      `Duplicate route ${route}: ${routeFiles.get(route)} and ${file}`,
    );
  }
  routeFiles.set(route, file);
  sources.set(route, await readFile(file, "utf8"));
}

const validRoutes = new Set([...routeFiles.keys(), ...redirects]);
const markdownLink = /\]\((\/v2[^)\s]*)\)|href=["'](\/v2[^"']*)["']/g;

async function inspectNavigation(directory) {
  const metaPath = path.join(directory, "meta.json");
  let meta;
  try {
    meta = JSON.parse(await readFile(metaPath, "utf8"));
  } catch (error) {
    errors.push(
      `Navigation group is missing or invalid: ${metaPath} (${error.message})`,
    );
    return;
  }

  for (const item of meta.pages ?? []) {
    const linked =
      typeof item === "string"
        ? item.match(/^\[[^\]]+\]\((\/v2[^)]*)\)$/)
        : null;
    if (linked) {
      const route = linked[1].replace(/\/$/, "") || "/v2";
      if (!routeFiles.has(route)) {
        errors.push(
          `${metaPath}: navigation points to unpublished or missing route ${route}`,
        );
      }
      if (navigationRoutes.has(route)) {
        errors.push(
          `Duplicate navigation route ${route}: ${navigationRoutes.get(route)} and ${metaPath}`,
        );
      }
      navigationRoutes.set(route, metaPath);
      continue;
    }
    if (
      typeof item === "string" &&
      item !== "---" &&
      item !== "..." &&
      !item.startsWith("!")
    ) {
      await inspectNavigation(path.join(directory, item));
    }
  }
}

await inspectNavigation(contentRoot);

for (const route of routeFiles.keys()) {
  if (!navigationRoutes.has(route)) {
    errors.push(
      `Published route is not reachable from V2 navigation: ${route}`,
    );
  }
}

for (const [sourceRoute, body] of sources) {
  for (const match of body.matchAll(markdownLink)) {
    const raw = match[1] ?? match[2];
    const [target, fragment] = raw.split("#", 2);
    const cleanTarget = target.replace(/[?].*$/, "").replace(/\/$/, "") || "/v2";
    if (!validRoutes.has(cleanTarget)) {
      errors.push(`${sourceRoute}: broken internal link ${raw}`);
      continue;
    }
    if (!fragment || !sources.has(cleanTarget)) continue;
    const targetBody = sources.get(cleanTarget);
    const headings = new Set(
      [...targetBody.matchAll(/^#{1,6}\s+(.+)$/gm)].map((item) =>
        headingSlug(item[1]),
      ),
    );
    if (!headings.has(decodeURIComponent(fragment))) {
      errors.push(`${sourceRoute}: missing anchor ${raw}`);
    }
  }

  for (const fence of body.matchAll(/```json\s*\n([\s\S]*?)```/g)) {
    try {
      JSON.parse(fence[1]);
    } catch (error) {
      errors.push(`${sourceRoute}: invalid JSON fence (${error.message})`);
    }
  }
}

const schema = JSON.parse(
  await readFile(path.join(root, "schemas", "lumen-crawler.openapi.json"), "utf8"),
);
if (!String(schema.openapi).startsWith("3.1.")) {
  errors.push(`OpenAPI version must be 3.1.x, received ${schema.openapi}`);
}

const expectedServers = ["https://crawler.lumen-labs.ai/v1"];
if (
  JSON.stringify(schema.servers?.map((server) => server.url)) !==
  JSON.stringify(expectedServers)
) {
  errors.push("OpenAPI servers must list the production crawl API /v1");
}

if (!schema.components?.securitySchemes?.BearerAuth) {
  errors.push("OpenAPI must declare BearerAuth");
}

const operationIds = new Set();
const operationMethods = new Set([
  "get",
  "put",
  "post",
  "delete",
  "patch",
  "head",
  "options",
  "trace",
]);

for (const [route, pathItem] of Object.entries(schema.paths ?? {})) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!operationMethods.has(method) || !operation || typeof operation !== "object") {
      continue;
    }
    const label = `${method.toUpperCase()} ${route}`;
    const operationId = operation.operationId;
    if (typeof operationId !== "string" || !/^[a-z][A-Za-z0-9]*$/.test(operationId)) {
      errors.push(`${label}: operationId must be stable lowerCamelCase`);
    } else {
      if (operationIds.has(operationId)) {
        errors.push(`${label}: duplicate operationId ${operationId}`);
      }
      operationIds.add(operationId);
    }
    if (typeof operation.description !== "string" || !operation.description.trim()) {
      errors.push(`${label}: missing operation description`);
    }
    if (!operation.tags?.length) {
      errors.push(`${label}: missing tag`);
    }
  }
}

const llmsSource = await readFile(
  path.join(root, "src", "lib", "llms-index.ts"),
  "utf8",
);
const rootBuilder = llmsSource.slice(
  llmsSource.indexOf("export function buildRootLlmsTxt"),
  llmsSource.indexOf("export function buildVersionLlmsTxt"),
);
const firstH1 = rootBuilder.indexOf("# Lumen Crawler");
const summary = rootBuilder.indexOf("\n> ");
const guidance = rootBuilder.indexOf("**When to use Lumen Crawler:**");
const firstH2 = rootBuilder.indexOf("\n## ");
if (firstH1 < 0 || summary < firstH1 || guidance < summary || firstH2 < guidance) {
  errors.push(
    "Root llms.txt must contain one H1, a blockquote summary, non-heading usage guidance, then H2 link sections",
  );
}
if (
  (rootBuilder.match(/# Lumen Crawler/g) ?? []).length !== 1 ||
  /\n#{3,6}\s/.test(rootBuilder)
) {
  errors.push(
    "Root llms.txt must contain exactly one H1 and only H2 link sections after guidance",
  );
}
for (const label of [
  "Lumen Crawler documentation",
  "Quickstart",
  "Lumen Crawler OpenAPI 3.1 specification",
  "Copy-paste prompts",
  "Docs MCP",
  "FAQ",
]) {
  if (!rootBuilder.includes(`[${label}]`)) {
    errors.push(`Root llms.txt is missing named link: ${label}`);
  }
}

const mcpDiscovery = JSON.parse(
  await readFile(path.join(root, "public", ".well-known", "mcp.json"), "utf8"),
);
if (
  mcpDiscovery.url !== "https://crawler-docs.lumen-labs.ai/docs/mcp" ||
  mcpDiscovery.transport !== "streamable-http"
) {
  errors.push("Docs MCP discovery must identify the Streamable HTTP docs endpoint");
}
if (
  mcpDiscovery.authentication?.required !== false ||
  mcpDiscovery.capabilities?.tools !== true
) {
  errors.push("Docs MCP discovery must declare unauthenticated tool capability");
}

const deployWorkflow = await readFile(
  path.join(root, ".github", "workflows", "deploy.yaml"),
  "utf8",
);
const runtimePackageCommand = deployWorkflow
  .split("\n")
  .reduce((joined, line, index, lines) => {
    if (joined) return joined;
    if (!line.includes("tar -czf lumen-crawler-docs-release.tgz")) return "";
    let command = line.trimEnd();
    for (let i = index; command.endsWith("\\") && i + 1 < lines.length; i += 1) {
      command = `${command.slice(0, -1)} ${lines[i + 1].trim()}`;
    }
    return command;
  }, "");
if (!runtimePackageCommand.split(/\s+/).includes("content")) {
  errors.push(
    "Production runtime package must include content for Markdown and Docs MCP reads",
  );
}

if (errors.length) {
  console.error(`Documentation validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Validated ${routeFiles.size} published V2 routes, navigation, links, JSON fences, llms.txt structure, and ${operationIds.size} OpenAPI operations.`,
);
