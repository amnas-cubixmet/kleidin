"use client";

import { useEffect } from "react";

export function HomeShoppingMotion() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("[data-shop-reveal]");
    if (!('IntersectionObserver' in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.animate([
          { opacity: .45, transform: "translateY(18px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 650, easing: "cubic-bezier(.22,1,.36,1)" });
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return null;
}
