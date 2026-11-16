import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import {
  DocsContainer,
  DocsDrawerLinks,
  DocsSidebarTitle,
} from "@/components/v2/docs/docs-header";
import {
  RepoSidebarFolder,
  RepoSidebarItem,
  RepoSidebarSeparator,
} from "@/components/v2/docs/repo-sidebar";
import { DocsSearchProvider } from "@/components/v2/docs/search-shortcut";
import { groupDocsTree } from "@/lib/v2/docs-tree";

export default function Layout({ children }: { children: ReactNode }) {
  // A dark header over a reading surface that stays light. Search and the
  // title move out of the sidebar into the header, and there is no theme
  // choice. The sidebar lists pages by the repo they come from. Search runs in
  // the browser against the index the build writes, and "/" opens it.
  return (
    <DocsSearchProvider>
      <div className="lm-docs">
        <DocsLayout
          tree={groupDocsTree(source.pageTree)}
          nav={{ enabled: false }}
          slots={{ container: DocsContainer, navTitle: DocsSidebarTitle }}
          searchToggle={{ enabled: false }}
          themeSwitch={{ enabled: false }}
          i18n={false}
          sidebar={{
            defaultOpenLevel: 1,
            collapsible: false,
            banner: <DocsDrawerLinks />,
            components: {
              Item: RepoSidebarItem,
              Folder: RepoSidebarFolder,
              Separator: RepoSidebarSeparator,
            },
          }}
        >
          {children}
        </DocsLayout>
      </div>
    </DocsSearchProvider>
  );
}
