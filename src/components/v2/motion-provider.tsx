"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { loopScheduler } from "@/lib/v2/loop-scheduler";

const PAUSED_KEY = "lm-motion-paused";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

// sessionStorage throws when storage is blocked. The control still works for
// the current page view because this copy is the one components read.
let paused: boolean | null = null;
const pausedListeners = new Set<() => void>();

function readPaused() {
  if (paused === null) {
    try {
      paused = sessionStorage.getItem(PAUSED_KEY) === "1";
    } catch {
      paused = false;
    }
  }
  return paused;
}

function setPaused(next: boolean) {
  paused = next;
  try {
    sessionStorage.setItem(PAUSED_KEY, next ? "1" : "0");
  } catch {
    // Nothing to do. The state lasts until the next page load.
  }
  pausedListeners.forEach((listener) => listener());
}

function subscribePaused(listener: () => void) {
  pausedListeners.add(listener);
  return () => {
    pausedListeners.delete(listener);
  };
}

function subscribeReduced(listener: () => void) {
  const query = window.matchMedia(REDUCED_QUERY);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

function subscribeVisibility(listener: () => void) {
  document.addEventListener("visibilitychange", listener);
  return () => document.removeEventListener("visibilitychange", listener);
}

const returnFalse = () => false;

type Motion = {
  paused: boolean;
  reduced: boolean;
  togglePaused: () => void;
};

const MotionContext = createContext<Motion>({
  paused: false,
  reduced: false,
  togglePaused: () => {},
});

export function useMotion() {
  return useContext(MotionContext);
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const isPaused = useSyncExternalStore(
    subscribePaused,
    readPaused,
    returnFalse,
  );
  const reduced = useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED_QUERY).matches,
    returnFalse,
  );
  const tabHidden = useSyncExternalStore(
    subscribeVisibility,
    () => document.hidden,
    returnFalse,
  );

  const halted = isPaused || reduced || tabHidden;
  useEffect(() => {
    if (halted) loopScheduler.pause();
    else loopScheduler.resume();
  }, [halted]);

  const motion = useMemo(
    () => ({
      paused: isPaused,
      reduced,
      togglePaused: () => setPaused(!readPaused()),
    }),
    [isPaused, reduced],
  );

  return (
    <MotionContext.Provider value={motion}>{children}</MotionContext.Provider>
  );
}
