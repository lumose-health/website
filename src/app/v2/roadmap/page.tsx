import type { Metadata } from "next";
import json from "@/data/roadmap.json";
import { CONTRIBUTE_URL } from "@/lib/v2/routes";
import { Card } from "@/components/v2/card";
import { EXTERNAL_LINK } from "@/components/v2/button";
import { ContentRail, type RailItem } from "@/components/v2/content-rail";
import { ContentShell } from "@/components/v2/content-shell";
import { TEXT_LINK, formatDate } from "@/components/v2/changelog/release";
import { Phase, type RoadmapPhase } from "@/components/v2/roadmap/phase";

// noindex comes from the v2 layout. Only the title is set here.
export const metadata: Metadata = {
  title: "Roadmap | Lumose",
};

// The synced copy of the whole roadmap document, in the docs.
const FULL_ROADMAP_URL = "/docs/about/roadmap";

// Used only when the source loses its own opening line, so the page never
// reads as a schedule.
const FALLBACK_LEAD = "Phases are sequenced, not scheduled. We don't commit to dates.";

// Typed by hand: the sync writes an empty list when GitHub fails on a fresh
// checkout, and the inferred type of an empty list would break the build.
type RawPhase = {
  id: string;
  label: string;
  title: string;
  focus: string | null;
  items: { title: string; inDevelopment: boolean }[];
};
type RoadmapData = { generatedAt: string; lead: string | null; phases: RawPhase[] };
const data: RoadmapData = json;

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

// This file is generated, so an id is only used as a fragment when it looks
// like one the sync writes, and a repeated id is dropped.
const PHASE_ID = /^[a-z][a-z0-9-]*$/;
const seen = new Set<string>();

const phases: RoadmapPhase[] = (Array.isArray(data.phases) ? data.phases : [])
  .filter((p) => PHASE_ID.test(text(p?.id)) && text(p.title).length > 0)
  .filter((p) => !seen.has(p.id) && seen.add(p.id))
  .map((p) => ({
    id: p.id,
    label: text(p.label),
    title: text(p.title),
    focus: text(p.focus) || null,
    items: (Array.isArray(p.items) ? p.items : [])
      .filter((item) => text(item?.title).length > 0)
      .map((item) => ({ title: text(item.title), inDevelopment: item.inDevelopment === true })),
  }));

const lead = text(data.lead) || FALLBACK_LEAD;
const syncedOn = formatDate(text(data.generatedAt));

const railItems: RailItem[] = phases.map((p) => ({ id: p.id, label: p.label || p.title }));

const LINK = `inline-flex min-h-lm-touch items-center ${TEXT_LINK}`;

function FullRoadmapLink({ className = "" }: { className?: string }) {
  return (
    <a href={FULL_ROADMAP_URL} className={`${LINK} ${className}`}>
      Read the full roadmap
      <span aria-hidden="true">&nbsp;→</span>
    </a>
  );
}

/** The two ways onward. They close the rail, and close the page where the rail is hidden. */
function OnwardLinks({ className }: { className: string }) {
  return (
    <ul className={className}>
      <li>
        <FullRoadmapLink />
      </li>
      <li>
        <a href={CONTRIBUTE_URL} {...EXTERNAL_LINK} className={LINK}>
          How to get involved
        </a>
      </li>
    </ul>
  );
}

export default function RoadmapPage() {
  const empty = phases.length === 0;

  return (
    <ContentShell
      title="Roadmap"
      lead={lead}
      rail={
        empty ? undefined : (
          <>
            <ContentRail label="Phases" items={railItems} />
            <OnwardLinks className="mt-5 border-t border-lm-line-subtle pt-3 pl-4 text-sm" />
          </>
        )
      }
    >
      {empty ? (
        <Card>
          <p className="text-lm-ink-muted">The roadmap isn&rsquo;t available in this build.</p>
          <p className="mt-3">
            <FullRoadmapLink className="-my-2.5" />
          </p>
        </Card>
      ) : (
        <>
          <div className="divide-y divide-lm-line-subtle">
            {phases.map((phase) => (
              <Phase key={phase.id} phase={phase} />
            ))}
          </div>
          <div className="mt-14 border-t border-lm-line-subtle pt-4">
            <OnwardLinks className="flex flex-col gap-x-8 tablet:flex-row desktop:hidden" />
            {syncedOn && (
              <p className="mt-2 text-sm text-lm-ink-faint">
                Synced from GitHub on {syncedOn}.
              </p>
            )}
          </div>
        </>
      )}
    </ContentShell>
  );
}
