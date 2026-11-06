import type { Metadata } from "next";
import { HomePage } from "@/components/home-page";

// Set here rather than in the root layout, which every route would inherit.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomePage />;
}
