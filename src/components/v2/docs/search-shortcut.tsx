"use client";

import { lazy, useEffect, type ReactNode } from "react";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { RootProvider } from "fumadocs-ui/provider/next";
import { hasOpenOverlay, shouldOpenSearch } from "@/lib/v2/search-shortcut";

const DocsSearchDialog = lazy(() => import("./search-dialog"));

/** Opens docs search on "/". Ctrl/⌘ K stays with the Fumadocs provider. */
function SearchShortcut() {
  const { setOpenSearch } = useSearchContext();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (!shouldOpenSearch(event, target, hasOpenOverlay(document))) return;

      // Stops the "/" landing in the search field, and Firefox quick find.
      event.preventDefault();
      setOpenSearch(true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [setOpenSearch]);

  return null;
}

/**
 * The Fumadocs provider for the new docs look: search runs in the browser
 * against the prebuilt index, and "/" opens it. The dialog code is fetched the
 * first time search opens rather than with every page.
 */
export function DocsSearchProvider({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{ enabled: false }}
      search={{ SearchDialog: DocsSearchDialog, preload: false }}
    >
      <SearchShortcut />
      {children}
    </RootProvider>
  );
}
