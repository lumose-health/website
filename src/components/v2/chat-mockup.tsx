import { Trash2 } from "lucide-react";
import { PROVIDERS } from "@/data/providers";
import type { SampleChat } from "@/data/providers";
import { useProviderSelection } from "./provider-context";

const DISCLAIMER = "Not medical advice. Consult your healthcare provider.";

// The app's chat border and its dark text on blue. White on this blue is 3.3:1.
const BORDER = "border-[#343A42]";
const ON_BLUE = "text-[#14212A]";
const PANEL_RADIUS = "rounded-[4px]";

const summaryFor = (chat: SampleChat) =>
  `Illustration of the Lumose AI Chat page with sample data. ${chat.summary} It ends: ${DISCLAIMER}`;

// Every sample stays in place, stacked in one cell, so the chat is always as
// tall as the tallest of them and a swap is a true crossfade. A hidden sample
// also drops out of find-in-page and text selection once it has faded.
const SAMPLE =
  "[grid-area:1/1] flex min-w-0 flex-col gap-3.5 transition-[opacity,visibility] duration-(--lm-dur-fast) motion-reduce:transition-none";

/**
 * Drawn from the app's AI Chat page. Nothing here is a control. Each provider
 * shows its own sample from the provider data, which holds the content rules.
 */
export function ChatMockup() {
  const { provider } = useProviderSelection();

  return (
    <div
      role="img"
      aria-label={summaryFor(provider.chat)}
      className={`overflow-hidden rounded-[14px] border ${BORDER} bg-lm-app-panel text-left text-lm-app-text`}
    >
      <div className="bg-lm-app-disclaimer-bar p-[5px] text-center font-lm-mono text-[12px] font-bold tablet:text-[10px]">
        Not medical advice
      </div>

      <div className="grid px-3.5 pt-4 pb-3 tablet:px-[18px]">
        {PROVIDERS.map(({ id, chat }) => (
          <div
            key={id}
            data-chat-sample={id}
            className={`${SAMPLE} ${id === provider.id ? "" : "invisible opacity-0"}`}
          >
            <p
              className={`max-w-[85%] self-end ${PANEL_RADIUS} bg-lm-app-primary px-3 py-2 text-sm ${ON_BLUE}`}
            >
              {chat.question}
            </p>

            <div
              className={`max-w-[94%] self-start ${PANEL_RADIUS} border ${BORDER} bg-lm-app-page px-3.5 py-3 text-[13.5px]/[1.5]`}
            >
              <p className="mb-2">
                <strong>What I see in your data:</strong>
                {` ${chat.seen}`}
              </p>
              <ul className="mb-2 list-disc pl-[18px]">
                {chat.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <p className="mb-2.5">
                <strong>Worth mentioning to your endo/CDE:</strong>
                {` ${chat.mention}`}
              </p>
              <p
                className={`border-t ${BORDER} pt-2 font-lm-mono text-[12px]/[1.4] font-bold tablet:text-[11px]`}
              >
                {DISCLAIMER}
              </p>
            </div>
          </div>
        ))}
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
