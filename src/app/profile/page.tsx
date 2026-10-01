import type { Metadata } from "next";
import { ProfileClient } from "@/components/ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your KLEID.IN profile.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
