import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LABEL_STEP_MS,
  createRotationGate,
  labelSlot,
  nextLabelIndex,
} from "./label-rotation";

function gateWithLog() {
  const calls: boolean[] = [];
  return { gate: createRotationGate((running) => calls.push(running)), calls };
}

test("the label steps through every name and wraps to the first", () => {
  const seen: number[] = [];
  let index = 0;
  for (let step = 0; step < 6; step++) {
    seen.push(index);
    index = nextLabelIndex(index, 4);
  }
  assert.deepEqual(seen, [0, 1, 2, 3, 0, 1]);
});

test("a list with one name or none stays on the first", () => {
  assert.equal(nextLabelIndex(0, 1), 0);
  assert.equal(nextLabelIndex(0, 0), 0);
});

test("each name stays up for about 2.5 to 3 seconds", () => {
  assert.ok(LABEL_STEP_MS >= 2500 && LABEL_STEP_MS <= 3000);
});

test("one name shows, the one before it has rolled out, the rest wait", () => {
  const slots = (index: number) =>
    [0, 1, 2, 3].map((position) => labelSlot(position, index, 4));
  assert.deepEqual(slots(0), ["current", "waiting", "waiting", "previous"]);
  assert.deepEqual(slots(1), ["previous", "current", "waiting", "waiting"]);
  assert.deepEqual(slots(3), ["waiting", "waiting", "previous", "current"]);
});

test("a name is never moved straight from rolled out to showing", () => {
  // It would cross the cell backwards. It has to wait below first.
  for (let index = 0; index < 4; index++) {
    const next = nextLabelIndex(index, 4);
    for (let position = 0; position < 4; position++) {
      if (labelSlot(position, index, 4) !== "previous") continue;
      assert.equal(labelSlot(position, next, 4), "waiting");
    }
  }
});

test("a single name is always the one showing", () => {
  assert.equal(labelSlot(0, 0, 1), "current");
});

test("the rotation waits for its region to run", () => {
  const { gate, calls } = gateWithLog();
  gate.setHold("hover", false);
  assert.deepEqual(calls, []);
  gate.setRegionRunning(true);
  assert.deepEqual(calls, [true]);
  gate.setRegionRunning(false);
  assert.deepEqual(calls, [true, false]);
});

test("hover or focus holds the rotation until both are gone", () => {
  const { gate, calls } = gateWithLog();
  gate.setRegionRunning(true);
  gate.setHold("hover", true);
  gate.setHold("focus", true);
  gate.setHold("hover", false);
  assert.deepEqual(calls, [true, false]);
  gate.setHold("focus", false);
  assert.deepEqual(calls, [true, false, true]);
});

test("a hold taken while stopped still applies when the region starts", () => {
  const { gate, calls } = gateWithLog();
  gate.setHold("focus", true);
  gate.setRegionRunning(true);
  assert.deepEqual(calls, []);
  gate.setHold("focus", false);
  assert.deepEqual(calls, [true]);
});

test("repeating a state doesn't call back again", () => {
  const { gate, calls } = gateWithLog();
  gate.setRegionRunning(true);
  gate.setRegionRunning(true);
  gate.setHold("hover", true);
  gate.setHold("hover", true);
  assert.deepEqual(calls, [true, false]);
});
