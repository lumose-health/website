import { Alerts } from "@/components/v2/alerts";
import { Architecture } from "@/components/v2/architecture";
import { BeamSection } from "@/components/v2/beam/beam-section";
import { ByoAi } from "@/components/v2/byo-ai";
import { Dashboard } from "@/components/v2/dashboard/dashboard";
import { DemoShowcase } from "@/components/v2/demos/demo-showcase";
import { DeviceCards } from "@/components/v2/device-cards";
import { Hero } from "@/components/v2/hero";
import { ProviderSelectionProvider } from "@/components/v2/provider-context";

export default function V2Home() {
  return (
    <main>
      <ProviderSelectionProvider>
        <Hero />
        <Dashboard />
        <BeamSection />
        <ByoAi />
        <Alerts />
        <DemoShowcase />
        <DeviceCards />
        <Architecture />
      </ProviderSelectionProvider>
    </main>
  );
}
