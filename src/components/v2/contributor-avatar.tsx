"use client";

import { useEffect, useRef, useState } from "react";
import { EXTERNAL_LINK, FOCUS_RING } from "./button";

// Avatars fade in with the panel. The first 12 are staggered and the rest
// arrive together, so the whole panel lands inside the page's entrance budget.
const STAGGER_MS = 30;
const STAGGERED = 12;
// Gap kept between a tooltip and the edges of the panel it sits in.
const EDGE_PX = 8;

export type AvatarPerson = {
  login: string;
  profileUrl: string;
  commits: number;
  avatar: string | null;
};

type ContributorAvatarProps = {
  person: AvatarPerson;
  index: number;
  /** Shown from 760px only. Below that the person is counted in "+N". */
  wideOnly: boolean;
};

/** Two letters for the placeholder: capitals first, then word starts, then the login's start. */
function initials(login: string) {
  const capitals = login.match(/[A-Z]/g) ?? [];
  if (capitals.length >= 2) return capitals.slice(0, 2).join("");
  const words = login.split(/[-_.]+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return login.slice(0, 2).toUpperCase();
}

export function ContributorAvatar({
  person,
  index,
  wideOnly,
}: ContributorAvatarProps) {
  const { login, profileUrl, avatar } = person;
  const commits = person.commits.toLocaleString("en-US");
  const label = `${login} · ${commits} ${person.commits === 1 ? "commit" : "commits"}`;
  const letters = initials(login);
  // Initials show only when there is no photo. They are then the only visible
  // text on the link, so the name starts with them and a speech user who says
  // "click JL" reaches it (WCAG 2.5.3). Leaving them out of the name would not
  // help: sighted users still read them as the label. A photo has no text.
  const name = avatar ? label : `${letters}, ${label}`;

  const tip = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState({ hover: false, focus: false });
  const [dismissed, setDismissed] = useState(false);
  const open = active.hover || active.focus;

  // Esc hides the tooltip without moving focus (WCAG 1.4.13). It comes back on
  // the next hover or focus. Hover alone doesn't focus anything, so this
  // listens on the document.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDismissed(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Keeps the tooltip inside the panel, which clips sideways so a long login
  // near an edge can never make the page scroll.
  const place = () => {
    const el = tip.current;
    const panel = el?.closest("[data-avatar-panel]");
    if (!el || !panel) return;
    el.style.translate = "";
    const box = el.getBoundingClientRect();
    const bounds = panel.getBoundingClientRect();
    const left = bounds.left + EDGE_PX - box.left;
    const right = bounds.right - EDGE_PX - box.right;
    const shift = left > 0 ? left : right < 0 ? right : 0;
    if (shift) el.style.translate = `calc(-50% + ${shift}px) 0`;
  };

  const activate = (key: "hover" | "focus") => {
    place();
    setDismissed(false);
    setActive((a) => ({ ...a, [key]: true }));
  };
  const deactivate = (key: "hover" | "focus") =>
    setActive((a) => ({ ...a, [key]: false }));

  return (
    <li
      className={`group relative transition-opacity duration-(--lm-dur-reveal) ease-lm-out group-data-[reveal-state=pending]/panel:opacity-0 motion-reduce:transition-none ${wideOnly ? "hidden tablet:block" : ""}`}
      style={{
        transitionDelay: `${Math.min(index, STAGGERED) * STAGGER_MS}ms`,
      }}
      data-avatar
      data-dismissed={dismissed || undefined}
      onPointerEnter={() => activate("hover")}
      onPointerLeave={() => deactivate("hover")}
      onFocus={() => activate("focus")}
      onBlur={() => deactivate("focus")}
    >
      <a
        href={profileUrl}
        {...EXTERNAL_LINK}
        aria-label={name}
        className={`relative flex size-12 items-center justify-center overflow-hidden rounded-full border border-lm-line bg-lm-raised font-lm-body text-[13px] font-medium text-lm-ink-secondary transition-[translate,border-color] duration-(--lm-dur-instant) hover:-translate-y-0.5 hover:border-lm-line-strong focus-visible:-translate-y-0.5 motion-reduce:translate-y-0! ${FOCUS_RING}`}
      >
        {avatar ? (
          // A plain img: the export has no image optimizer, and the file is already 96px.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            width={48}
            height={48}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{letters}</span>
        )}
      </a>
      {/* The link's name carries this text, so the tooltip itself stays silent.
          Hovering another avatar hides this one even while it has focus, so two
          tooltips never overlap. The width stops at the panel's edges, and a
          long login ends in an ellipsis. */}
      <span
        ref={tip}
        aria-hidden="true"
        className="invisible absolute top-full left-1/2 z-10 -translate-x-1/2 pt-2 opacity-0 transition-[opacity,visibility] duration-(--lm-dur-fast) group-hover:visible group-hover:opacity-100 group-has-focus-visible:visible group-has-focus-visible:opacity-100 group-data-dismissed:invisible! group-data-dismissed:opacity-0! max-w-[calc(100cqw-16px)] motion-reduce:transition-none [[data-avatar-panel]:has([data-avatar]:hover)_[data-avatar]:not(:hover)_&]:invisible! [[data-avatar-panel]:has([data-avatar]:hover)_[data-avatar]:not(:hover)_&]:opacity-0!"
      >
        <span className="block rounded-lm-sm border border-lm-line bg-lm-raised px-2.5 py-1.5 truncate font-lm-mono text-xs text-lm-ink shadow-lg shadow-black/40">
          {label}
        </span>
      </span>
    </li>
  );
}
