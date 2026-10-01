"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  clearLocalAccount,
  type LocalAccountProfile,
  readLocalAccount,
  writeLocalAccount,
} from "@/lib/account";

const emptyProfile: LocalAccountProfile = {
  name: "",
  email: "",
  phone: "",
  city: "",
  signedInAt: "",
};

export function ProfileClient() {
  const [profile, setProfile] = useState<LocalAccountProfile | null>(null);
  const [form, setForm] = useState<LocalAccountProfile>(emptyProfile);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = readLocalAccount();
    setProfile(current);
    if (current) setForm(current);
    setReady(true);
  }, []);

  const initials = useMemo(() => {
    const source = form.name || form.email || "K";
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [form.email, form.name]);

  function updateField(field: keyof LocalAccountProfile, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveProfile() {
    const next = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
    };

    writeLocalAccount(next);
    setProfile(next);
    setForm(next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1400);
  }

  function signOut() {
    clearLocalAccount();
    setProfile(null);
    setForm(emptyProfile);
  }

  if (!ready) {
    return <main className="min-h-[72vh] bg-white" />;
  }

  if (!profile) {
    return (
      <main className="min-h-[72vh] bg-white px-4 py-14">
        <section className="mx-auto max-w-[680px] border border-black/10 p-7 text-center md:p-12">
          <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
            KLEID.IN ACCOUNT
          </p>
          <h1 className="mt-4 text-[clamp(38px,7vw,62px)] font-semibold leading-[.92] tracking-[-.055em]">
            Sign in first.
          </h1>
          <p className="mx-auto mt-4 max-w-[420px] text-[10px] leading-5 text-black/50">
            Your profile details are available after signing in.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex min-h-11 items-center justify-center bg-[#111] px-6 text-[9px] font-semibold !text-white"
          >
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-[72vh] bg-[#f6f6f3] px-3 py-4 sm:px-5 md:px-8 md:py-8">
      <section className="mx-auto grid w-full max-w-[1180px] gap-3 md:grid-cols-[320px_1fr]">
        <aside className="bg-[#111] p-6 text-white md:min-h-[620px] md:p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-[18px] font-semibold text-[#111]">
            {initials}
          </div>
          <p className="mt-7 text-[8px] font-semibold tracking-[.14em] text-white/40">
            PROFILE
          </p>
          <h1 className="mt-2 break-words text-[30px] font-semibold leading-[.96] tracking-[-.045em]">
            {form.name || "Your account"}
          </h1>
          <p className="mt-3 break-all text-[9px] text-white/50">{form.email}</p>

          <div className="mt-10 grid gap-2 border-t border-white/10 pt-5">
            <Link href="/products" className="text-[9px] font-semibold text-white">
              Shop products
            </Link>
            <Link href="/contact" className="text-[9px] font-semibold text-white/65">
              Contact support
            </Link>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="mt-8 min-h-10 border border-white/20 bg-transparent px-4 text-[8px] font-semibold text-white"
          >
            Sign out
          </button>
        </aside>

        <div className="bg-white p-5 sm:p-7 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-6">
            <div>
              <p className="m-0 text-[8px] font-semibold tracking-[.14em] text-[#001cac]">
                ACCOUNT DETAILS
              </p>
              <h2 className="mt-3 text-[clamp(32px,5vw,54px)] font-semibold leading-[.94] tracking-[-.05em]">
                Your profile.
              </h2>
            </div>
            <span className="text-[8px] text-black/35">
              {profile.signedInAt
                ? "Signed in " + new Date(profile.signedInAt).toLocaleDateString("en-IN")
                : ""}
            </span>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-[8px] font-semibold tracking-[.1em] text-black/40">NAME</span>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="h-12 border border-black/15 px-4 text-[11px] outline-none focus:border-black"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[8px] font-semibold tracking-[.1em] text-black/40">EMAIL</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-12 border border-black/15 px-4 text-[11px] outline-none focus:border-black"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[8px] font-semibold tracking-[.1em] text-black/40">PHONE</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+91"
                className="h-12 border border-black/15 px-4 text-[11px] outline-none focus:border-black"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-[8px] font-semibold tracking-[.1em] text-black/40">CITY</span>
              <input
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                placeholder="Your city"
                className="h-12 border border-black/15 px-4 text-[11px] outline-none focus:border-black"
              />
            </label>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={saveProfile}
              className="min-h-11 bg-[#001cac] px-6 text-[9px] font-semibold text-white"
            >
              {saved ? "Saved" : "Save profile"}
            </button>
            <Link href="/" className="text-[9px] font-semibold text-black/55">
              Back to store
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
