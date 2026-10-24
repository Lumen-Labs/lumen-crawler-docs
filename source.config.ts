import {
  defineConfig,
  defineDocs,
  frontmatterSchema,
  metaSchema,
} from "fumadocs-mdx/config";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import lastModified from "fumadocs-mdx/plugins/last-modified";

export const v2 = defineDocs({
  dir: "content/v2",
  docs: {
    schema: frontmatterSchema,
  },
  meta: {
    schema: metaSchema,
  },
});

export default defineConfig({
  plugins: [lastModified()],
  mdxOptions: {
    rehypePlugins: (v) => [rehypeKatex, ...v],
    remarkPlugins: [remarkMath],
  },
});
