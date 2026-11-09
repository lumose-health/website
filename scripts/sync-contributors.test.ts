import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  collect,
  downloadAvatar,
  isHuman,
  MAX_AVATARS,
  safeLogin,
  saveAvatars,
  sync,
  type CollectedContributor,
  type ContributorsData,
  type FetchImpl,
  type JsonFetcher,
} from "./sync-contributors";

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);

function image(body: Uint8Array<ArrayBuffer> = PNG, type = "image/png"): Response {
  return new Response(body, { status: 200, headers: { "content-type": type } });
}

function routes(map: Record<string, unknown>): JsonFetcher {
  return async (url) => {
    if (!(url in map)) throw new Error(`GitHub 404 for ${url}`);
    return map[url];
  };
}

const person = (login: string, n: number, type = "User") => ({
  login,
  type,
  avatar_url: `https://avatars.githubusercontent.com/u/${n}?v=4`,
  contributions: n,
});

async function tempDir() {
  return mkdtemp(path.join(tmpdir(), "contributors-"));
}

test("safeLogin accepts GitHub logins and rejects anything path-like", () => {
  assert.equal(safeLogin("Jl-Engelbrecht"), "jl-engelbrecht");
  for (const bad of ["../etc", "a/b", "a\\b", ".", "", "-a", "a-", "a--b", "x".repeat(40), "a.b", undefined]) {
    assert.equal(safeLogin(bad), null, String(bad));
  }
});

test("isHuman drops bots, [bot] logins and the exclude list", () => {
  assert.equal(isHuman(person("alice", 1)), true);
  assert.equal(isHuman(person("renovate", 1, "Bot")), false);
  assert.equal(isHuman(person("dependabot[bot]", 1)), false);
  assert.equal(isHuman(person("CodeRabbitAI", 1)), false);
  assert.equal(isHuman({ contributions: 3 }), false);
});

test("collect merges people across repos, pages through results and uses the main repo stats", async () => {
  const org = "https://api.github.com/orgs/acme/repos?type=public&per_page=100";
  const page1 = Array.from({ length: 100 }, (_, i) => person(`p${i}`, 1));
  const data = await collect(
    routes({
      [`${org}&page=1`]: [
        { name: "lumose", private: false, fork: false, archived: false, stargazers_count: 10, forks_count: 2 },
        { name: "docs", private: false, fork: false, archived: false, stargazers_count: 5, forks_count: 1 },
        { name: "old", private: false, fork: false, archived: true, stargazers_count: 99, forks_count: 9 },
        { name: "copy", private: false, fork: true, archived: false, stargazers_count: 99, forks_count: 9 },
      ],
      "https://api.github.com/repos/acme/lumose/contributors?per_page=100&page=1": page1,
      "https://api.github.com/repos/acme/lumose/contributors?per_page=100&page=2": [person("Alice", 7)],
      "https://api.github.com/repos/acme/docs/contributors?per_page=100&page=1": [
        person("alice", 3),
        person("github-actions[bot]", 50, "Bot"),
      ],
      "https://api.github.com/repos/acme/lumose/releases/latest": { tag_name: "v1.2.0" },
    }),
    "acme"
  );

  assert.equal(data.stars, 10);
  assert.equal(data.forks, 2);
  assert.equal(data.latestRelease, "v1.2.0");
  assert.equal(data.contributors.length, 101);
  const alice = data.contributors[0];
  assert.equal(alice.login, "Alice");
  assert.equal(alice.commits, 10);
  assert.deepEqual(alice.repos, ["lumose", "docs"]);
  assert.equal(alice.profileUrl, "https://github.com/Alice");
});

test("downloadAvatar only accepts small images from the avatar host", async () => {
  const dir = await tempDir();
  const ok: FetchImpl = async () => image();

  assert.equal(await downloadAvatar("Alice", "https://avatars.githubusercontent.com/u/1?v=4", dir, ok), "/avatars/alice.png");
  assert.deepEqual(new Uint8Array(await readFile(path.join(dir, "alice.png"))), PNG);

  assert.equal(await downloadAvatar("bob", "https://evil.example/u/1", dir, ok), null);
  assert.equal(await downloadAvatar("bob", "http://avatars.githubusercontent.com/u/1", dir, ok), null);
  assert.equal(await downloadAvatar("../bob", "https://avatars.githubusercontent.com/u/1", dir, ok), null);
  assert.equal(
    await downloadAvatar("bob", "https://avatars.githubusercontent.com/u/1", dir, async () => image(PNG, "text/html")),
    null
  );
  assert.equal(
    await downloadAvatar("bob", "https://avatars.githubusercontent.com/u/1", dir, async () => image(new Uint8Array(300_000))),
    null
  );
  assert.deepEqual(await readdir(dir), ["alice.png"]);
});

test("saveAvatars keeps going when one download fails and stops at the cap", async () => {
  const dir = await tempDir();
  const people: CollectedContributor[] = Array.from({ length: MAX_AVATARS + 2 }, (_, i) => ({
    login: `p${i}`,
    remoteAvatar: `https://avatars.githubusercontent.com/u/${i}`,
    profileUrl: `https://github.com/p${i}`,
    commits: 1,
    repos: [],
  }));
  let calls = 0;
  const flaky: FetchImpl = async (url) => {
    calls++;
    if (url.includes("/u/1?")) throw new Error("network down");
    return image();
  };

  const out = await saveAvatars(people, dir, flaky);
  assert.equal(calls, MAX_AVATARS);
  assert.equal(out[0].avatar, "/avatars/p0.png");
  assert.equal(out[1].avatar, null);
  assert.equal(out[MAX_AVATARS].avatar, null);
  assert.equal(out.filter((c) => c.avatar).length, MAX_AVATARS - 1);
  assert.ok(out.every((c) => !("remoteAvatar" in c)));
});

test("sync keeps the last JSON when GitHub fails, and drops avatars missing on disk", async () => {
  const dir = await tempDir();
  const outFile = path.join(dir, "contributors.json");
  const prev: ContributorsData = {
    generatedAt: "2026-01-01T00:00:00.000Z",
    org: "acme",
    stars: 4,
    forks: 1,
    latestRelease: null,
    contributors: [{ login: "a", avatar: "/avatars/a.png", profileUrl: "https://github.com/a", commits: 1, repos: [] }],
  };
  await writeFile(outFile, JSON.stringify(prev));
  const down: JsonFetcher = async () => {
    throw new Error("GitHub 403 for rate limit");
  };

  assert.equal(await sync({ get: down, outFile, avatarDir: path.join(dir, "public", "avatars") }), "kept");
  const kept = JSON.parse(await readFile(outFile, "utf8")) as ContributorsData;
  assert.equal(kept.generatedAt, prev.generatedAt);
  assert.equal(kept.stars, 4);
  assert.equal(kept.contributors[0].avatar, null);
});

test("sync writes an empty file when GitHub fails and there is no JSON yet", async () => {
  const dir = await tempDir();
  const outFile = path.join(dir, "data", "contributors.json");
  const down: JsonFetcher = async () => {
    throw new Error("fetch failed");
  };

  assert.equal(await sync({ get: down, outFile, avatarDir: path.join(dir, "avatars") }), "empty");
  assert.ok(existsSync(outFile));
  const empty = JSON.parse(await readFile(outFile, "utf8")) as ContributorsData;
  assert.deepEqual(empty.contributors, []);
});

test("sync writes local avatar paths and no remote avatar URLs", async () => {
  const dir = await tempDir();
  const outFile = path.join(dir, "contributors.json");
  const org = "https://api.github.com/orgs/lumose-health/repos?type=public&per_page=100&page=1";
  const get = routes({
    [org]: [{ name: "lumose", private: false, fork: false, archived: false, stargazers_count: 3, forks_count: 0 }],
    "https://api.github.com/repos/lumose-health/lumose/contributors?per_page=100&page=1": [person("alice", 2)],
  });

  assert.equal(await sync({ get, fetchImpl: async () => image(), outFile, avatarDir: path.join(dir, "avatars") }), "synced");
  const text = await readFile(outFile, "utf8");
  assert.ok(!text.includes("githubusercontent"));
  const data = JSON.parse(text) as ContributorsData;
  assert.equal(data.stars, 3);
  assert.equal(data.contributors[0].avatar, "/avatars/alice.png");
});
