"use client";

import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { usePathname } from "fumadocs-core/framework";
import type * as PageTree from "fumadocs-core/page-tree";
import {
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarSeparator,
  useFolder,
  useFolderDepth,
} from "fumadocs-ui/components/sidebar/base";
import { useTreePath } from "fumadocs-ui/contexts/tree";
import { isCurrentPage, isRepoGroup } from "@/lib/v2/docs-tree";

// Rows are 44px in the drawer, which is touch only, and tighter in the sidebar.
const ROW =
  "flex min-h-lm-touch w-full items-center gap-2 rounded-lm-sm py-1.5 pe-2 text-start text-[15px] wrap-anywhere md:min-h-9 [&_svg]:size-4 [&_svg]:shrink-0";
const ROW_LINK = `${ROW} text-lm-docs-body transition-colors duration-(--lm-dur-instant) hover:bg-lm-docs-panel hover:text-lm-docs-ink data-[active=true]:font-medium`;
const ROW_BUTTON = `${ROW} cursor-pointer text-lm-docs-body transition-colors duration-(--lm-dur-instant) hover:bg-lm-docs-panel hover:text-lm-docs-ink`;
const GROUP_HEAD =
  "flex min-h-lm-touch w-full items-center gap-2 rounded-lm-sm px-2 py-1.5 text-start md:min-h-9 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-lm-docs-muted";

// Left padding by depth: top level, inside a group, then one step per folder.
const INDENT = ["ps-2", "ps-[18px]", "ps-[30px]", "ps-[42px]", "ps-[54px]"];

function indent(depth: number): string {
  return INDENT[Math.min(depth, INDENT.length - 1)];
}

const STORAGE_KEY = "lm-docs-folders";

// Open and closed folders, by tree id, for this browser tab. Storage can be
// missing or blocked, and then every folder just starts from its default.
function readSaved(): Record<string, boolean> {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, boolean>;
    }
  } catch {}
  return {};
}

function writeSaved(id: string, open: boolean) {
  try {
    const next = { ...readSaved(), [id]: open };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}
}

/**
 * Carries a folder's open state across page loads and across the drawer
 * closing, which unmounts the tree. A saved "closed" never hides the page
 * being read: the folder that holds it opens on load.
 */
function FolderMemory({ id, active }: { id: string; active: boolean }) {
  const folder = useFolder();
  const open = folder?.open;
  const setOpen = folder?.setOpen;
  const restored = useRef(false);

  useLayoutEffect(() => {
    if (open === undefined || !setOpen) return;
    if (!restored.current) {
      restored.current = true;
      const saved = readSaved()[id];
      if (typeof saved === "boolean" && saved !== open && (saved || !active)) {
        setOpen(saved);
      }
      return;
    }
    writeSaved(id, open);
  }, [id, open, active, setOpen]);

  return null;
}

export function RepoSidebarItem({ item }: { item: PageTree.Item }) {
  const pathname = usePathname();
  const depth = useFolderDepth();
  const active = isCurrentPage(item.url, pathname);

  return (
    <SidebarItem
      href={item.url}
      external={item.external}
      active={active}
      aria-current={active ? "page" : undefined}
      icon={item.icon}
      className={`${ROW_LINK} ${indent(depth)}`}
    >
      {item.name}
    </SidebarItem>
  );
}

export function RepoSidebarFolder({
  item,
  children,
}: {
  item: PageTree.Folder;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const depth = useFolderDepth();
  const active = useTreePath().includes(item);
  const indexActive = item.index
    ? isCurrentPage(item.index.url, pathname)
    : false;

  let head: ReactNode;
  if (isRepoGroup(item)) {
    head = (
      <SidebarFolderTrigger className={GROUP_HEAD}>
        <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-2">
          <span className="text-sm font-semibold text-lm-docs-ink">
            {item.name}
          </span>
          <span className="font-mono text-[11px] text-lm-docs-muted">
            {item.repo}
          </span>
        </span>
      </SidebarFolderTrigger>
    );
  } else if (item.index) {
    head = (
      <SidebarFolderLink
        href={item.index.url}
        external={item.index.external}
        active={indexActive}
        aria-current={indexActive ? "page" : undefined}
        className={`${ROW_LINK} ${indent(depth)}`}
      >
        {item.icon}
        {item.name}
      </SidebarFolderLink>
    );
  } else {
    head = (
      <SidebarFolderTrigger
        className={`${item.collapsible === false ? ROW : ROW_BUTTON} ${indent(depth)}`}
      >
        {item.icon}
        {item.name}
      </SidebarFolderTrigger>
    );
  }

  return (
    <SidebarFolder
      collapsible={item.collapsible}
      active={active}
      defaultOpen={item.defaultOpen}
      className={isRepoGroup(item) ? "mt-5 first:mt-0" : undefined}
    >
      {item.$id && item.collapsible !== false ? (
        <FolderMemory id={item.$id} active={active} />
      ) : null}
      {head}
      <SidebarFolderContent>
        <div className="flex flex-col gap-0.5 pt-0.5">{children}</div>
      </SidebarFolderContent>
    </SidebarFolder>
  );
}

// Plain text in the list: a label, or the line under a group with no docs yet.
export function RepoSidebarSeparator({ item }: { item: PageTree.Separator }) {
  const depth = useFolderDepth();

  return (
    <SidebarSeparator
      className={`flex min-h-9 items-center gap-2 py-1.5 pe-2 text-[15px] text-lm-docs-muted [&_svg]:size-4 [&_svg]:shrink-0 ${indent(depth)}`}
    >
      {item.icon}
      {item.name}
    </SidebarSeparator>
  );
}
