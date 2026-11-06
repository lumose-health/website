import { X } from "lucide-react";

const QUIET = "border-lm-line-pill text-lm-ink-muted";
const DOT = "size-1.5 rounded-full";

// The one source of status labels and marks. Page copy passes a status, never text.
const STATUSES = {
  supported: {
    label: "Supported",
    tone: QUIET,
    mark: <span className={`${DOT} bg-lm-status-supported`} />,
  },
  beta: {
    label: "Beta",
    tone: QUIET,
    mark: <span className={`${DOT} bg-lm-caution`} />,
  },
  untested: {
    label: "Untested",
    tone: QUIET,
    mark: <span className={`${DOT} border-[1.5px] border-lm-ink-faint`} />,
  },
  "not-working": {
    label: "Not working",
    tone: "border-lm-line-strong text-lm-ink",
    mark: <X size={10} strokeWidth={2.5} className="text-lm-caution" />,
  },
  "in-development": {
    label: "In development",
    alertsLabel: "Alerts in development",
    tone: "border-lm-caution-line text-lm-caution",
    mark: <span className={`${DOT} bg-lm-caution`} />,
  },
};

export type QuietPillStatus = keyof typeof STATUSES;

type QuietPillProps =
  | { status: Exclude<QuietPillStatus, "in-development"> }
  | { status: "in-development"; scope?: "alerts" };

export function QuietPill(props: QuietPillProps) {
  const row = STATUSES[props.status];
  const label =
    props.status === "in-development" && props.scope === "alerts"
      ? STATUSES["in-development"].alertsLabel
      : row.label;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 align-middle rounded-full border px-2.5 py-[3px] font-lm-body text-xs whitespace-nowrap ${row.tone}`}
    >
      <span aria-hidden="true" className="contents">
        {row.mark}
      </span>
      {label}
    </span>
  );
}
