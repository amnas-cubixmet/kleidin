import { AdminHomepageHeroManager } from "@/components/AdminHomepageHeroManager";
import { AdminAnimationBarManager } from "@/components/AdminAnimationBarManager";

export const dynamic = "force-dynamic";

export default function AdminHomepagePage() {
  return (
    <>
      <AdminHomepageHeroManager />
      <AdminAnimationBarManager />
    </>
  );
}
