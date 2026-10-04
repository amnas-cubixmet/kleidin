"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminDemoModeControl({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function toggle() {
    const next = !enabled;

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/admin/demo-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not update demo mode.");
      }

      setEnabled(Boolean(data.enabled));
      router.refresh();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "Could not update demo mode.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className={
        "mb-3 rounded-[18px] border p-4 sm:mb-4 sm:rounded-[20px] sm:p-5 " +
        (enabled
          ? "border-[#001cac]/20 bg-[#eef2ff]"
          : "border-[#dfe3ea] bg-white")
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#5f6874]">
              Project demo mode
            </p>
            <span
              className={
                "inline-flex min-h-[26px] items-center rounded-full px-3 text-[9px] font-bold " +
                (enabled
                  ? "bg-[#001cac] text-white"
                  : "bg-[#eceff3] text-[#5d6570]")
              }
            >
              {enabled ? "ON" : "OFF"}
            </span>
          </div>

          <h2 className="mt-2 text-[20px] font-semibold tracking-[-.035em]">
            {enabled
              ? "Demo data is active across the project."
              : "Only real production data is visible."}
          </h2>

          <p className="mt-1.5 max-w-[720px] text-[10px] leading-5 text-[#68717d]">
            ON shows records tagged as demo throughout admin and storefront.
            OFF hides demo records without deleting them.
          </p>

          {error ? (
            <p className="mt-2 text-[10px] font-semibold text-[#a33d3d]">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Link
            href="/admin/data-setup"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-[#cfd4da] bg-white px-5 text-[10px] font-bold text-[#111111]"
          >
            Demo data
          </Link>

          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={saving}
            onClick={() => void toggle()}
            className={
              "inline-flex min-h-[44px] min-w-[118px] items-center justify-center rounded-full px-5 text-[10px] font-bold transition disabled:opacity-50 " +
              (enabled
                ? "bg-[#111111] text-white"
                : "border border-[#111111] bg-white text-[#111111]")
            }
          >
            {saving ? "Saving…" : enabled ? "Turn demo OFF" : "Turn demo ON"}
          </button>
        </div>
      </div>
    </section>
  );
}
