"use client";

export function AdminViewportStyle() {
  return (
    <style jsx global>{`
      html,
      body {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      .admin-scroll-hidden::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }

      .admin-scroll-hidden {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
    `}</style>
  );
}
