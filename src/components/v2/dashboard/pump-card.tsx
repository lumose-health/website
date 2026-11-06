import type { DashboardSnapshot } from "@/lib/v2/simulated-glucose";
import { AppCard } from "../browser-frame";

type PumpCardProps = Pick<
  DashboardSnapshot,
  "iobUnits" | "basalUnitsPerHour" | "reservoirUnits"
>;

export function PumpCard({
  iobUnits,
  basalUnitsPerHour,
  reservoirUnits,
}: PumpCardProps) {
  const rows = [
    { label: "IOB:", value: `${iobUnits.toFixed(2)}u` },
    { label: "BASAL:", value: `${basalUnitsPerHour.toFixed(2)} u/hr` },
    { label: "BATTERY:", value: "64%" },
    { label: "RESERVOIR:", value: `${reservoirUnits}u` },
  ];

  return (
    <AppCard title="Live Pump">
      <div className="px-3.5 pt-1 pb-2.5 font-lm-mono text-[12px] font-bold tablet:text-[11px]">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between border-b border-[#343A42] py-3"
          >
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
