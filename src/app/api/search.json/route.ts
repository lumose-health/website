import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// The site is a static export, so there is no server to answer a query. The
// build writes the whole docs index to out/api/search.json once, and the
// browser searches it. Only pages from the docs loader go in.
//
// The path is not /api/search on purpose. The production docs still use the
// stock dialog, which asks /api/search?query=... and gets a 404. A file at
// that path would answer each of those queries with the full index instead.
// The .json name also gets the file a JSON content type, and with it
// compression, from static hosts.
export const dynamic = "force-static";

export const { staticGET: GET } = createFromSource(source);
