import { Trash2 } from "lucide-react";

const DISCLAIMER = "Not medical advice. Consult your healthcare provider.";

// The app's chat border and its dark text on blue. White on this blue is 3.3:1.
const BORDER = "border-[#343A42]";
const ON_BLUE = "text-[#14212A]";
const PANEL_RADIUS = "rounded-[4px]";

const SUMMARY = `Illustration of the Lumose AI Chat page with sample data. Someone asks why they keep running high after breakfast. The answer describes the pattern in their glucose and suggests raising it with their care team. It ends: ${DISCLAIMER}`;

/**
 * Drawn from the app's AI Chat page. Nothing here is a control, and the answer
 * is the same for every provider. Don't add dosing suggestions to the sample.
 */
export function ChatMockup() {
  return (
    <div
      role="img"
      aria-label={SUMMARY}
      className={`overflow-hidden rounded-[14px] border ${BORDER} bg-lm-app-panel text-left text-lm-app-text`}
    >
      <div className="bg-lm-app-disclaimer-bar p-[5px] text-center font-lm-mono text-[12px] font-bold tablet:text-[10px]">
        Not medical advice
      </div>

      <div className="flex flex-col gap-3.5 px-3.5 pt-4 pb-3 tablet:px-[18px]">
        <p
          className={`max-w-[85%] self-end ${PANEL_RADIUS} bg-lm-app-primary px-3 py-2 text-sm ${ON_BLUE}`}
        >
          Why do I keep running high after breakfast?
        </p>

        <div
          className={`max-w-[94%] self-start ${PANEL_RADIUS} border ${BORDER} bg-lm-app-page px-3.5 py-3 text-[13.5px]/[1.5]`}
        >
          <p className="mb-2">
            <strong>What I see in your data:</strong> on 9 of the last 14
            mornings you rose 60–90 mg/dL within an hour of eating.
          </p>
          <ul className="mb-2 list-disc pl-[18px]">
            <li>Peaks were higher on days with a later breakfast.</li>
            <li>Overnight stayed in range, so the rise starts after breakfast.</li>
          </ul>
          <p className="mb-2.5">
            <strong>Worth mentioning to your endo/CDE:</strong> this morning
            pattern and your breakfast timing.
          </p>
          <p
            className={`border-t ${BORDER} pt-2 font-lm-mono text-[12px]/[1.4] font-bold tablet:text-[11px]`}
          >
            {DISCLAIMER}
          </p>
        </div>
      </div>

      <p className="px-3.5 pb-2 text-center font-lm-mono text-[12px]/[1.4] font-bold tablet:text-[11px]">
        {DISCLAIMER}
      </p>

      <div
        aria-hidden="true"
        className={`flex gap-2 border-t ${BORDER} bg-lm-app-page px-3 py-2.5`}
      >
        <span
          className={`flex min-h-10 min-w-0 flex-1 items-center ${PANEL_RADIUS} border border-lm-app-text px-3 text-[13px] text-[#949EA8]`}
        >
          <span className="truncate">Ask about your glucose data...</span>
        </span>
        <span
          className={`inline-flex flex-none items-center gap-1.5 ${PANEL_RADIUS} border ${BORDER} px-2.5 font-lm-mono text-[12px] font-bold tablet:text-[11px]`}
        >
          <Trash2 size={12} />
          Clear
        </span>
        <span
          className={`inline-flex flex-none items-center ${PANEL_RADIUS} bg-lm-app-primary px-4 text-[13px] ${ON_BLUE}`}
        >
          Send
        </span>
      </div>
    </div>
  );
}
