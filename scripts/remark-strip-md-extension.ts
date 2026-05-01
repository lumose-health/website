/**
 * Resolves markdown cross-doc links to absolute URLs and strips .md/.mdx.
 *
 * Source repo docs use standard markdown convention for internal links:
 *   [Acknowledgments](./acknowledgments.md)
 *   [Section](../foo/bar.md#anchor)
 *   [text][ref]                       (with [ref]: ./bar.md elsewhere)
 *
 * Why we can't just strip the extension and leave the relative path alone:
 *   The browser resolves relative URLs against the current page URL. Pages
 *   served at /docs/platform (no trailing slash) treat "platform" as a
 *   filename, so ./foo resolves to /docs/foo (one level too high). Pages
 *   served with a trailing slash break the inverse case (sibling links
 *   resolve into the wrong directory). The only correct fix is to compute
 *   the absolute URL at MDX-processing time, where we know the source file
 *   path.
 *
 * Algorithm:
 *   1. Get source file path relative to content/docs (e.g. platform/concepts/byoai.md)
 *   2. Resolve the relative href against the file's parent directory
 *   3. Strip .md / .mdx extension
 *   4. Prefix with /docs/
 *
 * Skipped (left as-is):
 *   - absolute URLs (http://, mailto:, etc.)
 *   - protocol-relative URLs (//foo)
 *   - root-relative paths (/foo) — already in URL space
 *   - URLs that don't end in .md / .mdx
 */

import path from "node:path";
import { visit } from "unist-util-visit";
import type { Root, Link, Definition } from "mdast";
import type { VFile } from "vfile";

const CONTENT_DOCS_SEGMENT = "/content/docs/";
const URL_BASE = "/docs";

function rewriteUrl(url: string | null | undefined, filePath: string | undefined): string {
  if (!url) return url ?? "";

  // Absolute / external / root-relative — leave alone
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  if (url.startsWith("//")) return url;
  if (url.startsWith("/")) return url;

  // Strip .md/.mdx (with optional #anchor and ?query) — only paths matching this are rewritten
  const match = url.match(/^(.*?)\.(md|mdx)(#[^?]*)?(\?.*)?$/i);
  if (!match) return url;
  const [, base, , anchor = "", query = ""] = match;

  // Need source file path to resolve relative URLs to absolute
  if (!filePath) return `${base}${anchor}${query}`;

  // Find content/docs segment in the absolute file path
  const normalized = filePath.replace(/\\/g, "/");
  const idx = normalized.indexOf(CONTENT_DOCS_SEGMENT);
  if (idx < 0) return `${base}${anchor}${query}`;

  // path of source file under content/docs/, e.g. "platform/concepts/byoai.md"
  const relFromContent = normalized.slice(idx + CONTENT_DOCS_SEGMENT.length);
  // parent directory of source file, e.g. "platform/concepts"
  const fileDir = path.posix.dirname(relFromContent);

  // Resolve relative URL against source file's directory
  let resolved = path.posix.normalize(path.posix.join(fileDir, base));

  // Fumadocs treats "<dir>/index.md" as the page at <dir>'s URL.
  // Strip a trailing /index so links like ./troubleshooting/index.md
  // resolve to /docs/.../troubleshooting (not .../troubleshooting/index).
  if (resolved === "index") resolved = "";
  else if (resolved.endsWith("/index")) resolved = resolved.slice(0, -"/index".length);

  return `${URL_BASE}/${resolved}${anchor}${query}`;
}

export function remarkStripMdExtension() {
  return (tree: Root, file: VFile) => {
    const filePath = typeof file.path === "string" ? file.path : undefined;
    visit(tree, "link", (node: Link) => {
      node.url = rewriteUrl(node.url, filePath);
    });
    visit(tree, "definition", (node: Definition) => {
      node.url = rewriteUrl(node.url, filePath);
    });
  };
}
