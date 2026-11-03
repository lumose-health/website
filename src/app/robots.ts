import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Required for `output: export` so this emits a static robots.txt at build.
export const dynamic = "force-static";

const isPreview = process.env.NEXT_PUBLIC_BUILD_ENV === "preview";

export default function robots(): MetadataRoute.Robots {
  // Preview builds: keep PR preview hosts out of search indexes entirely.
  if (isPreview) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
