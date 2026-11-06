import { BeamSection } from "@/components/v2/beam/beam-section";
import { Dashboard } from "@/components/v2/dashboard/dashboard";
import { Hero } from "@/components/v2/hero";

export default function V2Home() {
  return (
    <main>
      <Hero />
      <Dashboard />
      <BeamSection />
    </main>
  );
}
