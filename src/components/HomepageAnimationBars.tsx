"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type {
  AnimationBarConfig,
  AnimationBarPlacement,
} from "@/types/animation-bar";

function isLive(bar: AnimationBarConfig, now: number) {
  if (!bar.enabled) return false;

  const starts = bar.startsAt ? new Date(bar.startsAt).getTime() : null;
  const ends = bar.endsAt ? new Date(bar.endsAt).getTime() : null;

  if (starts !== null && Number.isFinite(starts) && now < starts) return false;
  if (ends !== null && Number.isFinite(ends) && now > ends) return false;

  return true;
}

function themeClasses(theme: AnimationBarConfig["theme"]) {
  if (theme === "light") {
    return "bg-white text-[#111] border-y border-black/10";
  }

  if (theme === "blue") {
    return "bg-[#001cac] text-white";
  }

  return "bg-[#111] text-white";
}

function Item({
  text,
  href,
  hidden = false,
}: {
  text: string;
  href?: string;
  hidden?: boolean;
}) {
  const className =
    "inline-flex min-h-10 shrink-0 items-center whitespace-nowrap text-[10px] font-bold uppercase tracking-[.12em]";

  if (!href) {
    return <span className={className}>{text}</span>;
  }

  const external =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:");

  if (external) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noreferrer" : undefined}
        className={className}
        tabIndex={hidden ? -1 : undefined}
      >
        {text}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      tabIndex={hidden ? -1 : undefined}
    >
      {text}
    </Link>
  );
}

export function HomepageAnimationBars({
  bars,
  placement,
}: {
  bars: AnimationBarConfig[];
  placement: AnimationBarPlacement;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const liveBars = useMemo(
    () =>
      bars
        .filter((bar) => bar.placement === placement && isLive(bar, now))
        .sort((a, b) => a.order - b.order),
    [bars, now, placement],
  );

  if (!liveBars.length) return null;

  return (
    <div className="w-full">
      {liveBars.map((bar) => {
        const duration = Math.max(7, Math.round(72 / Math.max(1, bar.speed)));

        const style = {
          "--animation-bar-duration": duration + "s",
          "--animation-bar-gap": bar.gap + "px",
        } as CSSProperties;

        const renderSet = (hidden: boolean, copy: string) => (
          <div
            key={copy}
            className="animation-bar-set"
            style={{ gap: bar.gap }}
            aria-hidden={hidden || undefined}
          >
            {bar.items.map((item, index) => (
              <div
                key={copy + "-" + item.id}
                className="flex shrink-0 items-center"
                style={{ gap: bar.gap }}
              >
                <Item text={item.text} href={item.href} hidden={hidden} />
                {bar.separator ? (
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[9px] opacity-50"
                  >
                    {bar.separator}
                  </span>
                ) : null}
                {index === bar.items.length - 1 ? (
                  <span className="w-1 shrink-0" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        );

        return (
          <section
            key={bar.id}
            aria-label={bar.name}
            className={
              "animation-bar-shell overflow-hidden " +
              themeClasses(bar.theme) +
              (bar.pauseOnHover ? " animation-bar-pause-hover" : "")
            }
            style={style}
          >
            {bar.autoScroll ? (
              <div
                className={
                  "animation-bar-track " +
                  (bar.direction === "right"
                    ? "animation-bar-right"
                    : "animation-bar-left")
                }
              >
                {renderSet(false, "primary")}
                {renderSet(true, "duplicate")}
              </div>
            ) : (
              <div
                className={
                  "animation-bar-manual " +
                  (bar.allowManualScroll
                    ? "overflow-x-auto overscroll-x-contain"
                    : "overflow-hidden")
                }
              >
                <div
                  className="flex min-w-max items-center"
                  style={{ gap: bar.gap }}
                >
                  {bar.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex shrink-0 items-center"
                      style={{ gap: bar.gap }}
                    >
                      <Item text={item.text} href={item.href} />
                      {bar.separator && index < bar.items.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="shrink-0 text-[9px] opacity-50"
                        >
                          {bar.separator}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
