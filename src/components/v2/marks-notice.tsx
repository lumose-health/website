type MarksNoticeProps = { className?: string };

/** Required next to every display of third-party names or logos. */
export function MarksNotice({ className = "" }: MarksNoticeProps) {
  return (
    <p className={`text-xs text-lm-ink-faint ${className}`}>
      Product names and logos belong to their owners. Lumose is not affiliated
      with or endorsed by them.
    </p>
  );
}
