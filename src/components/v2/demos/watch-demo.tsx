"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mic, X } from "lucide-react";
import {
  WATCH_PEAK_BG,
  WATCH_SETTLED,
  WATCH_TRACK,
  watchStateAt,
} from "@/lib/v2/demo-clock";
import type { DemoClock, WatchState } from "@/lib/v2/demo-clock";
import { WatchFaceScreen, WatchFrame } from "./demo-placeholder";

const CROSSFADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// A preview of a screen still in development, so it holds still rather than
// flashing, and its copy stays clear of timing and delivery.
function AlertScreen({ state }: { state: WatchState }) {
  return (
    <div className="flex size-full flex-col items-center justify-center px-5 py-4 text-lm-glucose-high-low">
      <span className="text-[10px] font-bold tracking-wider uppercase">
        High Glucose
      </span>
      <span className="mt-1 text-2xl font-bold tabular-nums">{state.bg}</span>
      <span className="text-[8px] text-zinc-400">mg/dL</span>
      <span className="mt-2 text-center text-[9px] leading-snug text-zinc-400">
        Preview. In development.
      </span>
      <div className="mt-2 flex items-center gap-1.5 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1">
        <X className="size-2.5 text-zinc-400" />
        <span className="text-[9px] text-zinc-400">Dismiss</span>
      </div>
    </div>
  );
}

// The reply reports the numbers on the watch and nothing else: no dose, no pump
// action and nothing about where glucose goes next.
function ChatScreen({ state }: { state: WatchState }) {
  return (
    <div className="flex size-full flex-col items-center justify-center p-4">
      <div className="mb-1.5 flex size-7 items-center justify-center rounded-full bg-blue-600">
        <Mic className="size-3.5 text-white" />
      </div>
      <span className="text-[10px] font-semibold text-white">
        &ldquo;How am I doing?&rdquo;
      </span>
      <div className="mt-1.5 max-w-[90%] rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1.5">
        <span className="block text-[8px] leading-snug text-zinc-300">
          You&apos;re at {state.bg} mg/dL and trending down. Peaked at{" "}
          {WATCH_PEAK_BG} after lunch.
        </span>
      </div>
      <span className="mt-1.5 text-[7px] text-zinc-400">
        Not medical advice.
      </span>
    </div>
  );
}

function Screen({ state }: { state: WatchState }) {
  if (state.phase === "alert") return <AlertScreen state={state} />;
  if (state.phase === "chat") return <ChatScreen state={state} />;
  return <WatchFaceScreen state={state} />;
}

/** Shows the face until the clock first runs, then steps through its script. */
export function WatchDemo({ clock }: { clock: DemoClock }) {
  const [state, setState] = useState(WATCH_SETTLED);

  useEffect(
    () =>
      clock.add(WATCH_TRACK, (position) => setState(watchStateAt(position))),
    [clock],
  );

  return (
    <WatchFrame>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={state.phase} className="size-full" {...CROSSFADE}>
          <Screen state={state} />
        </motion.div>
      </AnimatePresence>
    </WatchFrame>
  );
}
