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
      "Last 6 hours: time in range **78%**, average glucose **142 mg/dL**. One high after lunch (peaked 245), back in range within 90 min.",
  },
  { role: "user", content: "Prepare a note for my endo about that high" },
  {
    role: "assistant",
    content:
      "From the last 6 hours:\n- Peaked 245 after lunch\n- Back in range within 90 min\n- Worth raising with your care team: how often this happens",
  },
  { role: "user", content: "What's my glucose right now?" },
  { role: "assistant", content: "Current: 136 mg/dL, trending down." },
];

export const PHONE_CYCLE_MS = 36_600;

/** When the phone shows its Daily Brief alert, and the browser rebuilds its brief. */
export const PHONE_BRIEF_AT_MS = 28_600;

const chat = (messages: number, typing = false): PhoneChatFrame => ({
  screen: "chat",
  messages,
  typing,
});
const alert = (index: number): PhoneAlertFrame => ({
  screen: "alerts",
  alert: index,
});

/** Where the alerts take over from the chat. */
const PHONE_ALERTS_AT_MS = 16_600;

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
  [PHONE_ALERTS_AT_MS, alert(0)],
  [20_600, alert(1)],
  [24_600, alert(2)],
  // The Daily Brief alert, which holds until the cycle ends.
  [PHONE_BRIEF_AT_MS, alert(3)],
];

export const PHONE_TRACK: DemoTrack = {
  cycleMs: PHONE_CYCLE_MS,
  marks: PHONE_SCRIPT.map(([at]) => at),
};

/** The static HTML and the reduced motion end state. */
export const PHONE_SETTLED = chat(CHAT_MESSAGES.length);

/**
 * The phone's frame at a point in a cycle. The first cycle opens on the full
 * chat that the static HTML already shows, so nothing disappears when the clock
 * starts. Later cycles replay the chat from an empty screen.
 */
export function phoneFrameAt(positionMs: number, cycle: number): PhoneFrame {
  if (cycle === 0 && positionMs < PHONE_ALERTS_AT_MS) return PHONE_SETTLED;
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
  { phase: "face", bg: 142, trend: "\u2192", iob: "0.45", time: "13:30" },
  { phase: "rising", bg: 195, trend: "\u2197", iob: "1.2", time: "13:55" },
  {
    phase: "alert",
    bg: WATCH_PEAK_BG,
    trend: "\u2191",
    iob: "1.2",
    time: "14:15",
  },
  { phase: "chat", bg: 210, trend: "\u2198", iob: "0.9", time: "14:30" },
  { phase: "corrected", bg: 128, trend: "\u2192", iob: "0.3", time: "15:30" },
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

/** When each section of the browser's brief appears, after the phone's alert. */
const BRIEF_SECTION_DELAYS_MS = [300, 900, 1_800, 2_800, 3_800, 4_800];

export const BROWSER_SECTIONS = BRIEF_SECTION_DELAYS_MS.length;

// On the phone's cycle, so the two stay in step. The mark at 0 only opens the
// cycle; the brief stays built from the end of one build to the next alert.
export const BROWSER_TRACK: DemoTrack = {
  cycleMs: PHONE_CYCLE_MS,
  marks: [
    0,
    PHONE_BRIEF_AT_MS,
    ...BRIEF_SECTION_DELAYS_MS.map((delay) => PHONE_BRIEF_AT_MS + delay),
  ],
};

/**
 * How many sections of the brief show. It's built before the first alert, so
 * the frame is never blank.
 */
export function browserSectionsAt(positionMs: number) {
  if (positionMs < PHONE_BRIEF_AT_MS) return BROWSER_SECTIONS;
  const sinceAlert = positionMs - PHONE_BRIEF_AT_MS;
  return BRIEF_SECTION_DELAYS_MS.filter((delay) => delay <= sinceAlert).length;
}

/** A mark's position within its cycle, and which cycle it's in, from 0. */
type OnMark = (positionMs: number, cycle: number) => void;

type Entry = DemoTrack & { onMark: OnMark };

function fire(entry: Entry, elapsedMs: number) {
  entry.onMark(
    elapsedMs % entry.cycleMs,
    Math.floor(elapsedMs / entry.cycleMs),
  );
}

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
  // The first cycle takes over from the settled frame, so it waits for the
  // clock to really run. A visitor who has paused motion keeps that frame.
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
      entries.forEach((entry) => fire(entry, elapsedMs));
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
      due.forEach((entry) => fire(entry, elapsedMs));
      arm();
    }, dueAt - elapsedMs);
  }

  return {
    /** Calls back on each of the track's marks. Returns a remove function. */
    add(track: DemoTrack, onMark: OnMark) {
      const entry = { ...track, onMark };
      disarm();
      entries.add(entry);
      if (begun) fire(entry, elapsedMs);
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
