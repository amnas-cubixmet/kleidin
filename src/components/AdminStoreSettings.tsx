"use client";

import { useEffect, useState } from "react";
import type { StoreSettings } from "@/types/commerce";

function label(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

export function AdminStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [principlesText, setPrinciplesText] = useState("[]");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/settings", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load settings.");
        setSettings(data.settings);
        setPrinciplesText(JSON.stringify(data.settings.aboutPrinciples || [], null, 2));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load settings.");
      }
    })();
  }, []);

  function update(key: keyof StoreSettings, value: unknown) {
    setSettings((current) => {
      if (!current) return current;
      return { ...current, [key]: value } as StoreSettings;
    });
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    setMessage("");

    try {
      let principles = settings.aboutPrinciples;
      try {
        const parsed = JSON.parse(principlesText);
        if (Array.isArray(parsed)) principles = parsed;
      } catch {
        throw new Error("About principles JSON is invalid.");
      }

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...settings, aboutPrinciples: principles }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save settings.");
      setSettings(data.settings);
      setPrinciplesText(JSON.stringify(data.settings.aboutPrinciples || [], null, 2));
      setMessage("Store settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return <p className="text-sm text-black/50">Loading settings… {message}</p>;
  }

  const entries = Object.entries(settings).filter(
    ([key]) => key !== "aboutPrinciples",
  ) as Array<[keyof StoreSettings, StoreSettings[keyof StoreSettings]]>;

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">STOREFRONT</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">Settings</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-black/50">
        Homepage, About, contact and social content can be changed here without editing source code.
      </p>

      <section className="mt-6 grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5 md:grid-cols-2">
        {entries.map(([key, value]) => {
          if (Array.isArray(value)) {
            return (
              <label key={String(key)} className="block md:col-span-2">
                <span className="text-[11px] font-semibold">{label(String(key))}</span>
                <input
                  value={value.join(", ")}
                  onChange={(event) =>
                    update(
                      key,
                      event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                />
              </label>
            );
          }

          const stringValue = String(value ?? "");
          const long =
            stringValue.length > 70 ||
            /body|lead|title|tagline/i.test(String(key));

          return (
            <label key={String(key)} className={long ? "block md:col-span-2" : "block"}>
              <span className="text-[11px] font-semibold">{label(String(key))}</span>
              {long ? (
                <textarea
                  value={stringValue}
                  onChange={(event) => update(key, event.target.value)}
                  className="mt-1 min-h-20 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                />
              ) : (
                <input
                  value={stringValue}
                  onChange={(event) => update(key, event.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                />
              )}
            </label>
          );
        })}

        <label className="block md:col-span-2">
          <span className="text-[11px] font-semibold">About principles (JSON)</span>
          <textarea
            value={principlesText}
            onChange={(event) => setPrinciplesText(event.target.value)}
            className="mt-1 min-h-52 w-full rounded-xl border border-black/10 px-3 py-2.5 font-mono text-xs"
          />
        </label>

        <div className="md:col-span-2">
          {message ? <p className="mb-3 text-xs font-medium text-black/55">{message}</p> : null}
          <button onClick={() => void save()} disabled={saving} className="rounded-xl bg-[#001cac] px-5 py-3 text-xs font-bold text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </section>
    </div>
  );
}
