import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { PreviewBanner } from "@/components/preview-banner";
import "./globals.css";

// "preview" on PR builds (set in .github/workflows/ci.yml). Anything else
// (typically unset on production builds in deploy.yml/docs-rebuild.yml) is
// treated as production.
const isPreview = process.env.NEXT_PUBLIC_BUILD_ENV === "preview";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlycemicGPT - Open Source Diabetes Management Platform",
  description:
    "Because no one should manage diabetes alone. Real-time glucose monitoring, AI-powered analysis, caregiver alerts, and Wear OS support. Self-hosted, privacy-first, open source.",
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
    title: "GlycemicGPT - Open Source Diabetes Management Platform",
    description:
      "Because no one should manage diabetes alone. Real-time glucose monitoring, AI-powered analysis, caregiver alerts, and Wear OS support.",
    url: "https://glycemicgpt.org",
    siteName: "GlycemicGPT",
    type: "website",
  },
  // Preview builds emit a noindex meta tag so search engines do not index
  // pr-*.glycemicgpt.pages.dev URLs. Production builds emit no robots meta and
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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {isPreview && <PreviewBanner />}
          {/* fumadocs RootProvider lives in src/app/docs/layout.tsx so the
              marketing landing page does not ship the docs framework runtime. */}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
