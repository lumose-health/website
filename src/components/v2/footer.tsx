"use client";

import { usePathname } from "next/navigation";
import {
  DISCORD_URL,
  DISCUSSIONS_URL,
  GITHUB_URL,
  SPONSOR_URL,
  routes,
} from "@/lib/v2/routes";
import { EXTERNAL_LINK, NAV_LINK } from "./button";
import { Logo } from "./logo";
import { PauseMotion } from "./pause-motion";

const COLUMNS = [
  {
    title: "Project",
    links: [
      { label: "Docs", href: routes.docs },
      { label: "Changelog", href: routes.changelog },
      { label: "Roadmap", href: routes.roadmap },
      { label: "GitHub", href: GITHUB_URL },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Discord", href: DISCORD_URL },
      { label: "Discussions", href: DISCUSSIONS_URL },
      { label: "Open Collective", href: SPONSOR_URL },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Medical disclaimer", href: routes.disclaimer },
      { label: "Privacy", href: routes.privacy },
      { label: "Terms", href: routes.terms },
      { label: "Accessibility", href: routes.accessibility },
      { label: "Contact", href: routes.contact },
    ],
  },
];

export function Footer() {
  // Only the home page has loops. Content pages stay free of the control. The
  // suffix goes because a host serving the export literally reports /v2.html,
  // or /index.html once this is the root.
  const pathname = usePathname().replace(/(\/index)?(\.html)?$/, "") || "/";
  const showPause = pathname === routes.home;

  return (
    <footer className="border-t border-lm-line-subtle bg-lm-footer">
      <div className="mx-auto flex max-w-lm-content flex-col gap-10 px-lm-gutter pt-14 pb-8 desktop:flex-row desktop:justify-between">
        <div className="max-w-[420px]">
          <Logo size="footer" />
          <p className="mt-2 text-sm text-lm-ink-muted">
            <a
              href={routes.rename}
              className={`${NAV_LINK} underline underline-offset-4`}
            >
              Formerly GlycemicGPT
            </a>
            . GPL-3.0.
          </p>
          <p className="text-[13px] text-lm-ink-faint">
            Not a medical device. Not cleared or approved by the FDA or any
            regulator. Always talk to your care team before changing treatment.
          </p>
          {showPause && (
            <div className="mt-2">
              <PauseMotion />
            </div>
          )}
        </div>

        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-12 gap-y-8 tablet:grid-cols-3 desktop:flex"
        >
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="font-lm-mono text-xs font-medium text-lm-ink-faint uppercase">
                {column.title}
              </h2>
              <ul className="mt-1">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.href.startsWith("https:") ? EXTERNAL_LINK : {})}
                      className={`${NAV_LINK} text-sm`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
