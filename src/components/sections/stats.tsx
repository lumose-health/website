"use client";

import { AnimatedSection } from "@/components/animated-section";
import { Reveal } from "@/components/reveal";
import { Shield, Brain, Puzzle, Users } from "lucide-react";

const differentiators = [
  {
    icon: Shield,
    title: "Your Data, Your Server",
    description:
      "Self-hosted on your infrastructure. No cloud accounts, no data harvesting, no corporate access to your health records.",
  },
  {
    icon: Brain,
    title: "AI That Knows Your Patterns",
    description:
      "Daily analysis briefs, pattern detection, and conversational AI that understands your insulin, your meals, your life.",
  },
  {
    icon: Puzzle,
    title: "Works Your Way",
    description:
      "BLE direct connect, cloud sync, or bridge from your existing platform. One app, any device, any setup.",
  },
  {
    icon: Users,
    title: "Built for Caregivers Too",
    description:
      "Read-only access for parents and partners. Alerting is in active development and works only for some setups. Keep your CGM's own alerts on.",
  },
];

export function StatsSection() {
  return (
    <AnimatedSection className="border-y border-border bg-muted/30">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {differentiators.map((item, i) => (
          <Reveal
            key={item.title}
            delay={i * 100}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mb-1.5 text-sm font-semibold">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </Reveal>
        ))}
      </div>
    </AnimatedSection>
  );
}
