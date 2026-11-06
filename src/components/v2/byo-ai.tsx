"use client";

import { useRef, useSyncExternalStore } from "react";
import type { KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { flags } from "@/data/flags";
import { PROVIDER_NOTICE_SUBJECT, PROVIDERS } from "@/data/providers";
import { FOCUS_RING } from "./button";
import { ChatMockup } from "./chat-mockup";
import { MarksNotice } from "./marks-notice";
import { useProviderSelection } from "./provider-context";

const BULLETS = [
  "Use a subscription you already pay for",
  "Run fully local with Ollama",
  "Or any OpenAI-compatible endpoint",
];

const CAPTION_PREFIX = "Illustrative example. Answering with:";

// Tighter from 1020px to 1179px, so all four still fit on one row beside the
// text. The range has an upper limit because desktop: sorts after min-[1180px]:.
const BUTTON = `inline-flex min-h-lm-touch min-w-0 items-center gap-2 rounded-lm-button border px-3 text-left text-sm transition-colors duration-(--lm-dur-fast) enabled:cursor-pointer motion-reduce:transition-none desktop:max-[1179px]:gap-1.5 desktop:max-[1179px]:px-2.5 min-[1180px]:px-4 ${FOCUS_RING}`;
// Forced colors would otherwise remove the fill, and with it the pressed state.
const PRESSED =
  "border-[#3E7BC4] bg-[#13253B] text-lm-ink forced-colors:border-[Highlight] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:forced-color-adjust-none";
const IDLE =
  "border-lm-line-pill text-lm-ink-muted enabled:hover:border-lm-ink-faint enabled:hover:text-lm-ink";
// Until JS runs nothing can be chosen, so the buttons read as a plain list of
// names. This covers JS being off and bundles that never load. Padding stays, so
// nothing moves at hydration.
const PLAIN = "border-transparent text-lm-ink-secondary";

const noSubscribe = () => () => {};

/** False in the static HTML, then true once this page's JS is running. */
function useHydrated() {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
}

function ProviderButtons() {
  const { provider, setProvider } = useProviderSelection();
  const hydrated = useHydrated();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  function moveWithArrows(event: KeyboardEvent, index: number) {
    // Alt+Left is the browser's Back shortcut.
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (step === 0) return;

    event.preventDefault();
    const next = (index + step + PROVIDERS.length) % PROVIDERS.length;
    setProvider(PROVIDERS[next]);
    buttons.current[next]?.focus();
  }

  return (
    <div
      role="group"
      aria-label="AI provider"
      className="mb-[18px] grid grid-cols-2 gap-2 tablet:flex tablet:flex-wrap"
    >
      {PROVIDERS.map((item, index) => {
        const pressed = item.id === provider.id;
        return (
          <button
            key={item.id}
            ref={(element) => {
              buttons.current[index] = element;
            }}
            type="button"
            aria-pressed={pressed}
            disabled={!hydrated}
            onClick={() => setProvider(item)}
            onKeyDown={(event) => moveWithArrows(event, index)}
            className={`${BUTTON} ${!hydrated ? PLAIN : pressed ? PRESSED : IDLE}`}
          >
            {flags.logosCleared ? (
              // eslint-disable-next-line @next/next/no-img-element -- static export, and the name sits next to it
              <img
                src={item.logo}
                alt=""
                width={16}
                height={16}
                loading="lazy"
                decoding="async"
                className={`size-4 flex-none transition-opacity duration-(--lm-dur-fast) motion-reduce:transition-none ${hydrated && !pressed ? "opacity-70" : ""}`}
              />
            ) : null}
            {item.name}
          </button>
        );
      })}
    </div>
  );
}

function ProviderCaption() {
  const { provider } = useProviderSelection();

  // Every value stays in place, stacked, so swapping is a true crossfade and the
  // line never changes height. Screen readers get the one line below instead,
  // and only the part that changes is announced.
  return (
    <>
      <p className="sr-only">
        {`${CAPTION_PREFIX} `}
        <span aria-live="polite">{`${provider.name} · ${provider.where}`}</span>
      </p>
      <p
        aria-hidden="true"
        className="mt-2.5 font-lm-mono text-[12px]/[1.5] text-lm-ink-faint tablet:text-[11px]/[1.5]"
      >
        {`${CAPTION_PREFIX} `}
        <span className="inline-grid max-w-full align-top">
          {PROVIDERS.map((item) => (
            <span
              key={item.id}
              className={`[grid-area:1/1] transition-opacity duration-(--lm-dur-fast) motion-reduce:transition-none ${item.id === provider.id ? "" : "opacity-0"}`}
            >
              {`${item.name} · ${item.where}`}
            </span>
          ))}
        </span>
      </p>
    </>
  );
}

export function ByoAi() {
  return (
    <section id="features" className="border-t border-lm-line-subtle">
      <div className="mx-auto grid max-w-lm-content grid-cols-1 items-center gap-12 px-lm-gutter py-[72px] tablet:py-[96px] desktop:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] desktop:gap-16 desktop:py-[120px]">
        <Reveal>
          <h2 className="mb-5 font-lm-display text-lm-h2">
            <span className="block">Any model.</span>
            <span className="block">Your data stays put.</span>
          </h2>
          <p className="mb-7 text-lm-lead text-lm-ink-muted">
            Point Lumose at Claude, OpenAI, GitHub Copilot, or a local model
            through Ollama. Lumose doesn&apos;t host or resell AI, so your
            history only goes where you send it.
          </p>
          {/* The role keeps list semantics in Safari, which drops them when list markers are removed. */}
          <ul role="list" className="flex flex-col gap-3">
            {BULLETS.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-[#DCE3EA]">
                <Check
                  size={18}
                  strokeWidth={2.5}
                  aria-hidden="true"
                  className="mt-[3px] flex-none text-lm-blue-light"
                />
                {bullet}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal
          delay={100}
          className="w-full max-w-[640px] min-w-0 desktop:max-w-none"
        >
          <div className="rounded-lm-card-lg border border-lm-line bg-lm-panel p-4 tablet:p-5">
            <ProviderButtons />
            <ChatMockup />
            <ProviderCaption />
            {flags.showProviderNotice ? (
              <MarksNotice subject={PROVIDER_NOTICE_SUBJECT} className="mt-1.5" />
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
