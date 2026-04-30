import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: "GlycemicGPT Docs",
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
  );
}
