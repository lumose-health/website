import { QuietPill } from "@/components/v2/quiet-pill";

export default function V2Home() {
  return (
    <main className="mx-auto max-w-lm-content px-lm-gutter py-[72px] tablet:py-[96px] desktop:py-[112px]">
      <h1 className="font-lm-display text-lm-hero-title">Lumose</h1>
      <p className="mt-6 text-lm-lead text-lm-ink-muted">
        A preview of the new site.
      </p>
      <ul className="mt-8 flex flex-wrap gap-3">
        <li>
          <QuietPill status="supported" />
        </li>
        <li>
          <QuietPill status="beta" />
        </li>
        <li>
          <QuietPill status="untested" />
        </li>
        <li>
          <QuietPill status="not-working" />
        </li>
        <li>
          <QuietPill status="in-development" />
        </li>
        <li>
          <QuietPill status="in-development" scope="alerts" />
        </li>
      </ul>
    </main>
  );
}
