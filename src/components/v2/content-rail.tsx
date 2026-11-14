"use client";

import { useEffect, useState } from "react";
import { FOCUS_RING } from "./button";

export type RailItem = { id: string; label: string };

// How far below the viewport top a heading must pass to count as the one being read.
const READ_LINE = 120;

/** The id the fragment names, or an empty string when it names none. */
function hashId(): string {
  try {
    return decodeURIComponent(window.location.hash.slice(1));
  } catch {
    // A malformed fragment such as #% names no heading.
    return "";
  }
}

/**
 * Moves focus to the heading a fragment points at, so keyboard and screen
 * reader users land where the page scrolled. A target inside a closed
 * <details> row opens it first, because a closed row can't be scrolled to.
 */
function focusHashTarget() {
  const id = hashId();
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;

  const details = target.closest("details");
  const wasClosed = details !== null && !details.open;
  if (details && wasClosed) details.open = true;

  target.focus({ preventScroll: !wasClosed });
  if (wasClosed) target.scrollIntoView();
}

/**
 * The side list of sections on a content page, from 1020px up. Links are plain
 * fragments, so it works without JS. With JS, the section being read is
 * marked with aria-current and a colored edge, and a jump moves focus to its
 * heading.
 */
export function ContentRail({
  label,
  items,
}: {
  label: string;
  items: readonly RailItem[];
}) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    focusHashTarget();
    window.addEventListener("hashchange", focusHashTarget);
    return () => window.removeEventListener("hashchange", focusHashTarget);
  }, []);

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (targets.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      let active = targets[0].id;
      for (const el of targets) {
        if (el.getBoundingClientRect().top <= READ_LINE) active = el.id;
        else break;
      }
      // Sections near the end can't reach the line, because the page runs out
      // of scroll first. At the foot of a scrolled page, mark the section the
      // reader jumped to while its heading is on screen, or else the last one.
      // A page too short to scroll is always at its foot, so a jump there marks
      // its heading too, and with no jump the first section stays marked.
      const page = document.documentElement;
      if (window.scrollY + window.innerHeight >= page.scrollHeight - 2) {
        const id = hashId();
        const jumped = targets.find((el) => el.id === id);
        const top = jumped?.getBoundingClientRect().top;
        const onScreen = top !== undefined && top >= 0 && top < window.innerHeight;
        if (jumped && onScreen) active = jumped.id;
        else if (window.scrollY > 0) active = targets[targets.length - 1].id;
      }
      setCurrent(active);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    // A resize changes how far the page scrolls, so the foot can move too. A
    // jump made at the foot may not scroll at all, so the fragment is watched.
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav aria-label={label}>
      <ul>
        {items.map((item) => {
          const isCurrent = item.id === current;
          return (
            <li key={item.id} className="h-9">
              <a
                href={`#${item.id}`}
                aria-current={isCurrent ? "location" : undefined}
                // Re-clicking the current link fires no hashchange, so focus it here too.
                onClick={() => requestAnimationFrame(focusHashTarget)}
                className={`-my-1 flex min-h-lm-touch items-center border-l-2 pl-3.5 text-sm transition-colors duration-(--lm-dur-instant) hover:text-lm-ink ${FOCUS_RING} ${
                  // Forced colors paint a transparent edge as text, so there the
                  // current item takes the system highlight and the rest match the page.
                  isCurrent
                    ? "border-lm-blue-light text-lm-ink forced-colors:border-[Highlight]"
                    : "border-transparent text-lm-ink-muted forced-colors:border-[Canvas]"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
