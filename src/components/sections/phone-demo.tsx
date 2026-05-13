"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MessageSquare,
  Send,
  AlertTriangle,
  Bell,
  CheckCircle,
  Brain,
} from "lucide-react";

// --- Types ---

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

interface AlertItem {
  level: "warning" | "urgent" | "recovery" | "brief";
  title: string;
  body: string;
  time: string;
}

// --- Data ---

const chatMessages: ChatMsg[] = [
  { role: "user", content: "How am I doing today?" },
  {
    role: "assistant",
    content:
      "Time in range is **78%** today -- above your 70% target. Average glucose **142 mg/dL**. One high after lunch (peaked 225) but your correction worked within 90 min.",
  },
  { role: "user", content: "Prepare a summary for my endo appointment" },
  {
    role: "assistant",
    content:
      "14-day report:\n- Time in range: 74%\n- Avg: 151 mg/dL, GMI: 6.9%\n- Pattern: Post-dinner highs 3x/week\n- Suggestion: Evening carb ratio adjustment",
  },
  { role: "user", content: "Will I go low tonight?" },
  {
    role: "assistant",
    content:
      "Current: 136 mg/dL, trending down. **Moderate risk** of going below 70 by 2 AM. Consider a 15g snack before bed. I'll alert you if glucose drops below 80.",
  },
];

const alerts: AlertItem[] = [
  {
    level: "warning",
    title: "GlycemicGPT - Sarah",
    body: "Blood sugar is HIGH -- 245 mg/dL and rising. Last reading 5 min ago.",
    time: "2 min ago",
  },
  {
    level: "urgent",
    title: "GlycemicGPT - Sarah",
    body: "URGENT: Blood sugar is 52 mg/dL -- immediate attention needed.",
    time: "Just now",
  },
  {
    level: "recovery",
    title: "GlycemicGPT - Sarah",
    body: "Sarah's blood sugar is back in range -- 128 mg/dL and stable.",
    time: "12 min ago",
  },
  {
    level: "brief",
    title: "Daily Brief - Sarah",
    body: "Yesterday: 76% in range. 2 highs, no lows. Trending better than last week.",
    time: "8:00 AM",
  },
];

// --- Subcomponents ---

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMsg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      className={`flex shrink-0 ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${
          isUser ? "bg-blue-600 text-white" : "bg-muted text-foreground"
        }`}
      >
        {msg.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-0.5" : ""}>
            {line.split("**").map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j}>{part}</strong>
              ) : (
                <span key={j}>{part}</span>
              )
            )}
          </p>
        ))}
        {!isUser && (
          <p className="mt-1 pt-0.5 border-t border-border/30 text-[9px] text-muted-foreground flex items-center gap-0.5">
            <AlertTriangle className="h-2 w-2" />
            Not medical advice
          </p>
        )}
      </div>
    </motion.div>
  );
}

function AlertNotification({ alert }: { alert: AlertItem }) {
  const colors = {
    warning: { bg: "bg-amber-500/15", border: "border-amber-500/30", icon: "text-amber-400" },
    urgent: { bg: "bg-red-500/15", border: "border-red-500/30", icon: "text-red-400" },
    recovery: { bg: "bg-green-500/15", border: "border-green-500/30", icon: "text-green-400" },
    brief: { bg: "bg-blue-500/15", border: "border-blue-500/30", icon: "text-blue-400" },
  };
  const c = colors[alert.level];
  const Icon =
    alert.level === "recovery"
      ? CheckCircle
      : alert.level === "brief"
        ? Brain
        : Bell;

  return (
    <motion.div
      className={`mx-2 rounded-xl border ${c.border} ${c.bg} p-2.5`}
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-2">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${c.icon}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold">{alert.title}</span>
            <span className="text-[9px] text-muted-foreground">{alert.time}</span>
          </div>
          <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">
            {alert.body}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// --- Phone Frame ---

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[280px] sm:w-[300px]">
      <div className="rounded-[2.5rem] border-2 border-border bg-background p-2 shadow-xl">
        <div className="mx-auto mb-1 h-5 w-20 rounded-full bg-border/50" />
        <div className="overflow-hidden rounded-[2rem] border border-border bg-background">
          {children}
        </div>
        <div className="mx-auto mt-1 h-1 w-14 rounded-full bg-border/50" />
      </div>
    </div>
  );
}

// --- Main Component ---

export function PhoneDemo({ onDailyBriefAlert }: { onDailyBriefAlert?: () => void }) {
  const prefersReducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<"chat" | "alerts">("chat");
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [visibleAlert, setVisibleAlert] = useState(0);

  // Auto-scroll chat container to bottom (not the page)
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [visibleMessages, showTyping]);

  useEffect(() => {
    if (prefersReducedMotion) {
      // Accessibility: when prefers-reduced-motion activates, normalize the
      // animation state to its final values in a single pass so the user sees
      // the end state immediately rather than the running animation. This is
      // a deliberate exception to the react-hooks/set-state-in-effect rule;
      // the cascading-render concern does not apply because prefersReducedMotion
      // is a stable media-query value, not a per-render state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisibleMessages(chatMessages.length);
      setPhase("chat");
      setShowTyping(false);
      return;
    }

    // Fix #1: track ALL timeouts to prevent memory leaks on unmount
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    function schedule(fn: () => void, ms: number) {
      const id = setTimeout(fn, ms);
      timeouts.push(id);
      return id;
    }

    let msgIdx = 0;

    function nextChatMessage() {
      if (msgIdx >= chatMessages.length) {
        schedule(() => {
          setPhase("alerts");
          setVisibleAlert(0);
          runAlerts();
        }, 2500);
        return;
      }

      const msg = chatMessages[msgIdx];
      if (msg.role === "assistant") {
        setShowTyping(true);
        schedule(() => {
          setShowTyping(false);
          setVisibleMessages(msgIdx + 1);
          msgIdx++;
          schedule(nextChatMessage, 2000);
        }, 1500);
      } else {
        setVisibleMessages(msgIdx + 1);
        msgIdx++;
        schedule(nextChatMessage, 800);
      }
    }

    let alertIdx = 0;
    function runAlerts() {
      if (alertIdx >= alerts.length) {
        schedule(() => {
          setPhase("chat");
          setVisibleMessages(0);
          setShowTyping(false);
          msgIdx = 0;
          alertIdx = 0;
          schedule(nextChatMessage, 1500);
        }, 4000);
        return;
      }

      setVisibleAlert(alertIdx);
      if (alertIdx === 3 && onDailyBriefAlert) {
        onDailyBriefAlert();
      }
      alertIdx++;
      schedule(runAlerts, 4000);
    }

    schedule(nextChatMessage, 1200);

    return () => timeouts.forEach(clearTimeout);
  }, [prefersReducedMotion, onDailyBriefAlert]);

  return (
    <PhoneFrame>
      <AnimatePresence mode="wait">
        {phase === "chat" ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chat header */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                <MessageSquare className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="text-[11px] font-semibold">AI Chat</div>
                <div className="text-[9px] text-muted-foreground">
                  Ask about your glucose data
                </div>
              </div>
            </div>

            {/* Scrollable messages area -- hidden scrollbar like a real phone */}
            <div ref={chatContainerRef} className="h-[320px] overflow-y-auto px-2.5 py-2 scrollbar-none" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
              <div className="flex flex-col gap-1.5">
                <AnimatePresence mode="popLayout">
                  {chatMessages.slice(0, visibleMessages).map((msg, i) => (
                    <ChatBubble key={`chat-${i}`} msg={msg} />
                  ))}
                </AnimatePresence>
                {showTyping && (
                  <div className="flex justify-start shrink-0">
                    <div className="rounded-2xl bg-muted px-3 py-2">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border px-2.5 py-1.5">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-2.5 py-1">
                <span className="flex-1 text-[9px] text-muted-foreground">
                  Ask about your glucose data...
                </span>
                <Send className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="alerts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Alerts header */}
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500">
                <Bell className="h-3 w-3 text-white" />
              </div>
              <div>
                <div className="text-[11px] font-semibold">Caregiver Alerts</div>
                <div className="text-[9px] text-muted-foreground">
                  Monitoring Sarah
                </div>
              </div>
            </div>

            {/* Alert notifications */}
            <div className="flex h-[320px] flex-col justify-start gap-2 py-3">
              <AnimatePresence mode="wait">
                <AlertNotification
                  key={`alert-${visibleAlert}`}
                  alert={alerts[visibleAlert]}
                />
              </AnimatePresence>

              {/* Previous alerts (faded) */}
              <div className="space-y-2 opacity-30">
                {alerts
                  .slice(0, visibleAlert)
                  .reverse()
                  .slice(0, 2)
                  .map((a, i) => (
                    <div
                      key={`prev-${i}`}
                      className="mx-2 rounded-xl border border-border/20 bg-muted/30 p-2"
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[9px] text-muted-foreground">
                          {a.title}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border px-2.5 py-1.5 text-center">
              <span className="text-[9px] text-muted-foreground">
                Real-time caregiver monitoring
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PhoneFrame>
  );
}
