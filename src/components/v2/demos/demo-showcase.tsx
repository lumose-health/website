"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { createDemoClock } from "@/lib/v2/demo-clock";
import { useLoopRegion } from "@/lib/v2/use-loop-region";
import { useMotion } from "../motion-provider";
import { PauseMotion } from "../pause-motion";
import { QuietPill } from "../quiet-pill";
import { PhonePlaceholder } from "./demo-placeholder";

// The only way into `motion`. A chunk that can't load leaves the static frame,
// where the import error would otherwise take down the whole page.
const PhoneDemo = dynamic(
  () =>
    import("./phone-demo")
      .then((module) => module.PhoneDemo)
      .catch(() => PhonePlaceholder),
  { ssr: false, loading: PhonePlaceholder },
);

const NEAR_VIEWPORT = { rootMargin: "600px" };
const STARTS_CLOCK = { threshold: 0.3 };

const PHONE_SUMMARY =
  "Illustration of the Lumose phone app with made-up data. Someone asks the AI chat about their last 6 hours, a recent high and their current glucose, and each answer is marked not medical advice. A second screen previews caregiver alerts, labeled in development, with a reminder to keep your CGM's own alerts on.";

/** Calls back the first time the element meets the observer's condition. */
function useFirstView(
  onView: () => void,
  options: IntersectionObserverInit,
) {
  return useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;
      const observer = new IntersectionObserver((records) => {
        if (!records.some((record) => record.isIntersecting)) return;
        observer.disconnect();
        onView();
      }, options);
      observer.observe(element);
      return () => observer.disconnect();
    },
    [onView, options],
  );
}

export function DemoShowcase() {
  const { reduced } = useMotion();
  const [approached, setApproached] = useState(false);
  const [clock] = useState(() => createDemoClock());

  const region = useLoopRegion({ onRunningChange: clock.setRunning });

  useEffect(() => clock.stop, [clock]);

  const approachRef = useFirstView(
    useCallback(() => setApproached(true), []),
    NEAR_VIEWPORT,
  );
  const startWhenSeen = useFirstView(clock.start, STARTS_CLOCK);

  return (
    <section
      ref={approachRef}
      id="demo"
      className="border-y border-lm-line-subtle bg-lm-band"
    >
      <div className="mx-auto max-w-lm-content px-lm-gutter py-[72px] tablet:py-[96px] desktop:py-[112px]">
        <Reveal className="mx-auto mb-14 max-w-[720px] text-center">
          <h2 className="mb-3.5 font-lm-display text-lm-h2">
            Your phone, your wrist, the web
          </h2>
          <p className="text-lm-lead text-lm-ink-muted">
            AI chat, the Wear OS watch face and daily briefs, running together,
            plus a preview of caregiver alerts.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div
            {...region}
            className="flex flex-wrap items-start justify-center gap-x-8 gap-y-10"
          >
            <figure
              ref={startWhenSeen}
              className="flex max-w-[300px] flex-col items-center gap-3"
            >
              {/* A sibling of the caption, because a figure with a figcaption
                  can't itself take this role. */}
              <div role="img" aria-label={PHONE_SUMMARY}>
                <div aria-hidden="true">
                  {approached && !reduced ? (
                    <PhoneDemo clock={clock} />
                  ) : (
                    <PhonePlaceholder />
                  )}
                </div>
              </div>
              <figcaption className="text-center">
                <span className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-semibold">
                  Insights &amp; Alerts
                  <QuietPill status="in-development" scope="alerts" />
                </span>
                <span className="mt-2 block text-sm text-lm-ink-muted">
                  AI chat and insights on your phone. Caregiver alerts are being
                  built.
                </span>
              </figcaption>
            </figure>
          </div>
        </Reveal>

        <div className="mx-auto mt-10 flex max-w-[860px] flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <p className="flex max-w-[640px] gap-2 text-xs/[1.6] text-lm-ink-faint">
            <AlertTriangle
              size={14}
              aria-hidden="true"
              className="mt-0.5 flex-none text-lm-caution"
            />
            <span>
              Demo content for illustration. Names and data are made up. Lumose
              is a monitoring and analysis tool, not medical advice. Always talk
              to your care team before changing how you manage diabetes.
            </span>
          </p>
          <PauseMotion />
        </div>
      </div>
    </section>
  );
}
