import {
  defineCollections,
  defineConfig,
  defineDocs,
  frontmatterSchema,
} from "fumadocs-mdx/config";
import { remarkStripMdExtension } from "./scripts/remark-strip-md-extension";

export const docs = defineDocs({
  dir: "content/docs",
});

// Pages the site owns that are not docs, such as the rename note. They are
// kept out of content/docs so the docs sidebar and sitemap never list them.
export const pages = defineCollections({
  type: "doc",
  dir: "content/pages",
  schema: frontmatterSchema,
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkStripMdExtension],
    rehypeCodeOptions: {
      themes: { light: "github-light", dark: "github-dark" },
      // Source repo docs use a wide range of code-fence languages.
      // Fall back to plaintext for any language we don't ship a grammar for
      // instead of failing the build.
      defaultLanguage: "plaintext",
      fallbackLanguage: "plaintext",
      lazy: true,
      langs: [
        "bash",
        "shell",
        "json",
        "yaml",
        "markdown",
        "javascript",
        "typescript",
        "tsx",
        "jsx",
        "python",
        "kotlin",
        "java",
        "html",
        "css",
        "dockerfile",
        "ini",
        "toml",
        "diff",
      ],
    },
  },
});
