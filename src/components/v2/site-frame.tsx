import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";
import { MotionProvider } from "./motion-provider";
import { CONTENT_ID, SkipLink } from "./skip-link";

/**
 * The frame every page outside the docs sits in: skip link, header, the page
 * itself and the footer. The fonts and the .lm-root look come from the root
 * layout.
 */
export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MotionProvider>
        <SkipLink />
        <Header />
        <div id={CONTENT_ID} className="flex-1">
          {children}
        </div>
        <Footer />
      </MotionProvider>
    </div>
  );
}
