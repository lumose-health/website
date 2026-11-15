import type { Metadata } from "next";
import { SiteFrame } from "@/components/v2/site-frame";

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
  return <SiteFrame>{children}</SiteFrame>;
}
