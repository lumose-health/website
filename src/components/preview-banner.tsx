import { SITE_HOST, SITE_URL } from "@/lib/site";

// Rendered only on preview builds. The NEXT_PUBLIC_BUILD_ENV env var is set
// to "preview" in ci.yml during PR builds and is unset/"production" everywhere
// else. The banner makes it visually obvious that a pr-*.glycemicgpt.pages.dev
// URL is not the official site, which protects against confusion or attempted
// reputation abuse via PR-preview URLs shared out of context.
export function PreviewBanner() {
  return (
    <div
      role="region"
      aria-label="Preview deployment notice"
      className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-700 dark:text-amber-300"
    >
      <strong className="font-semibold">Preview deployment</strong>
      <span className="mx-2">—</span>
      <span>
        You are viewing a pull request preview, not the official Lumose
        site. Production is at{" "}
        <a
          href={SITE_URL}
          className="underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100"
        >
          {SITE_HOST}
        </a>
        .
      </span>
    </div>
  );
}
