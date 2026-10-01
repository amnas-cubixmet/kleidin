import type { Metadata } from "next";
import { LoginClient } from "@/components/LoginClient";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your KLEID.IN account.",
};

export default function LoginPage() {
  return <LoginClient />;
}
