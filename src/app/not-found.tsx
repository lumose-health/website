import type { Metadata } from "next";
import DefaultNotFound from "next/dist/client/components/builtin/not-found";

// next.config.ts inlines this value in every build, which is what lets the
// bundler drop the preview branch below from other builds.
const isPreview = process.env.NEXT_PUBLIC_V2_PREVIEW === "1";

// Next marks every 404 noindex by itself, with or without this file. A preview
// build clears the robots tag from the root layout so the page has one, not two.
export const metadata: Metadata = isPreview
  ? { title: "Page not found | Lumose", robots: null }
  : {};

export default function NotFound() {
  // The shell is imported here, on demand, because every route carries this
  // file and a plain import would put the new fonts on every page of the site.
  if (process.env.NEXT_PUBLIC_V2_PREVIEW === "1") {
    return import("@/components/v2/legal-shell").then(({ NotFoundShell }) => (
      <NotFoundShell />
    ));
  }

  // The page Next would render with no not-found file at all, so the live 404
  // stays as it was.
  return <DefaultNotFound />;
}
