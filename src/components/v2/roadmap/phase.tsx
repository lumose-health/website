import { FOCUS_RING } from "../button";
import { QuietPill } from "../quiet-pill";

export type RoadmapItem = { title: string; inDevelopment: boolean };

export type RoadmapPhase = {
  /** Fragment id, such as phase-1. */
  id: string;
  /** "Ongoing" or "Phase 1". */
  label: string;
  title: string;
  /** Null when the source gives the phase no focus line, or the sync dropped it. */
  focus: string | null;
  items: RoadmapItem[];
};

/**
 * One phase of the roadmap: its label, title, focus line and item titles, all
 * as plain text. The source has no dates, progress or statuses, so none are
 * shown. A phase with no focus line or no items is a shorter section.
 */
export function Phase({ phase }: { phase: RoadmapPhase }) {
  return (
    <section aria-labelledby={phase.id} className="py-10 first:pt-0 last:pb-0">
      <h2
        id={phase.id}
        tabIndex={-1}
        className={`scroll-mt-6 rounded-lm-sm [overflow-wrap:anywhere] ${FOCUS_RING}`}
      >
        {phase.label && (
          <span className="mb-1.5 block font-lm-mono text-xs/[1.4] font-medium text-lm-ink-faint">
            {`${phase.label} `}
          </span>
        )}
        <span className="block font-lm-display text-[22px]/[1.25] font-medium">
          {phase.title}
        </span>
      </h2>

      {phase.focus && <p className="mt-3 text-lm-ink-muted">{phase.focus}</p>}

      {phase.items.length > 0 && (
        <ul className="mt-5 gap-x-10 desktop:columns-2">
          {phase.items.map((item, i) => (
            <li
              key={i}
              className="break-inside-avoid border-t border-lm-line-subtle py-3 [overflow-wrap:anywhere]"
            >
              {item.inDevelopment ? `${item.title} ` : item.title}
              {item.inDevelopment && <QuietPill status="in-development" />}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
