// Every internal link in the new site goes through this file. The pages moved
// from /v2 to the root by emptying BASE; public/_redirects sends old links on.
const BASE: string = "";

export const routes = {
  home: BASE || "/",
  changelog: `${BASE}/changelog`,
  roadmap: `${BASE}/roadmap`,
  rename: `${BASE}/rename`,

  // Docs and legal pages are not rebuilt under BASE, so these stay absolute.
  docs: "/docs",
  privacy: "/privacy",
  terms: "/terms",
  disclaimer: "/disclaimer",
  accessibility: "/accessibility",
  contact: "/contact",
} as const;

/** The id of a release on the changelog page: "v0.16.0" becomes "v0-16-0". */
export function releaseAnchor(version: string): string {
  const slug = version.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return /^v/.test(slug) ? slug : `v${slug}`;
}

/** A link to one release on the changelog page. */
export function releaseHref(version: string): string {
  return `${routes.changelog}#${releaseAnchor(version)}`;
}

// External links shared across v2. They live here, not in a component, so a
// client component can import them without pulling in that component's data.
export const GITHUB_URL = "https://github.com/lumose-health/lumose";
// The repo this site is built from, as "owner/name".
export const WEBSITE_REPO = "lumose-health/website";
export const SPONSOR_URL = "https://opencollective.com/lumose";
export const DISCORD_URL = "https://discord.gg/QbyhCQKDBs";
export const DISCUSSIONS_URL =
  "https://github.com/orgs/lumose-health/discussions";
export const CONTRIBUTE_URL =
  "https://github.com/lumose-health/lumose/blob/main/CONTRIBUTING.md";
