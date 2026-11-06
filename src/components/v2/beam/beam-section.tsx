import { Reveal } from "@/components/reveal";
import { routes } from "@/lib/v2/routes";
import { FOCUS_RING } from "../button";
import { MarksNotice } from "../marks-notice";
import { Marquee } from "../marquee";
import { PauseMotion } from "../pause-motion";
import { BeamDesktop } from "./beam-desktop";
import { BeamMobile } from "./beam-mobile";

const DIAGRAM_LABEL =
  "Illustration: Dexcom, Tandem, Medtronic, Glooko and Nightscout connect to your server, which connects to Claude, OpenAI, GitHub Copilot and Ollama.";

export function BeamSection() {
  return (
    <section
      id="connect-logos"
      className="mx-auto max-w-lm-content px-lm-gutter pt-[72px] pb-[72px] tablet:pt-[96px] tablet:pb-[96px] desktop:pt-[120px] desktop:pb-[112px]"
    >
      <Reveal className="text-center">
        <h2 className="mx-auto mb-[18px] max-w-[760px] font-lm-display text-lm-h2">
          Plugs into what you already run.
        </h2>
        <p className="mx-auto mb-14 max-w-[680px] text-lm-lead text-balance text-lm-ink-muted">
          Sign in to a device cloud, pair over Bluetooth, or point Lumose at
          your Nightscout. Lumose is the AI layer on top of the platforms you
          trust.
        </p>
      </Reveal>

      {/* Runs into the gutters, so the fixed widths fit at 760px and 360px. */}
      <div role="img" aria-label={DIAGRAM_LABEL} className="-mx-lm-gutter">
        <div aria-hidden="true" className="flex justify-center overflow-x-clip">
          <BeamDesktop />
          <BeamMobile />
        </div>
      </div>

      <Marquee className="mt-16" />

      <MarksNotice className="mt-6 text-center">
        <a
          href={`${routes.home}#connect`}
          className={`rounded-lm-sm text-lm-blue-light underline underline-offset-4 hover:text-[#8CC8FF] ${FOCUS_RING}`}
        >
          See device status →
        </a>{" "}
        <PauseMotion />
      </MarksNotice>
    </section>
  );
}
