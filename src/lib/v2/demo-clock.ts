// The one clock behind the device demos, and the phone's script on it. No DOM or
// React, so it can be tested on its own.

export type DemoTrack = {
  cycleMs: number;
  /** Positions within a cycle, ascending, starting at 0. */
  marks: readonly number[];
};

type PhoneChatFrame = { screen: "chat"; messages: number; typing: boolean };
type PhoneAlertFrame = { screen: "alerts"; alert: number };
export type PhoneFrame = PhoneChatFrame | PhoneAlertFrame;

export type ChatMessage = { role: "user" | "assistant"; content: string };

// Sample data. The chat sees about 6 hours of glucose and pump data, so keep each
// answer to that window and one recent event, with no dosing suggestions.
export const CHAT_MESSAGES: readonly ChatMessage[] = [
  { role: "user", content: "How am I doing today?" },
  {
    role: "assistant",
    content:
      "Last 6 hours: time in range **78%**, average glucose **142 mg/dL**. One high after lunch (peaked 225), back in range within 90 min.",
  },
  { role: "user", content: "Prepare a note for my endo about that high" },
  {
    role: "assistant",
    content:
      "From the last 6 hours:\n- Peaked 225 after lunch\n- Back in range within 90 min\n- Worth raising with your care team: how often this happens",
  },
  { role: "user", content: "What's my glucose right now?" },
  { role: "assistant", content: "Current: 136 mg/dL, trending down." },
];

export const PHONE_CYCLE_MS = 36_600;

const chat = (messages: number, typing = false): PhoneChatFrame => ({
  screen: "chat",
  messages,
  typing,
});
const alert = (index: number): PhoneAlertFrame => ({
  screen: "alerts",
  alert: index,
});

const PHONE_SCRIPT: readonly (readonly [number, PhoneFrame])[] = [
  [0, chat(0)],
  [1_200, chat(1)],
  [2_000, chat(1, true)],
  [3_500, chat(2)],
  [5_500, chat(3)],
  [6_300, chat(3, true)],
  [7_800, chat(4)],
  [9_800, chat(5)],
  [10_600, chat(5, true)],
  [12_100, chat(6)],
  [16_600, alert(0)],
  [20_600, alert(1)],
  [24_600, alert(2)],
  // The Daily Brief alert, which holds until the cycle ends.
  [28_600, alert(3)],
];

export const PHONE_TRACK: DemoTrack = {
  cycleMs: PHONE_CYCLE_MS,
  marks: PHONE_SCRIPT.map(([at]) => at),
};

/** The static HTML and the reduced motion end state. */
export const PHONE_SETTLED = chat(CHAT_MESSAGES.length);

export function phoneFrameAt(positionMs: number): PhoneFrame {
  let frame = PHONE_SCRIPT[0][1];
  for (const [at, next] of PHONE_SCRIPT) {
    if (at > positionMs) break;
    frame = next;
  }
  return frame;
}

/** The first clock time after this one that lands on one of the track's marks. */
export function nextMarkAfter(track: DemoTrack, elapsedMs: number) {
  const position = elapsedMs % track.cycleMs;
  const cycleStart = elapsedMs - position;
  const mark = track.marks.find((at) => at > position);
  return mark === undefined
    ? cycleStart + track.cycleMs + track.marks[0]
    : cycleStart + mark;
}

export type WatchState = {
  phase: "face" | "rising" | "alert" | "chat" | "corrected";
  bg: number;
  trend: string;
  iob: string;
  time: string;
};

const WATCH_STEP_MS = 5_000;

/** The high on the alert screen, which the chat reply quotes. */
export const WATCH_PEAK_BG = 245;

// Sample data. Insulin on board only falls after the high, so no step reads as a
// new dose.
const WATCH_STATES: readonly WatchState[] = [
  { phase: "face", bg: 142, trend: "\u2192", iob: "0.45", time: "02:30" },
  { phase: "rising", bg: 195, trend: "\u2197", iob: "1.2", time: "02:55" },
  {
    phase: "alert",
    bg: WATCH_PEAK_BG,
    trend: "\u2191",
    iob: "1.2",
    time: "03:15",
  },
  { phase: "chat", bg: 210, trend: "\u2198", iob: "0.9", time: "03:30" },
  { phase: "corrected", bg: 128, trend: "\u2192", iob: "0.3", time: "04:30" },
];

export const WATCH_TRACK: DemoTrack = {
  cycleMs: WATCH_STEP_MS * WATCH_STATES.length,
  marks: WATCH_STATES.map((_, index) => index * WATCH_STEP_MS),
};

/** The static HTML and the reduced motion end state. */
export const WATCH_SETTLED = WATCH_STATES[0];

export function watchStateAt(positionMs: number) {
  return WATCH_STATES[Math.floor(positionMs / WATCH_STEP_MS)];
}

type Entry = DemoTrack & { onMark: (positionMs: number) => void };

export type DemoClock = ReturnType<typeof createDemoClock>;

/**
 * Sleeps until the next mark on any track, so it costs nothing between steps and
 * needs no frames. It follows the loop region, which covers offscreen, hidden,
 * paused and reduced motion. There's only ever one timeout, and time stopped is
 * never counted, so a long stop can't build up steps to burst out on return.
 */
export function createDemoClock(now: () => number = () => performance.now()) {
  const entries = new Set<Entry>();
  let running = false;
  let started = false;
  // The first cycle replaces the settled frame, so it waits for the clock to
  // really run. A visitor who has paused motion keeps the settled frame.
  let begun = false;
  let elapsedMs = 0;
  let armedAt = 0;
  let dueAt = 0;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function disarm() {
    if (timeout === undefined) return;
    clearTimeout(timeout);
    timeout = undefined;
    // A late timer can be cancelled after its mark came due. Stopping just short
    // of the mark keeps it next in line, so it can't be skipped.
    elapsedMs = Math.min(elapsedMs + now() - armedAt, dueAt - 1);
  }

  function arm() {
    if (!running || !started || timeout !== undefined) return;
    if (entries.size === 0) return;

    if (!begun) {
      begun = true;
      entries.forEach((entry) => entry.onMark(elapsedMs % entry.cycleMs));
    }

    dueAt = Infinity;
    entries.forEach((entry) => {
      dueAt = Math.min(dueAt, nextMarkAfter(entry, elapsedMs));
    });

    armedAt = now();
    timeout = setTimeout(() => {
      timeout = undefined;
      const due = [...entries].filter(
        (entry) => nextMarkAfter(entry, elapsedMs) === dueAt,
      );
      elapsedMs = dueAt;
      due.forEach((entry) => entry.onMark(elapsedMs % entry.cycleMs));
      arm();
    }, dueAt - elapsedMs);
  }

  return {
    /** Calls back on each of the track's marks. Returns a remove function. */
    add(track: DemoTrack, onMark: (positionMs: number) => void) {
      const entry = { ...track, onMark };
      disarm();
      entries.add(entry);
      if (begun) onMark(elapsedMs % track.cycleMs);
      arm();
      return () => {
        disarm();
        entries.delete(entry);
        arm();
      };
    },
    /** Follows the loop region. */
    setRunning(next: boolean) {
      running = next;
      if (next) arm();
      else disarm();
    },
    /** Opens the first cycle. Nothing fires before this. */
    start() {
      started = true;
      arm();
    },
    stop: disarm,
  };
}
