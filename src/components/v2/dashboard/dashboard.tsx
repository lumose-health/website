import { DEMO_START_TICK, dashboardAt } from "@/lib/v2/simulated-glucose";
import { BrowserFrame } from "../browser-frame";
import { CgmCard } from "./cgm-card";
import { ConnectionsCard } from "./connections-card";
import { PumpCard } from "./pump-card";
import { Sidebar } from "./sidebar";

const UPDATED = "1m ago";

export function Dashboard() {
  const { glucose, band, pointerDegrees, iobUnits, reservoirUnits } =
    dashboardAt(DEMO_START_TICK);

  return (
    <section className="relative z-10 -mt-16 px-lm-gutter pb-10 tablet:-mt-[120px] desktop:-mt-[230px]">
      <figure className="mx-auto max-w-[1180px]">
        <BrowserFrame
          url="your-server.local/dashboard"
          label="Illustration of the Lumose dashboard with simulated data, showing a glucose reading, pump status and device connections."
        >
          <div className="flex">
            <Sidebar />
            <div className="min-w-0 flex-1 p-3.5">
              <div className="grid gap-3 tablet:grid-cols-3">
                <CgmCard
                  glucose={glucose}
                  band={band}
                  pointerDegrees={pointerDegrees}
                  updated={UPDATED}
                />
                <PumpCard iobUnits={iobUnits} reservoirUnits={reservoirUnits} />
                <ConnectionsCard updated={UPDATED} />
              </div>
            </div>
          </div>
        </BrowserFrame>
        <figcaption className="mt-3 text-center font-lm-mono text-[12px] text-lm-ink-muted">
          Simulated data for illustration.
        </figcaption>
      </figure>
    </section>
  );
}
