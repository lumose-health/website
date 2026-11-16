import { LegalShell } from "@/components/v2/legal-shell";

interface LegalPageProps {
  title: string;
  /** Human-readable date, e.g. "May 27, 2026". */
  lastUpdated: string;
  /** Optional one-line summary shown under the title. */
  intro?: string;
  children: React.ReactNode;
}

/**
 * Shared chrome and typography for the static legal/standard pages
 * (/privacy, /terms, /disclaimer, /accessibility, /contact). The pages pass
 * plain headings, paragraphs and lists, styled by the .lm-legal rules in
 * globals.css.
 */
export function LegalPage({ title, lastUpdated, intro, children }: LegalPageProps) {
  return (
    <LegalShell title={title} lastUpdated={lastUpdated} intro={intro}>
      {children}
    </LegalShell>
  );
}
