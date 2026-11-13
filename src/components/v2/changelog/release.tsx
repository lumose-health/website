import { EXTERNAL_LINK, FOCUS_RING } from "../button";
import { QuietPill } from "../quiet-pill";

export type ChangelogEntry = {
  text: string;
  area: string | null;
  /** Null when the notes name no pull request, or its link failed the check in the page. */
  prUrl: string | null;
  prNumber: number | null;
  inDevelopment: boolean;
};

export type ChangelogRelease = {
  version: string;
  /** Fragment id, such as v0-16-0. */
  anchor: string;
  /** YYYY-MM-DD, or empty when the sync had no date. */
  date: string;
  /** Null when the link failed the check in the page. */
  url: string | null;
  maintenance: boolean;
  new: ChangelogEntry[];
  fixed: ChangelogEntry[];
  breaking: ChangelogEntry[];
};

const GROUPS = [
  { key: "new", title: "New" },
  { key: "fixed", title: "Fixed" },
  { key: "breaking", title: "Breaking" },
] as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-05" reads "Nov 5, 2026". Formatted by hand so the build's time zone can't shift the day. */
export function formatDate(iso: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return null;
  const month = MONTHS[Number(m[2]) - 1];
  if (!month) return null;
  return `${month} ${Number(m[3])}, ${m[1]}`;
}

export const TEXT_LINK = `rounded-lm-sm text-lm-blue-light underline-offset-4 transition-colors duration-(--lm-dur-instant) hover:text-lm-ink hover:underline ${FOCUS_RING}`;

// Heading levels shift by two inside the older releases, where each row has its own heading.
type Level = 2 | 4;

function Entry({ entry }: { entry: ChangelogEntry }) {
  return (
    <li className="flex flex-col gap-x-6 gap-y-1 py-3 tablet:flex-row tablet:items-baseline tablet:justify-between">
      <p className="min-w-0 [overflow-wrap:anywhere]">
        {entry.inDevelopment ? `${entry.text} ` : entry.text}
        {entry.inDevelopment && <QuietPill status="in-development" />}
      </p>
      {(entry.area || entry.prUrl) && (
        <p className="flex shrink-0 items-center gap-3 font-lm-mono text-xs font-medium text-lm-ink-faint">
          {entry.area}
          {entry.prUrl && (
            // The link keeps a 44px hit area without making every row 44px tall.
            // The label keeps the visible "#1002" so speech input still finds it.
            <a
              href={entry.prUrl}
              aria-label={`Pull request #${entry.prNumber}`}
              {...EXTERNAL_LINK}
              className={`-my-2.5 inline-flex min-h-lm-touch min-w-lm-touch items-center tablet:justify-end ${TEXT_LINK}`}
            >
              #{entry.prNumber}
            </a>
          )}
        </p>
      )}
    </li>
  );
}

export function Release({ release, level = 2 }: { release: ChangelogRelease; level?: Level }) {
  const Heading = level === 2 ? "h2" : "h4";
  const GroupHeading = level === 2 ? "h3" : "h5";
  const date = formatDate(release.date);
  const groups = GROUPS.filter((g) => release[g.key].length > 0);

  return (
    <article aria-labelledby={release.anchor} className="py-10 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-x-4 gap-y-1 tablet:flex-row tablet:items-baseline">
        <Heading
          id={release.anchor}
          tabIndex={-1}
          className={`scroll-mt-6 rounded-lm-sm font-lm-mono font-bold ${level === 2 ? "text-2xl/[1.2]" : "text-xl/[1.2]"} [overflow-wrap:anywhere] ${FOCUS_RING}`}
        >
          {release.version}
        </Heading>
        {date && (
          <time dateTime={release.date} className="font-lm-mono text-xs font-medium text-lm-ink-faint">
            {date}
          </time>
        )}
        {release.url && (
          <a
            href={release.url}
            {...EXTERNAL_LINK}
            aria-label={`View on GitHub: ${release.version}`}
            className={`-my-2.5 inline-flex min-h-lm-touch items-center self-start tablet:ml-auto tablet:self-auto ${TEXT_LINK}`}
          >
            View on GitHub&nbsp;→
          </a>
        )}
      </div>

      {groups.length === 0 || release.maintenance ? (
        <p className="mt-4 text-lm-ink-muted">Maintenance release.</p>
      ) : (
        groups.map((group) => (
          <div key={group.key} className="mt-6">
            <GroupHeading
              className={`font-lm-display font-medium ${level === 2 ? "text-[22px]/[1.25]" : "text-lg/[1.3]"}`}
            >
              {group.title}
            </GroupHeading>
            <ul className="mt-2 divide-y divide-lm-line-subtle">
              {release[group.key].map((entry, i) => (
                <Entry key={i} entry={entry} />
              ))}
            </ul>
          </div>
        ))
      )}
    </article>
  );
}
