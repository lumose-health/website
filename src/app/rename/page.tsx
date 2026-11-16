import type { ComponentProps, ReactNode } from "react";
import type { Metadata } from "next";
import { OPEN_GRAPH, pageTitle } from "@/lib/site";
import { notFound } from "next/navigation";
import { getSitePage } from "@/lib/source";
import { DISCORD_URL, routes } from "@/lib/v2/routes";
import { EXTERNAL_LINK } from "@/components/v2/button";
import { ContentShell } from "@/components/v2/content-shell";
import { TEXT_LINK } from "@/components/v2/changelog/release";

// The note itself is content/pages/rename.mdx. This file only frames it.
const note = getSitePage("rename");

const TITLE = "GlycemicGPT is now Lumose";
// The note's own one-line summary, from content/pages/rename.mdx.
const DESCRIPTION = note?.description;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: routes.rename },
  openGraph: { ...OPEN_GRAPH, title: pageTitle(TITLE), description: DESCRIPTION, url: routes.rename },
};

// The note names its links by key, so every address still comes from routes.ts
// and moves with the rest of the site.
const LINKS: Record<string, string> = {
  changelog: routes.changelog,
  setup: `${routes.docs}/platform/get-started`,
  discord: DISCORD_URL,
};

function NoteLink({ to, children }: { to: string; children: ReactNode }) {
  const href = Object.hasOwn(LINKS, to) ? LINKS[to] : undefined;
  if (!href) return <>{children}</>;

  return (
    <a
      href={href}
      {...(href.startsWith("https:") ? EXTERNAL_LINK : {})}
      // Negative margins keep the 44px target from pushing the lines apart.
      className={`-my-2.5 inline-flex min-h-lm-touch items-center underline ${TEXT_LINK}`}
    >
      {children}
    </a>
  );
}

const components = {
  NoteLink,
  h2: (props: ComponentProps<"h2">) => (
    <h2
      {...props}
      className="mt-10 mb-3 font-lm-display text-[22px]/[1.25] font-medium first:mt-0"
    />
  ),
  p: (props: ComponentProps<"p">) => (
    <p {...props} className="mt-4 text-lm-ink-secondary" />
  ),
  ul: (props: ComponentProps<"ul">) => (
    <ul {...props} className="divide-y divide-lm-line-subtle border-y border-lm-line-subtle" />
  ),
  li: (props: ComponentProps<"li">) => (
    <li {...props} className="py-3 text-lm-ink-secondary" />
  ),
  code: (props: ComponentProps<"code">) => (
    <code
      {...props}
      className="font-lm-mono text-lm-ink [overflow-wrap:anywhere]"
    />
  ),
};

export default function RenamePage() {
  if (!note) notFound();
  const Body = note.body;

  return (
    <ContentShell title={note.title} lead={note.description ?? ""}>
      <Body components={components} />
    </ContentShell>
  );
}
