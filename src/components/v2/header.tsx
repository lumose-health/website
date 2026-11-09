import { Heart, Star } from "lucide-react";
import { GitHubIcon } from "@/components/icons";
import { routes } from "@/lib/v2/routes";
import { ButtonLink, EXTERNAL_LINK, FOCUS_RING, NAV_LINK } from "./button";
import { starCount } from "./contributors";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export const GITHUB_URL = "https://github.com/lumose-health/lumose";
export const SPONSOR_URL = "https://opencollective.com/lumose";

// Plain anchors throughout, not next/link. Link would prefetch pages that
// aren't built yet, and a native fragment jump moves the keyboard start point
// to the target. The home prefix keeps these working from content pages.
const NAV = [
  { label: "Features", href: `${routes.home}#features` },
  { label: "Live demo", href: `${routes.home}#demo` },
  { label: "Devices", href: `${routes.home}#connect-logos` },
  { label: "Docs", href: routes.docs },
  { label: "Community", href: `${routes.home}#contributors` },
] as const;

const BAR_LINK = `items-center rounded-lm-button-sm min-h-lm-touch px-3 text-sm text-lm-ink transition-colors duration-(--lm-dur-instant) hover:bg-lm-raised ${FOCUS_RING}`;
const MENU_LINK = `${NAV_LINK} w-full text-[15px]`;

function SponsorLink({ className }: { className: string }) {
  return (
    <a
      href={SPONSOR_URL}
      {...EXTERNAL_LINK}
      className={`gap-2 font-medium ${className}`}
    >
      <Heart
        size={15}
        fill="currentColor"
        aria-hidden="true"
        className="text-lm-heart"
      />
      Sponsor
    </a>
  );
}

type StarLinkProps = {
  stars?: number;
  label?: string;
  className: string;
};

function StarLink({ stars, label, className }: StarLinkProps) {
  const count = stars ? stars.toLocaleString("en-US") : null;

  return (
    <a
      href={GITHUB_URL}
      {...EXTERNAL_LINK}
      aria-label={
        count
          ? `Star Lumose on GitHub, ${count} stars`
          : "Star Lumose on GitHub"
      }
      className={`gap-2 ${className}`}
    >
      <GitHubIcon aria-hidden="true" className="size-4" />
      {label}
      {count && (
        <>
          <Star
            size={16}
            fill="currentColor"
            strokeWidth={0}
            aria-hidden="true"
            className="text-lm-star"
          />
          <span className="text-[15px] font-bold text-white tabular-nums">
            {count}
          </span>
        </>
      )}
    </a>
  );
}

export function Header({ stars = starCount }: { stars?: number }) {
  return (
    <header className="border-b border-lm-line-subtle bg-lm-hero">
      <div className="mx-auto flex max-w-lm-content flex-wrap items-center gap-x-1.5 px-lm-gutter py-3.5 tablet:gap-x-2.5">
        <a
          href={routes.home}
          aria-label="Lumose home"
          className={`inline-flex min-h-lm-touch items-center rounded-lm-sm text-lm-ink ${FOCUS_RING}`}
        >
          <Logo size="header" />
        </a>

        <nav
          aria-label="Main"
          className="ml-auto hidden items-center gap-1 desktop:flex"
        >
          {NAV.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`${NAV_LINK} px-3 text-[15px]`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <SponsorLink className={`hidden tablet:inline-flex ${BAR_LINK}`} />
          <StarLink
            stars={stars}
            className={`hidden tablet:inline-flex ${BAR_LINK}`}
          />
          <ButtonLink variant="header" href={`${routes.home}#start`}>
            Get started
          </ButtonLink>
        </div>

        <MobileMenu links={NAV}>
          <SponsorLink className={MENU_LINK} />
          <StarLink stars={stars} label="GitHub" className={MENU_LINK} />
        </MobileMenu>
      </div>
    </header>
  );
}
