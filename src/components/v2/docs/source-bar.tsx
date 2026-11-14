import { formatSyncDate, type DocSource } from "@/lib/v2/doc-source";
import { EXTERNAL_LINK } from "../button";

// Set once while the site is built, which is also when the docs are synced.
// This file has no client code, so the date is fixed in the HTML.
const SYNCED = formatSyncDate(new Date());

/** Says which repo and file a docs page comes from, with a link to edit it. */
export function SourceBar({ source }: { source: DocSource }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lm-button-sm border border-lm-docs-line bg-lm-docs-panel px-3.5 py-2.5 text-[13px] leading-5">
      <p className="min-w-0 font-mono text-lm-docs-body wrap-anywhere">
        {`${source.repo} · ${source.path}`}
      </p>
      <p className="flex flex-wrap items-center gap-x-4 text-lm-docs-muted">
        {/* The area to hit is 44px high. The focus outline stays on the text. */}
        <a
          href={source.editUrl}
          {...EXTERNAL_LINK}
          className="relative rounded-xs after:absolute after:inset-x-0 after:-inset-y-3 text-lm-docs-link underline underline-offset-2 transition-colors duration-(--lm-dur-instant) hover:text-lm-docs-link-hover"
        >
          Edit on GitHub
        </a>
        <span>
          {"Synced "}
          <time dateTime={SYNCED.iso}>{SYNCED.label}</time>
        </span>
      </p>
    </div>
  );
}
