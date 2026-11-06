"use client";

import { useCallback, useRef } from "react";
import type { TouchEvent } from "react";
import { Bluetooth, Cloud, Link } from "lucide-react";
import { flags } from "@/data/flags";
import { integrations } from "@/data/integrations";
import type { Connection, Integration } from "@/data/integrations";
import { useLoopRegion } from "@/lib/v2/use-loop-region";

const PIXELS_PER_SECOND = 28;

const CONNECTION_ICONS: Record<Connection, typeof Cloud> = {
  Cloud,
  "Bluetooth + cloud": Bluetooth,
  Bridge: Link,
  "Via Nightscout": Link,
};

function MarqueeItem({ item }: { item: Integration }) {
  const Icon = CONNECTION_ICONS[item.connection];

  return (
    <li className="lm-marquee-item flex flex-none flex-col items-center gap-2.5 px-[34px]">
      <div className="lm-marquee-head flex items-center gap-2.5">
        {flags.logosCleared ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export, and the name sits next to it
          <img
            src={item.logo}
            alt=""
            width={30}
            height={30}
            loading="lazy"
            decoding="async"
            className="lm-marquee-logo size-[30px] flex-none rounded-lg object-cover"
          />
        ) : (
          <span className="lm-marquee-logo flex size-[30px] flex-none items-center justify-center rounded-lg bg-lm-raised font-lm-mono text-[15px] leading-none font-medium text-lm-ink-secondary">
            {item.initial}
          </span>
        )}
        <span className="lm-marquee-name font-lm-display text-[21px]/[1.2] font-semibold tracking-[-0.02em] whitespace-nowrap">
          {item.name}
        </span>
      </div>
      <span className="inline-flex items-center gap-[5px] font-lm-mono text-[10px] tracking-[0.08em] whitespace-nowrap text-lm-blue-light uppercase">
        <Icon size={11} aria-hidden="true" />
        {item.connection}
      </span>
    </li>
  );
}

function holdWhileTouched(event: TouchEvent<HTMLDivElement>) {
  event.currentTarget.toggleAttribute(
    "data-lm-held",
    event.targetTouches.length > 0,
  );
}

/**
 * A CSS loop of two identical sets. Moving the track by half its width lands
 * exactly on the join, whatever the width turns out to be, so only the duration
 * has to be measured.
 */
export function Marquee({ className = "" }: { className?: string }) {
  const row = useRef<HTMLDivElement | null>(null);

  const { ref: regionRef, ...region } = useLoopRegion({
    // Clipped images count as offscreen, so lazy loading would leave each one
    // to arrive after it had already moved into view.
    onRunningChange: (running) => {
      if (!running) return;
      row.current?.querySelectorAll("img").forEach((image) => {
        image.loading = "eager";
      });
    },
  });

  const attach = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return;
      row.current = element;
      element.setAttribute("data-lm-hydrated", "");

      // Waits for fonts so the first width is the final one. The observer then
      // catches reduced motion turning off, when the wrapped set gets wider.
      const observer = new ResizeObserver(([{ contentRect }]) => {
        const seconds = contentRect.width / PIXELS_PER_SECOND;
        element.style.setProperty("--lm-marquee-duration", `${seconds}s`);
      });
      let attached = true;
      void document.fonts.ready.then(() => {
        const set = element.querySelector("ul");
        if (attached && set) observer.observe(set);
      });

      const detach = regionRef(element);
      return () => {
        attached = false;
        observer.disconnect();
        detach?.();
      };
    },
    [regionRef],
  );

  return (
    <div
      {...region}
      ref={attach}
      onTouchStart={holdWhileTouched}
      onTouchEnd={holdWhileTouched}
      onTouchCancel={holdWhileTouched}
      className={`lm-marquee border-y border-lm-line-subtle py-[30px] ${className}`}
    >
      <div className="lm-marquee-track flex w-max">
        <ul className="lm-marquee-set flex flex-none items-start">
          {integrations.map((item) => (
            <MarqueeItem key={item.name} item={item} />
          ))}
        </ul>
        <ul
          aria-hidden="true"
          className="lm-marquee-set lm-marquee-copy flex flex-none items-start"
        >
          {integrations.map((item) => (
            <MarqueeItem key={item.name} item={item} />
          ))}
        </ul>
      </div>
    </div>
  );
}
