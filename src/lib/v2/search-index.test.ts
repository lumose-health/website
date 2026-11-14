import assert from "node:assert/strict";
import { test } from "node:test";
import { createIndexLoader } from "./search-index";

const BASE = "/api/search.json";

/** A stand-in for the search client: records each URL and lets the test settle it. */
function fakeClient() {
  const calls: {
    from: string;
    resolve: (value: string) => void;
    reject: (error: Error) => void;
  }[] = [];
  const search = (from: string) =>
    new Promise<string>((resolve, reject) => {
      calls.push({ from, resolve, reject });
    });
  return { calls, search, urls: () => [...new Set(calls.map((c) => c.from))] };
}

const down = () => new Error("offline");

async function failNext(
  loader: ReturnType<typeof createIndexLoader>,
  client: ReturnType<typeof fakeClient>,
) {
  const run = loader.run(client.search);
  client.calls.at(-1)?.reject(down());
  await assert.rejects(run);
}

test("the first search uses the bare URL and later ones reuse it", async () => {
  const loader = createIndexLoader(BASE);
  const client = fakeClient();
  const first = loader.run(client.search);
  client.calls[0].resolve("a");
  assert.equal(await first, "a");
  const second = loader.run(client.search);
  client.calls[1].resolve("b");
  assert.equal(await second, "b");
  assert.deepEqual(client.urls(), [BASE]);
});

test("searches typed while the download is pending share one URL", async () => {
  const loader = createIndexLoader(BASE);
  const client = fakeClient();
  const runs = Array.from({ length: 10 }, () => loader.run(client.search));
  assert.deepEqual(client.urls(), [BASE]);
  for (const call of client.calls) call.resolve("ok");
  await Promise.all(runs);
});

test("ten searches during a failed load and its retry use one extra URL", async () => {
  const loader = createIndexLoader(BASE);
  const client = fakeClient();
  const before = Array.from({ length: 5 }, () => loader.run(client.search));
  for (const call of client.calls) call.reject(down());
  await Promise.allSettled(before);

  const during = Array.from({ length: 10 }, () => loader.run(client.search));
  assert.deepEqual(client.urls(), [BASE, `${BASE}?retry=1`]);
  for (const call of client.calls.slice(5)) call.resolve("ok");
  assert.deepEqual(await Promise.all(during), Array(10).fill("ok"));
});

test("a search right after a failure retries, with no failure shown first", async () => {
  const loader = createIndexLoader(BASE);
  const client = fakeClient();
  await failNext(loader, client);
  const retry = loader.run(client.search);
  assert.equal(client.calls.at(-1)?.from, `${BASE}?retry=1`);
  client.calls.at(-1)?.resolve("ok");
  assert.equal(await retry, "ok");
  assert.equal(loader.exhausted, false);
});

test("retries stop at the cap without another request", async () => {
  const loader = createIndexLoader(BASE, 3);
  const client = fakeClient();
  for (let i = 0; i < 4; i++) await failNext(loader, client);
  assert.equal(loader.exhausted, true);
  assert.equal(client.calls.length, 4);

  await assert.rejects(loader.run(client.search));
  await assert.rejects(loader.run(client.search));
  assert.equal(client.calls.length, 4);
});

test("reset allows another round under a URL not used before", async () => {
  const loader = createIndexLoader(BASE, 3);
  const client = fakeClient();
  for (let i = 0; i < 4; i++) await failNext(loader, client);
  loader.reset();
  assert.equal(loader.exhausted, false);
  const run = loader.run(client.search);
  assert.equal(client.calls.at(-1)?.from, `${BASE}?retry=4`);
  client.calls.at(-1)?.resolve("ok");
  assert.equal(await run, "ok");
});

test("an error after the index has loaded does not start a download", async () => {
  const loader = createIndexLoader(BASE);
  const client = fakeClient();
  const first = loader.run(client.search);
  client.calls[0].resolve("ok");
  await first;

  const broken = loader.run(client.search);
  client.calls[1].reject(new Error("bad query"));
  await assert.rejects(broken);
  assert.equal(loader.exhausted, false);

  const next = loader.run(client.search);
  client.calls[2].resolve("ok");
  await next;
  assert.deepEqual(client.urls(), [BASE]);
});

test("a late failure from an old URL does not undo the retry", async () => {
  const loader = createIndexLoader(BASE);
  const client = fakeClient();
  const slow = loader.run(client.search);
  const other = loader.run(client.search);
  client.calls[1].reject(down());
  await assert.rejects(other);

  const retry = loader.run(client.search);
  client.calls[0].reject(down());
  await assert.rejects(slow);

  const typedDuringRetry = loader.run(client.search);
  assert.equal(client.calls.at(-1)?.from, `${BASE}?retry=1`);
  client.calls[2].resolve("ok");
  client.calls[3].resolve("ok");
  await Promise.all([retry, typedDuringRetry]);
});

test("a stalled download fails at the timeout and the next search retries", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const loader = createIndexLoader(BASE, 3, 20_000);
  const client = fakeClient();
  const stalled = loader.run(client.search);
  const alsoWaiting = loader.run(client.search);

  t.mock.timers.tick(19_999);
  assert.equal(client.calls.length, 2);
  t.mock.timers.tick(1);
  await assert.rejects(stalled, /too long/);
  await assert.rejects(alsoWaiting, /too long/);

  const retry = loader.run(client.search);
  assert.equal(client.calls.at(-1)?.from, `${BASE}?retry=1`);

  // The stalled attempt finishing now must not mark the retry as loaded.
  client.calls[0].resolve("late");
  client.calls[1].reject(down());
  await Promise.resolve();
  const typedDuringRetry = loader.run(client.search);
  assert.equal(client.calls.at(-1)?.from, `${BASE}?retry=1`);

  // The retry is still on the clock: it can time out too.
  t.mock.timers.tick(20_000);
  await assert.rejects(retry, /too long/);
  await assert.rejects(typedDuringRetry, /too long/);
  assert.equal(loader.exhausted, false);
});

test("timeouts count toward the retry cap", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const loader = createIndexLoader(BASE, 3, 20_000);
  const client = fakeClient();
  for (let i = 0; i < 4; i++) {
    const run = loader.run(client.search);
    t.mock.timers.tick(20_000);
    await assert.rejects(run, /too long/);
  }
  assert.equal(loader.exhausted, true);
  await assert.rejects(loader.run(client.search));
  assert.equal(client.calls.length, 4);
});

test("a download that finishes in time stops the clock", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const loader = createIndexLoader(BASE, 3, 20_000);
  const client = fakeClient();
  const first = loader.run(client.search);
  client.calls[0].resolve("ok");
  assert.equal(await first, "ok");

  t.mock.timers.tick(60_000);
  const later = loader.run(client.search);
  client.calls[1].resolve("ok");
  assert.equal(await later, "ok");
  assert.deepEqual(client.urls(), [BASE]);
  assert.equal(loader.exhausted, false);
});
