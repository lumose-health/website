"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { DiscordIcon, GitHubIcon, OpenCollectiveIcon } from "./icons";
import { ThemeToggle } from "./theme-toggle";

const MOBILE_MENU_EXIT_MS = 180;

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Platform", href: "/#platform" },
  { label: "Docs", href: "/docs" },
  { label: "Getting Started", href: "/#getting-started" },
  { label: "Discord", href: "https://discord.gg/QbyhCQKDBs", external: true },
  { label: "Open Collective", href: "https://opencollective.com/lumose", external: true },
  { label: "GitHub", href: "https://github.com/GlycemicGPT/GlycemicGPT", external: true },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const toggleMobile = () => {
    if (mobileOpen && !mobileClosing) {
      setMobileClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setMobileOpen(false);
        setMobileClosing(false);
      }, MOBILE_MENU_EXIT_MS);
    } else if (!mobileOpen) {
      setMobileOpen(true);
    }
  };

  const closeMobile = () => {
    if (!mobileOpen || mobileClosing) return;
    setMobileClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setMobileOpen(false);
      setMobileClosing(false);
    }, MOBILE_MENU_EXIT_MS);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG favicon, 6.5KB, no optimization needed */}
          <img src="/logo.svg" alt="" className="h-7 w-7" aria-hidden="true" />
          GlycemicGPT
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label === "GitHub" && <GitHubIcon className="h-4 w-4" />}
              {link.label === "Discord" && <DiscordIcon className="h-4 w-4" />}
              {link.label === "Open Collective" && <OpenCollectiveIcon className="h-4 w-4" />}
              {link.label}
            </a>
          ))}
          <ThemeToggle />
        </nav>

        {/* Mobile toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={toggleMobile}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen && !mobileClosing}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu -- mounted during open + closing phases to play exit animation */}
      {mobileOpen && (
        <nav
          className={`${
            mobileClosing ? "animate-fade-up-exit" : "animate-fade-down"
          } overflow-hidden border-b border-border bg-background/95 backdrop-blur-md md:hidden`}
        >
          <div className="flex flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                {...(link.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
