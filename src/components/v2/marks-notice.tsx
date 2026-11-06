import type { ReactNode } from "react";

type MarksNoticeProps = {
  className?: string;
  subject?: string;
  children?: ReactNode;
};

/** Required next to every display of third-party names or logos. */
export function MarksNotice({
  className = "",
  subject = "Product names and logos",
  children,
}: MarksNoticeProps) {
  return (
    <p className={`text-xs text-lm-ink-faint ${className}`}>
      {subject} belong to their owners. Lumose is not affiliated with or
      endorsed by them.
      {children ? " " : null}
      {children}
    </p>
  );
}
