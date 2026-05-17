"use client";

import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/sections/hero";
import { FeaturesSection } from "@/components/sections/features";
import { useHashScrollFix } from "@/lib/use-hash-scroll-fix";

// All below-the-fold sections lazy-load. Each is wrapped in a viewport-aware
// reveal (or has no animation at all), so users never see them before scroll.
// Lazy-loading them keeps the initial hydration budget tight on slow mobile
// CPUs -- the dominant cost in Lighthouse mobile preset.
const ConnectSection = dynamic(
  () => import("@/components/sections/connect").then((m) => m.ConnectSection),
  { ssr: false }
);
const GlucoseChartSection = dynamic(
  () =>
    import("@/components/sections/glucose-chart").then(
      (m) => m.GlucoseChartSection
    ),
  { ssr: false }
);
const DemoShowcaseSection = dynamic(
  () =>
    import("@/components/sections/demo-showcase").then(
      (m) => m.DemoShowcaseSection
    ),
  { ssr: false }
);
const ArchitectureSection = dynamic(
  () =>
    import("@/components/sections/architecture").then(
      (m) => m.ArchitectureSection
    ),
  { ssr: false }
);
const StatsSection = dynamic(
  () => import("@/components/sections/stats").then((m) => m.StatsSection),
  { ssr: false }
);
const GettingStartedSection = dynamic(
  () =>
    import("@/components/sections/getting-started").then(
      (m) => m.GettingStartedSection
    ),
  { ssr: false }
);
const LazyFooter = dynamic(
  () => import("@/components/footer").then((m) => m.Footer),
  { ssr: false }
);

export default function Home() {
  // Restore hash-link behavior since most anchor targets now live in
  // dynamic-imported chunks (#platform, #getting-started).
  useHashScrollFix();

  return (
    <>
      <Header />
      <main className="scroll-smooth">
        <HeroSection />
        <FeaturesSection />
        <ConnectSection />
        <GlucoseChartSection />
        <DemoShowcaseSection />
        <ArchitectureSection />
        <StatsSection />
        <GettingStartedSection />
      </main>
      <LazyFooter />
    </>
  );
}
