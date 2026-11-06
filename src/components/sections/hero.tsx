"use client";

import { ArrowRight } from "lucide-react";
import { GitHubIcon } from "@/components/icons";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-4 pt-16">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-green-500/8 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/6 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground">
          Open Source Diabetes Management Platform
        </div>

        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Because no one should manage diabetes alone.
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          Real-time glucose monitoring, AI-powered analysis, caregiver alerts,
          and Wear OS support. Self-hosted, privacy-first, completely open source.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#getting-started"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/lumose-health/lumose"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            <GitHubIcon className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
