"use client";

import type { ComponentProps } from "react";
import { Menu, Search } from "lucide-react";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { Container } from "fumadocs-ui/layouts/docs/slots/container";
import { SidebarTrigger } from "fumadocs-ui/layouts/docs/slots/sidebar";
import { DISCORD_URL, GITHUB_URL, routes } from "@/lib/v2/routes";
import { buttonClass, EXTERNAL_LINK, FOCUS_RING, NAV_LINK } from "../button";
import { Logo } from "../logo";
import { SkipLink } from "../skip-link";

// Fumadocs marks the page column with this id.
const PAGE_ID = "nd-page";

const LINKS = [
  { label: "Home", href: routes.home },
  { label: "GitHub", href: GITHUB_URL, ...EXTERNAL_LINK },
  { label: "Discord", href: DISCORD_URL, ...EXTERNAL_LINK },
];

// Both controls open the search dialog the docs already use. That dialog asks
// /api/search, which the exported site does not have, so results stay empty
// until a prebuilt index replaces it.
function SearchControls() {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  if (!enabled) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenSearch(true)}
        className={`mx-auto hidden min-h-lm-touch max-w-[360px] min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lm-button-sm border border-lm-line-strong bg-lm-card px-3.5 text-sm text-lm-ink-muted transition-colors duration-(--lm-dur-instant) hover:border-lm-ink-faint tablet:flex ${FOCUS_RING}`}
      >
        <Search size={16} aria-hidden="true" />
        <span className="flex-1 truncate text-left">Search all docs</span>
        <span aria-hidden="true" className="hidden gap-1 desktop:inline-flex">
          {hotKey.map((key, index) => (
            <kbd
              key={index}
              className="rounded-md border border-lm-line-strong px-1.5 font-mono text-xs"
            >
              {key.display}
            </kbd>
          ))}
        </span>
      </button>
      <button
        type="button"
        aria-label="Search docs"
        onClick={() => setOpenSearch(true)}
        className={`${buttonClass("icon")} ml-auto tablet:hidden`}
      >
        <Search size={20} aria-hidden="true" />
      </button>
    </>
  );
}

function DocsHeader() {
  return (
    <header className="sticky top-0 z-30 h-(--fd-banner-height) border-b border-lm-line-subtle bg-lm-page text-lm-ink">
      <SkipLink target={PAGE_ID} />
      <div className="flex h-full items-center gap-1.5 px-4 tablet:gap-4 tablet:px-lm-gutter">
        <a
          href={routes.home}
          className={`inline-flex min-h-lm-touch shrink-0 items-center gap-3 rounded-lm-sm text-lm-ink ${FOCUS_RING}`}
        >
          <Logo size="footer" />
          <span className="text-sm text-lm-ink-muted">docs</span>
        </a>

        <SearchControls />

        <nav aria-label="Site" className="hidden items-center gap-1 tablet:flex">
          {LINKS.map(({ label, ...link }) => (
            <a key={label} {...link} className={`${NAV_LINK} px-3 text-[15px]`}>
              {label}
            </a>
          ))}
        </nav>

        {/* md, not tablet: Fumadocs switches the sidebar to a drawer at 768px,
            so the button has to stay until then. */}
        <SidebarTrigger className={`${buttonClass("icon")} md:hidden`}>
          <Menu size={22} aria-hidden="true" />
        </SidebarTrigger>
      </div>
    </header>
  );
}

/**
 * Stands in for the Fumadocs layout wrapper so the header sits above the docs
 * columns, full width, while still being inside the sidebar state it toggles.
 */
export function DocsContainer(props: ComponentProps<"div">) {
  return (
    <>
      <DocsHeader />
      <Container {...props} />
    </>
  );
}

/** The header links, moved into the sidebar drawer below 760px. */
export function DocsDrawerLinks() {
  return (
    <nav aria-label="Site" className="tablet:hidden">
      <ul>
        {LINKS.map(({ label, ...link }) => (
          <li key={label}>
            <a
              {...link}
              className="flex min-h-lm-touch items-center rounded-lm-sm px-2 text-lm-docs-body transition-colors duration-(--lm-dur-instant) hover:text-lm-docs-link-hover"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** The header already carries the logo, so the sidebar title renders nothing. */
export function DocsSidebarTitle() {
  return null;
}
