"use client";

import { useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { useMotion } from "./motion-provider";

const subscribeToNothing = () => () => {};
const returnTrue = () => true;
const returnFalse = () => false;

export function PauseMotion() {
  const { paused, togglePaused } = useMotion();
  const Icon = paused ? Play : Pause;

  // The static HTML holds the button's space but can't show it, so scripts that
  // never run leave a gap and not a control that does nothing. With scripting
  // off the gap goes too, because that is settled before first paint.
  const hydrated = useSyncExternalStore(
    subscribeToNothing,
    returnTrue,
    returnFalse,
  );

  return (
    <button
      type="button"
      onClick={togglePaused}
      className={`-mx-2 inline-flex min-h-lm-touch min-w-lm-touch cursor-pointer items-center gap-1.5 rounded-lm-sm px-2 text-xs text-lm-ink-muted transition-colors duration-(--lm-dur-instant) hover:text-lm-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lm-blue-light motion-reduce:hidden ${hydrated ? "" : "invisible noscript:hidden"}`}
    >
      <Icon size={14} aria-hidden="true" />
      {paused ? "Play motion" : "Pause motion"}
    </button>
  );
}
