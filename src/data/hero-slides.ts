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
  startsAt?: string | null;
  endsAt?: string | null;
  showCountdown?: boolean;
  ctaStyle?: HeroCtaStyle;
  imagePosition?: HeroImagePosition;
  enabled: boolean;
  order: number;
};

export const defaultHeroSlides: HeroSlideConfig[] = [
  {
    id: "default-product",
    kind: "product",
    productId: null,
    label: "FEATURED",
    title: "EVERYDAY ESSENTIAL",
    subtitle: "A clean everyday piece selected from the current collection.",
    button: "View product",
    href: "",
    badge: "FEATURED PRODUCT",
    imageUrl: "",
    showCountdown: false,
    ctaStyle: "light",
    imagePosition: "center",
    enabled: true,
    order: 1,
  },
  {
    id: "default-offer",
    kind: "offer",
    productId: null,
    label: "LIMITED OFFER",
    title: "WEEKEND EDIT",
    subtitle: "A limited offer for selected KLEID.IN pieces.",
    button: "Shop the offer",
    href: "/products",
    badge: "LIMITED TIME",
    discountText: "20% OFF",
    imageUrl: "",
    startsAt: null,
    endsAt: null,
    showCountdown: true,
    ctaStyle: "light",
    imagePosition: "center",
    enabled: true,
    order: 2,
  },
  {
    id: "default-collection",
    kind: "collection",
    productId: null,
    label: "COLLECTION",
    title: "THE EVERYDAY EDIT",
    subtitle: "Simple pieces built for repeat wear.",
    button: "Shop collection",
    href: "/products",
    badge: "KLEID.IN",
    imageUrl: "",
    showCountdown: false,
    ctaStyle: "light",
    imagePosition: "center",
    enabled: true,
    order: 3,
  },
];
