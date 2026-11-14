import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DocsContainer,
  DocsDrawerLinks,
  DocsSidebarTitle,
} from "@/components/v2/docs/docs-header";
import { isV2Preview } from "@/lib/v2/preview";

export default function Layout({ children }: { children: ReactNode }) {
  if (isV2Preview()) {
    // The new look: a dark header over a reading surface that stays light.
    // Search, the theme switch and the title move out of the sidebar, because
    // the header carries the first and the last and there is no theme choice.
    return (
      <RootProvider theme={{ enabled: false }}>
        <div className="lm-docs">
          <DocsLayout
            tree={source.pageTree}
            nav={{ enabled: false }}
            slots={{ container: DocsContainer, navTitle: DocsSidebarTitle }}
            searchToggle={{ enabled: false }}
            themeSwitch={{ enabled: false }}
            i18n={false}
            sidebar={{
              defaultOpenLevel: 1,
              collapsible: false,
              banner: <DocsDrawerLinks />,
            }}
          >
            {children}
          </DocsLayout>
        </div>
      </RootProvider>
    );
  }

  return (
    <RootProvider theme={{ enabled: false }}>
      <DocsLayout
        tree={source.pageTree}
        nav={{
          title: "Lumose Docs",
          children: <ThemeToggle />,
        }}
        themeSwitch={{ enabled: false }}
        i18n={false}
        sidebar={{
          defaultOpenLevel: 1,
        }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
