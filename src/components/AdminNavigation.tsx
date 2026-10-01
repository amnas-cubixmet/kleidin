"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NavItem = {
  id: string;
  label: string;
  shortLabel: string;
  icon: "overview" | "products" | "hero" | "reviews";
};

const navItems: NavItem[] = [
  { id: "overview", label: "Overview", shortLabel: "Home", icon: "overview" },
  { id: "products", label: "Products", shortLabel: "Products", icon: "products" },
  { id: "hero", label: "Hero", shortLabel: "Hero", icon: "hero" },
  { id: "reviews", label: "Reviews", shortLabel: "Reviews", icon: "reviews" },
];

function NavIcon({ type }: { type: NavItem["icon"] }) {
  if (type === "overview") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
      </svg>
    );
  }

  if (type === "products") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="m4 8 8-4 8 4-8 4-8-4Z" />
        <path d="m4 8 8 4 8-4v8l-8 4-8-4V8Z" />
        <path d="M12 12v8" />
      </svg>
    );
  }

  if (type === "hero") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="9" r="1.5" />
        <path d="m5 17 5-5 3 3 2-2 4 4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 18.5 4 20l.8-3.4A8 8 0 1 1 7 18.5Z" />
      <path d="M8.5 11.5h7M8.5 8.5h4" />
    </svg>
  );
}

export function AdminNavigation() {
  const [activeId, setActiveId] = useState("overview");

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) setActiveId(visible.target.id);
      },
      {
        rootMargin: "-15% 0px -68% 0px",
        threshold: [0.05, 0.15, 0.3],
      },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const goToSection = (id: string) => {
    setActiveId(id);
    const section = document.getElementById(id);
    if (!section) return;

    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "#" + id);
  };

  return (
    <>
      <aside className="sticky top-5 hidden h-[calc(100vh-40px)] w-[220px] shrink-0 flex-col rounded-[24px] border border-black/8 bg-white p-3 lg:flex">
        <div className="px-3 pb-5 pt-3">
          <strong className="block text-[18px] font-extrabold tracking-[-.055em]">
            KLEID.IN
          </strong>
          <span className="mt-1 block text-[7px] font-semibold uppercase tracking-[.16em] text-black/35">
            Admin panel
          </span>
        </div>

        <nav className="grid gap-1.5" aria-label="Admin navigation">
          {navItems.map((item) => {
            const active = activeId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => goToSection(item.id)}
                aria-current={active ? "page" : undefined}
                className={
                  "flex min-h-12 w-full items-center gap-3 rounded-[14px] px-3 text-left text-[10px] font-semibold transition " +
                  (active
                    ? "bg-[#001cac] text-white"
                    : "text-black/55 hover:bg-black/[.035] hover:text-black")
                }
              >
                <NavIcon type={item.icon} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-black/8 pt-3">
          <Link
            href="/"
            target="_blank"
            className="flex min-h-11 items-center justify-between rounded-[14px] px-3 text-[9px] font-semibold text-black/50 transition hover:bg-black/[.035] hover:text-black"
          >
            <span>View storefront</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </Link>
        </div>
      </aside>

      <nav
        className="fixed inset-x-3 bottom-3 z-[70] grid grid-cols-4 rounded-[20px] border border-black/10 bg-white/95 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,.12)] backdrop-blur-xl lg:hidden"
        aria-label="Admin mobile navigation"
      >
        {navItems.map((item) => {
          const active = activeId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goToSection(item.id)}
              aria-current={active ? "page" : undefined}
              className={
                "flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[14px] px-1 text-[8px] font-semibold transition " +
                (active ? "bg-[#001cac] text-white" : "text-black/45")
              }
            >
              <NavIcon type={item.icon} />
              <span>{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
