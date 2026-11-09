import type { ComponentProps, ReactNode } from "react";
import { FOCUS_RING } from "./button";

const SURFACE = "rounded-lm-card-lg border border-lm-line bg-lm-card p-[26px]";

type CardProps = { className?: string; children: ReactNode };

/** A static card. Use LinkCard when the whole card goes somewhere. */
export function Card({ className = "", children }: CardProps) {
  return <div className={`${SURFACE} ${className}`}>{children}</div>;
}

type LinkCardProps = Omit<ComponentProps<"a">, "title" | "children"> & {
  title: string;
  /** The call to action at the foot of the card. An arrow follows it. */
  action: string;
  children: ReactNode;
};

/** A card that is one link from edge to edge. */
export function LinkCard({
  title,
  action,
  children,
  className = "",
  ...props
}: LinkCardProps) {
  return (
    <a
      className={`group/card flex h-full flex-col ${SURFACE} transition-colors duration-(--lm-dur-instant) hover:border-lm-line-strong ${FOCUS_RING} ${className}`}
      {...props}
    >
      <h3 className="mb-2 font-lm-display text-[22px]/[1.25] font-medium text-lm-ink">
        {title}
      </h3>
      <p className="mb-[18px] text-lm-ink-muted">{children}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 font-medium text-lm-blue-light">
        {action}
        <span
          aria-hidden="true"
          className="transition-transform duration-(--lm-dur-instant) group-hover/card:translate-x-[3px] motion-reduce:transition-none motion-reduce:group-hover/card:translate-x-0"
        >
          →
        </span>
      </span>
    </a>
  );
}
