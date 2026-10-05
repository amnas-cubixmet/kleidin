"use client";

import { useEffect, useState } from "react";
import type { StoreSettings } from "@/types/commerce";

const emptySettings: StoreSettings = {
  whatsappNumber: "",
  instagramUrl: "",
  facebookUrl: "",
  supportEmail: "",
  footerTagline: "",
  homeBrandEyebrow: "",
  homeBrandTitle: "",
  homeDealersEyebrow: "",
  homeDealersTitle: "",
  homeDealersBody: "",
  aboutHeroEyebrow: "",
  aboutHeroTitle: "",
  aboutHeroLead: "",
  aboutHeroBody: "",
  aboutMissionEyebrow: "",
  aboutMissionTitle: "",
  aboutMissionBody: "",
  aboutPhilosophyEyebrow: "",
  aboutPhilosophyTitle: "",
  aboutPhilosophyBody: "",
  aboutPrinciples: [],
  aboutBuiltEyebrow: "",
  aboutBuiltTitle: "",
  aboutBuiltBody: "",
  aboutFutureEyebrow: "",
  aboutFutureTitle: "",
  aboutFutureBody: "",
};

export function AdminStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/admin/settings", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load settings.");
        return data.settings as StoreSettings;
      })
      .then((value) => {
        if (active) setSettings(value);
      })
      .catch((error) => {
        if (active) setMessage(error instanceof Error ? error.message : "Could not load settings.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function update<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  function updatePrinciple(index: number, field: "title" | "copy", value: string) {
    setSettings((current) => {
      const principles = [...current.aboutPrinciples];
      while (principles.length <= index) principles.push({ title: "", copy: "" });
      principles[index] = { ...principles[index], [field]: value };
      return { ...current, aboutPrinciples: principles };
    });
    setMessage("");
  }

  async function save() {
    try {
      setSaving(true);
      setMessage("");

      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save settings.");

      setSettings(data.settings as StoreSettings);
      setMessage("Storefront settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  const field =
    "h-12 w-full rounded-[12px] border border-[#d7dbe1] bg-white px-3.5 text-[12px] font-medium text-[#1d2025] outline-none transition placeholder:text-[#989fa8] focus:border-[#111111] focus:ring-2 focus:ring-black/10";
  const area =
    "min-h-[110px] w-full resize-y rounded-[12px] border border-[#d7dbe1] bg-white p-3.5 text-[12px] leading-5 outline-none focus:border-[#111111] focus:ring-2 focus:ring-black/10";
  const label =
    "mb-1.5 block text-[9px] font-bold uppercase tracking-[.09em] text-[#636b76]";
  const section =
    "rounded-[20px] border border-[#d9dde3] bg-white p-4 sm:p-5 md:p-6";

  if (loading) {
    return (
      <div className="grid min-h-[360px] place-items-center rounded-[20px] border border-[#d9dde3] bg-white text-[11px] font-semibold text-[#6c7480]">
        Loading storefront settings…
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className={section}>
        <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#001cac]">
          Contact & social
        </p>
        <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em]">
          Live storefront links
        </h2>
        <p className="mt-2 text-[10px] leading-5 text-[#68717d]">
          Change these here after deployment. No code edit is needed.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label>
            <span className={label}>WhatsApp number</span>
            <input className={field} value={settings.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} placeholder="919876543210" />
          </label>
          <label>
            <span className={label}>Support email</span>
            <input className={field} value={settings.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} placeholder="hello@kleid.in" />
          </label>
          <label>
            <span className={label}>Instagram URL</span>
            <input className={field} value={settings.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} placeholder="https://instagram.com/..." />
          </label>
          <label>
            <span className={label}>Facebook URL</span>
            <input className={field} value={settings.facebookUrl} onChange={(e) => update("facebookUrl", e.target.value)} placeholder="https://facebook.com/..." />
          </label>
          <label className="sm:col-span-2">
            <span className={label}>Footer tagline</span>
            <input className={field} value={settings.footerTagline} onChange={(e) => update("footerTagline", e.target.value)} />
          </label>
        </div>
      </section>

      <section className={section}>
        <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#001cac]">
          Homepage
        </p>
        <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em]">
          Brand & dealer sections
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label>
            <span className={label}>Brand eyebrow</span>
            <input className={field} value={settings.homeBrandEyebrow} onChange={(e) => update("homeBrandEyebrow", e.target.value)} />
          </label>
          <label>
            <span className={label}>Brand title</span>
            <textarea className={area} value={settings.homeBrandTitle} onChange={(e) => update("homeBrandTitle", e.target.value)} />
          </label>
          <label>
            <span className={label}>Dealer eyebrow</span>
            <input className={field} value={settings.homeDealersEyebrow} onChange={(e) => update("homeDealersEyebrow", e.target.value)} />
          </label>
          <label>
            <span className={label}>Dealer title</span>
            <input className={field} value={settings.homeDealersTitle} onChange={(e) => update("homeDealersTitle", e.target.value)} />
          </label>
          <label className="sm:col-span-2">
            <span className={label}>Dealer description</span>
            <textarea className={area} value={settings.homeDealersBody} onChange={(e) => update("homeDealersBody", e.target.value)} />
          </label>
        </div>
      </section>

      <section className={section}>
        <p className="text-[9px] font-bold uppercase tracking-[.12em] text-[#001cac]">
          About page
        </p>
        <h2 className="mt-1.5 text-[26px] font-semibold tracking-[-.045em]">
          About content
        </h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <label><span className={label}>Hero eyebrow</span><input className={field} value={settings.aboutHeroEyebrow} onChange={(e) => update("aboutHeroEyebrow", e.target.value)} /></label>
          <label><span className={label}>Hero title</span><input className={field} value={settings.aboutHeroTitle} onChange={(e) => update("aboutHeroTitle", e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={label}>Hero lead</span><textarea className={area} value={settings.aboutHeroLead} onChange={(e) => update("aboutHeroLead", e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={label}>Hero body</span><textarea className={area} value={settings.aboutHeroBody} onChange={(e) => update("aboutHeroBody", e.target.value)} /></label>

          <label><span className={label}>Mission eyebrow</span><input className={field} value={settings.aboutMissionEyebrow} onChange={(e) => update("aboutMissionEyebrow", e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={label}>Mission title</span><textarea className={area} value={settings.aboutMissionTitle} onChange={(e) => update("aboutMissionTitle", e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={label}>Mission body</span><textarea className={area} value={settings.aboutMissionBody} onChange={(e) => update("aboutMissionBody", e.target.value)} /></label>

          <label><span className={label}>Philosophy eyebrow</span><input className={field} value={settings.aboutPhilosophyEyebrow} onChange={(e) => update("aboutPhilosophyEyebrow", e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={label}>Philosophy title</span><textarea className={area} value={settings.aboutPhilosophyTitle} onChange={(e) => update("aboutPhilosophyTitle", e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={label}>Philosophy body</span><textarea className={area} value={settings.aboutPhilosophyBody} onChange={(e) => update("aboutPhilosophyBody", e.target.value)} /></label>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className="rounded-[14px] bg-[#f6f7f9] p-3">
              <span className={label}>Principle {index + 1}</span>
              <input
                className={field}
                value={settings.aboutPrinciples[index]?.title ?? ""}
                onChange={(e) => updatePrinciple(index, "title", e.target.value)}
                placeholder="Title"
              />
              <textarea
                className={area + " mt-2"}
                value={settings.aboutPrinciples[index]?.copy ?? ""}
                onChange={(e) => updatePrinciple(index, "copy", e.target.value)}
                placeholder="Description"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label><span className={label}>Built eyebrow</span><input className={field} value={settings.aboutBuiltEyebrow} onChange={(e) => update("aboutBuiltEyebrow", e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={label}>Built title</span><textarea className={area} value={settings.aboutBuiltTitle} onChange={(e) => update("aboutBuiltTitle", e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={label}>Built body</span><textarea className={area} value={settings.aboutBuiltBody} onChange={(e) => update("aboutBuiltBody", e.target.value)} /></label>

          <label><span className={label}>Future eyebrow</span><input className={field} value={settings.aboutFutureEyebrow} onChange={(e) => update("aboutFutureEyebrow", e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={label}>Future title</span><textarea className={area} value={settings.aboutFutureTitle} onChange={(e) => update("aboutFutureTitle", e.target.value)} /></label>
          <label className="sm:col-span-2"><span className={label}>Future body</span><textarea className={area} value={settings.aboutFutureBody} onChange={(e) => update("aboutFutureBody", e.target.value)} /></label>
        </div>
      </section>

      {message ? (
        <div className="rounded-[14px] border border-[#d9dde3] bg-white px-4 py-3 text-[10px] font-semibold text-[#555d67]">
          {message}
        </div>
      ) : null}

      <div className="sticky bottom-3 z-20 flex justify-end rounded-[16px] border border-[#d9dde3] bg-white/95 p-2.5 shadow-[0_16px_40px_rgba(16,24,40,.12)] backdrop-blur">
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving}
          className="min-h-[46px] rounded-full bg-[#111111] px-7 text-[10px] font-bold !text-white disabled:opacity-50"
          style={{ color: "#fff" }}
        >
          {saving ? "Saving…" : "Save storefront settings"}
        </button>
      </div>
    </div>
  );
}
