"use client";

import { useEffect, useState } from "react";
import { AdminDrawer } from "@/components/AdminDrawer";
import type { StoreSettings } from "@/types/commerce";

function label(key: string) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

const controlClass =
  "mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#001cac] focus:ring-2 focus:ring-[#001cac]/10";

export function AdminStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [principlesText, setPrinciplesText] = useState("[]");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function loadSettings() {
    const response = await fetch("/api/admin/settings", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Could not load settings.");
    }

    setSettings(data.settings);
    setPrinciplesText(
      JSON.stringify(data.settings.aboutPrinciples || [], null, 2),
    );
  }

  useEffect(() => {
    void loadSettings().catch((error) =>
      setMessage(
        error instanceof Error ? error.message : "Could not load settings.",
      ),
    );
  }, []);

  function update(key: keyof StoreSettings, value: unknown) {
    setSettings((current) => {
      if (!current) return current;
      return { ...current, [key]: value } as StoreSettings;
    });
  }

  async function closeDrawer() {
    if (saving) return;
    setDrawerOpen(false);
    setMessage("");

    try {
      await loadSettings();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not reload settings.",
      );
    }
  }

  async function save() {
    if (!settings) return;
    setSaving(true);
    setMessage("");

    try {
      let principles = settings.aboutPrinciples;

      try {
        const parsed = JSON.parse(principlesText);
        if (!Array.isArray(parsed)) {
          throw new Error();
        }
        principles = parsed;
      } catch {
        throw new Error("About principles JSON is invalid.");
      }

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...settings,
          aboutPrinciples: principles,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not save settings.");
      }

      setSettings(data.settings);
      setPrinciplesText(
        JSON.stringify(data.settings.aboutPrinciples || [], null, 2),
      );
      setDrawerOpen(false);
      setMessage("Store settings saved.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <p className="text-sm text-black/50">
        Loading settings… {message}
      </p>
    );
  }

  const entries = Object.entries(settings).filter(
    ([key]) =>
      key !== "aboutPrinciples" && !key.startsWith("homeDefaultHero"),
  ) as Array<[keyof StoreSettings, StoreSettings[keyof StoreSettings]]>;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">
            STOREFRONT
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-.04em]">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-black/45">
            Storefront content stays read-only here until you open the editor.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setMessage("");
            setDrawerOpen(true);
          }}
          className="min-h-11 w-full rounded-xl bg-[#001cac] px-5 text-xs font-bold !text-white sm:w-auto"
        >
          Edit settings
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Fields", entries.length + 1],
          ["Dealer tags", settings.homeDealerTags.length],
          ["Principles", settings.aboutPrinciples.length],
          ["Support", settings.supportEmail ? "Ready" : "Missing"],
        ].map(([name, value]) => (
          <article
            key={String(name)}
            className="rounded-2xl bg-white p-4 ring-1 ring-black/5"
          >
            <p className="text-[9px] font-bold uppercase tracking-[.1em] text-black/40">
              {name}
            </p>
            <strong className="mt-2 block text-xl tracking-[-.03em]">
              {value}
            </strong>
          </article>
        ))}
      </div>

      <section className="mt-4 grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5 md:grid-cols-2">
        <div className="rounded-xl bg-black/[.025] p-4">
          <p className="text-[9px] font-bold uppercase tracking-[.1em] text-black/40">
            Support email
          </p>
          <p className="mt-2 break-all text-sm font-semibold">
            {settings.supportEmail || "Not configured"}
          </p>
        </div>
        <div className="rounded-xl bg-black/[.025] p-4">
          <p className="text-[9px] font-bold uppercase tracking-[.1em] text-black/40">
            WhatsApp
          </p>
          <p className="mt-2 break-all text-sm font-semibold">
            {settings.whatsappNumber || "Not configured"}
          </p>
        </div>
        <div className="rounded-xl bg-black/[.025] p-4 md:col-span-2">
          <p className="text-[9px] font-bold uppercase tracking-[.1em] text-black/40">
            Homepage catalog
          </p>
          <p className="mt-2 text-sm font-semibold">
            {settings.homeCatalogTitle || "No title"}
          </p>
          <p className="mt-1 text-xs text-black/45">
            {settings.homeCatalogEyebrow}
          </p>
        </div>
      </section>

      {message ? (
        <p className="mt-4 rounded-xl bg-white px-4 py-3 text-xs font-medium text-black/60 ring-1 ring-black/5">
          {message}
        </p>
      ) : null}

      <AdminDrawer
        open={drawerOpen}
        title="Edit storefront settings"
        description="Homepage, About, contact and social content. Changes are applied only after Save."
        onClose={() => void closeDrawer()}
        footer={
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <button
              type="button"
              onClick={() => void closeDrawer()}
              disabled={saving}
              className="min-h-11 rounded-xl border border-black/10 px-5 text-xs font-bold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving}
              className="min-h-11 rounded-xl bg-[#001cac] px-5 text-xs font-bold !text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
          </div>
        }
      >
        <div className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5 md:grid-cols-2">
          {entries.map(([key, value]) => {
            if (Array.isArray(value)) {
              return (
                <label key={String(key)} className="block md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-[.08em] text-black/50">
                    {label(String(key))}
                  </span>
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
                    className={controlClass}
                  />
                </label>
              );
            }

            const stringValue = String(value ?? "");
            const long =
              stringValue.length > 70 ||
              /body|lead|title|tagline/i.test(String(key));

            return (
              <label
                key={String(key)}
                className={long ? "block md:col-span-2" : "block"}
              >
                <span className="text-[10px] font-bold uppercase tracking-[.08em] text-black/50">
                  {label(String(key))}
                </span>
                {long ? (
                  <textarea
                    value={stringValue}
                    onChange={(event) => update(key, event.target.value)}
                    className={controlClass + " min-h-24 resize-y"}
                  />
                ) : (
                  <input
                    value={stringValue}
                    onChange={(event) => update(key, event.target.value)}
                    className={controlClass}
                  />
                )}
              </label>
            );
          })}

          <label className="block md:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-[.08em] text-black/50">
              About principles (JSON)
            </span>
            <textarea
              value={principlesText}
              onChange={(event) => setPrinciplesText(event.target.value)}
              className={controlClass + " min-h-52 resize-y font-mono text-xs"}
            />
          </label>

          {message ? (
            <p className="md:col-span-2 rounded-xl bg-black/[.025] px-3 py-2 text-xs font-medium text-black/55">
              {message}
            </p>
          ) : null}
        </div>
      </AdminDrawer>
    </div>
  );
}
