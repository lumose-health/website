"use client";

import { Pause, Play } from "lucide-react";
import { useMotion } from "./motion-provider";

export function PauseMotion() {
  const { paused, togglePaused } = useMotion();
  const Icon = paused ? Play : Pause;

  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={togglePaused}
      className="-mx-2 inline-flex min-h-lm-touch min-w-lm-touch cursor-pointer items-center gap-1.5 rounded-lm-sm px-2 text-xs text-lm-ink-muted transition-colors duration-(--lm-dur-instant) hover:text-lm-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lm-blue-light motion-reduce:hidden"
    >
      <Icon size={14} aria-hidden="true" />
      {paused ? "Play motion" : "Pause motion"}
    </button>
  );
}
