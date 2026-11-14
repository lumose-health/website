"use client";

import { useRef, useState } from "react";
import { useStaticSearch } from "fumadocs-core/search/client/orama-static";
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

// Written by the build, see src/app/api/search.json/route.ts. It is downloaded
// on the first query, so pages that are only read never fetch it.
const SEARCH_INDEX = "/api/search.json";

/**
 * The docs search dialog on a static host: it searches the prebuilt index in
 * the browser. Loaded with React.lazy, so none of this is in a page load.
 */
export default function DocsSearchDialog(props: SharedProps) {
  // Fumadocs keeps the index download per URL, including one that failed, so
  // a dropped connection would leave search broken until a reload. Typing
  // again after a failure asks under a new URL, which downloads it afresh.
  const [attempt, setAttempt] = useState(0);
  const search = useStaticSearch({
    from: attempt === 0 ? SEARCH_INDEX : `${SEARCH_INDEX}?retry=${attempt}`,
  });
  const failed = search.error !== undefined;

  // The dialog has no trigger element of its own, so it would drop focus on
  // the page body when it closes. This remembers what had focus on the way in
  // (a header control, or wherever "/" was pressed) and hands it back.
  const opener = useRef<HTMLElement | null>(null);

  return (
    <SearchDialog
      {...search}
      {...props}
      onSearchChange={(value) => {
        if (failed) setAttempt((count) => count + 1);
        search.onSearchChange(value);
      }}
    >
      <SearchDialogOverlay />
      <SearchDialogContent
        onOpenAutoFocus={() => {
          const active = document.activeElement;
          opener.current = active instanceof HTMLElement ? active : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus();
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
        <SearchDialogFooter className="text-xs text-lm-docs-muted">
          Type to search the docs. Arrow keys move through results, Enter opens
          one, Esc closes.
        </SearchDialogFooter>
      </SearchDialogContent>
    </SearchDialog>
  );
}
