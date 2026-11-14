import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import type * as PageTree from "fumadocs-core/page-tree";
import { flattenTree } from "fumadocs-core/page-tree";
import yaml from "js-yaml";
import {
  COMING_SOON,
  DOCS_GROUPS,
  groupDocsTree,
  isCurrentPage,
  isRepoGroup,
} from "./docs-tree";

function page(name: string, url: string): PageTree.Item {
  return { type: "page", name, url };
}

function folder(
  name: string,
  children: PageTree.Node[],
  index?: PageTree.Item,
): PageTree.Folder {
  return { type: "folder", name, children, index, defaultOpen: true };
}

// The shape the two synced sources produce today, plus the docs home page.
function liveTree(extra: PageTree.Node[] = []): PageTree.Root {
  return {
    $id: "root",
    name: "Docs",
    children: [
      page("Lumose Documentation", "/docs"),
      folder(
        "Platform docs",
        [
          page("Get Started", "/docs/platform/get-started"),
          folder("Install", [page("Docker", "/docs/platform/install/docker")]),
        ],
        page("Overview", "/docs/platform"),
      ),
      folder("About", [
        page("Acknowledgments", "/docs/about/acknowledgments"),
        page("Roadmap", "/docs/about/roadmap"),
      ]),
      ...extra,
    ],
  };
}

function groups(tree: PageTree.Root) {
  return tree.children.filter(isRepoGroup);
}

function urls(tree: PageTree.Root): string[] {
  return flattenTree(tree.children).map((item) => item.url);
}

test("the sidebar has one group per source repo, in a set order", () => {
  const grouped = groupDocsTree(liveTree());

  assert.deepEqual(
    groups(grouped).map((group) => [group.name, group.repo]),
    [
      ["Platform", "lumose"],
      ["Android & Wear OS", "android-unofficial"],
      ["iOS", "ios-unofficial"],
      ["Project", ".github"],
    ],
  );
});

test("a group takes over its source's top folder and keeps the page order", () => {
  const grouped = groupDocsTree(liveTree());
  const [platform, , , project] = groups(grouped);

  assert.deepEqual(
    platform.children.map((node) => node.name),
    ["Overview", "Get Started", "Install"],
  );
  assert.equal(platform.index, undefined);
  assert.equal(platform.collapsible, undefined);
  assert.equal(platform.defaultOpen, true);
  assert.deepEqual(
    project.children.map((node) => node.name),
    ["Acknowledgments", "Roadmap"],
  );

  // Same pages in the same order, so previous and next links stay as they are.
  assert.deepEqual(urls(grouped), urls(liveTree()));
});

test("a group with no pages is a heading over plain text, not a link", () => {
  const grouped = groupDocsTree(liveTree());
  const [, android, ios] = groups(grouped);

  for (const group of [android, ios]) {
    assert.equal(group.collapsible, false);
    assert.equal(group.index, undefined);
    assert.equal(group.children.length, 1);
    const [line] = group.children;
    assert.equal(line.type, "separator");
    assert.equal(line.name, COMING_SOON);
    assert.equal("url" in line, false);
  }
  assert.equal(
    urls(grouped).some((url) => /\/docs\/(android|ios)(\/|$)/.test(url)),
    false,
  );
});

test("a group fills in by itself once its path has pages", () => {
  const grouped = groupDocsTree(
    liveTree([
      folder(
        "Android",
        [page("Install the app", "/docs/android/install")],
        page("Android overview", "/docs/android"),
      ),
    ]),
  );
  const [, android, ios] = groups(grouped);

  assert.deepEqual(
    android.children.map((node) => [node.type, node.name]),
    [
      ["page", "Android overview"],
      ["page", "Install the app"],
    ],
  );
  assert.equal(android.collapsible, undefined);
  assert.equal(android.repo, "android-unofficial");
  // iOS still has nothing.
  assert.equal(ios.children[0].name, COMING_SOON);
});

test("a single page at a group's path joins the group too", () => {
  const grouped = groupDocsTree(liveTree([page("iOS", "/docs/ios/")]));
  const [, , ios] = groups(grouped);

  assert.deepEqual(
    ios.children.map((node) => node.name),
    ["iOS"],
  );
});

test("pages outside every group stay reachable, above the groups", () => {
  const stray = folder("Widgets", [page("Clock", "/docs/widgets/clock")]);
  const lookalike = page("Platforms", "/docs/platforms");
  const label: PageTree.Separator = { type: "separator", name: "More" };
  const grouped = groupDocsTree(liveTree([stray, lookalike, label]));

  assert.deepEqual(grouped.children.slice(0, 4), [
    page("Lumose Documentation", "/docs"),
    stray,
    lookalike,
    label,
  ]);
  assert.equal(grouped.children.length, 4 + DOCS_GROUPS.length);
  assert.deepEqual(
    [...urls(grouped)].sort(),
    [...urls(liveTree([stray, lookalike]))].sort(),
  );
});

test("grouping leaves its input alone and keeps the tree id", () => {
  const tree = liveTree();
  const before = structuredClone(tree);
  const grouped = groupDocsTree(tree);

  assert.deepEqual(tree, before);
  assert.equal(grouped.$id, tree.$id);
  assert.equal(grouped.name, tree.name);
});

test("every synced source lands in a group", () => {
  const config = yaml.load(
    readFileSync(path.join(process.cwd(), "docs-sources.yaml"), "utf8"),
  ) as { sources: { key: string; targetPath: string }[] };
  const paths = DOCS_GROUPS.map((group) => group.path);

  assert.ok(config.sources.length > 0);
  for (const source of config.sources) {
    assert.ok(
      paths.includes(source.targetPath.replace(/\/+$/, "")),
      `${source.key} syncs to ${source.targetPath}, which has no sidebar group`,
    );
  }
});

test("the current page matches with or without a trailing slash", () => {
  assert.equal(isCurrentPage("/docs/platform", "/docs/platform"), true);
  assert.equal(isCurrentPage("/docs/platform", "/docs/platform/"), true);
  assert.equal(isCurrentPage("/docs/platform", "/docs/platform/install"), false);
  assert.equal(isCurrentPage("/docs", "/docs/platform"), false);
});
