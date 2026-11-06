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
