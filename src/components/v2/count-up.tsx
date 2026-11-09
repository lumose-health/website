"use client";

import { useEffect, useRef } from "react";
import { useMotion } from "./motion-provider";

const DURATION_MS = 1600;
// Counting starts when the number's top passes 85% of the viewport height.
const TRIGGER_MARGIN = "0px 0px -15% 0px";

const format = (n: number) => n.toLocaleString("en-US");
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

type Phase = "final" | "waiting" | "counting";

/**
 * A number that counts up once when it scrolls into view.
 *
 * The static HTML holds the final value, so it shows as-is with scripting off,
 * when the bundle never loads, under reduced motion, while motion is paused,
 * on arrival by `#contributors`, and when it is already onscreen at hydration.
 * Only a number still below the fold at hydration is set to 0 to wait.
 *
 * This is a one-shot, so it runs on its own frames and not on the shared loop
 * scheduler, which freezes everything while paused. Pausing or turning on
 * reduced motion part way through jumps straight to the final value.
 */
export function CountUp({ value }: { value: number }) {
  const { paused, reduced } = useMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const phase = useRef<Phase>("final");
  const finish = useRef<() => void>(() => {});

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const observers: IntersectionObserver[] = [];
    const show = (n: number) => {
      el.textContent = format(n);
    };
    finish.current = () => {
      cancelAnimationFrame(frame);
      observers.forEach((o) => o.disconnect());
      phase.current = "final";
      show(value);
    };

    const skip =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.location.hash === "#contributors" ||
      el.getBoundingClientRect().top < window.innerHeight;
    if (skip || value <= 0) return () => finish.current();

    phase.current = "waiting";
    show(0);

    const start = () => {
      phase.current = "counting";
      const begin = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - begin) / DURATION_MS, 1);
        if (t >= 1) {
          finish.current();
          return;
        }
        show(Math.round(value * easeOutCubic(t)));
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        start();
      },
      { rootMargin: TRIGGER_MARGIN },
    );
    observers.push(io);
    io.observe(el);

    return () => finish.current();
  }, [value]);

  // The motion state settles just after hydration, so this runs after the
  // mount effect above and corrects it when motion turns out to be paused.
  useEffect(() => {
    if ((paused || reduced) && phase.current !== "final") finish.current();
  }, [paused, reduced]);

  const text = format(value);

  return (
    <>
      {/* The hidden copy reserves the final width, so counting never shifts the row. */}
      <span aria-hidden="true" className="inline-grid tabular-nums">
        <span className="invisible col-start-1 row-start-1">{text}</span>
        <span ref={ref} className="col-start-1 row-start-1">
          {text}
        </span>
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}
