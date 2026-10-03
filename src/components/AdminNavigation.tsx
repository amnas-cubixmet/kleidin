"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type IconName =
  | "dashboard"
  | "orders"
  | "products"
  | "inventory"
  | "customers"
  | "testimonials"
  | "hero"
  | "settings"
  | "more";

type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

const primaryItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/products", label: "Products", icon: "products" },
  { href: "/admin/inventory", label: "Inventory", icon: "inventory" },
];

const relationshipItems: NavItem[] = [
  { href: "/admin/customers", label: "Customers", icon: "customers" },
  { href: "/admin/testimonials", label: "Testimonials", icon: "testimonials" },
];

const storefrontItems: NavItem[] = [
  { href: "/admin/hero", label: "Hero", icon: "hero" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

const mobileItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Home", icon: "dashboard" },
  { href: "/admin/orders", label: "Orders", icon: "orders" },
  { href: "/admin/products", label: "Products", icon: "products" },
  { href: "/admin/inventory", label: "Stock", icon: "inventory" },
  { href: "/admin/more", label: "More", icon: "more" },
];

function Icon({ name, className = "h-[19px] w-[19px]" }: { name: IconName; className?: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
    case "orders":
      return <svg {...common}><path d="M6 3h12l1 18H5L6 3Z" /><path d="M9 7a3 3 0 0 0 6 0" /></svg>;
    case "products":
      return <svg {...common}><path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5V16l-8 5-8-5V7.5Z" /><path d="M12 12v9" /></svg>;
    case "inventory":
      return <svg {...common}><path d="M4 7h16v14H4z" /><path d="M3 3h18v4H3z" /><path d="M9 11h6" /></svg>;
    case "customers":
      return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 20c.5-4 2.4-6 5.5-6s5 2 5.5 6" /><path d="M16 11a3 3 0 1 0 0-6" /><path d="M17 14c2.3.6 3.4 2.6 3.5 6" /></svg>;
    case "testimonials":
      return <svg {...common}><path d="M6 17.5 3 20l.8-4A8.5 8.5 0 1 1 6 17.5Z" /><path d="m9 10 1 1 2-2" /><path d="M14 10h3M9 14h8" /></svg>;
    case "hero":
      return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m5 17 5-5 3 3 2-2 4 4" /></svg>;
    case "settings":
      return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></svg>;
    default:
      return <svg {...common}><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></svg>;
  }
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

function DesktopGroup({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  return (
    <div className="mt-4 xl:mt-5">
      <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[.13em] text-[#8a919d]">{title}</p>
      <div className="grid gap-1">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                "relative flex min-h-[42px] items-center gap-3 rounded-[11px] px-3 text-[10px] font-bold transition-colors " +
                (active
                  ? "bg-[#e9edff] text-[#001cac]"
                  : "text-[#59616d] hover:bg-[#f3f5f8] hover:text-[#15171a]")
              }
            >
              {active ? <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[#001cac]" /> : null}
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <>
      <aside className="sticky top-4 hidden h-[calc(100vh-32px)] w-[232px] xl:w-[244px] shrink-0 flex-col admin-scroll-hidden overflow-y-auto rounded-[20px] border border-[#dfe3ea] bg-white p-2.5 xl:rounded-[22px] xl:p-3 shadow-[0_10px_35px_rgba(18,26,43,.04)] lg:flex">
        <Link href="/admin/dashboard" className="rounded-[14px] bg-[#f7f8fb] px-3 pb-3 pt-3.5">
          <strong className="block text-[19px] font-extrabold tracking-[-.055em] text-[#15171a]">KLEID.IN</strong>
          <span className="mt-1 block text-[8px] font-bold uppercase tracking-[.16em] text-[#7d8490]">Commerce admin</span>
        </Link>

        <DesktopGroup title="Business" items={primaryItems} pathname={pathname} />
        <DesktopGroup title="Relationships" items={relationshipItems} pathname={pathname} />
        <DesktopGroup title="Storefront" items={storefrontItems} pathname={pathname} />

        <div className="mt-auto pt-5">
          <Link href="/" target="_blank" className="flex min-h-9 items-center justify-between rounded-[12px] border border-[#dfe3ea] bg-[#f8f9fb] px-3 text-[9px] font-bold text-[#4d5561] transition hover:bg-white hover:text-[#15171a]">
            <span>View storefront</span>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </Link>
        </div>
      </aside>

      <nav
        className="fixed inset-x-2 bottom-2 z-[80] grid grid-cols-5 rounded-[17px] border border-[#d9dee7] bg-white/95 p-1 shadow-[0_12px_34px_rgba(18,26,43,.16)] backdrop-blur-xl supports-[padding:max(0px)]:bottom-[max(.5rem,env(safe-area-inset-bottom))] lg:hidden"
        aria-label="Admin mobile navigation"
      >
        {mobileItems.map((item) => {
          const active =
            item.icon === "more"
              ? ["/admin/customers", "/admin/testimonials", "/admin/hero", "/admin/settings", "/admin/more"].some((href) => isActive(pathname, href))
              : isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={
                "flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-[12px] px-1 text-[8px] font-bold transition-colors " +
                (active ? "bg-[#e9edff] text-[#001cac]" : "text-[#6b7280]")
              }
            >
              <Icon name={item.icon} className="h-[17px] w-[17px]" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
