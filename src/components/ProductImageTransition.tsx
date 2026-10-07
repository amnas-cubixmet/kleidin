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
        !source.naturalWidth ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const sourceRect = source.getBoundingClientRect();
      if (!sourceRect.width || !sourceRect.height) return;

      event.preventDefault();
      event.stopPropagation();
      pending.current?.cleanup();

      document.documentElement.dataset.productTransitionActive = "true";

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

      const sourceStyle = getComputedStyle(source);
      Object.assign(image.style, {
        position: "fixed",
        left: `${sourceRect.left}px`,
        top: `${sourceRect.top}px`,
        width: `${sourceRect.width}px`,
        height: `${sourceRect.height}px`,
        margin: "0",
        objectFit: sourceStyle.objectFit,
        objectPosition: sourceStyle.objectPosition,
        background: "#f1f1ef",
        zIndex: "10000",
        pointerEvents: "none",
        borderRadius: sourceStyle.borderRadius,
        transformOrigin: "center center",
        willChange: "left, top, width, height, transform, opacity",
        maxWidth: "none",
      });

      document.body.append(backdrop, image);

      const cleanup = () => {
        image.remove();
        backdrop.remove();
        delete document.documentElement.dataset.productTransitionActive;

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
        timer: window.setTimeout(cleanup, 4500),
      };

      pending.current = active;

      backdrop.animate([{ opacity: 0 }, { opacity: 0.96 }], {
        duration: 300,
        easing: "cubic-bezier(.4,0,.2,1)",
        fill: "forwards",
      });

      const shrink = image.animate(
        [
          {
            transform: "translate3d(0, 0, 0) scale(1)",
            opacity: 1,
          },
          {
            transform: "translate3d(0, 26px, 0) scale(.78)",
            opacity: 1,
          },
        ],
        {
          duration: 320,
          easing: "cubic-bezier(.22,.61,.36,1)",
          fill: "forwards",
        },
      );

      shrink.finished
        .catch(() => undefined)
        .then(() => {
          if (pending.current !== active) return;

          const shrunkRect = image.getBoundingClientRect();
          Object.assign(image.style, {
            left: `${shrunkRect.left}px`,
            top: `${shrunkRect.top}px`,
            width: `${shrunkRect.width}px`,
            height: `${shrunkRect.height}px`,
            transform: "none",
          });

          shrink.cancel();
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

    const active = transition;
    let frame = 0;
    let stopped = false;
    let growAnimation: Animation | undefined;
    let target: HTMLImageElement | null = null;
    let noTargetTimer = 0;

    const observer = new MutationObserver(tryAnimate);

    function tryAnimate() {
      if (stopped) return;

      target = document.querySelector<HTMLImageElement>(
        "[data-product-image-target] img",
      );

      if (!target) return;

      const firstRect = target.getBoundingClientRect();
      if (!firstRect.width || !firstRect.height) return;

      stopped = true;
      observer.disconnect();
      window.clearTimeout(noTargetTimer);

      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(() => {
          if (!target || pending.current !== active) {
            active.cleanup();
            return;
          }

          const rect = target.getBoundingClientRect();
          const targetStyle = getComputedStyle(target);
          const image = active.image;

          const startScale = window.innerWidth < 768 ? 0.64 : 0.58;
          const startWidth = Math.max(rect.width * startScale, 1);
          const startHeight = Math.max(rect.height * startScale, 1);
          const startLeft = rect.left + (rect.width - startWidth) / 2;
          const riseDistance = Math.min(
            Math.max(window.innerHeight * 0.12, 64),
            112,
          );
          const startTop =
            rect.top + (rect.height - startHeight) / 2 + riseDistance;

          Object.assign(image.style, {
            left: `${startLeft}px`,
            top: `${startTop}px`,
            width: `${startWidth}px`,
            height: `${startHeight}px`,
            objectFit: targetStyle.objectFit,
            objectPosition: targetStyle.objectPosition,
            borderRadius: targetStyle.borderRadius,
            opacity: "1",
            transform: "none",
            filter: "blur(0)",
          });

          active.backdrop.animate([{ opacity: 0.96 }, { opacity: 0 }], {
            duration: 900,
            easing: "cubic-bezier(.16,1,.3,1)",
            fill: "forwards",
          });

          growAnimation = image.animate(
            [
              {
                left: `${startLeft}px`,
                top: `${startTop}px`,
                width: `${startWidth}px`,
                height: `${startHeight}px`,
                opacity: 0.88,
                transform: "translate3d(0, 0, 0)",
              },
              {
                left: `${rect.left}px`,
                top: `${rect.top + 8}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: 1,
                transform: "translate3d(0, 0, 0)",
                offset: 0.88,
              },
              {
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                opacity: 1,
                transform: "translate3d(0, 0, 0)",
              },
            ],
            {
              duration: 1050,
              easing: "cubic-bezier(.16,1,.3,1)",
              fill: "forwards",
            },
          );

          growAnimation.finished
            .then(() => {
              if (!target || pending.current !== active) return;

              const reveal = () => {
                if (!target || pending.current !== active) return;

                delete document.documentElement.dataset.productTransitionActive;

                window.requestAnimationFrame(() => {
                  active.image.remove();
                  active.backdrop.remove();

                  if (pending.current === active) {
                    window.clearTimeout(active.timer);
                    pending.current = null;
                  }
                });
              };

              if (target.complete && target.naturalWidth) {
                reveal();
              } else {
                target.addEventListener("load", reveal, { once: true });
                target.addEventListener("error", active.cleanup, { once: true });
              }
            })
            .catch(active.cleanup);
        });
      });
    }

    observer.observe(document.body, { childList: true, subtree: true });
    tryAnimate();

    noTargetTimer = window.setTimeout(() => {
      if (!stopped) active.cleanup();
    }, 1400);

    return () => {
      observer.disconnect();
      window.clearTimeout(noTargetTimer);
      window.cancelAnimationFrame(frame);
      growAnimation?.cancel();
    };
  }, [pathname]);

  useEffect(() => () => pending.current?.cleanup(), []);

  return (
    <style jsx global>{`
      html[data-product-transition-active="true"]
        [data-product-image-target]
        img {
        opacity: 0 !important;
      }
    `}</style>
  );
}
