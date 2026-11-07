import type { ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  Check,
  Clock,
  House,
  Lightbulb,
  MessageSquare,
  MessagesSquare,
  Send,
  Settings,
  Utensils,
} from "lucide-react";
import { CHAT_MESSAGES, WATCH_SETTLED } from "@/lib/v2/demo-clock";
import type { ChatMessage, WatchState } from "@/lib/v2/demo-clock";
import { LogoIcon } from "../logo";
import { useProviderSelection } from "../provider-context";

// Shared by both screens, so swapping them never changes the frame's height.
export const SCREEN_HEADER =
  "flex h-[43px] items-center gap-2 border-b border-border px-3";
export const SCREEN_BODY = "h-[320px]";
export const SCREEN_FOOTER =
  "flex h-[38px] items-center border-t border-border px-2.5";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[280px] tablet:w-[300px]">
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

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex shrink-0 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-[11px] leading-relaxed ${
          isUser ? "bg-blue-600 text-white" : "bg-muted text-foreground"
        }`}
      >
        {message.content.split("\n").map((line, i) => (
          <p key={i} className={i > 0 ? "mt-0.5" : ""}>
            {line
              .split("**")
              .map((part, j) =>
                j % 2 === 1 ? <strong key={j}>{part}</strong> : part,
              )}
          </p>
        ))}
        {!isUser ? (
          <p className="mt-1 flex items-center gap-0.5 border-t border-border/30 pt-0.5 text-[9px] text-muted-foreground">
            <AlertTriangle className="size-2" />
            Not medical advice
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** The first `count` messages, with `wrap` for anything that goes around each. */
export function chatBubbles(
  count: number,
  wrap: (bubble: ReactNode, index: number) => ReactNode = (bubble) => bubble,
) {
  return CHAT_MESSAGES.slice(0, count).map((message, index) =>
    wrap(<ChatBubble key={index} message={message} />, index),
  );
}

export function ChatScreen({ children }: { children: ReactNode }) {
  return (
    <>
      <div className={SCREEN_HEADER}>
        <div className="flex size-6 items-center justify-center rounded-full bg-blue-600">
          <MessageSquare className="size-3 text-white" />
        </div>
        <div>
          <div className="text-[11px] font-semibold">AI Chat</div>
          <div className="text-[9px] text-muted-foreground">
            Ask about your glucose data
          </div>
        </div>
      </div>

      {/* The reversed column keeps the newest message in view with no script, so
          nothing can move the page. The tabindex keeps this scroller out of the
          tab order, where browsers would otherwise put it. */}
      <div
        tabIndex={-1}
        className={`flex flex-col-reverse overflow-y-auto px-2.5 py-2 [scrollbar-width:none] ${SCREEN_BODY}`}
      >
        <div className="flex flex-col gap-1.5">{children}</div>
      </div>

      <div className={SCREEN_FOOTER}>
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-muted/50 px-2.5 py-1">
          <span className="flex-1 text-[9px] text-muted-foreground">
            Ask about your glucose data...
          </span>
          <Send className="size-3 text-muted-foreground" />
        </div>
      </div>
    </>
  );
}

/**
 * The chat with every message in place. It's the frame in the static HTML, under
 * reduced motion, and whenever the demo's script can't load.
 */
export function PhonePlaceholder() {
  return (
    <PhoneFrame>
      <ChatScreen>{chatBubbles(CHAT_MESSAGES.length)}</ChatScreen>
    </PhoneFrame>
  );
}

export function WatchFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-[170px] tablet:w-[185px]">
      {/* Crown */}
      <div className="absolute top-1/2 right-[-6px] h-6 w-2 -translate-y-1/2 rounded-r-sm bg-zinc-600" />
      <div className="rounded-full border-[3px] border-zinc-700 bg-zinc-800 p-1 shadow-xl">
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-full bg-black">
          {children}
        </div>
      </div>
    </div>
  );
}

const STABLE_READINGS = [
  [3, 12],
  [10, 11],
  [18, 12],
  [25, 13],
  [33, 11],
  [40, 12],
  [48, 11],
  [55, 12],
  [63, 13],
  [70, 12],
  [78, 11],
  [85, 12],
  [93, 11],
];

const RISING_READINGS = [
  [3, 15],
  [10, 14],
  [18, 13],
  [25, 12],
  [33, 11],
  [40, 10],
  [48, 9],
  [55, 8],
  [63, 6],
  [70, 5],
  [78, 4],
  [85, 4],
  [93, 3],
];

/** The app's graph: target band, then basal and insulin on board along the bottom. */
function WatchGraph({ rising }: { rising: boolean }) {
  const readings = rising ? RISING_READINGS : STABLE_READINGS;

  return (
    <svg
      viewBox="0 0 100 25"
      preserveAspectRatio="none"
      className="h-full w-full"
    >
      <rect
        x="0"
        y="5"
        width="100"
        height="13"
        fill="#22C55E"
        fillOpacity="0.12"
      />
      {[5, 18].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="100"
          y2={y}
          stroke="white"
          strokeWidth="0.3"
          strokeOpacity="0.3"
          strokeDasharray="1.5 1.5"
        />
      ))}

      {[
        [0, 30, 22],
        [30, 70, 21],
        [70, 100, 22.5],
      ].map(([from, to, y]) => (
        <g key={from}>
          <rect
            x={from}
            y={y}
            width={to - from}
            height={25 - y}
            fill="#00BCD4"
            fillOpacity="0.15"
          />
          <line
            x1={from}
            y1={y}
            x2={to}
            y2={y}
            stroke="#00BCD4"
            strokeWidth="0.4"
            strokeOpacity="0.6"
          />
        </g>
      ))}

      <path
        d="M0,25 L0,22 L15,21 L30,20 L50,21.5 L70,22 L85,23 L100,24 L100,25 Z"
        fill="#42A5F5"
        fillOpacity="0.15"
      />
      <path
        d="M0,22 L15,21 L30,20 L50,21.5 L70,22 L85,23 L100,24"
        fill="none"
        stroke="#42A5F5"
        strokeWidth="0.5"
        strokeOpacity="0.8"
      />

      <polyline
        points={readings.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke="#22C55E"
        strokeWidth="0.4"
        strokeOpacity="0.6"
      />
      {readings.map(([x, y]) => (
        <circle
          key={x}
          cx={x}
          cy={y}
          r="1"
          fill={y <= 5 ? "#EF4444" : y <= 8 ? "#F59E0B" : "#22C55E"}
        />
      ))}
    </svg>
  );
}

export function WatchFaceScreen({ state }: { state: WatchState }) {
  return (
    <div className="flex size-full flex-col items-center justify-center px-3 py-2">
      <div className="flex items-baseline gap-1">
        <span className="text-[28px] leading-none font-bold text-white tabular-nums">
          {state.bg}
        </span>
        <span className="text-base text-white">{state.trend}</span>
      </div>
      <span className="text-[8px] tracking-wider text-zinc-400 uppercase">
        BG
      </span>

      <span className="mt-1 text-[9px] text-zinc-400">IoB: {state.iob} u</span>

      <div className="relative mt-1.5 h-[28px] w-[85%] overflow-hidden rounded">
        <WatchGraph rising={state.phase === "rising"} />
      </div>

      <span className="mt-1 text-[22px] leading-none font-bold text-white tabular-nums">
        {state.time}
      </span>

      <div className="mt-1 flex items-center gap-4">
        <div className="flex flex-col items-center">
          <Bell className="size-2.5 text-amber-400" />
          <span className="text-[6px] text-zinc-400">Alerts</span>
        </div>
        <span className="text-[7px] font-medium text-emerald-600">Lumose</span>
        <div className="flex flex-col items-center">
          <MessageSquare className="size-2.5 text-blue-400" />
          <span className="text-[6px] text-zinc-400">AI Chat</span>
        </div>
      </div>
    </div>
  );
}

/** The watch face. Like the phone's, it's what shows without the demo's script. */
export function WatchPlaceholder() {
  return (
    <WatchFrame>
      <WatchFaceScreen state={WATCH_SETTLED} />
    </WatchFrame>
  );
}

const BROWSER_NAV = [
  { label: "Dashboard", icon: House },
  { label: "Daily Briefs", icon: Clock, active: true },
  { label: "AI Chat", icon: MessagesSquare },
  { label: "Knowledge Base", icon: BookOpen },
  { label: "Meals", icon: Utensils },
  { label: "Settings", icon: Settings },
];

// The real app's sidebar. Beside phone and watch the frame is narrow, so it keeps
// to icons until the frame itself has room for labels.
function BrowserSidebar() {
  return (
    <div className="hidden w-11 flex-none flex-col gap-0.5 border-r border-[#2C333C] bg-lm-app-sidebar px-1.5 py-2.5 tablet:flex @min-[480px]:w-[124px]">
      <div className="mb-1 flex items-center justify-center gap-1.5 border-b border-[#2C333C] px-1 pb-2.5 @min-[480px]:justify-start">
        <LogoIcon width={15} height={14} />
        <span className="hidden text-[11px] tracking-[0.06em] @min-[480px]:inline">
          Lumose
        </span>
      </div>
      {BROWSER_NAV.map(({ label, icon: Icon, active }) => (
        <div
          key={label}
          className={`flex items-center justify-center gap-1.5 rounded px-1.5 py-[5px] text-[10px] @min-[480px]:justify-start ${
            active
              ? "bg-lm-app-sidebar-active text-lm-app-text shadow-[inset_2px_0_0_var(--color-lm-app-primary)]"
              : "text-lm-app-text-muted"
          }`}
        >
          <Icon size={12} className="flex-none" />
          <span className="hidden truncate @min-[480px]:inline">{label}</span>
        </div>
      ))}
    </div>
  );
}

// Made-up data that agrees with itself: 220 of 288 readings in range is 76.4%,
// and with no lows the other 68 are highs. A brief sees 24 hours of totals, so
// its text has no times of day and nothing about other days. The labels are
// spelled as the app prints them.
const BRIEF_DATA = [
  ["Timeinrangepct", "76.4"],
  ["Averageglucose", "148.2"],
  ["Lowcount", "0"],
  ["Highcount", "68"],
  ["Readingscount", "288"],
  ["Correctioncount", "3"],
  ["Totalinsulin", "41.6"],
];

const MONO_LABEL =
  "font-lm-mono text-[9px] font-bold tracking-[0.04em] text-lm-app-text-muted uppercase";

/**
 * The app's AI Insights page with one daily brief open, in six sections that
 * `reveal` can style one at a time. Left out, every section shows. A hidden
 * section keeps its space, so the build never changes the frame's height.
 */
export function InsightsPage({
  reveal = () => "",
}: {
  reveal?: (section: number) => string;
}) {
  const { provider } = useProviderSelection();

  return (
    <div className="@container">
      <div className="flex">
        <BrowserSidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-2.5 px-3.5 py-3 tablet:px-4">
          <div className={reveal(0)}>
            <div className="flex items-center gap-2.5">
              <Lightbulb size={22} className="flex-none text-lm-app-primary" />
              <div>
                <div className="font-lm-display text-[16px] leading-tight">
                  AI Insights
                </div>
                <div className="text-[10px] text-lm-app-text-muted">
                  AI-powered analysis of your glucose patterns
                </div>
              </div>
            </div>
            <div className="mt-2.5 inline-flex gap-0.5 rounded-[3px] border border-[#343A42] p-0.5 text-[10px]">
              <span className="rounded-[2px] bg-lm-blue-fill px-2 py-[3px] text-white">
                All Insights <span className="font-lm-mono">(12)</span>
              </span>
              <span className="px-2 py-[3px]">
                Daily Briefs <span className="font-lm-mono">(12)</span>
              </span>
            </div>
          </div>

          <div
            className={`flex flex-col gap-2 rounded border border-lm-line-accent bg-[#232930] p-3 ${reveal(1)}`}
          >
            <div className="flex gap-2">
              <span className="flex size-5 flex-none items-center justify-center rounded-[3px] bg-[#1C2836]">
                <Lightbulb size={12} className="text-lm-blue-light" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-lm-mono text-[9px] font-bold">
                  <span className="text-lm-blue-light">DAILY BRIEF</span>
                  <span className="rounded-[3px] bg-[#1C3352] px-1.5 text-lm-blue-light">
                    New
                  </span>
                </div>
                <div className="mt-0.5 text-[11px]">
                  Daily Brief — Oct 28, 2026
                </div>
                <div className="font-lm-mono text-[9px] font-bold text-lm-app-text-muted">
                  Oct 28, 8:00 AM
                </div>
              </div>
            </div>

            <div
              className={`rounded-[2px] border border-lm-caution-line bg-lm-app-disclaimer-box px-2 py-1 font-lm-mono text-[9px] font-bold text-lm-caution ${reveal(2)}`}
            >
              Not medical advice. Always consult your healthcare provider.
            </div>

            <p
              className={`text-[10.5px]/[1.5] text-[#E3E8EE] ${reveal(3)}`}
            >
              Over the last 24 hours, 76% of your 288 readings were in range,
              with an average of 148 mg/dL. None were low and 68 were high.
              Control-IQ made 3 automatic corrections.
            </p>

            <div
              className={`flex flex-col gap-1.5 border-t border-[#343A42] pt-2 ${reveal(4)}`}
            >
              <div className={MONO_LABEL}>Analysis period</div>
              <div className="-mt-1 text-[10px]">Oct 27 – Oct 28</div>
              <div className={MONO_LABEL}>Data used for analysis</div>
              <div className="-mt-0.5 grid grid-cols-2 gap-x-3.5 gap-y-0.5 font-lm-mono text-[9px] font-bold">
                {BRIEF_DATA.map(([key, value]) => (
                  <div key={key} className="flex min-w-0 justify-between gap-1">
                    <span className="truncate">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`flex flex-col gap-1 ${reveal(5)}`}>
              <div className={MONO_LABEL}>AI model</div>
              <div className="flex items-center gap-1.5 font-lm-mono text-[9px] font-bold">
                <MessagesSquare
                  size={10}
                  className="flex-none text-lm-app-text-muted"
                />
                <span className="truncate">{provider.model}</span>
              </div>
              <div className={`mt-1 ${MONO_LABEL}`}>Safety validation</div>
              <div className="flex items-center gap-1 font-lm-mono text-[9px] font-bold text-lm-glucose-in-range">
                <Check size={10} strokeWidth={3} />
                approved
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The finished brief, for the static HTML, reduced motion and a failed chunk. */
export function BrowserPlaceholder() {
  return <InsightsPage />;
}
