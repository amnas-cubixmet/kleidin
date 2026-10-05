"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

export function AdminDrawer({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-[#f7f7f8] shadow-2xl sm:max-w-[720px]"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-black/10 bg-white px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#001cac]">
              KLEID.IN ADMIN
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-[-.03em]">{title}</h2>
            {description ? (
              <p className="mt-1 max-w-[520px] text-xs leading-5 text-black/50">
                {description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white text-lg leading-none transition hover:bg-black/[.04]"
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          {children}
        </div>

        {footer ? (
          <footer className="sticky bottom-0 z-10 border-t border-black/10 bg-white px-4 py-4 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </section>
    </div>
  );
}
