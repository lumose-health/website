"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { FOCUS_RING } from "./button";

export type CodeTab = {
  id: string;
  label: string;
  /** Shell commands, shown with a "$ " prompt that is never copied. */
  lines: string[];
  /** Muted lines that run after the commands, such as a reminder comment. */
  comment?: { before: number; text: string };
  /** One short line under the code. */
  note?: ReactNode;
};

type CopyState = "idle" | "copied" | "manual";

const COPIED_MS = 2000;

const noSubscribe = () => () => {};

/** False in the static HTML, then true once this page's JS is running. */
function useHydrated() {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
}

/** What Copy puts on the clipboard: the commands without their prompts. */
export function copyText(tab: CodeTab) {
  const lines = [...tab.lines];
  if (tab.comment) lines.splice(tab.comment.before, 0, tab.comment.text);
  return lines.join("\n");
}

// The prompt is CSS generated content, so neither Copy nor a manual selection
// can pick it up.
const PROMPT = "before:text-lm-ink-faint before:content-['$_']";

function CodeLines({ tab }: { tab: CodeTab }) {
  const rows: ReactNode[] = tab.lines.map((line) => (
    <span key={line} className={`block ${PROMPT}`}>
      {line}
    </span>
  ));
  if (tab.comment) {
    rows.splice(
      tab.comment.before,
      0,
      <span key="comment" className="block text-lm-ink-faint">
        {tab.comment.text}
      </span>,
    );
  }
  return rows;
}

const PRE = `m-0 overflow-x-auto px-5 py-[22px] font-lm-mono text-[14px]/[1.85] whitespace-pre text-[#DCE3EA] ${FOCUS_RING} focus-visible:-outline-offset-2`;
const NOTE = "border-t border-lm-line px-5 py-3 text-sm text-lm-ink-muted";

const TAB = `inline-flex min-h-lm-touch cursor-pointer items-center rounded-lm-sm px-3 text-[13px] transition-colors duration-(--lm-dur-fast) motion-reduce:transition-none ${FOCUS_RING}`;
// Forced colors would otherwise drop the fill, and with it the selected state.
const TAB_SELECTED =
  "bg-lm-raised text-lm-ink forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:forced-color-adjust-none";
const TAB_IDLE = "text-lm-ink-muted hover:text-lm-ink";

export function CodePanel({ tabs, label }: { tabs: CodeTab[]; label: string }) {
  const hydrated = useHydrated();
  const baseId = useId();
  const [active, setActive] = useState(0);
  const [copy, setCopy] = useState<CopyState>("idle");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const preRefs = useRef<(HTMLPreElement | null)[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function show(next: CopyState) {
    window.clearTimeout(timer.current);
    setCopy(next);
    if (next === "copied") {
      timer.current = window.setTimeout(() => setCopy("idle"), COPIED_MS);
    }
  }

  function select(index: number) {
    window.clearTimeout(timer.current);
    setCopy("idle");
    setActive(index);
  }

  function moveWithArrows(event: KeyboardEvent, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
      return;
    }
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;

    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  }

  /** Selects the visible commands so the visitor can copy them by hand. */
  function selectCode() {
    const pre = preRefs.current[active];
    const selection = window.getSelection();
    if (!pre || !selection) return;
    const range = document.createRange();
    range.selectNodeContents(pre);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  async function copyActive() {
    try {
      // Missing outside secure contexts, and rejected when permission is denied.
      await navigator.clipboard.writeText(copyText(tabs[active]));
      show("copied");
    } catch {
      selectCode();
      show("manual");
    }
  }

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;

  return (
    <div className="min-w-0 overflow-hidden rounded-lm-card border border-lm-line bg-lm-code">
      {hydrated ? (
        <div className="flex items-center justify-between gap-2 border-b border-lm-line py-1 pr-1 pl-1 tablet:pl-2">
          <div role="tablist" aria-label={label} className="flex gap-1">
            {tabs.map((tab, index) => {
              const selected = index === active;
              return (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={tabId(index)}
                  aria-selected={selected}
                  aria-controls={panelId(index)}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(index)}
                  onKeyDown={(event) => moveWithArrows(event, index)}
                  className={`${TAB} ${selected ? TAB_SELECTED : TAB_IDLE}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={copyActive}
            aria-label={`Copy the ${tabs[active].label} commands`}
            className={`inline-flex min-h-lm-touch flex-none cursor-pointer items-center rounded-lm-sm border border-lm-line-strong px-3 text-[13px] text-lm-ink-secondary transition-colors duration-(--lm-dur-instant) hover:border-lm-ink-faint hover:text-lm-ink motion-reduce:transition-none ${FOCUS_RING}`}
          >
            {/* Both labels share one cell, so the button keeps its width. */}
            <span className="inline-grid">
              <span
                className={`[grid-area:1/1] ${copy === "copied" ? "invisible" : ""}`}
              >
                Copy
              </span>
              <span
                className={`[grid-area:1/1] ${copy === "copied" ? "" : "invisible"}`}
              >
                Copied
              </span>
            </span>
          </button>
        </div>
      ) : null}

      {/* Without JS every tab is shown, one under the other, each with its name. */}
      <div
        className={
          hydrated ? "grid grid-cols-[minmax(0,1fr)]" : "flex flex-col"
        }
      >
        {tabs.map((tab, index) => {
          const selected = index === active;
          return (
            <div
              key={tab.id}
              id={panelId(index)}
              role={hydrated ? "tabpanel" : undefined}
              aria-labelledby={hydrated ? tabId(index) : undefined}
              className={
                hydrated
                  ? `min-w-0 [grid-area:1/1] transition-[opacity,visibility] duration-(--lm-dur-fast) motion-reduce:transition-none ${selected ? "" : "invisible opacity-0"}`
                  : `min-w-0 ${index > 0 ? "border-t border-lm-line" : ""}`
              }
            >
              {hydrated ? null : (
                <p className="border-b border-lm-line px-5 py-3 text-[13px] font-medium text-lm-ink">
                  {tab.label}
                </p>
              )}
              <pre
                ref={(element) => {
                  preRefs.current[index] = element;
                }}
                tabIndex={0}
                role="region"
                aria-label={`${tab.label} commands`}
                className={PRE}
              >
                <code>
                  <CodeLines tab={tab} />
                </code>
              </pre>
              {tab.note ? <p className={NOTE}>{tab.note}</p> : null}
            </div>
          );
        })}
      </div>

      {/* Present from hydration on, so the first message is announced. */}
      {hydrated ? (
        <p role="status" className={copy === "manual" ? NOTE : "sr-only"}>
          {copy === "copied"
            ? "Copied"
            : copy === "manual"
              ? "Press Ctrl+C"
              : ""}
        </p>
      ) : null}
    </div>
  );
}
