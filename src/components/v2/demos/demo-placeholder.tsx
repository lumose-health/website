import type { ReactNode } from "react";
import { AlertTriangle, MessageSquare, Send } from "lucide-react";
import { CHAT_MESSAGES } from "@/lib/v2/demo-clock";
import type { ChatMessage } from "@/lib/v2/demo-clock";

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
