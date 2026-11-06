import { FOCUS_RING } from "./button";

export const CONTENT_ID = "content";

export function SkipLink() {
  return (
    <a
      href={`#${CONTENT_ID}`}
      className={`sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:inline-flex focus:min-h-lm-touch focus:items-center focus:rounded-lm-sm focus:bg-lm-raised focus:px-4 focus:text-sm focus:text-lm-ink ${FOCUS_RING}`}
    >
      Skip to content
    </a>
  );
}
