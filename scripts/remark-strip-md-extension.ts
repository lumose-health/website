/**
 * Strips .md / .mdx extensions from relative markdown link URLs.
 *
 * Source repo docs use standard markdown convention for internal links:
 *   [Acknowledgments](./acknowledgments.md)
 *   [Section](../foo/bar.md#anchor)
 *   [text][ref]                       (with [ref]: ./bar.md elsewhere)
 *
 * That works on GitHub's markdown renderer (we don't break docs viewed in
 * the source repo). On the website those need to become extension-less so
 * they resolve to Fumadocs page URLs:
 *   /docs/platform/concepts/acknowledgments
 *   /docs/platform/foo/bar#anchor
 *
 * Both inline links (`Link` AST nodes) and reference-style link definitions
 * (`Definition` AST nodes) are rewritten.
 *
 * Skips:
 *   - absolute URLs (http://, https://, mailto:, tel:, //)
 *   - root-relative paths (/foo/bar.md)  — those are already-resolved hrefs
 *   - URLs that don't end in .md / .mdx
 */

import { visit } from "unist-util-visit";
import type { Root, Link, Definition } from "mdast";

function rewriteUrl(url: string | null | undefined): string {
  if (!url) return url ?? "";

  // Absolute / external URLs — leave alone
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  if (url.startsWith("//")) return url;
  if (url.startsWith("/")) return url;

  // Match optional path + .md/.mdx + optional #anchor and/or ?query
  const match = url.match(/^(.*?)\.(md|mdx)(#[^?]*)?(\?.*)?$/i);
  if (!match) return url;

  const [, base, , anchor = "", query = ""] = match;
  return `${base}${anchor}${query}`;
}

export function remarkStripMdExtension() {
  return (tree: Root) => {
    visit(tree, "link", (node: Link) => {
      node.url = rewriteUrl(node.url);
    });
    visit(tree, "definition", (node: Definition) => {
      node.url = rewriteUrl(node.url);
    });
  };
}
