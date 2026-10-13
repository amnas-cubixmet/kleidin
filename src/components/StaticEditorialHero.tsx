"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { HomepageHeroCampaign } from "@/types/homepage-hero";
import styles from "./StaticEditorialHero.module.css";

type Props = {
  campaign: HomepageHeroCampaign;
  campaignIndex: number;
  campaignCount: number;
  onSelectCampaign: (index: number) => void;
  onSwipeCampaign: (step: number) => void;
};

export function StaticEditorialHero({
  campaign,
  campaignIndex,
  campaignCount,
  onSelectCampaign,
  onSwipeCampaign,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);

  const cards = useMemo(
    () => (campaign.cardImages ?? []).filter((url) => Boolean(url.trim())).slice(0, 4),
    [campaign.cardImages],
  );

  useEffect(() => {
    if (cards.length < 2 || paused) return;
    const interval = window.setInterval(() => {
      if (!document.hidden) {
        setFront((previous) => (previous + 1) % cards.length);
      }
    }, 3800);
    return () => window.clearInterval(interval);
  }, [cards.length, paused]);

  useEffect(() => {
    if (!sectionRef.current || !artRef.current) return;
    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    media.add("(min-width: 768px)", () => {
      const tween = gsap.to(artRef.current, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });
      return () => tween.kill();
    });
    return () => media.revert();
  }, []);

  const buttonHref = /^(\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(campaign.buttonHref)
    ? campaign.buttonHref
    : "/#all-products";
  const isExternal = /^https?:\/\//i.test(buttonHref);

  return (
    <section
      ref={sectionRef}
      className={styles.staticHero}
      aria-label="KLEID.IN editorial hero"
      onTouchStart={(event) => {
        touchStartRef.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartRef.current;
        const end = event.changedTouches[0]?.clientX;
        touchStartRef.current = null;
        if (start !== null && end !== undefined && Math.abs(end - start) > 75 && campaignCount > 1) {
          onSwipeCampaign(end < start ? 1 : -1);
        }
      }}
    >
      <div className={styles.texture} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          {campaign.eyebrow ? <p className={styles.eyebrow}>{campaign.eyebrow}</p> : null}
          <h1 className={styles.headline}>{campaign.title}</h1>
          {campaign.subtitle ? <p className={styles.description}>{campaign.subtitle}</p> : null}
          <div className={styles.actions}>
            {campaign.buttonLabel ? (
              isExternal ? (
                <a href={buttonHref} className={styles.cta} target="_blank" rel="noopener noreferrer">
                  {campaign.buttonLabel} <span aria-hidden="true">↗</span>
                </a>
              ) : (
                <Link href={buttonHref} className={styles.cta}>
                  {campaign.buttonLabel} <span aria-hidden="true">↗</span>
                </Link>
              )
            ) : null}
            <span className={styles.sideNote}>MADE FOR EVERYDAY</span>
          </div>
        </div>
        <div
          ref={artRef}
          className={styles.art}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          aria-label="Rotating collection imagery"
        >
          <div className={styles.artEntrance}>
            <div className={styles.circle} aria-hidden="true" />
            <div className={styles.deck} aria-live="off">
              {cards.map((image, index) => {
                const depth = (index - front + cards.length) % cards.length;
                return (
                  <div
                    key={image + index}
                    className={styles.deckCard}
                    data-depth={depth}
                    style={{ zIndex: cards.length - depth }}
                    aria-hidden={depth !== 0}
                  >
                    <div className={styles.cardFrame}>
                      <Image
                        src={image}
                        alt={depth === 0 ? "KLEID.IN editorial look " + (index + 1) : ""}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 72vw, 32vw"
                        className={styles.cardImage}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.cardCount}>
              <span>{String(front + 1).padStart(2, "0")}</span>
              <span className={styles.counterLine} />
              <span>{String(cards.length).padStart(2, "0")}</span>
            </div>
          </div>
          {cards.length > 1 ? (
            <div className={styles.cardControls} aria-label="Editorial cards">
              {cards.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFront(index)}
                  className={index === front ? styles.activeDot : styles.dot}
                  aria-label={"Show editorial image " + (index + 1)}
                  aria-pressed={index === front}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className={styles.bottom}>
        <span>EXPLORE THE COLLECTION</span>
        <span className={styles.scrollCue}>SCROLL TO DISCOVER <span aria-hidden="true">↓</span></span>
        {campaignCount > 1 ? (
          <div className={styles.campaignDots} aria-label="Hero campaigns">
            {Array.from({ length: campaignCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onSelectCampaign(index)}
                className={index === campaignIndex ? styles.activeCampaignDot : styles.campaignDot}
                aria-label={"Show hero campaign " + (index + 1)}
                aria-pressed={index === campaignIndex}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
