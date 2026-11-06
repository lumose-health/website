import { Reveal } from "@/components/reveal";
import { deviceCards, NOT_WORKING_ISSUE_URL } from "@/data/device-status";
import type { DeviceCard } from "@/data/device-status";
import { EXTERNAL_LINK, FOCUS_RING } from "./button";
import { Card } from "./card";
import { QuietPill } from "./quiet-pill";

const LEGEND =
  "Beta: built, not fully checked against real hardware. Untested: no real-hardware testing yet. Not working: ";

function StatusCard({ card }: { card: DeviceCard }) {
  return (
    <Card className="flex h-full flex-col gap-3.5">
      <p className="text-[13px] text-lm-ink-faint">{card.kicker}</p>
      <h3 className="font-lm-display text-[22px]/[1.25] font-medium">
        {card.title}
      </h3>
      <p className="text-sm/[1.5] text-lm-ink-muted">{card.description}</p>

      {/* The role keeps list semantics in Safari, which drops them when list markers are removed. */}
      <ul role="list" className="mt-auto border-t border-lm-line">
        {card.rows.map((row) => (
          <li
            key={row.name}
            className="flex items-center justify-between gap-2.5 border-b border-lm-line py-2.5 text-sm"
          >
            <span className="min-w-0">{row.name}</span>
            <span className="sr-only">: </span>
            <QuietPill status={row.status} />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function DeviceCards() {
  return (
    <section
      id="connect"
      className="mx-auto max-w-lm-content px-lm-gutter pt-[72px] pb-[72px] tablet:pt-[96px] tablet:pb-[96px] desktop:pt-[112px]"
    >
      <Reveal className="mb-12 max-w-[680px]">
        <h2 className="mb-3.5 font-lm-display text-lm-h2">
          Meets you where your data already is
        </h2>
        <p className="text-lm-lead text-lm-ink-muted">
          Every connection is read-only. If we haven&apos;t tested something on
          real hardware, we say so.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 desktop:grid-cols-3">
        {deviceCards.map((card, index) => (
          <Reveal key={card.title} delay={index * 100}>
            <StatusCard card={card} />
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-sm/[1.5] text-lm-ink-faint">
        {LEGEND}
        <a
          href={NOT_WORKING_ISSUE_URL}
          {...EXTERNAL_LINK}
          className={`rounded-lm-sm text-lm-blue-light underline underline-offset-4 hover:text-[#8CC8FF] ${FOCUS_RING}`}
        >
          tracked on GitHub
        </a>
        .
      </p>
    </section>
  );
}
