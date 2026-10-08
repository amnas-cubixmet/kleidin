"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type Pending = {
  image: HTMLImageElement;
  backdrop: HTMLDivElement;
  href: string;
  timer: number;
  cleanup: () => void;
};

/**
 * Product-card route transition:
 * click -> image dips/shrinks -> route changes -> image rises into the
 * product-detail image position.
 */
export function ProductImageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<Pending | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link = (event.target as Element)?.closest<HTMLAnchorElement>(
        "a[data-product-transition]",
      );

      if (!link || link.target === "_blank" || link.hasAttribute("download")) {
        return;
      }

      const url = new URL(link.href, location.href);
      if (
        url.origin !== location.origin ||
        !url.pathname.startsWith("/products/") ||
        url.pathname === pathname
      ) {
        return;
      }

      const source =
        link.querySelector<HTMLImageElement>("img") ||
        link.closest("article")?.querySelector<HTMLImageElement>("img");

      if (
        !source?.complete ||
        !source.naturalWidth
      ) {
        return;
      }

      const rect = source.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      event.preventDefault();
      event.stopPropagation();
      pending.current?.cleanup();

      const backdrop = document.createElement("div");
      backdrop.setAttribute("aria-hidden", "true");
      Object.assign(backdrop.style, {
        position: "fixed",
        inset: "0",
        background: "#fafafa",
        opacity: "0",
        zIndex: "9998",
        pointerEvents: "none",
        willChange: "opacity",
      });

      const image = document.createElement("img");
      image.src = source.currentSrc || source.src;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");

      const style = getComputedStyle(source);
      Object.assign(image.style, {
        position: "fixed",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        margin: "0",
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
        background: "#f1f1ef",
        zIndex: "10000",
        pointerEvents: "none",
        borderRadius: style.borderRadius,
        transformOrigin: "center center",
        willChange: "transform, opacity",
        maxWidth: "none",
      });

      document.body.append(backdrop, image);

      const cleanup = () => {
        image.remove();
        backdrop.remove();

        if (pending.current?.image === image) {
          window.clearTimeout(pending.current.timer);
          pending.current = null;
        }
      };

      const active: Pending = {
        image,
        backdrop,
        href: url.pathname,
        cleanup,
        timer: window.setTimeout(cleanup, 5000),
      };

      pending.current = active;

      backdrop.animate(
        [{ opacity: 0 }, { opacity: 0.94 }],
        {
          duration: 220,
          easing: "ease-out",
          fill: "forwards",
        },
      );

      const dip = image.animate(
        [
          {
            transform: "translate3d(0, 0, 0) scale(1)",
            opacity: 1,
          },
          {
            transform: "translate3d(0, 34px, 0) scale(.9)",
            opacity: 0.98,
          },
        ],
        {
          duration: 220,
          easing: "cubic-bezier(.4,0,.2,1)",
          fill: "forwards",
        },
      );

      dip.finished
        .catch(() => undefined)
        .then(() => {
          if (pending.current !== active) return;
          router.push(url.pathname + url.search, { scroll: true });
        });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, pathname]);

  useEffect(() => {
    const transition = pending.current;
    if (!transition) return;

    if (transition.href !== pathname) {
      transition.cleanup();
      return;
    }

    const active: Pending = transition;
    let frame = 0;
    let stopped = false;
    let riseAnimation: Animation | undefined;
    let target: HTMLImageElement | null = null;
    let previousTargetOpacity = "";

    const observer = new MutationObserver(tryAnimate);

    function tryAnimate() {
      if (stopped) return;

      target = document.querySelector<HTMLImageElement>(
        "[data-product-image-target] img",
      );
      if (!target) return;

      const targetRect = target.getBoundingClientRect();
      if (!targetRect.width || !targetRect.height) return;

      stopped = true;
      observer.disconnect();

      previousTargetOpacity = target.style.opacity;
      target.style.opacity = "0";

      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(() => {
          if (!target) {
            active.cleanup();
            return;
          }

          const rect = target.getBoundingClientRect();
          const image = active.image;

          const startWidth = Math.max(rect.width * 0.84, 1);
          const startHeight = Math.max(rect.height * 0.84, 1);
          const startLeft = rect.left + (rect.width - startWidth) / 2;
          const riseDistance = Math.min(
            Math.max(window.innerHeight * 0.16, 88),
            150,
          );
          const startTop = rect.top + riseDistance;

          Object.assign(image.style, {
            left: `${startLeft}px`,
            top: `${startTop}px`,
            width: `${startWidth}px`,
            height: `${startHeight}px`,
            transform: "translate3d(0, 0, 0) scale(1)",
            transformOrigin: "center center",
            opacity: "0",
          });

          active.backdrop.animate(
            [{ opacity: 0.94 }, { opacity: 0 }],
            {
              duration: 620,
              easing: "cubic-bezier(.16,1,.3,1)",
              fill: "forwards",
            },
          );

          riseAnimation = image.animate(
            [
              {
                left: `${startLeft}px`,
                top: `${startTop}px`,
                width: `${startWidth}px`,
                height: `${startHeight}px`,
                opacity: 0,
                filter: "blur(2px)",
              },
              {
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: 1,
                filter: "blur(0)",
                offset: 0.82,
              },
              {
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: 1,
                filter: "blur(0)",
              },
            ],
            {
              duration: 760,
              easing: "cubic-bezier(.16,1,.3,1)",
              fill: "forwards",
            },
          );

          riseAnimation.finished
            .then(() => {
              if (!target || pending.current !== active) return;

              const revealTarget = () => {
                if (!target || pending.current !== active) return;

                target.style.opacity = previousTargetOpacity || "1";

                const fade = active.image.animate(
                  [{ opacity: 1 }, { opacity: 0 }],
                  {
                    duration: 120,
                    easing: "ease-out",
                    fill: "forwards",
                  },
                );

                fade.finished
                  .then(active.cleanup)
                  .catch(active.cleanup);
              };

              if (target.complete && target.naturalWidth) {
                revealTarget();
              } else {
                target.addEventListener("load", revealTarget, { once: true });
                target.addEventListener("error", active.cleanup, { once: true });
              }
            })
            .catch(active.cleanup);
        });
      });
    }

    observer.observe(document.body, { childList: true, subtree: true });
    tryAnimate();

    return () => {
      stopped = true;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      riseAnimation?.cancel();

      if (target) {
        target.style.opacity = previousTargetOpacity;
      }
    };
  }, [pathname]);

  useEffect(() => () => pending.current?.cleanup(), []);

  return null;
}
