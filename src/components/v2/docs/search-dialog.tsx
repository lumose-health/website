"use client";

import { useRef, useState } from "react";
import { experimental_useSearch as useSearch } from "fumadocs-core/search/client";
import { staticClient } from "fumadocs-core/search/client/orama-static";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
} from "fumadocs-ui/components/dialog/search";
import type { SharedProps } from "fumadocs-ui/contexts/search";
import { createIndexLoader } from "@/lib/v2/search-index";
import { pickFocusTarget } from "@/lib/v2/search-shortcut";

// Written by the build, see src/app/api/search.json/route.ts. It is downloaded
// on the first query, so pages that are only read never fetch it.
const SEARCH_INDEX = "/api/search.json";

// One per page load, like the download it guards. It allows one download at a
// time and a few retries after a failure, see search-index.ts.
const loader = createIndexLoader(SEARCH_INDEX);

function makeSearch() {
  return (query: string) =>
    loader.run(async (from) => staticClient({ from }).search(query));
}

function isVisible(element: HTMLElement) {
  return element.isConnected && element.getClientRects().length > 0;
}

// Fumadocs marks the page column with this id.
const PAGE_ID = "nd-page";

/**
 * The docs search dialog on a static host: it searches the prebuilt index in
 * the browser. Loaded with React.lazy, so none of this is in a page load.
 */
export default function DocsSearchDialog(props: SharedProps) {
  // The search hook runs again when it is handed a new function, which is how
  // "Try again" repeats the current query.
  const [run, setRun] = useState(makeSearch);
  const search = useSearch(run);
  const gaveUp = search.error !== undefined && loader.exhausted;

  // The dialog has no trigger element of its own, so it would drop focus on
  // the page body when it closes. This remembers what had focus on the way in
  // (a header control, or wherever "/" was pressed) and hands it back.
  const opener = useRef<HTMLElement | null>(null);

  return (
    <SearchDialog {...search} {...props}>
      <SearchDialogOverlay />
      <SearchDialogContent
        onOpenAutoFocus={() => {
          const active = document.activeElement;
          opener.current = active instanceof HTMLElement ? active : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          // The header swaps its search control at 760px, so the opener can
          // be hidden by now. Then the control that shows gets focus, and
          // failing that the page content.
          const main = document.getElementById(PAGE_ID);
          const target = pickFocusTarget(
            opener.current,
            [...document.querySelectorAll<HTMLElement>("[data-docs-search]")],
            main,
            isVisible,
          );
          if (main && target === main && !main.hasAttribute("tabindex")) {
            main.tabIndex = -1;
          }
          target?.focus();
          opener.current = null;
        }}
      >
        {/* The field hides its own focus outline, so the row around it shows
            one in the docs link color. The close button already uses it. */}
        <SearchDialogHeader className="rounded-t-xl has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-lm-docs-link">
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList />
        {gaveUp && (
          <div className="flex items-center justify-between gap-3 p-3 text-sm">
            <span>The search index did not load.</span>
            <button
              type="button"
              className="min-h-lm-touch cursor-pointer rounded-md border px-3 font-medium text-lm-docs-link hover:text-lm-docs-link-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lm-docs-link"
              onClick={(event) => {
                event.currentTarget
                  .closest('[role="dialog"]')
                  ?.querySelector("input")
                  ?.focus();
                loader.reset();
                setRun(makeSearch);
              }}
            >
              Try again
            </button>
          </div>
        )}
        <SearchDialogFooter className="text-xs text-lm-docs-muted">
          Type to search the docs. Arrow keys move through results, Enter opens
          one, Esc closes.
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
