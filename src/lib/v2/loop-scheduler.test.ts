import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import { createLoopScheduler } from "./loop-scheduler";
import type { FrameDriver, LoopScheduler } from "./loop-scheduler";

// A fake clock: frames run only when the test calls step().
function createFakeClock() {
  let now = 1000;
  let nextId = 1;
  const queue = new Map<number, (now: number) => void>();

  const driver: FrameDriver = {
    request(callback) {
      const id = nextId++;
      queue.set(id, callback);
      return id;
    },
    cancel(id) {
      queue.delete(id);
    },
  };

  return {
    driver,
    pendingCount: () => queue.size,
    advance(ms: number) {
      now += ms;
    },
    step(ms = 16) {
      now += ms;
      const callbacks = [...queue.values()];
      queue.clear();
      callbacks.forEach((callback) => callback(now));
    },
  };
}

function recorder() {
  const frames: { elapsed: number; delta: number }[] = [];
  return {
    frames,
    onFrame(elapsed: number, delta: number) {
      frames.push({ elapsed, delta });
    },
    last: () => frames[frames.length - 1],
  };
}

describe("loop scheduler", () => {
  let clock: ReturnType<typeof createFakeClock>;
  let scheduler: LoopScheduler;

  beforeEach(() => {
    clock = createFakeClock();
    scheduler = createLoopScheduler(clock.driver);
  });

  it("does not request a frame for a region that was only added", () => {
    scheduler.add(recorder());
    assert.equal(clock.pendingCount(), 0);
  });

  it("starts a region at zero and advances it by the frame time", () => {
    const region = recorder();
    scheduler.add(region).setVisible(true);

    clock.step();
    clock.step(16);
    clock.step(20);

    assert.deepEqual(region.frames, [
      { elapsed: 0, delta: 0 },
      { elapsed: 16, delta: 16 },
      { elapsed: 36, delta: 20 },
    ]);
  });

  it("runs every region from one pending frame", () => {
    const first = recorder();
    const second = recorder();
    scheduler.add(first).setVisible(true);
    scheduler.add(second).setVisible(true);
    assert.equal(clock.pendingCount(), 1);

    clock.step();
    assert.equal(clock.pendingCount(), 1);
    assert.equal(first.frames.length, 1);
    assert.equal(second.frames.length, 1);
  });

  it("stops running a removed region and keeps the others going", () => {
    const removed = recorder();
    const kept = recorder();
    const handle = scheduler.add(removed);
    handle.setVisible(true);
    scheduler.add(kept).setVisible(true);

    clock.step();
    handle.remove();
    clock.step();

    assert.equal(removed.frames.length, 1);
    assert.equal(kept.frames.length, 2);
  });

  it("freezes on pause and resumes in phase with no catch-up", () => {
    const region = recorder();
    scheduler.add(region).setVisible(true);
    clock.step();
    clock.step(16);

    scheduler.pause();
    assert.equal(clock.pendingCount(), 0);
    clock.advance(60_000);

    scheduler.resume();
    clock.step(16);
    assert.deepEqual(region.last(), { elapsed: 16, delta: 0 });

    clock.step(16);
    assert.deepEqual(region.last(), { elapsed: 32, delta: 16 });
  });

  it("freezes one region offscreen and leaves the others running", () => {
    const hidden = recorder();
    const shown = recorder();
    const hiddenHandle = scheduler.add(hidden);
    hiddenHandle.setVisible(true);
    scheduler.add(shown).setVisible(true);
    clock.step();
    clock.step(16);

    hiddenHandle.setVisible(false);
    clock.step(500);
    assert.equal(hidden.frames.length, 2);
    assert.equal(clock.pendingCount(), 1);

    hiddenHandle.setVisible(true);
    clock.step(16);
    assert.deepEqual(hidden.last(), { elapsed: 16, delta: 0 });
  });

  it("does not run a region that scrolls into view while paused", () => {
    const region = recorder();
    scheduler.pause();
    scheduler.add(region).setVisible(true);
    assert.equal(clock.pendingCount(), 0);

    scheduler.resume();
    assert.equal(clock.pendingCount(), 1);
  });

  it("stops the loop when the last region leaves", () => {
    const first = scheduler.add(recorder());
    const second = scheduler.add(recorder());
    first.setVisible(true);
    second.setVisible(true);
    clock.step();

    first.setVisible(false);
    assert.equal(scheduler.isFramePending(), true);
    second.remove();
    assert.equal(scheduler.isFramePending(), false);
    assert.equal(clock.pendingCount(), 0);
  });

  it("stops the loop when a region removes itself during a frame", () => {
    const handle = scheduler.add({ onFrame: () => handle.remove() });
    handle.setVisible(true);

    clock.step();

    assert.equal(scheduler.isFramePending(), false);
  });

  it("keeps a single frame pending when a frame changes regions", () => {
    const other = scheduler.add(recorder());
    const handle = scheduler.add({ onFrame: () => other.setVisible(true) });
    handle.setVisible(true);

    clock.step();

    assert.equal(clock.pendingCount(), 1);
  });

  it("limits a long frame gap so a loop never jumps", () => {
    const region = recorder();
    scheduler.add(region).setVisible(true);
    clock.step();

    clock.step(5000);

    assert.deepEqual(region.last(), { elapsed: 100, delta: 100 });
  });

  it("requests no frames for a region with no frame callback", () => {
    const changes: boolean[] = [];
    const handle = scheduler.add({ onChange: (r) => changes.push(r) });

    handle.setVisible(true);
    assert.equal(clock.pendingCount(), 0);

    scheduler.pause();
    scheduler.resume();
    handle.setVisible(false);
    assert.deepEqual(changes, [true, false, true, false]);
  });

  it("reports a change only when the running state flips", () => {
    const changes: boolean[] = [];
    const handle = scheduler.add({ onChange: (r) => changes.push(r) });

    handle.setVisible(true);
    handle.setVisible(true);
    scheduler.pause();
    scheduler.pause();
    handle.setVisible(false);
    scheduler.resume();

    assert.deepEqual(changes, [true, false]);
  });
});
