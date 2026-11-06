import type { ComponentProps } from "react";

export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lm-blue-light";

/** Text links in the header, menu and footer. Always 44px high. */
export const NAV_LINK = `inline-flex min-h-lm-touch items-center rounded-lm-sm text-lm-ink-secondary transition-colors duration-(--lm-dur-instant) hover:text-lm-ink ${FOCUS_RING}`;

export const EXTERNAL_LINK = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

const BASE = `inline-flex cursor-pointer items-center justify-center whitespace-nowrap transition-colors duration-(--lm-dur-instant) active:translate-y-px motion-reduce:active:translate-y-0 ${FOCUS_RING}`;

const VARIANTS = {
  primary:
    "min-h-lm-touch rounded-lm-button bg-lm-blue-fill px-5 font-semibold text-white hover:bg-lm-blue-fill-hover",
  header:
    "min-h-lm-touch rounded-lm-button-sm bg-lm-blue-fill px-3 text-sm font-semibold text-white tablet:px-4 hover:bg-lm-blue-fill-hover",
  "hero-light":
    "min-h-[50px] rounded-lm-button bg-lm-ink px-6 font-semibold text-lm-page hover:bg-lm-ink-secondary",
  ghost:
    "min-h-[50px] rounded-lm-button border border-lm-line-strong px-6 font-medium text-lm-ink hover:border-lm-ink-faint",
  icon: "size-lm-touch rounded-lm-button-sm text-lm-ink hover:bg-lm-raised",
};

export function buttonClass(variant: keyof typeof VARIANTS) {
  return `${BASE} ${VARIANTS[variant]}`;
}

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: keyof typeof VARIANTS;
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  return <a className={`${buttonClass(variant)} ${className}`} {...props} />;
}
