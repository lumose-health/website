"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Battery, Mic, X, Bell, MessageSquare } from "lucide-react";

// --- Types ---

interface WatchState {
  phase: "face" | "rising" | "alert" | "chat" | "corrected";
  bg: number;
  trend: string;
  iob: string;
  time: string;
}

const states: WatchState[] = [
  { phase: "face", bg: 142, trend: "\u2192", iob: "0.45", time: "02:30" },
  { phase: "rising", bg: 195, trend: "\u2197", iob: "1.2", time: "02:35" },
  { phase: "alert", bg: 245, trend: "\u2191", iob: "1.2", time: "02:40" },
  { phase: "chat", bg: 210, trend: "\u2198", iob: "2.8", time: "02:48" },
  { phase: "corrected", bg: 128, trend: "\u2192", iob: "0.3", time: "03:15" },
];

// --- Watch Frame ---

function WatchFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[170px] sm:w-[185px]">
      {/* Crown button */}
      <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 h-6 w-2 rounded-r-sm bg-zinc-600" />
      {/* Bezel */}
      <div className="rounded-full border-[3px] border-zinc-700 bg-zinc-800 p-1 shadow-xl">
        {/* Screen */}
        <div className="overflow-hidden rounded-full bg-black aspect-square flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}

// --- Watch Face Screen (matches actual Lumose watch face) ---

function WatchFaceScreen({ state }: { state: WatchState }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-3 py-2">
      {/* Battery icon */}
      <Battery className="h-3 w-3 text-zinc-500 mb-0.5" />

      {/* BG Value + trend arrow (white, not colored) */}
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] font-bold tabular-nums text-white leading-none">
          {state.bg}
        </span>
        <span className="text-base text-white">
          {state.trend}
        </span>
      </div>

      {/* BG label */}
      <span className="text-[8px] text-zinc-500 uppercase tracking-wider">
        BG
      </span>

      {/* IoB */}
      <span className="text-[9px] text-zinc-400 mt-1">
        IoB: {state.iob} u
      </span>

      {/* Mini glucose graph -- matches WatchGraphRenderer (400x100 aspect ratio) */}
      <div className="relative w-[85%] mt-1.5 h-[28px] rounded overflow-hidden">
        <svg viewBox="0 0 100 25" className="w-full h-full" preserveAspectRatio="none">
          {/* Target range band (green, low alpha) */}
          <rect x="0" y="5" width="100" height="13" fill="#22C55E" fillOpacity="0.12" />
          {/* Threshold dashed lines */}
          <line x1="0" y1="5" x2="100" y2="5" stroke="white" strokeWidth="0.3" strokeOpacity="0.3" strokeDasharray="1.5 1.5" />
          <line x1="0" y1="18" x2="100" y2="18" stroke="white" strokeWidth="0.3" strokeOpacity="0.3" strokeDasharray="1.5 1.5" />

          {/* Basal area at bottom (teal, stepped) */}
          <rect x="0" y="22" width="30" height="3" fill="#00BCD4" fillOpacity="0.15" />
          <line x1="0" y1="22" x2="30" y2="22" stroke="#00BCD4" strokeWidth="0.4" strokeOpacity="0.6" />
          <rect x="30" y="21" width="40" height="4" fill="#00BCD4" fillOpacity="0.15" />
          <line x1="30" y1="21" x2="70" y2="21" stroke="#00BCD4" strokeWidth="0.4" strokeOpacity="0.6" />
          <rect x="70" y="22.5" width="30" height="2.5" fill="#00BCD4" fillOpacity="0.15" />
          <line x1="70" y1="22.5" x2="100" y2="22.5" stroke="#00BCD4" strokeWidth="0.4" strokeOpacity="0.6" />

          {/* IoB area (blue fill at bottom, overlapping basal) */}
          <path
            d="M0,25 L0,22 L15,21 L30,20 L50,21.5 L70,22 L85,23 L100,24 L100,25 Z"
            fill="#42A5F5" fillOpacity="0.15"
          />
          <path
            d="M0,22 L15,21 L30,20 L50,21.5 L70,22 L85,23 L100,24"
            fill="none" stroke="#42A5F5" strokeWidth="0.5" strokeOpacity="0.8"
          />

          {/* Glucose line + dots */}
          {state.phase === "rising" || state.phase === "alert" ? (
            <>
              {/* Rising pattern -- glucose line */}
              <polyline
                points="3,15 10,14 18,13 25,12 33,11 40,10 48,9 55,8 63,6 70,5 78,4 85,4 93,3"
                fill="none" stroke="#22C55E" strokeWidth="0.4" strokeOpacity="0.6"
              />
              {/* Dots colored by range */}
              {[[3,15],[10,14],[18,13],[25,12],[33,11],[40,10],[48,9],[55,8],[63,6],[70,5],[78,4],[85,4],[93,3]].map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r="1" fill={y <= 5 ? "#EF4444" : y <= 8 ? "#F59E0B" : "#22C55E"} />
              ))}
            </>
          ) : (
            <>
              {/* Stable in-range pattern -- glucose line */}
              <polyline
                points="3,12 10,11 18,12 25,13 33,11 40,12 48,11 55,12 63,13 70,12 78,11 85,12 93,11"
                fill="none" stroke="#22C55E" strokeWidth="0.4" strokeOpacity="0.6"
              />
              {/* All green dots (in range) */}
              {[[3,12],[10,11],[18,12],[25,13],[33,11],[40,12],[48,11],[55,12],[63,13],[70,12],[78,11],[85,12],[93,11]].map(([x,y], i) => (
                <circle key={i} cx={x} cy={y} r="1" fill="#22C55E" />
              ))}
            </>
          )}
        </svg>
      </div>

      {/* Time (large, bold, matching real watch) */}
      <span className="text-[22px] font-bold text-white mt-1 tabular-nums leading-none">
        {state.time}
      </span>

      {/* Complication icons row (Alerts + AI Chat) */}
      <div className="flex items-center gap-4 mt-1">
        <div className="flex flex-col items-center">
          <Bell className="h-2.5 w-2.5 text-amber-400" />
          <span className="text-[6px] text-zinc-600">Alerts</span>
        </div>
        <span className="text-[7px] text-emerald-600 font-medium">
          Lumose
        </span>
        <div className="flex flex-col items-center">
          <MessageSquare className="h-2.5 w-2.5 text-blue-400" />
          <span className="text-[6px] text-zinc-600">AI Chat</span>
        </div>
      </div>
    </div>
  );
}

// --- Alert Screen ---

function AlertScreen({ state }: { state: WatchState }) {
  const isUrgent = state.bg > 200 || state.bg < 55;
  const alertColor = isUrgent ? "#EF4444" : "#FBBF24";

  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-5 py-4">
      <span
        className="text-[10px] font-bold uppercase tracking-wider"
        style={{ color: alertColor }}
      >
        High Glucose
      </span>
      <span
        className="text-2xl font-bold mt-1 tabular-nums"
        style={{ color: alertColor }}
      >
        {state.bg}
      </span>
      <span className="text-[8px] text-zinc-500">mg/dL</span>
      <span className="text-[9px] text-zinc-400 mt-2 text-center leading-snug">
        In development
      </span>
      <div className="mt-2 flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 border border-zinc-700">
        <X className="h-2.5 w-2.5 text-zinc-400" />
        <span className="text-[9px] text-zinc-400">Dismiss</span>
      </div>
    </div>
  );
}

// --- Chat Screen ---

function ChatScreen() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full px-4 py-4">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 mb-1.5">
        <Mic className="h-3.5 w-3.5 text-white" />
      </div>
      <span className="text-[10px] text-white font-semibold">
        &ldquo;How am I doing?&rdquo;
      </span>
      <div className="mt-1.5 rounded-lg bg-zinc-800 border border-zinc-700 px-2 py-1.5 max-w-[90%]">
        <span className="text-[8px] text-zinc-300 leading-snug block">
          Trending high after lunch. Pump&apos;s closed-loop handled the correction. Back in range within 90 min.
        </span>
      </div>
      <span className="text-[7px] text-zinc-600 mt-1.5">Tap mic to ask</span>
    </div>
  );
}

// --- Main Component ---

export function WatchDemo() {
  const prefersReducedMotion = useReducedMotion();
  const [stateIdx, setStateIdx] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setStateIdx((i) => (i + 1) % states.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  const current = states[stateIdx];

  return (
    <WatchFrame>
      <AnimatePresence mode="wait">
        <motion.div
          key={current.phase}
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {current.phase === "alert" ? (
            <AlertScreen state={current} />
          ) : current.phase === "chat" ? (
            <ChatScreen />
          ) : (
            <WatchFaceScreen state={current} />
          )}
        </motion.div>
      </AnimatePresence>
    </WatchFrame>
  );
}
