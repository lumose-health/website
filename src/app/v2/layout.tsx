import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Poppins } from "next/font/google";

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

// Hidden with a meta tag only. A robots.txt rule would stop crawlers reading
// this tag and would advertise the path.
export const metadata: Metadata = {
  title: "Lumose",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // `dark` is set here because the root theme provider can still resolve to
    // light. The fonts live here so live pages never load them.
    <div
      className={`dark lm-root ${poppins.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      {children}
    </div>
  );
}
