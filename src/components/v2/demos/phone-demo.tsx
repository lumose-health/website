"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Brain, CheckCircle } from "lucide-react";
import { PHONE_SETTLED, PHONE_TRACK, phoneFrameAt } from "@/lib/v2/demo-clock";
import type { DemoClock, PhoneFrame as Frame } from "@/lib/v2/demo-clock";
import { QuietPill } from "../quiet-pill";
import {
  ChatScreen,
  PhoneFrame,
  SCREEN_BODY,
  SCREEN_FOOTER,
  SCREEN_HEADER,
  chatBubbles,
} from "./demo-placeholder";

type AlertItem = {
  level: "warning" | "urgent" | "recovery" | "brief";
  title: string;
  body: string;
  time: string;
};

// A preview of a screen still in development, with made-up data.
const ALERTS: AlertItem[] = [
  {
    level: "warning",
    title: "Lumose - Sarah",
    body: "Blood sugar is HIGH -- 245 mg/dL and rising. Last reading 5 min ago.",
    time: "2 min ago",
  },
  {
    level: "urgent",
    title: "Lumose - Sarah",
    body: "URGENT: Blood sugar is 52 mg/dL -- immediate attention needed.",
    time: "Just now",
  },
  {
    level: "recovery",
    title: "Lumose - Sarah",
    body: "Sarah's blood sugar is back in range -- 128 mg/dL and stable.",
    time: "12 min ago",
  },
  {
    level: "brief",
    title: "Daily Brief - Sarah",
    body: "Yesterday: 76% in range. 2 highs, no lows.",
    time: "8:00 AM",
  },
];

const ALERT_STYLES = {
  warning: {
    box: "border-amber-500/30 bg-amber-500/15",
    tint: "text-amber-400",
    Icon: Bell,
  },
  urgent: {
    box: "border-red-500/30 bg-red-500/15",
    tint: "text-red-400",
    Icon: Bell,
  },
  recovery: {
    box: "border-green-500/30 bg-green-500/15",
    tint: "text-green-400",
    Icon: CheckCircle,
  },
  brief: {
    box: "border-blue-500/30 bg-blue-500/15",
    tint: "text-blue-400",
    Icon: Brain,
  },
};

const SCREEN_FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 },
};

// A CSS loop, so the dots stop with the region. One from motion wouldn't.
function TypingDots() {
  return (
    <div className="flex shrink-0 justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-2">
        {["0ms", "200ms", "400ms"].map((delay) => (
          <span
            key={delay}
            style={{ animationDelay: delay }}
            className="size-1.5 animate-pulse rounded-full bg-muted-foreground/50 [animation-duration:1s]"
          />
        ))}
      </div>
    </div>
  );
}

function AlertNotification({ alert }: { alert: AlertItem }) {
  const { box, tint, Icon } = ALERT_STYLES[alert.level];

  return (
    <motion.div
      className={`mx-2 rounded-xl border p-2.5 ${box}`}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 size-4 shrink-0 ${tint}`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold">{alert.title}</span>
            <span className="text-[9px] text-muted-foreground">
              {alert.time}
            </span>
          </div>
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">
            {alert.body}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function AlertsScreen({ current }: { current: number }) {
  return (
    <>
      <div className={SCREEN_HEADER}>
        <div className="flex size-6 items-center justify-center rounded-full bg-amber-500">
          <Bell className="size-3 text-white" />
        </div>
        <div>
          <div className="text-[11px] font-semibold whitespace-nowrap">
            Caregiver Alerts
          </div>
          <div className="text-[9px] text-muted-foreground">
            Monitoring Sarah
          </div>
        </div>
        {/* Scaled to the text around it, so the header fits at 280px wide. */}
        <span className="ml-auto [&>span]:gap-1 [&>span]:px-1.5 [&>span]:py-px [&>span]:text-[9px]">
          <QuietPill status="in-development" />
        </span>
      </div>

      <div className={`flex flex-col gap-2 py-3 ${SCREEN_BODY}`}>
        <AnimatePresence mode="wait">
          <AlertNotification key={current} alert={ALERTS[current]} />
        </AnimatePresence>

        <div className="space-y-2 opacity-30">
          {ALERTS.slice(0, current)
            .reverse()
            .slice(0, 2)
            .map((alert, i) => (
              <div
                key={i}
                className="mx-2 rounded-xl border border-border/20 bg-muted/30 p-2"
              >
                <div className="flex items-center gap-2">
                  <Bell className="size-3 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">
                    {alert.title}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div
        className={`${SCREEN_FOOTER} justify-center text-[9px] text-muted-foreground`}
      >
        Preview. Keep your CGM&apos;s own alerts on.
      </div>
    </>
  );
}

/**
 * Shows the settled frame until the clock first runs, then follows its script.
 * State changes only on the script's marks, about a dozen times a cycle, and
 * only this component re-renders.
 */
export function PhoneDemo({ clock }: { clock: DemoClock }) {
  const [frame, setFrame] = useState<Frame>(PHONE_SETTLED);

  useEffect(
    () =>
      clock.add(PHONE_TRACK, (position) => setFrame(phoneFrameAt(position))),
    [clock],
  );

  return (
    <PhoneFrame>
      <AnimatePresence mode="wait" initial={false}>
        {frame.screen === "chat" ? (
          <motion.div key="chat" {...SCREEN_FADE}>
            <ChatScreen>
              {chatBubbles(frame.messages, (bubble, index) => (
                <motion.div
                  key={index}
                  initial={
                    frame === PHONE_SETTLED ? false : { opacity: 0, y: 8 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {bubble}
                </motion.div>
              ))}
              {frame.typing ? <TypingDots /> : null}
            </ChatScreen>
          </motion.div>
        ) : (
          <motion.div key="alerts" {...SCREEN_FADE}>
            <AlertsScreen current={frame.alert} />
          </motion.div>
        )}
      </AnimatePresence>
    </PhoneFrame>
  );
}
