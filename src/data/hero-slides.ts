export type HeroSlideKind = "product" | "offer" | "collection" | "custom";
export type HeroCtaStyle = "light" | "dark" | "outline";
export type HeroImagePosition = "left" | "center" | "right";

export type HeroSlideConfig = {
  id: string;
  kind: HeroSlideKind;
  productId?: string | null;
  label: string;
  title: string;
  subtitle: string;
  button: string;
  href: string;
  badge: string;
  discountText?: string;
  imageUrl: string;
  imagePublicId?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  showCountdown?: boolean;
  ctaStyle?: HeroCtaStyle;
  imagePosition?: HeroImagePosition;
  enabled: boolean;
  order: number;
};


export const heroSlides: HeroSlideConfig[] = [
  {
    id: "kleid-main",
    kind: "custom",
    productId: null,
    label: "KLEID.IN",
    title: "ESSENTIALS WITHOUT NOISE",
    subtitle: "Everyday clothing built for simple, repeat wear.",
    button: "Shop collection",
    href: "/products",
    badge: "KLEID.IN",
    imageUrl: "",
    enabled: true,
    order: 1,
    ctaStyle: "light",
    imagePosition: "center",
  },
];
