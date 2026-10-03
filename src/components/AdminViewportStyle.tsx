"use client";

export function AdminViewportStyle() {
  return (
    <style jsx global>{`
      html,
      body,
      * {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }

      html::-webkit-scrollbar,
      body::-webkit-scrollbar,
      *::-webkit-scrollbar {
        display: none;
        width: 0;
        height: 0;
      }

      button,
      a {
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      button:focus-visible,
      a:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        outline: 2px solid #001cac;
        outline-offset: 2px;
      }
    `}</style>
  );
}
