import type { Metadata } from "next";
import { NotFoundShell } from "@/components/v2/legal-shell";

// Next marks every 404 noindex by itself. A preview build also has a robots
// tag from the root layout, so this clears that one and the page keeps one.
export const metadata: Metadata = { title: "Page not found", robots: null };

export default function NotFound() {
  return <NotFoundShell />;
}
