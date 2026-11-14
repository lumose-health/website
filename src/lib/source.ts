import { docs, pages } from "../../.source/server";
import { loader } from "fumadocs-core/source";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

/** A site-owned page from content/pages, by file name without the extension. */
export function getSitePage(name: string) {
  return pages.find((page) => page.info.path === `${name}.mdx`);
}
