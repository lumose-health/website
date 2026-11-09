import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BROWSER_SECTIONS,
  BROWSER_TRACK,
  CHAT_MESSAGES,
  PHONE_CYCLE_MS,
  PHONE_SETTLED,
  PHONE_TRACK,
  type PhoneFrame,
  browserSectionsAt,
  WATCH_PEAK_BG,
  WATCH_SETTLED,
  WATCH_TRACK,
  createDemoClock,
  phoneFrameAt,
  watchStateAt,
} from "./demo-clock";

// Timers and time under the test's control, so nothing here waits.
function fakeTime() {
  let current = 0;
  let timer: { at: number; run: () => void } | undefined;
  const realSet = globalThis.setTimeout;
  const realClear = globalThis.clearTimeout;
  globalThis.setTimeout = ((run: () => void, ms: number) => {
    assert.equal(timer, undefined, "only one timeout at a time");
    timer = { at: current + ms, run };
    return timer;
  }) as unknown as typeof setTimeout;
  globalThis.clearTimeout = (() => {
    timer = undefined;
  }) as unknown as typeof clearTimeout;

  return {
    now: () => current,
    pending: () => timer !== undefined,
    /** Time passing while the timer is overdue, as on a busy main thread. */
    block(ms: number) {
      current += ms;
    },
    advance(ms: number) {
      const end = current + ms;
      while (timer && timer.at <= end) {
        const { at, run } = timer;
        current = at;
        timer = undefined;
        run();
      }
      current = end;
    },
    restore() {
      globalThis.setTimeout = realSet;
      globalThis.clearTimeout = realClear;
    },
  };
}

function runningClock(time: ReturnType<typeof fakeTime>) {
  const clock = createDemoClock(time.now);
  const seen: number[] = [];
  const remove = clock.add(PHONE_TRACK, (position) => seen.push(position));
  clock.setRunning(true);
  clock.start();
  return { clock, seen, remove };
}

test("the phone script keeps its timing", () => {
  assert.equal(PHONE_CYCLE_MS, 36_600);
  const chat = (messages: number, typing = false) => ({
    screen: "chat",
    messages,
    typing,
  });
  assert.deepEqual(phoneFrameAt(0, 1), chat(0));
  assert.deepEqual(phoneFrameAt(1_200, 1), chat(1));
  assert.deepEqual(phoneFrameAt(2_000, 1), chat(1, true));
  assert.deepEqual(phoneFrameAt(3_500, 1), chat(2));
  assert.deepEqual(phoneFrameAt(5_500, 1), chat(3));
  assert.deepEqual(phoneFrameAt(6_300, 1), chat(3, true));
  assert.deepEqual(phoneFrameAt(7_800, 1), chat(4));
  assert.deepEqual(phoneFrameAt(9_800, 1), chat(5));
  assert.deepEqual(phoneFrameAt(10_600, 1), chat(5, true));
  assert.deepEqual(phoneFrameAt(16_599, 1), chat(CHAT_MESSAGES.length));
});

test("alerts change every 4 s from 16.6 s, and the last holds to the cycle end", () => {
  for (const [at, alert] of [
    [16_600, 0],
    [20_600, 1],
    [24_600, 2],
    [28_600, 3],
    [32_600, 3],
    [36_599, 3],
  ] as const) {
    assert.deepEqual(phoneFrameAt(at, 1), { screen: "alerts", alert });
  }
});

test("the first cycle opens on the full chat and never shows an empty screen", () => {
  for (const at of [0, 1_199, 1_200, 2_000, 12_100, 16_599]) {
    assert.equal(phoneFrameAt(at, 0), PHONE_SETTLED);
  }
  assert.deepEqual(phoneFrameAt(16_600, 0), { screen: "alerts", alert: 0 });
  assert.deepEqual(phoneFrameAt(28_600, 0), { screen: "alerts", alert: 3 });
  assert.deepEqual(phoneFrameAt(0, 1), {
    screen: "chat",
    messages: 0,
    typing: false,
  });
});

test("the clock passes each mark's cycle, so only the first cycle is settled", () => {
  const time = fakeTime();
  try {
    const clock = createDemoClock(time.now);
    const frames: PhoneFrame[] = [];
    clock.add(PHONE_TRACK, (position, cycle) =>
      frames.push(phoneFrameAt(position, cycle)),
    );
    clock.setRunning(true);
    clock.start();

    time.advance(PHONE_CYCLE_MS - 1);
    const first = frames.filter((frame) => frame.screen === "chat");
    assert.ok(first.length > 0);
    assert.ok(first.every((frame) => frame === PHONE_SETTLED));

    time.advance(1);
    assert.deepEqual(frames.at(-1), {
      screen: "chat",
      messages: 0,
      typing: false,
    });
    clock.stop();
  } finally {
    time.restore();
  }
});

test("a track added late gets the clock's cycle", () => {
  const time = fakeTime();
  try {
    const { clock } = runningClock(time);
    time.advance(PHONE_CYCLE_MS + 3_600);
    const seen: [number, number][] = [];
    clock.add(PHONE_TRACK, (position, cycle) => seen.push([position, cycle]));
    assert.deepEqual(seen, [[3_600, 1]]);
    clock.stop();
  } finally {
    time.restore();
  }
});

test("the chat quotes the watch's peak, and the watch reads after lunch", () => {
  const replies = CHAT_MESSAGES.filter((m) => m.role === "assistant");
  const peaks = replies.flatMap((m) =>
    [...m.content.matchAll(/peaked (\d+)/gi)].map((match) => Number(match[1])),
  );
  assert.deepEqual(peaks, [WATCH_PEAK_BG, WATCH_PEAK_BG]);
  assert.equal(watchStateAt(10_000).bg, WATCH_PEAK_BG);
  assert.deepEqual(
    WATCH_TRACK.marks.map((at) => watchStateAt(at).time),
    ["13:30", "13:55", "14:15", "14:30", "15:30"],
  );
});

test("nothing happens until both started and running", () => {
  const time = fakeTime();
  try {
    const seen: number[] = [];
    const notRunning = createDemoClock(time.now);
    notRunning.add(PHONE_TRACK, (position) => seen.push(position));
    notRunning.start();
    const notStarted = createDemoClock(time.now);
    notStarted.add(PHONE_TRACK, (position) => seen.push(position));
    notStarted.setRunning(true);

    time.advance(5_000);
    assert.deepEqual(seen, []);
    assert.equal(time.pending(), false);
  } finally {
    time.restore();
  }
});

test("one full cycle lands on every mark, then starts again", () => {
  const time = fakeTime();
  try {
    const { clock, seen } = runningClock(time);
    time.advance(PHONE_CYCLE_MS);
    assert.deepEqual(seen, [...PHONE_TRACK.marks, 0]);
    clock.stop();
  } finally {
    time.restore();
  }
});

test("a stop keeps the phase and a long stop never bursts", () => {
  const time = fakeTime();
  try {
    const { clock, seen } = runningClock(time);
    time.advance(1_000);
    assert.deepEqual(seen, [0]);

    clock.setRunning(false);
    assert.equal(time.pending(), false);
    time.advance(600_000);
    assert.deepEqual(seen, [0]);

    clock.setRunning(true);
    time.advance(199);
    assert.deepEqual(seen, [0]);
    time.advance(1);
    assert.deepEqual(seen, [0, 1_200]);
    clock.stop();
  } finally {
    time.restore();
  }
});

test("a late timer cancelled after its mark came due still lands on it", () => {
  const time = fakeTime();
  try {
    const { clock, seen } = runningClock(time);
    time.advance(1_000);
    time.block(205);
    clock.setRunning(false);
    clock.setRunning(true);
    time.advance(1);
    assert.deepEqual(seen, [0, 1_200]);
    clock.stop();
  } finally {
    time.restore();
  }
});

test("a track added late joins at the clock's position", () => {
  const time = fakeTime();
  try {
    const { clock, seen, remove } = runningClock(time);
    time.advance(3_600);

    const late: number[] = [];
    clock.add({ cycleMs: 25_000, marks: [0, 5_000] }, (position) =>
      late.push(position),
    );
    assert.deepEqual(late, [3_600]);
    time.advance(1_400);
    assert.deepEqual(late, [3_600, 5_000]);

    remove();
    const count = seen.length;
    time.advance(10_000);
    assert.equal(seen.length, count);
    clock.stop();
  } finally {
    time.restore();
  }
});

test("a clock with nothing on it stands still", () => {
  const time = fakeTime();
  try {
    const clock = createDemoClock(time.now);
    clock.setRunning(true);
    clock.start();
    time.advance(10_000);

    const seen: number[] = [];
    clock.add(PHONE_TRACK, (position) => seen.push(position));
    assert.deepEqual(seen, [0]);
    clock.stop();
  } finally {
    time.restore();
  }
});

test("the watch steps through five states, five seconds each", () => {
  assert.equal(WATCH_TRACK.cycleMs, 25_000);
  assert.deepEqual(WATCH_TRACK.marks, [0, 5_000, 10_000, 15_000, 20_000]);
  assert.deepEqual(
    WATCH_TRACK.marks.map((at) => watchStateAt(at).phase),
    ["face", "rising", "alert", "chat", "corrected"],
  );
  assert.equal(watchStateAt(4_999).phase, "face");
  assert.equal(watchStateAt(24_999).phase, "corrected");
  assert.equal(WATCH_SETTLED.phase, "face");
});

test("the browser brief rebuilds with the phone's Daily Brief alert", () => {
  assert.equal(BROWSER_TRACK.cycleMs, PHONE_CYCLE_MS);
  assert.deepEqual(phoneFrameAt(28_600, 1), { screen: "alerts", alert: 3 });
  assert.equal(browserSectionsAt(0), BROWSER_SECTIONS);
  assert.equal(browserSectionsAt(28_599), BROWSER_SECTIONS);
  for (const [at, sections] of [
    [28_600, 0],
    [28_900, 1],
    [29_500, 2],
    [30_400, 3],
    [31_400, 4],
    [32_400, 5],
    [33_400, 6],
    [36_599, 6],
  ] as const) {
    assert.equal(browserSectionsAt(at), sections);
  }
  assert.ok(BROWSER_TRACK.marks.every((at) => at < PHONE_CYCLE_MS));
});
