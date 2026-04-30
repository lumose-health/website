import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
});

export default defineConfig({
  mdxOptions: {
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
