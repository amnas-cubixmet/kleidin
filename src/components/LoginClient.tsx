"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { writeLocalAccount } from "@/lib/account";

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const fallbackName =
      cleanEmail
        .split("@")[0]
        ?.replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
      "KLEID.IN Customer";

    writeLocalAccount({
      name: fallbackName,
      email: cleanEmail,
      phone: "",
      city: "",
      signedInAt: new Date().toISOString(),
    });

    setPassword("");
    router.push("/profile");
  }

  return (
    <main className="min-h-[72vh] bg-white px-3 py-5 sm:px-5 md:px-8 md:py-10">
      <section className="mx-auto grid w-full max-w-[1180px] overflow-hidden border border-black/10 bg-white md:grid-cols-[.9fr_1.1fr]">
        <div className="flex min-h-[330px] flex-col justify-between bg-[#111] p-6 text-white md:min-h-[620px] md:p-10">
          <div>
            <p className="m-0 text-[8px] font-semibold tracking-[.15em] text-white/45">
              KLEID.IN / ACCOUNT
            </p>
            <h1 className="mt-5 max-w-[560px] text-[clamp(44px,7vw,86px)] font-semibold leading-[.88] tracking-[-.06em]">
              Welcome back.
            </h1>
          </div>
          <p className="m-0 max-w-[420px] text-[10px] leading-5 text-white/55">
            Sign in to keep your profile details ready for a smoother KLEID.IN experience.
          </p>
        </div>

        <div className="flex items-center p-5 sm:p-8 md:p-12">
          <div className="w-full max-w-[520px]">
            <p className="m-0 text-[8px] font-semibold tracking-[.12em] text-[#001cac]">
              SIGN IN
            </p>
            <h2 className="mt-3 text-[clamp(34px,5vw,58px)] font-semibold leading-[.94] tracking-[-.055em]">
              Your account.
            </h2>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <label className="grid gap-2">
                <span className="text-[8px] font-semibold tracking-[.1em] text-black/45">
                  EMAIL
                </span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full border border-black/15 bg-white px-4 text-[11px] outline-none transition focus:border-black"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-[8px] font-semibold tracking-[.1em] text-black/45">
                  PASSWORD
                </span>
                <div className="flex h-12 items-center border border-black/15 bg-white focus-within:border-black">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-[11px] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="h-full min-w-[64px] border-0 bg-transparent px-3 text-[8px] font-semibold text-black/60"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </label>

              {error ? (
                <p className="m-0 text-[9px] font-medium text-red-600">{error}</p>
              ) : null}

              <button
                type="submit"
                className="mt-1 min-h-12 w-full border-0 bg-[#001cac] px-5 text-[9px] font-semibold text-white"
              >
                Sign in
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between gap-4 text-[8px] text-black/45">
              <span>Local demo account mode</span>
              <Link href="/contact" className="font-semibold text-black">
                Need help?
              </Link>
            </div>

            <p className="mt-7 border-t border-black/10 pt-5 text-[8px] leading-4 text-black/40">
              Your password is used only to validate this demo sign-in form and is not stored.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
