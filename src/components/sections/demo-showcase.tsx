"use client";

import { useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";
import { PhoneDemo } from "./phone-demo";
import { WatchDemo } from "./watch-demo";
import { BrowserDemo } from "./browser-demo";

export function DemoShowcaseSection() {
  // Sync: browser starts its animation when phone enters daily brief alert
  const [briefTrigger, setBriefTrigger] = useState(0);
  const onDailyBriefAlert = useCallback(() => {
    setBriefTrigger((t) => t + 1);
  }, []);

  return (
    <AnimatedSection className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mb-12 text-center">
        <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
          See the Platform in Action
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Manage diabetes from your phone, your wrist, or the web. AI-powered
          insights, real-time alerts, and daily briefs -- wherever you are.
        </p>
      </div>

      <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-8">
        {/* Phone demo: AI Chat + Caregiver Alerts */}
        <div className="flex flex-col items-center gap-3">
          <PhoneDemo onDailyBriefAlert={onDailyBriefAlert} />
          <p className="text-sm font-semibold">Insights &amp; Alerts</p>
          <p className="max-w-[260px] text-center text-xs text-muted-foreground">
            AI chat, predictive insights, and caregiver alerts -- all from your
            phone.
          </p>
        </div>

        {/* Watch demo: BG + Alerts + AI Chat cycling */}
        <div className="flex flex-col items-center gap-3">
          <WatchDemo />
          <p className="text-sm font-semibold">Glance &amp; Go</p>
          <p className="max-w-[180px] text-center text-xs text-muted-foreground">
            BG, trends, alerts, and AI chat on your wrist.
          </p>
        </div>

        {/* Browser demo: Daily Briefs */}
        <div className="flex flex-col items-center gap-3">
          <BrowserDemo trigger={briefTrigger} />
          <p className="text-sm font-semibold">Your Dashboard, Anywhere</p>
          <p className="max-w-[400px] text-center text-xs text-muted-foreground">
            Morning briefs, pattern analysis, and trend reports delivered to your
            web dashboard.
          </p>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-2xl items-start justify-center gap-2 text-center text-xs text-muted-foreground">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
        <p>
          Demo content shown for illustration. Names and data are fictional.
          Lumose is a monitoring and analysis tool -- not medical advice.
          Always consult your healthcare provider before making changes to your
          diabetes management.
        </p>
      </div>
    </AnimatedSection>
  );
}
