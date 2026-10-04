"use client";

import { useEffect, useState } from "react";
import type { Announcement } from "@/types/announcement";

export function AnnouncementBar({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndex(0);
    setVisible(true);
  }, [announcements]);

  useEffect(() => {
    if (!visible || announcements.length <= 1) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % announcements.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [announcements.length, visible]);

  const current = announcements[index] ?? announcements[0];
  if (!visible || !current) return null;

  const external =
    current.linkHref.startsWith("http://") ||
    current.linkHref.startsWith("https://");

  return (
    <div className="announcement">
      <div className="announcement-copy" key={current.id}>
        <span>{current.text}</span>

        {current.linkLabel && current.linkHref ? (
          <>
            <span className="announcement-dot">•</span>
            <a
              href={current.linkHref}
              target={external ? "_blank" : undefined}
              rel={external ? "noreferrer" : undefined}
            >
              {current.linkLabel}
            </a>
          </>
        ) : null}

        {announcements.length > 1 ? (
          <span className="ml-2 text-[8px] opacity-60">
            {index + 1}/{announcements.length}
          </span>
        ) : null}
      </div>

      <button
        type="button"
        className="announcement-close"
        aria-label="Close announcement"
        onClick={() => setVisible(false)}
      >
        ×
      </button>
    </div>
  );
}
