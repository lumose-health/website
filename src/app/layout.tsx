import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";
import { PreviewBanner } from "@/components/preview-banner";
import { OG_IMAGE, OPEN_GRAPH, SITE_URL, TITLE_TEMPLATE } from "@/lib/site";
import "./globals.css";

// "preview" on PR builds (set in .github/workflows/ci.yml). Anything else
// (typically unset on production builds in deploy.yml/docs-rebuild.yml) is
// treated as production.
const isPreview = process.env.NEXT_PUBLIC_BUILD_ENV === "preview";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Lumose - Open Source Diabetes Management Platform",
    template: TITLE_TEMPLATE,
  },
  description:
    "Because no one should manage diabetes alone. Real-time glucose monitoring, AI-powered analysis, and Wear OS support. Self-hosted, privacy-first, open source.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    ...OPEN_GRAPH,
    url: SITE_URL,
  },
  // Pages set no twitter fields of their own, so every page keeps this. X
  // reads the title and description from the Open Graph tags.
  twitter: {
    card: "summary_large_image",
    images: [OG_IMAGE],
  },
  // Preview builds emit a noindex meta tag so search engines do not index
  // pr-*.lumose.pages.dev URLs. Production builds emit no robots meta and
  // are indexable.
  ...(isPreview && {
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The site is dark only, so `dark` is fixed here. The docs set their own
  // light reading surface inside it.
  return (
    <html
      lang="en"
      className={`dark ${poppins.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <body className="lm-root antialiased">
        {isPreview && <PreviewBanner />}
        {/* The fumadocs RootProvider lives under src/app/docs/layout.tsx so
            the marketing pages do not ship the docs framework runtime. */}
        {children}
      </body>
    </html>
  );
}
