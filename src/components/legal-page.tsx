import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { isV2Preview } from "@/lib/v2/preview";

interface LegalPageProps {
  title: string;
  /** Human-readable date, e.g. "May 27, 2026". */
  lastUpdated: string;
  /** Optional one-line summary shown under the title. */
  intro?: string;
  children: React.ReactNode;
}

// Loaded on demand, and only in a preview build. A plain import would put the
// new fonts on every page that uses this file, in every build. The check is
// written out, not isV2Preview(), because the bundler only drops the import
// when it can see the inlined value from next.config.ts right here.
async function PreviewLegalPage(props: LegalPageProps) {
  if (process.env.NEXT_PUBLIC_V2_PREVIEW === "1") {
    const { LegalShell } = await import("@/components/v2/legal-shell");
    return <LegalShell {...props} />;
  }
  return null;
}

/**
 * Shared chrome and typography for the static legal/standard pages
 * (/privacy, /terms, /disclaimer, /accessibility, /contact).
 *
 * Typography is applied with Tailwind descendant selectors rather than the
 * typography plugin, which is not a dependency of this project. Keeping it
 * local avoids adding one just for a handful of long-form pages.
 */
export function LegalPage({ title, lastUpdated, intro, children }: LegalPageProps) {
  // The new look, in preview builds only. The words are the same either way.
  if (isV2Preview()) {
    return (
      <PreviewLegalPage title={title} lastUpdated={lastUpdated} intro={intro}>
        {children}
      </PreviewLegalPage>
    );
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32">
        <header className="mb-10 border-b border-border pb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {intro && (
            <p className="mt-3 text-base text-muted-foreground">{intro}</p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </header>

        <article
          className="
            text-[15px] leading-relaxed text-foreground/80
            [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground
            [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground
            [&_p]:my-4
            [&_ul]:my-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6
            [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6
            [&_li]:pl-1
            [&_strong]:font-semibold [&_strong]:text-foreground
            [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-foreground/80
            [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:text-foreground
            [&_blockquote]:my-4 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic
          "
        >
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
