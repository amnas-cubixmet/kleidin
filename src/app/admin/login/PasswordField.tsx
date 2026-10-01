"use client";

import { useState } from "react";

export default function PasswordField() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="grid gap-2">
      <span className="text-[8px] font-semibold uppercase tracking-[.12em] text-black/45">
        Password
      </span>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          required
          className="h-[52px] w-full border border-black/20 bg-white px-4 pr-12 text-[14px] text-[#111] outline-none transition focus:border-[#111] focus:ring-2 focus:ring-black/5"
          placeholder="Enter password"
        />

        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-black/45 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/20"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          title={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m3 3 18 18" />
              <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
              <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.3 0 8.8 4.8 9.7 6.2a3 3 0 0 1 0 3.6 16.8 16.8 0 0 1-2.5 2.8" />
              <path d="M6.6 6.7a17.4 17.4 0 0 0-4.3 5 3 3 0 0 0 0 3.6C3.2 16.7 6.7 21 12 21a10.8 10.8 0 0 0 4-.8" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-[18px] w-[18px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.3 10.2a3 3 0 0 0 0 3.6C3.2 15.2 6.7 20 12 20s8.8-4.8 9.7-6.2a3 3 0 0 0 0-3.6C20.8 8.8 17.3 4 12 4S3.2 8.8 2.3 10.2Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </label>
  );
}
