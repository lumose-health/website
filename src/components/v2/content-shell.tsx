import type { ReactNode } from "react";
import { SiteFrame } from "./site-frame";

type ContentShellProps = {
  title: string;
  lead?: string;
  /** Side navigation, shown from 1020px up. Pages without one get a narrower column. */
  rail?: ReactNode;
  children: ReactNode;
};

/**
 * The calm page frame shared by Changelog, Roadmap, the rename note, the legal
 * pages and the 404: a title, one lead line and a reading column, with an
 * optional rail to its left, inside the site frame. No hero art and nothing
 * that moves.
 */
export function ContentShell(props: ContentShellProps) {
  return (
    <SiteFrame>
      <ContentColumn {...props} />
    </SiteFrame>
  );
}

function ContentColumn({ title, lead, rail, children }: ContentShellProps) {
  const column = rail ? "max-w-[720px] desktop:mx-0" : "max-w-[640px]";

  return (
    <main className="mx-auto max-w-lm-content px-lm-gutter pt-12 pb-20 tablet:pt-[72px] tablet:pb-28">
      <div
        className={
          rail
            ? "desktop:grid desktop:grid-cols-[200px_minmax(0,720px)] desktop:justify-center desktop:gap-16"
            : ""
        }
      >
        {rail && (
          <div className="hidden desktop:block">
            <div className="sticky top-8">{rail}</div>
          </div>
        )}
        <div className={`mx-auto min-w-0 ${column}`}>
          <h1 className="font-lm-display text-lm-h2 text-balance">{title}</h1>
          {lead && (
            <p className="mt-3.5 text-lm-lead text-lm-ink-muted">{lead}</p>
          )}
          <div className="mt-12">{children}</div>
        </div>
      </div>
    </main>
  );
}
