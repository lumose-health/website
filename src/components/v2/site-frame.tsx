import type { ReactNode } from "react";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import { Footer } from "./footer";
import { Header } from "./header";
import { MotionProvider } from "./motion-provider";
import { CONTENT_ID, SkipLink } from "./skip-link";

// The fonts live in this file so a page only loads them when it renders the
// frame's module. Live pages must never import it.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

/**
 * The dark frame every new page sits in: skip link, header, the page itself and
 * the footer. Used by the /v2 layout and by the legal pages and the 404.
 */
export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    // `dark` is set here because the root theme provider can still resolve to
    // light.
    <div
      className={`dark lm-root flex flex-col ${poppins.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
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
