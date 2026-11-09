// Every internal v2 link goes through this file, so moving the new site to the
// root means changing BASE and nothing else.
const BASE: string = "/v2";

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

// External links shared across v2. They live here, not in a component, so a
// client component can import them without pulling in that component's data.
export const GITHUB_URL = "https://github.com/lumose-health/lumose";
export const SPONSOR_URL = "https://opencollective.com/lumose";
export const DISCORD_URL = "https://discord.gg/QbyhCQKDBs";
export const DISCUSSIONS_URL =
  "https://github.com/orgs/lumose-health/discussions";
export const CONTRIBUTE_URL =
  "https://github.com/lumose-health/lumose/blob/main/CONTRIBUTING.md";
