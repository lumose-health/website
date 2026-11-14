"use client";

import { useEffect, useState } from "react";
import { FOCUS_RING } from "./button";

export type RailItem = { id: string; label: string };

// How far below the viewport top a heading must pass to count as the one being read.
const READ_LINE = 120;

/**
 * Moves focus to the heading a fragment points at, so keyboard and screen
 * reader users land where the page scrolled. A target inside a closed
 * <details> row opens it first, because a closed row can't be scrolled to.
 */
function focusHashTarget() {
  let id: string;
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    // A malformed fragment such as #% names no heading.
    return;
  }
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
 * marked by color alone, and a jump moves focus to its heading.
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
      // A short last section can't reach the line, because the page runs out
      // of scroll first. At the foot of a scrolled page it is the one in view.
      const page = document.documentElement;
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= page.scrollHeight - 2) {
        active = targets[targets.length - 1].id;
      }
      setCurrent(active);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
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
                // Re-clicking the current link fires no hashchange, so focus it here too.
                onClick={() => requestAnimationFrame(focusHashTarget)}
                className={`-my-1 flex min-h-lm-touch items-center border-l-2 pl-3.5 text-sm transition-colors duration-(--lm-dur-instant) hover:text-lm-ink ${FOCUS_RING} ${
                  isCurrent
                    ? "border-lm-blue-light text-lm-ink"
                    : "border-transparent text-lm-ink-muted"
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
