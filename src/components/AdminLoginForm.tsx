"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed.");
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-[420px] rounded-[24px] border border-black/10 bg-white p-6 shadow-sm md:p-8"
    >
      <p className="text-[10px] font-bold tracking-[.16em] text-[#001cac]">ADMIN</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-.04em]">Sign in</h1>
      <p className="mt-2 text-sm leading-6 text-black/50">
        Manage products, stock, orders and storefront content.
      </p>

      <label className="mt-7 block">
        <span className="text-[11px] font-semibold text-black/55">Email</span>
        <input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#001cac]"
          required
        />
      </label>

      <label className="mt-4 block">
        <span className="text-[11px] font-semibold text-black/55">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#001cac]"
          required
        />
      </label>

      {message ? (
        <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
          {message}
        </p>
      ) : null}

      <button
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-[#001cac] px-4 py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
