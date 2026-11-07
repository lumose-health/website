"use client";

import { useCallback, useEffect, useState } from "react";
import { createStepTimer } from "@/lib/v2/dashboard-range";
import { useLoopRegion } from "@/lib/v2/use-loop-region";
import { QuietPill } from "./quiet-pill";

const STEP_MS = 3000;
const STATE_COUNT = 5;
// The static HTML and the reduced motion end state, so the ladder is complete
// with JS off, and the cycle begins here once it's in view.
const ALL_LIT = STATE_COUNT - 1;
const START_RATIO = 0.4;

const STEPS = [
  {
    title: "Urgent low: 52 mg/dL",
    sub: "Matched by a fixed rule",
    litRow: "border-lm-glucose-urgent bg-lm-raised",
    litTile: "border-lm-glucose-urgent bg-lm-glucose-urgent text-lm-page",
  },
  {
    title: "In-app alert",
    litRow: "border-lm-glucose-high-low bg-lm-raised",
    litTile: "border-lm-glucose-high-low bg-lm-glucose-high-low text-lm-page",
  },
  {
    title: "Caregiver escalation",
    inDevelopment: true,
    litRow: "border-dashed border-lm-blue-light bg-transparent",
    litTile: "border-lm-blue-light text-lm-blue-light",
  },
];

// Frozen drops the fade too, so a change caught mid-way doesn't keep moving
// while motion is stopped.
const STATE_FADE =
  "transition-colors duration-(--lm-dur-base) ease-(--ease-lm-in-out) motion-reduce:transition-none in-data-[lm-loop=frozen]:transition-none";
const IDLE_ROW = "border-lm-line bg-transparent";
const IDLE_TILE = "border-lm-line text-lm-ink-faint";

/**
 * Lights one row at a time. The timer follows the loop region, so it stops
 * offscreen, in a hidden tab, while paused and under reduced motion, and picks
 * up from the same state.
 */
export function AlertLadder() {
  const [state, setState] = useState(ALL_LIT);
  const [timer] = useState(() =>
    createStepTimer(STEP_MS, () =>
      setState((current) => (current + 1) % STATE_COUNT),
    ),
  );

  const region = useLoopRegion<HTMLElement>({
    onRunningChange: timer.setRunning,
    onSettle: () => setState(ALL_LIT),
  });

  useEffect(() => timer.stop, [timer]);

  const startWhenSeen = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return;
      const observer = new IntersectionObserver(
        (records) => {
          if (!records.some((r) => r.intersectionRatio >= START_RATIO)) return;
          observer.disconnect();
          timer.start();
        },
        { threshold: START_RATIO },
      );
      observer.observe(element);
      return () => observer.disconnect();
    },
    [timer],
  );

  return (
    <figure
      {...region}
      className="rounded-lm-card-lg border border-lm-line bg-lm-panel p-4 tablet:p-6"
    >
      <div
        ref={startWhenSeen}
        aria-hidden="true"
        className="flex flex-col gap-2.5"
      >
        {STEPS.map((step, index) => {
          const lit = index < state;
          return (
            <div
              key={step.title}
              className={`flex items-center gap-3.5 rounded-[14px] border p-4 tablet:px-[18px] ${STATE_FADE} ${lit ? step.litRow : IDLE_ROW}`}
            >
              <span
                className={`flex size-[34px] flex-none items-center justify-center rounded-[10px] border font-lm-mono text-[13px] font-bold tabular-nums ${STATE_FADE} ${lit ? step.litTile : IDLE_TILE}`}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={`block font-semibold ${STATE_FADE} ${lit ? "text-lm-ink" : "text-lm-ink-faint"}`}
                >
                  {step.title}
                </span>
                {step.sub ? (
                  <span
                    className={`block text-[13px]/[1.5] ${STATE_FADE} ${lit ? "text-lm-ink-muted" : "text-lm-ink-faint"}`}
                  >
                    {step.sub}
                  </span>
                ) : null}
                {step.inDevelopment ? (
                  <span className="mt-1 block">
                    <QuietPill status="in-development" />
                  </span>
                ) : null}
              </span>
            </div>
          );
        })}
      </div>

      {/* The role keeps list semantics in Safari, which drops them when list markers are removed. */}
      <ol role="list" className="sr-only">
        {STEPS.map((step) => (
          <li key={step.title}>
            {`${step.title}. ${step.sub ? `${step.sub}. ` : ""}`}
            {step.inDevelopment ? <QuietPill status="in-development" /> : null}
          </li>
        ))}
      </ol>

      <figcaption className="mt-3 font-lm-mono text-[12px]/[1.5] text-lm-ink-faint tablet:text-[11px]/[1.5]">
        Illustrative example. Alerting is in active development and works only
        for some setups.
      </figcaption>
    </figure>
  );
}
