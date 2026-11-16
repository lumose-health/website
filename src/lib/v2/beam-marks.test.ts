import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { BEAM_PROVIDERS } from "../../data/beam-marks";
import { LOCAL_RUNTIMES, PROVIDERS } from "../../data/providers";

const rotating = BEAM_PROVIDERS.filter((mark) => mark.runtimes);

test("only the local model tile in the diagram rotates", () => {
  assert.deepEqual(
    rotating.map((mark) => mark.name),
    ["Ollama"],
  );
});

test("the diagram and the provider button share one runtime list", () => {
  const button = PROVIDERS.find((provider) => provider.runtimes);
  assert.equal(rotating[0].runtimes, LOCAL_RUNTIMES);
  assert.equal(button?.runtimes, LOCAL_RUNTIMES);
  assert.deepEqual(
    LOCAL_RUNTIMES.map((runtime) => runtime.name),
    ["Ollama", "LM Studio", "llama.cpp", "vLLM"],
  );
});

test("the rotating tile starts on its own logo, which shows without JS", () => {
  assert.equal(rotating[0].runtimes?.[0].logo, rotating[0].logo);
});

test("every runtime logo is a file in public", () => {
  for (const runtime of LOCAL_RUNTIMES) {
    assert.ok(existsSync(`public${runtime.logo}`), runtime.logo);
  }
});
