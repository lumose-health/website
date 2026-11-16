// Canonical production origin for the public site. Used for metadata URLs,
// the sitemap and robots.txt. Preview builds are served from
// pr-*.lumose.pages.dev but still point here as the official site.
export const SITE_URL = "https://lumose.org";
export const SITE_HOST = "lumose.org";

// Open Graph fields every page shares. A page that sets its own openGraph
// replaces the root one whole, so it spreads this and adds its title and url.
export const OPEN_GRAPH = {
  title: "Lumose - Open Source Diabetes Management Platform",
  description:
    "Because no one should manage diabetes alone. Real-time glucose monitoring, AI-powered analysis, and Wear OS support.",
  siteName: "Lumose",
  type: "website",
} as const;
