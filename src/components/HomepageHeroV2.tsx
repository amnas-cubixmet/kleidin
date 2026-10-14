"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { HomepageHeroCampaign } from "@/types/homepage-hero";
import { StaticEditorialHero } from "@/components/StaticEditorialHero";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getTimeLeft(value?: string | null): TimeLeft {
  if (!value) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const remaining = Math.max(0, new Date(value).getTime() - Date.now());
  const total = Math.floor(remaining / 1000);

  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function isCampaignLive(
  campaign: HomepageHeroCampaign,
  now: number,
) {
  if (!campaign.enabled) return false;

  const starts = campaign.startsAt
    ? new Date(campaign.startsAt).getTime()
    : null;
  const ends = campaign.endsAt
    ? new Date(campaign.endsAt).getTime()
    : null;

  if (starts !== null && Number.isFinite(starts) && now < starts) return false;
  if (ends !== null && Number.isFinite(ends) && now >= ends) return false;

  return true;
}

function offerText(campaign: HomepageHeroCampaign) {
  const value = campaign.offerValue;

  if (campaign.offerType === "percentage") {
    return value + "% OFF";
  }

  if (campaign.offerType === "fixed") {
    return "₹" + value.toLocaleString("en-IN") + " OFF";
  }

  return "₹" + value.toLocaleString("en-IN");
}

export function HomepageHeroV2({
  campaigns,
}: {
  campaigns: HomepageHeroCampaign[];
}) {
  const touchX = useRef<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const liveCampaigns = useMemo(() => {
    const live = [...campaigns]
      .filter((campaign) => isCampaignLive(campaign, now));

    const imageCampaigns = live.filter(
      (campaign) =>
        campaign.id !== "fallback-hero" &&
        (campaign.mode === "image" || campaign.mode === "static"),
    );

    const activeOffer = live
      .filter(
        (campaign) =>
          campaign.id !== "fallback-hero" &&
          campaign.mode === "offer" &&
          campaign.offerValue > 0,
      )
      .sort((a, b) => {
        if (a.priority !== b.priority) return b.priority - a.priority;
        return (
          new Date(b.updatedAt || 0).getTime() -
          new Date(a.updatedAt || 0).getTime()
        );
      })[0];

    const managed = [
      ...imageCampaigns,
      ...(activeOffer ? [activeOffer] : []),
    ].sort((a, b) => a.priority - b.priority);

    if (managed.length) return managed;

    return live.filter(
      (campaign) => campaign.id === "fallback-hero",
    );
  }, [campaigns, now]);

  const current = liveCampaigns[index] ?? liveCampaigns[0];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (index >= liveCampaigns.length) setIndex(0);
  }, [index, liveCampaigns.length]);

  useEffect(() => {
    if (liveCampaigns.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((value) => (value + 1) % liveCampaigns.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, [liveCampaigns.length]);

  useEffect(() => {
    if (!current?.showCountdown || !current.endsAt) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const update = () => setTimeLeft(getTimeLeft(current.endsAt));
    update();

    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [current?.endsAt, current?.showCountdown]);

  if (!current) return null;

  if (current.mode === "static") {
    return (
      <StaticEditorialHero
        key={current.id}
        campaign={current}
        campaignIndex={index}
        campaignCount={liveCampaigns.length}
        onSelectCampaign={setIndex}
        onSwipeCampaign={(step) => setIndex((value) => (value + step + liveCampaigns.length) % liveCampaigns.length)}
      />
    );
  }

  const external =
    current.buttonHref.startsWith("http://") ||
    current.buttonHref.startsWith("https://") ||
    current.buttonHref.startsWith("mailto:");

  return (
    <section
      className="relative min-h-[calc(100svh-56px)] w-full overflow-hidden bg-[#111] text-white md:min-h-[100svh]"
      aria-label="Homepage hero"
      onTouchStart={(event) => {
        touchX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchX.current;
        const end = event.changedTouches[0]?.clientX;
        touchX.current = null;

        if (
          start !== null &&
          end !== undefined &&
          Math.abs(end - start) > 55 &&
          liveCampaigns.length > 1
        ) {
          setIndex(
            (value) =>
              (value + (end < start ? 1 : -1) + liveCampaigns.length) %
              liveCampaigns.length,
          );
        }
      }}
    >
      {liveCampaigns.map((campaign, campaignIndex) => (
        <div
          key={campaign.id}
          aria-hidden={campaignIndex !== index}
          className={
            "absolute inset-0 transition-[opacity,transform] duration-700 ease-out " +
            (campaignIndex === index
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-[1.025] opacity-0")
          }
        >
          {campaign.imageUrl ? (
            <Image
              src={campaign.imageUrl}
              alt=""
              fill
              preload={campaignIndex === 0}
              sizes="100vw"
              className={
                "object-cover " +
                (campaign.imagePosition === "left"
                  ? "object-left"
                  : campaign.imagePosition === "right"
                    ? "object-right"
                    : "object-center")
              }
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#111_0%,#0d1c77_100%)]" />
          )}
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.72)_0%,rgba(0,0,0,.38)_48%,rgba(0,0,0,.12)_100%)] md:bg-[linear-gradient(90deg,rgba(0,0,0,.68)_0%,rgba(0,0,0,.30)_48%,rgba(0,0,0,.06)_100%)]" />

      <div className="relative z-10 flex min-h-[calc(100svh-56px)] items-end px-5 pb-14 pt-24 sm:px-8 md:min-h-[100svh] md:items-center md:px-12 md:pb-20 lg:px-20">
        <div
          key={current.id}
          className="w-full max-w-[650px] transition-all duration-700"
        >
          <div className="flex flex-wrap items-center gap-2">
            {current.eyebrow ? (
              <span className="text-[9px] font-bold uppercase tracking-[.16em] text-white/65">
                {current.eyebrow}
              </span>
            ) : null}

            {current.mode === "offer" ? (
              <span className="rounded-full bg-white px-3 py-1 text-[8px] font-black uppercase tracking-[.1em] text-[#111]">
                {current.offerBadge || offerText(current)}
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 max-w-[620px] whitespace-pre-line text-[clamp(42px,12vw,68px)] font-black leading-[.84] tracking-[-.065em] md:text-[clamp(58px,7vw,104px)]">
            {current.title}
          </h1>

          {current.subtitle ? (
            <p className="mt-5 max-w-[430px] text-[13px] leading-6 text-white/72 md:text-sm md:leading-7">
              {current.subtitle}
            </p>
          ) : null}

          {current.mode === "offer" ? (
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[.14em] text-white/80">
              {offerText(current)} STOREWIDE
            </p>
          ) : null}

          {current.showCountdown && current.endsAt ? (
            <div className="mt-5 flex gap-2">
              {[
                ["Days", timeLeft.days],
                ["Hrs", timeLeft.hours],
                ["Min", timeLeft.minutes],
                ["Sec", timeLeft.seconds],
              ].map(([label, value]) => (
                <div
                  key={String(label)}
                  className="min-w-[58px] rounded-lg border border-white/15 bg-black/20 px-3 py-2.5 backdrop-blur-sm"
                >
                  <strong className="block text-[18px] font-bold">
                    {pad(Number(value))}
                  </strong>
                  <span className="text-[6px] uppercase tracking-[.1em] text-white/55">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {current.buttonLabel ? (
            <div className="mt-7">
              {external ? (
                <a
                  href={current.buttonHref || "/#all-products"}
                  target={
                    current.buttonHref.startsWith("https://")
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    current.buttonHref.startsWith("https://")
                      ? "noreferrer"
                      : undefined
                  }
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-[9px] font-bold uppercase tracking-[.1em] !text-[#111] transition hover:scale-[1.02]"
                >
                  {current.buttonLabel}
                </a>
              ) : (
                <Link
                  href={current.buttonHref || "/#all-products"}
                  className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-[9px] font-bold uppercase tracking-[.1em] !text-[#111] transition hover:scale-[1.02]"
                >
                  {current.buttonLabel}
                </Link>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {liveCampaigns.length > 1 ? (
        <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 md:bottom-8 md:right-10">
          {liveCampaigns.map((campaign, campaignIndex) => (
            <button
              key={campaign.id}
              type="button"
              aria-label={"Show hero " + (campaignIndex + 1)}
              aria-pressed={campaignIndex === index}
              onClick={() => setIndex(campaignIndex)}
              className={
                "h-1.5 rounded-full transition-all " +
                (campaignIndex === index
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/40")
              }
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
