import { AppCard } from "../browser-frame";

const DEVICES = ["Dexcom", "Tandem"];

export function ConnectionsCard({ updated }: { updated: string }) {
  return (
    <AppCard title="Live Connections" className="hidden tablet:block">
      <div className="grid grid-cols-[1.2fr_auto_0.9fr] items-center gap-x-2 gap-y-2 px-3 py-2.5 font-lm-mono text-[11px] font-bold desktop:px-3.5">
        <span className="text-[10px] text-lm-app-text-muted">DEVICE</span>
        <span className="text-[10px] text-lm-app-text-muted">STATUS</span>
        <span className="text-right text-[10px] text-lm-app-text-muted">
          UPDATED
        </span>
        <div className="col-span-full -mt-0.5 border-b border-[#343A42]" />

        {DEVICES.map((device) => (
          <div key={device} className="col-span-full grid grid-cols-subgrid">
            <span>{device}</span>
            <span>
              <span className="rounded-[3px] bg-[#173A2F] px-1.5 py-px text-lm-glucose-in-range">
                Connected
              </span>
            </span>
            <span className="text-right">{updated}</span>
          </div>
        ))}
      </div>
    </AppCard>
  );
}
