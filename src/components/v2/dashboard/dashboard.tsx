"use client";

import { useState } from "react";
import { DEFAULT_RANGE } from "@/lib/v2/dashboard-range";
import type { RangeHours } from "@/lib/v2/dashboard-range";
import { dashboardAt } from "@/lib/v2/simulated-glucose";
import { BrowserFrame } from "../browser-frame";
import { CgmCard } from "./cgm-card";
import { ConnectionsCard } from "./connections-card";
import { PumpCard } from "./pump-card";
import { RangeControl } from "./range-control";
import { Sidebar } from "./sidebar";
import { Trend } from "./trend";
import { useDashboardTick, useShownOnce } from "./use-dashboard-tick";

const UPDATED = "1m ago";

// A client component, so the lanes are built from the tick and the sample data
// stays out of the page payload. Everything shown comes from the tick, which keeps
// the first render free of time and random values.
export function Dashboard() {
  const [hours, setHours] = useState<RangeHours>(DEFAULT_RANGE);
  const { tick, region, start } = useDashboardTick();
  const riseRef = useShownOnce(0);
  const {
    glucose,
    band,
    pointerDegrees,
    iobUnits,
    basalUnitsPerHour,
    reservoirUnits,
  } = dashboardAt(tick);

  return (
    <section className="relative z-10 -mt-16 px-lm-gutter pb-10 tablet:-mt-[120px] desktop:-mt-[230px]">
      <figure {...region} className="mx-auto max-w-[1180px]">
        <div ref={riseRef} className="lm-dash-rise">
          <BrowserFrame
            url="your-server.local/dashboard"
            label={`Illustration of the Lumose dashboard with simulated data, showing a glucose reading, pump status, device connections and ${hours}-hour trends.`}
            hideContent={false}
          >
            <div className="flex">
              <Sidebar />
              <div className="min-w-0 flex-1 p-3.5">
                <div
                  aria-hidden="true"
                  className="grid gap-3 tablet:grid-cols-3"
                >
                  <CgmCard
                    glucose={glucose}
                    band={band}
                    pointerDegrees={pointerDegrees}
                    updated={UPDATED}
                  />
                  <PumpCard
                    iobUnits={iobUnits}
                    basalUnitsPerHour={basalUnitsPerHour}
                    reservoirUnits={reservoirUnits}
                  />
                  <ConnectionsCard updated={UPDATED} />
                </div>
                <RangeControl hours={hours} onChange={setHours} />
                <Trend tick={tick} hours={hours} onDrawn={start} />
              </div>
            </div>
          </BrowserFrame>
        </div>
        <figcaption className="mt-3 text-center font-lm-mono text-[12px] text-lm-ink-muted">
          Simulated data for illustration.
        </figcaption>
      </figure>
    </section>
  );
}
