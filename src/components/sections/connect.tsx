"use client";

import { AnimatedSection } from "@/components/animated-section";
import { Reveal } from "@/components/reveal";
import { Bluetooth, Cloud, Link } from "lucide-react";

const tiers = [
  {
    icon: Bluetooth,
    title: "Direct Connect",
    badge: "Real-Time",
    description:
      "Pair your insulin pump and CGM directly over Bluetooth. Real-time glucose data, basal rates, bolus history, and IoB streamed straight to your phone.",
    details: [
      "5-minute CGM readings, live on your dashboard",
      "Pump status: battery, reservoir, basal rate",
      "Automatic cloud upload to your pump manufacturer",
    ],
    available: true,
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    badge: "Coming Soon",
    description:
      "Already uploading to your pump manufacturer's cloud? Lumose reads your existing reports and aggregates the data -- no direct pump connection needed.",
    details: [
      "Import from manufacturer cloud reports",
      "Historical data aggregation and trend analysis",
      "Works alongside your existing pump app",
    ],
    available: false,
  },
  {
    icon: Link,
    title: "Platform Bridge",
    badge: "Coming Soon",
    description:
      "Using an existing diabetes platform? Connect via API and bring your data into Lumose for AI-powered analysis, alerting, and caregiver access.",
    details: [
      "API integration with third-party platforms",
      "Unified dashboard across all your data sources",
      "Keep your existing setup, add AI insights on top",
    ],
    available: false,
  },
];

export function ConnectSection() {
  return (
    <AnimatedSection className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Connect Your Way
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Whether you want real-time BLE streaming, cloud report imports, or
          integration with your existing platform -- Lumose meets you where
          you are.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier, i) => (
          <Reveal
            key={tier.title}
            delay={i * 100}
            className={`relative flex flex-col rounded-xl border p-6 ${
              tier.available
                ? "border-primary/30 bg-card shadow-lg shadow-primary/5"
                : "border-border bg-card"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <tier.icon className="h-5 w-5 text-primary" />
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  tier.available
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tier.badge}
              </span>
            </div>

            <h3 className="mb-2 text-lg font-semibold">{tier.title}</h3>
            <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
              {tier.description}
            </p>

            <ul className="mt-auto space-y-2">
              {tier.details.map((detail) => (
                <li
                  key={detail}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  {detail}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Lumose is designed to work with any insulin pump, CGM, or diabetes
        platform. Support for additional devices and integrations is actively
        being developed.
      </p>
    </AnimatedSection>
  );
}
