"use client";

import type { ComponentType, CSSProperties, ReactNode } from "react";
import {
  Bluetooth,
  Brain,
  CircleHelp,
  Database,
  Droplet,
  FileText,
  Lightbulb,
  Monitor,
  Server,
  Smartphone,
} from "lucide-react";
import { Reveal } from "@/components/reveal";
import { useLoopRegion } from "@/lib/v2/use-loop-region";
import { useShownOnce } from "./dashboard/use-dashboard-tick";

type Icon = ComponentType<{ className?: string; strokeWidth?: number }>;

// Labels follow the product. The phone sits in this chain only for pumps it
// reads over Bluetooth; cloud sources reach the server directly.
const NODES = [
  { label: "Your Devices", sub: "Pump over Bluetooth", icon: Bluetooth },
  { label: "Mobile App", sub: "Android + Wear OS", icon: Smartphone },
  { label: "Platform Core", sub: "API + orchestration", icon: Server },
  { label: "Web Dashboard", sub: "Real-time monitoring", icon: Monitor },
] as const;

const DIAGRAM_LABEL =
  "Illustration: a pump connects over Bluetooth to the Android and Wear OS app, which sends data to the platform core on your server. The platform core works with an AI engine, made of analysis using the AI you bring and a knowledge base searched by meaning, and feeds the real-time web dashboard.";

const SHOWN_THRESHOLD = 0.25;

function indexed(index: number) {
  return { "--lm-arch-index": index } as CSSProperties;
}

function Connector({ axis }: { axis: "x" | "y" }) {
  const horizontal = axis === "x";
  return (
    <div
      className={`relative flex-none ${horizontal ? "h-3 w-14" : "h-11 w-3"}`}
    >
      <div
        className={`absolute bg-lm-line-frame ${
          horizontal
            ? "top-1/2 right-1 left-0 h-px"
            : "top-0 bottom-1 left-1/2 w-px"
        }`}
      />
      <div
        className={`absolute size-0 border-transparent ${
          horizontal
            ? "top-1/2 right-0 -mt-1 border-y-4 border-l-[5px] border-l-lm-line-frame"
            : "bottom-0 left-1/2 -ml-1 border-x-4 border-t-[5px] border-t-lm-line-frame"
        }`}
      />
      <div className={`lm-arch-track lm-arch-dot-${axis}`}>
        <div
          className={`absolute size-1.5 rounded-full bg-lm-blue-light shadow-[0_0_8px_#5EB1FF] ${
            horizontal ? "top-1/2 left-0 -mt-[3px]" : "top-0 left-1/2 -ml-[3px]"
          }`}
        />
      </div>
    </div>
  );
}

function Node({
  label,
  sub,
  icon: NodeIcon,
  index,
}: {
  label: string;
  sub: string;
  icon: Icon;
  index: number;
}) {
  return (
    <div
      className="lm-arch-card flex w-[180px] flex-col items-center gap-2 rounded-lm-card border border-lm-line bg-lm-card px-4 py-[22px] text-center"
      style={indexed(index)}
    >
      <NodeIcon className="size-[22px] text-lm-blue-light" strokeWidth={2} />
      <div className="text-[15px] font-semibold">{label}</div>
      <div className="text-xs text-lm-ink-muted">{sub}</div>
    </div>
  );
}

function EngineCard({ label, sub, icon: CardIcon }: {
  label: string;
  sub: string;
  icon: Icon;
}) {
  return (
    <div className="flex w-[104px] flex-col items-center gap-1.5 rounded-[12px] border border-lm-line bg-lm-card px-2 py-3.5 text-center tablet:w-auto tablet:min-w-[128px] tablet:px-4">
      <CardIcon className="size-[22px] text-lm-blue-light" strokeWidth={2} />
      <div className="text-[13px] font-semibold">{label}</div>
      <div className="text-[11px] text-lm-ink-muted">{sub}</div>
    </div>
  );
}

// Each icon rides a full-width track, so a percentage shift of the track
// moves it across the whole lane.
function LaneIcon({
  icon: LaneGlyph,
  direction,
  delay,
  color,
}: {
  icon: Icon;
  direction: "r" | "l";
  delay: string;
  color: string;
}) {
  return (
    <div
      className={`lm-arch-track lm-arch-icon-${direction}`}
      style={{ "--lm-arch-delay": delay } as CSSProperties}
    >
      <LaneGlyph
        className={`absolute top-1/2 left-0 -mt-2 size-4 ${color}`}
        strokeWidth={2}
      />
    </div>
  );
}

function Lane({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-[22px] w-12 overflow-hidden tablet:w-24">
      <div className="absolute top-1/2 right-0 left-0 h-px bg-lm-line-frame" />
      {children}
    </div>
  );
}

function AiEngine() {
  return (
    <div
      className="lm-arch-card rounded-lm-card-lg border border-lm-blue-light/25 bg-lm-card/60 px-4 py-5 shadow-[0_0_60px_rgb(17_141_255/0.08)] tablet:px-6"
      style={indexed(4)}
    >
      <div className="mb-3.5 text-center text-xs font-semibold tracking-[0.1em] text-lm-blue-light">
        AI ENGINE
      </div>
      <div className="flex items-center">
        <EngineCard label="Analysis" sub="Bring your own AI" icon={Brain} />
        <div className="flex flex-col gap-2.5 px-1.5 tablet:px-2.5">
          <Lane>
            <LaneIcon icon={CircleHelp} direction="r" delay="0s" color="text-lm-blue-light" />
            <LaneIcon icon={Droplet} direction="r" delay="1.5s" color="text-[#F87171]" />
          </Lane>
          <Lane>
            <LaneIcon icon={FileText} direction="l" delay="0.5s" color="text-lm-blue-light" />
            <LaneIcon icon={Lightbulb} direction="l" delay="2s" color="text-[#FBBF24]" />
          </Lane>
        </div>
        <EngineCard label="Knowledge Base" sub="RAG + vector search" icon={Database} />
      </div>
    </div>
  );
}

function Diagram() {
  const region = useLoopRegion();
  const shownRef = useShownOnce(SHOWN_THRESHOLD);

  return (
    <div role="img" aria-label={DIAGRAM_LABEL}>
      <div {...region} aria-hidden="true">
        <div ref={shownRef} className="lm-arch">
          {/* Wide layout: AI Engine above Platform Core. The offset is half the
              row's width minus the center of the third node: 444 - 326 = 118. */}
          <div className="hidden flex-col items-center desktop:flex">
            <div className="flex translate-x-[118px] flex-col items-center">
              <AiEngine />
              <Connector axis="y" />
            </div>
            <div className="flex items-center">
              {NODES.map((node, index) => (
                <div key={node.label} className="flex items-center">
                  <Node {...node} index={index} />
                  {index < NODES.length - 1 && <Connector axis="x" />}
                </div>
              ))}
            </div>
          </div>

          {/* Narrow layout: one column, AI Engine between Platform Core and Web Dashboard. */}
          <div className="flex flex-col items-center desktop:hidden">
            {NODES.map((node, index) => (
              <div key={node.label} className="flex flex-col items-center">
                <Node {...node} index={index} />
                {index < NODES.length - 1 && <Connector axis="y" />}
                {index === 2 && (
                  <>
                    <AiEngine />
                    <Connector axis="y" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Architecture() {
  return (
    <section id="platform" className="border-y border-lm-line-subtle bg-lm-band">
      <div className="mx-auto max-w-lm-content px-lm-gutter py-[72px] tablet:py-[96px] desktop:py-[112px]">
        <Reveal className="mx-auto mb-14 max-w-[720px] text-center">
          <h2 className="mb-3.5 font-lm-display text-lm-h2 text-balance">
            From device to dashboard, in real time
          </h2>
          <p className="text-lm-lead text-balance text-lm-ink-muted">
            AI analysis and clinical knowledge retrieval are built into the
            platform core, which runs on your server.
          </p>
        </Reveal>
        <Diagram />
        <p className="mx-auto mt-8 max-w-[560px] text-center font-lm-mono text-[12px]/[1.5] text-balance text-lm-ink-faint tablet:text-[11px]/[1.5]">
          Cloud sources like Dexcom, CareLink, Glooko and Nightscout connect to
          your server directly.
        </p>
      </div>
    </section>
  );
}
