import type { ReactNode } from "react";

type CardProps = { className?: string; children: ReactNode };

export function Card({ className = "", children }: CardProps) {
  return (
    <div
      className={`rounded-lm-card-lg border border-lm-line bg-lm-card p-[26px] ${className}`}
    >
      {children}
    </div>
  );
}
