"use client";

import { useEffect } from "react";

/**
 * Restores hash-link scroll behavior for pages whose anchor targets live in
 * dynamic-imported chunks. When the browser parses static HTML it tries to
 * scroll to `window.location.hash` immediately; if the target element isn't
 * in the DOM yet (because its chunk hasn't loaded), the scroll silently
 * fails. This hook re-attempts the scroll as soon as the target appears.
 *
 * Watches for up to 5 seconds, then gives up so it never leaks observers.
 */
export function useHashScrollFix() {
  useEffect(() => {
    const rawHash = window.location.hash;
    if (!rawHash || rawHash.length < 2) return;
    let id: string;
    try {
      id = decodeURIComponent(rawHash.slice(1));
    } catch {
      // Malformed percent-encoding (e.g. "#%E0%A4%A"). Don't crash; bail out.
      return;
    }
    if (!id) return;

    function tryScroll(): boolean {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ block: "start", behavior: "instant" });
      return true;
    }

    // First attempt: target may already be present (eager section).
    if (tryScroll()) return;

    // Watch the DOM for the target to appear (lazy chunk).
    const observer = new MutationObserver(() => {
      if (tryScroll()) observer.disconnect();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Hard cap so a wrong hash doesn't leave the observer running forever.
    const timeout = setTimeout(() => observer.disconnect(), 5000);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);
}
