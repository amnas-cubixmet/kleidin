"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

type Pending = { image: HTMLImageElement; href: string; timer: number; cleanup: () => void };

/** A fixed image travels between routes, including browsers without View Transitions. */
export function ProductImageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const pending = useRef<Pending | null>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element)?.closest<HTMLAnchorElement>("a[data-product-transition]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, location.href);
      if (url.origin !== location.origin || !url.pathname.startsWith("/products/") || url.pathname === pathname) return;
      const source = link.querySelector<HTMLImageElement>("img") || link.closest("article")?.querySelector<HTMLImageElement>("img");
      if (!source?.complete || !source.naturalWidth || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const rect = source.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      event.preventDefault();
      event.stopPropagation();
      pending.current?.cleanup();
      const image = document.createElement("img");
      image.src = source.currentSrc || source.src;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");
      const style = getComputedStyle(source);
      Object.assign(image.style, {
        position: "fixed", left: `${rect.left}px`, top: `${rect.top}px`,
        width: `${rect.width}px`, height: `${rect.height}px`, margin: "0",
        objectFit: style.objectFit, objectPosition: style.objectPosition,
        background: "#fafafa", zIndex: "10000", pointerEvents: "none",
        borderRadius: style.borderRadius, willChange: "transform", maxWidth: "none",
      });
      document.body.append(image);
      const cleanup = () => {
        image.remove();
        if (pending.current?.image === image) {
          window.clearTimeout(pending.current.timer);
          pending.current = null;
        }
      };
      pending.current = { image, href: url.pathname, cleanup, timer: window.setTimeout(cleanup, 4500) };
      router.push(url.pathname + url.search, { scroll: true });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router, pathname]);

  useEffect(() => {
    const transition = pending.current;
    if (!transition) return;
    if (transition.href !== pathname) { transition.cleanup(); return; }
    const active: Pending = transition;
    let frame = 0;
    let stopped = false;
    let animation: Animation | undefined;
    const observer = new MutationObserver(tryAnimate);
    const startRect = active.image.getBoundingClientRect();
    function tryAnimate() {
      if (stopped) return;
      const target = document.querySelector<HTMLImageElement>("[data-product-image-target] img");
      if (!target) return;
      const end = target.getBoundingClientRect();
      if (!end.width || !end.height) return;
      stopped = true;
      observer.disconnect();
      // Let route scroll restoration and layout finish before reading the destination.
      frame = window.requestAnimationFrame(() => {
        frame = window.requestAnimationFrame(() => {
          const rect = target.getBoundingClientRect();
          animation = active.image.animate([
            { transform: "translate(0, 0) scale(1, 1)", opacity: 1 },
            { transform: `translate(${rect.left - startRect.left}px, ${rect.top - startRect.top}px) scale(${rect.width / startRect.width}, ${rect.height / startRect.height})`, opacity: 1 },
          ], { duration: 580, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" });
          active.image.style.transformOrigin = "top left";
          animation.finished.then(() => {
            const finish = () => {
              if (pending.current !== active) return;
              const fade = active.image.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: "forwards" });
              fade.finished.then(active.cleanup).catch(active.cleanup);
            };
            if (target.complete && target.naturalWidth) finish();
            else {
              target.addEventListener("load", finish, { once: true });
              target.addEventListener("error", active.cleanup, { once: true });
            }
          }).catch(active.cleanup);
        });
      });
    }
    observer.observe(document.body, { childList: true, subtree: true });
    tryAnimate();
    return () => { stopped = true; observer.disconnect(); window.cancelAnimationFrame(frame); animation?.cancel(); };
  }, [pathname]);

  useEffect(() => () => pending.current?.cleanup(), []);
  return null;
}
