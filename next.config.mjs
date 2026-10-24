import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  agentRules: false,
  basePath: "/docs",
  async rewrites() {
    return [
      {
        source: "/v2/:path*.md",
        destination: "/llms.mdx/v2/:path*",
      },
    ];
  },
};

export default withMDX(config);
