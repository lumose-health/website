"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Server, Smartphone, Activity, ArrowRight } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

const steps = [
  {
    icon: Server,
    title: "Deploy",
    description:
      "One command to spin up the full platform. Docker Compose or Kubernetes, your choice.",
    code: "docker compose up -d",
  },
  {
    icon: Smartphone,
    title: "Install",
    description:
      "Sideload the Android app and pair your insulin pump over Bluetooth.",
  },
  {
    icon: Activity,
    title: "Monitor",
    description:
      "Real-time glucose data, AI insights, caregiver alerts, and Wear OS watch face.",
  },
];

export function GettingStartedSection() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatedSection className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center" id="getting-started">
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl scroll-mt-20">
          Up and running in minutes
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Three steps from zero to real-time glucose monitoring.
        </p>
      </div>

      <div className="relative grid gap-8 md:grid-cols-3">
        {/* Connecting line (desktop) */}
        <div className="absolute left-0 right-0 top-16 hidden h-px bg-border md:block" />

        {steps.map((step, i) => (
          <motion.div
            key={step.title}
            className="relative rounded-xl border border-border bg-card p-6 text-center"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <step.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="mb-1 text-xs font-medium text-muted-foreground">
              Step {i + 1}
            </div>
            <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step.description}
            </p>
            {step.code && (
              <code className="mt-3 inline-block rounded-md bg-muted px-3 py-1.5 text-xs font-mono">
                {step.code}
              </code>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href="/docs"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
        >
          View Full Documentation
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </AnimatedSection>
  );
}
