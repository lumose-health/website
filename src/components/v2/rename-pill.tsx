import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/v2/routes";
import { FOCUS_RING } from "./button";

export function RenamePill() {
  return (
    <a
      href={routes.rename}
      // The ::before stretches the 32px pill to a 44px touch target.
      className={`group relative mb-[30px] inline-flex items-center gap-2 rounded-full border border-lm-blue-light/35 bg-lm-cta/70 py-[5px] pr-2 pl-[5px] text-[13px] whitespace-nowrap text-[#D3E6FA] backdrop-blur-[8px] before:absolute before:-inset-y-[6px] before:inset-x-0 min-[380px]:gap-2.5 min-[380px]:text-sm ${FOCUS_RING}`}
    >
      <span className="rounded-full bg-lm-blue-fill px-2.5 py-0.5 text-xs font-semibold text-white">
        New name
      </span>
      GlycemicGPT is now Lumose
      <ArrowRight
        size={14}
        aria-hidden="true"
        className="text-lm-blue-light transition-transform duration-(--lm-dur-instant) group-hover:translate-x-[3px] motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </a>
  );
}
