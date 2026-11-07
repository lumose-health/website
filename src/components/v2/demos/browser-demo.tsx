"use client";

import { useEffect, useState } from "react";
import {
  BROWSER_SECTIONS,
  BROWSER_TRACK,
  browserSectionsAt,
} from "@/lib/v2/demo-clock";
import type { DemoClock } from "@/lib/v2/demo-clock";
import { InsightsPage } from "./demo-placeholder";

// Sections leave at once and fade in over 400ms. The browser runs the fade, so
// no script loop runs between the clock's marks.
const SHOWN =
  "translate-y-0 opacity-100 transition-[opacity,translate] duration-400 ease-out";
const HIDDEN = "translate-y-2 opacity-0";

/**
 * Shows the finished brief until the clock first runs. After that it rebuilds
 * section by section each time the phone shows its Daily Brief alert.
 */
export function BrowserDemo({ clock }: { clock: DemoClock }) {
  const [sections, setSections] = useState(BROWSER_SECTIONS);

  useEffect(
    () =>
      clock.add(BROWSER_TRACK, (position) =>
        setSections(browserSectionsAt(position)),
      ),
    [clock],
  );

  return (
    <InsightsPage reveal={(section) => (section < sections ? SHOWN : HIDDEN)} />
  );
}
