type BrowserFrameProps = {
  url: string;
  /** One sentence for screen readers. It must say "illustration". */
  label: string;
  /**
   * Hides the contents from assistive tech. Leave it on unless the frame holds a
   * real control, in which case the caller hides everything around that control.
   */
  hideContent?: boolean;
  children: React.ReactNode;
};

// One image to assistive tech. The image is an empty overlay, because nothing
// inside role="img" can be reached, so a real control can sit beside it while the
// rest stays hidden and the label is the only thing read out. The disclaimer bar
// lives here so a frame can't be built without it.
export function BrowserFrame({
  url,
  label,
  hideContent = true,
  children,
}: BrowserFrameProps) {
  return (
    <div className="relative overflow-hidden rounded-lm-card border border-lm-line-frame bg-lm-frame shadow-[0_40px_120px_rgba(0,0,0,0.65),0_0_0_1px_rgba(69,211,255,0.06)]">
      <div
        role="img"
        aria-label={label}
        className="pointer-events-none absolute inset-0"
      />
      <div>
        <div
          aria-hidden="true"
          className="flex items-center gap-3.5 border-b border-lm-line-pill bg-lm-frame-bar px-3.5 py-2.5"
        >
          <div className="flex flex-none gap-1.5">
            <span className="size-[11px] rounded-full bg-[#3A434F]" />
            <span className="size-[11px] rounded-full bg-[#3A434F]" />
            <span className="size-[11px] rounded-full bg-[#3A434F]" />
          </div>
          <div className="mx-auto max-w-[420px] min-w-0 flex-1 truncate rounded-lm-sm bg-[#0F1318] px-3 py-1 text-center font-lm-mono text-[12px] text-lm-ink-faint">
            {url}
          </div>
          {/* Balances the dots, which keeps the address centered. */}
          <div className="hidden w-[45px] flex-none tablet:block" />
        </div>

        <div className="bg-lm-app-page text-left text-lm-app-text">
          <div
            aria-hidden="true"
            className="bg-lm-app-disclaimer-bar p-[5px] text-center font-lm-mono text-[12px] font-bold tablet:text-[10px]"
          >
            Not medical advice
          </div>
          <div aria-hidden={hideContent ? "true" : undefined}>{children}</div>
        </div>
      </div>
    </div>
  );
}

type AppCardProps = {
  title: string;
  className?: string;
  children: React.ReactNode;
};

/** A panel from the real app, with its lighter title strip. */
export function AppCard({ title, className = "", children }: AppCardProps) {
  return (
    <div className={`overflow-hidden rounded-md bg-lm-app-panel ${className}`}>
      <div className="bg-lm-app-panel-header px-4 py-3 font-lm-display text-[17px] font-medium">
        {title}
      </div>
      {children}
    </div>
  );
}
