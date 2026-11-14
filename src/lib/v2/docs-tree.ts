import type * as PageTree from "fumadocs-core/page-tree";

/** One sidebar group: the docs that come from a single source repo. */
export interface DocsGroup {
  id: string;
  title: string;
  /** Repo name, shown beside the title. */
  repo: string;
  /** Folder under content/docs that the repo's docs sync into. */
  path: string;
}

/**
 * Sidebar order. `path` matches `targetPath` in docs-sources.yaml. A group
 * whose path has no pages yet shows a placeholder line, and fills in by itself
 * once a source starts syncing pages there.
 */
export const DOCS_GROUPS: readonly DocsGroup[] = [
  { id: "platform", title: "Platform", repo: "lumose", path: "platform" },
  {
    id: "android",
    title: "Android & Wear OS",
    repo: "android-unofficial",
    path: "android",
  },
  { id: "ios", title: "iOS", repo: "ios-unofficial", path: "ios" },
  { id: "project", title: "Project", repo: ".github", path: "about" },
];

export const COMING_SOON = "Coming soon";

const GROUP_ID_PREFIX = "lm-group:";

/** A top-level sidebar folder that stands for a source repo. */
export interface RepoGroupFolder extends PageTree.Folder {
  $id: string;
  repo: string;
}

export function isRepoGroup(node: PageTree.Node): node is RepoGroupFolder {
  return (
    node.type === "folder" &&
    typeof node.$id === "string" &&
    node.$id.startsWith(GROUP_ID_PREFIX) &&
    "repo" in node
  );
}

function stripTrailingSlash(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

/** True when a sidebar link points at the page being viewed. */
export function isCurrentPage(href: string, pathname: string): boolean {
  return stripTrailingSlash(href) === stripTrailingSlash(pathname);
}

/** The first page link in a node, reading a folder's own page first. */
function firstUrl(node: PageTree.Node): string | undefined {
  if (node.type === "page") return node.url;
  if (node.type !== "folder") return undefined;
  if (node.index) return node.index.url;
  for (const child of node.children) {
    const url = firstUrl(child);
    if (url) return url;
  }
  return undefined;
}

function groupFor(
  node: PageTree.Node,
  groups: readonly DocsGroup[],
  baseUrl: string,
): DocsGroup | undefined {
  const url = firstUrl(node);
  if (!url) return undefined;
  const target = stripTrailingSlash(url);
  return groups.find((group) => {
    const root = `${baseUrl}/${group.path}`;
    return target === root || target.startsWith(`${root}/`);
  });
}

/**
 * Regroups the top level of the docs page tree by source repo. Pages keep
 * their order, so previous and next links do not change. Anything that belongs
 * to no group stays at the top level, above the groups, so it is still
 * reachable. The input tree is not modified.
 */
export function groupDocsTree(
  tree: PageTree.Root,
  groups: readonly DocsGroup[] = DOCS_GROUPS,
  baseUrl = "/docs",
): PageTree.Root {
  const base = stripTrailingSlash(baseUrl);
  const members = new Map<string, PageTree.Node[]>();
  for (const group of groups) members.set(group.id, []);
  const ungrouped: PageTree.Node[] = [];

  for (const node of tree.children) {
    const bucket = members.get(groupFor(node, groups, base)?.id ?? "");
    if (!bucket) {
      ungrouped.push(node);
    } else if (node.type === "folder") {
      // The group replaces the source's own top folder.
      if (node.index) bucket.push(node.index);
      bucket.push(...node.children);
    } else {
      bucket.push(node);
    }
  }

  const folders = groups.map((group): RepoGroupFolder => {
    const children = members.get(group.id) ?? [];
    const shared = {
      $id: `${GROUP_ID_PREFIX}${group.id}`,
      type: "folder",
      name: group.title,
      repo: group.repo,
      defaultOpen: true,
    } as const;

    if (children.length > 0) return { ...shared, children };

    // Nothing to open, so the group is a plain heading over a line of text.
    return {
      ...shared,
      collapsible: false,
      children: [
        {
          $id: `${GROUP_ID_PREFIX}${group.id}:soon`,
          type: "separator",
          name: COMING_SOON,
        },
      ],
    };
  });

  return { ...tree, children: [...ungrouped, ...folders] };
}
