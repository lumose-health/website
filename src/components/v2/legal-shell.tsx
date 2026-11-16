import type { ReactNode } from "react";
import { routes } from "@/lib/v2/routes";
import { ButtonLink } from "./button";
import { ContentShell } from "./content-shell";

type LegalShellProps = {
  title: string;
  lastUpdated: string;
  intro?: string;
  children: ReactNode;
};

/**
 * The legal pages in the site frame. The pages pass plain headings, paragraphs
 * and lists, so their type is set by the .lm-legal rules in globals.css.
 */
export function LegalShell({ title, lastUpdated, intro, children }: LegalShellProps) {
  return (
    <ContentShell title={title} lead={intro}>
      <p className="border-b border-lm-line-subtle pb-6 text-sm text-lm-ink-muted">
        Last updated: {lastUpdated}
      </p>
      <article className="lm-legal mt-8">{children}</article>
    </ContentShell>
  );
}

/** The 404 in the site frame. Static hosts serve it for any missing URL. */
export function NotFoundShell() {
  return (
    <ContentShell
      title="Page not found"
      lead="There is nothing at this address. The page may have moved, or the link may be wrong."
    >
      <ButtonLink href={routes.home}>Back to the home page</ButtonLink>
    </ContentShell>
  );
}
