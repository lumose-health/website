"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { routes } from "@/lib/v2/routes";
import { buttonClass, NAV_LINK } from "./button";

const PANEL_ID = "lm-menu";
const LINK = `${NAV_LINK} w-full text-[15px]`;

type MobileMenuProps = {
  links: readonly { label: string; href: string }[];
  /** Header items that move into the menu below 760px. */
  children: React.ReactNode;
};

// Renders the toggle and the panel as siblings in the header's wrapping row.
// The panel takes a full row of its own, so it pushes the page down, and it
// comes right after the toggle in the tab order.
export function MobileMenu({ links, children }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const Icon = open ? X : Menu;

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen(!open)}
        className={`${buttonClass("icon")} desktop:hidden`}
      >
        <Icon size={22} aria-hidden="true" />
      </button>
      <nav
        id={PANEL_ID}
        aria-label="Main"
        hidden={!open}
        onClick={(event) => {
          if ((event.target as Element).closest("a")) setOpen(false);
        }}
        className="basis-full pt-2 transition-[opacity,translate] duration-(--lm-dur-fast) ease-lm-out starting:-translate-y-2 starting:opacity-0 motion-reduce:transition-none desktop:hidden"
      >
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={LINK}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="tablet:hidden">{children}</div>
        <ul className="mt-2 border-t border-lm-line-subtle pt-2">
          <li>
            <a href={routes.changelog} className={LINK}>
              Changelog
            </a>
          </li>
          <li>
            <a href={routes.roadmap} className={LINK}>
              Roadmap
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}
