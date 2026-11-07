import type { ReactNode } from "react";
import { AlertTriangle, Bell, MessageSquare, Send } from "lucide-react";
import { CHAT_MESSAGES, WATCH_SETTLED } from "@/lib/v2/demo-clock";
import type { ChatMessage, WatchState } from "@/lib/v2/demo-clock";

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
