import type { Metadata } from "next";
import DefaultNotFound from "next/dist/client/components/builtin/not-found";
import { isV2Preview } from "@/lib/v2/preview";

// Next marks every 404 noindex by itself, with or without this file.
export const metadata: Metadata = isV2Preview()
  ? { title: "Page not found | Lumose" }
  : {};

// Loaded on demand, and only in a preview build. Every route carries this
// file, so a plain import would put the new fonts on every page of the site.
// The check is written out, not isV2Preview(), because the bundler only drops
// the import when it can see the inlined value from next.config.ts right here.
async function PreviewNotFound() {
  if (process.env.NEXT_PUBLIC_V2_PREVIEW === "1") {
    const { NotFoundShell } = await import("@/components/v2/legal-shell");
    return <NotFoundShell />;
  }
  return null;
}

export default function NotFound() {
  // Outside a preview build this is the page Next would render with no
  // not-found file at all, so the live 404 stays as it was.
  return isV2Preview() ? <PreviewNotFound /> : <DefaultNotFound />;
}
