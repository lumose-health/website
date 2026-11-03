"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FileText, TrendingUp, AlertTriangle, Activity, Sun } from "lucide-react";

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-[520px]">
      <div className="rounded-xl border border-border bg-background shadow-xl overflow-hidden">
        {/* macOS-style window chrome */}
        <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
          <div className="ml-3 flex-1 rounded-md bg-background/80 px-3 py-0.5 text-center text-[9px] text-muted-foreground">
            lumose.org/dashboard/briefs
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// Each section fades in based on a visibility index
function RevealBlock({
  children,
  visible,
  reduced,
}: {
  children: React.ReactNode;
  visible: boolean;
  reduced: boolean | null;
}) {
  // Fix #2: handle reduced-motion preference changes -- always show if reduced
  if (reduced) return <div>{children}</div>;
  if (!visible) return <div className="opacity-0">{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}

export function BrowserDemo({ trigger }: { trigger: number }) {
  const prefersReducedMotion = useReducedMotion();
  const [visibleSections, setVisibleSections] = useState(prefersReducedMotion ? 6 : 0);

  // Play animation on mount and re-sync when phone triggers daily brief
  useEffect(() => {
    if (prefersReducedMotion) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset animation on trigger
    setVisibleSections(0);

    const delays = [300, 900, 1800, 2800, 3800, 4800];
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    delays.forEach((delay, i) => {
      timeouts.push(setTimeout(() => setVisibleSections(i + 1), delay));
    });

    return () => timeouts.forEach(clearTimeout);
  }, [trigger, prefersReducedMotion]);

  return (
    <BrowserFrame>
      {/* Fixed height container -- prevents resizing during animation */}
      <div className="flex h-[440px]">
        {/* Sidebar */}
        <div className="hidden sm:flex w-[110px] shrink-0 flex-col border-r border-border bg-muted/30 px-2 py-3">
          <div className="flex items-center gap-1.5 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny SVG in mockup */}
            <img src="/logo.svg" alt="" className="h-4 w-4" />
            <span className="text-[9px] font-bold">GlycemicGPT</span>
          </div>
          <div className="space-y-1">
            {["Dashboard", "Daily Briefs", "Alerts", "AI Chat", "Knowledge Base", "Settings"].map(
              (item, i) => (
                <div
                  key={item}
                  className={`rounded-md px-2 py-1 text-[8px] ${
                    i === 1
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {item}
                </div>
              )
            )}
          </div>
        </div>

        {/* Main content - Daily Brief with fixed layout */}
        <div className="flex-1 overflow-hidden px-4 py-4">
          {/* Header -- always visible */}
          <RevealBlock visible={visibleSections >= 1} reduced={prefersReducedMotion}>
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <h3 className="text-xs font-semibold">Daily Brief</h3>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Today
              </p>
            </div>
          </RevealBlock>

          {/* Greeting */}
          <RevealBlock visible={visibleSections >= 2} reduced={prefersReducedMotion}>
            <div className="mb-3 rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[10px] font-semibold">Good morning, Sarah</span>
              </div>
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Here&apos;s your overnight summary. Glucose stayed in range{" "}
                <strong className="text-foreground">82-156 mg/dL</strong> with
                no lows detected. Time in range yesterday was{" "}
                <strong className="text-foreground">76%</strong>.
              </p>
            </div>
          </RevealBlock>

          {/* Stats row */}
          <RevealBlock visible={visibleSections >= 3} reduced={prefersReducedMotion}>
            <div className="mb-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-border p-2.5 text-center">
                <div className="text-lg font-bold text-green-400">76%</div>
                <div className="text-[9px] text-muted-foreground">Time in Range</div>
              </div>
              <div className="rounded-lg border border-border p-2.5 text-center">
                <div className="text-lg font-bold">148</div>
                <div className="text-[9px] text-muted-foreground">Avg mg/dL</div>
              </div>
              <div className="rounded-lg border border-border p-2.5 text-center">
                <div className="text-lg font-bold text-amber-400">2</div>
                <div className="text-[9px] text-muted-foreground">Highs Yesterday</div>
              </div>
            </div>
          </RevealBlock>

          {/* Pattern insight */}
          <RevealBlock visible={visibleSections >= 4} reduced={prefersReducedMotion}>
            <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[10px] font-semibold text-amber-400">Pattern Detected</span>
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed">
                Post-dinner highs for the <strong className="text-foreground">3rd day in a row</strong>.
                Average post-dinner peak: <strong className="text-foreground">218 mg/dL</strong>.
              </p>
            </div>
          </RevealBlock>

          {/* AI Pattern Summary */}
          <RevealBlock visible={visibleSections >= 5} reduced={prefersReducedMotion}>
            <div className="mb-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Activity className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[10px] font-semibold text-blue-400">AI Pattern Summary</span>
              </div>
              <p className="text-[9px] text-muted-foreground leading-relaxed">
                Overnight glucose stayed stable. Post-dinner remains the
                recurring pattern this week. A summary your care team will
                want to see.
              </p>
            </div>
          </RevealBlock>

          {/* Disclaimer */}
          <RevealBlock visible={visibleSections >= 6} reduced={prefersReducedMotion}>
            <p className="flex items-center gap-1 text-[8px] text-muted-foreground">
              <AlertTriangle className="h-2.5 w-2.5" />
              Not medical advice. Consult your healthcare provider.
            </p>
          </RevealBlock>
        </div>
      </div>
    </BrowserFrame>
  );
}
