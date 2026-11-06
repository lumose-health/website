import type { TrendWindow } from "@/lib/v2/simulated-glucose";

// The first and last labels sit inside the plot edges. The others center on their
// time, and they drop out on phones, where five labels won't fit at 12px.
function labelClass(index: number, count: number) {
  if (index === 0) return "";
  if (index === count - 1) return "-translate-x-full";
  const isMiddle = index * 2 === count - 1;
  return `-translate-x-1/2 ${isMiddle ? "" : "hidden tablet:block"}`;
}

export function TimeAxis({ timeLabels }: Pick<TrendWindow, "timeLabels">) {
  return (
    <div className="pt-1.5 pl-[34px]">
      <div className="relative h-4 text-[12px] leading-4 text-lm-app-text-muted tablet:text-[10px]">
        {timeLabels.map((label, index) => (
          <span
            key={index}
            className={`absolute top-0 whitespace-nowrap ${labelClass(index, timeLabels.length)}`}
            style={{ left: `${(index / (timeLabels.length - 1)) * 100}%` }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
