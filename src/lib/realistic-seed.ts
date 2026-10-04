import {
  createAnnouncement,
  deleteDemoAnnouncements,
} from "@/lib/mongodb-announcements";
import {
  createHeroSlide,
  deleteDemoHeroSlides,
} from "@/lib/mongodb-hero";
import {
  createOrder,
  deleteDemoOrders,
} from "@/lib/mongodb-orders";
import {
  createProduct,
  deleteDemoProducts,
  type ProductWriteInput,
} from "@/lib/mongodb-products";
import {
  createTestimonial,
  deleteDemoTestimonials,
} from "@/lib/mongodb-testimonials";
import type { Product } from "@/types/product";
import { setDemoModeEnabled } from "@/lib/demo-mode";

const SEED_TAG = "[KLEID_HARDCODE_DEMO_V2]";
const STANDARD_SIZES = ["S", "M", "L", "XL", "2XL"];

type DemoOffer = {
  type: "sale-price" | "percentage" | "fixed";
  value: number;
  label: string;
  badge: string;
};

type DemoProductSeed = {
  sku: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAtPrice: number;
  description: string;
  image: string;
  colors: Array<{ name: string; value: string }>;
  wholesaleEnabled: boolean;
  wholesalePrice?: number;
  wholesaleMinOrder?: number;
  featured: boolean;
  stockProfile: "normal" | "low" | "out";
  offer?: DemoOffer;
};

const IMAGES = {
  blackTee:
    "https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1200&q=85",
  whiteTee:
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
  foldedTee:
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85",
  shirt:
    "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85",
  fashion:
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=85",
  neutral:
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85",
};

const PRODUCT_SEEDS: DemoProductSeed[] = [
  {
    sku: "KLD-DEMO-001",
    name: "Core Heavy Tee",
    slug: "demo-core-heavy-tee",
    category: "T-Shirts",
    price: 1199,
    compareAtPrice: 1499,
    description: "Heavyweight cotton essential with a structured neck and clean regular fit.",
    image: IMAGES.blackTee,
    colors: [{ name: "Washed Black", value: "#171717" }, { name: "Off White", value: "#EEEAE1" }],
    wholesaleEnabled: true,
    wholesalePrice: 790,
    wholesaleMinOrder: 20,
    featured: true,
    stockProfile: "normal",
    offer: { type: "percentage", value: 10, label: "Weekend Edit", badge: "10% OFF" },
  },
  {
    sku: "KLD-DEMO-002",
    name: "Everyday Oversized Tee",
    slug: "demo-everyday-oversized-tee",
    category: "Oversized T-Shirts",
    price: 999,
    compareAtPrice: 1299,
    description: "Relaxed oversized silhouette with dropped shoulders and soft cotton jersey.",
    image: IMAGES.whiteTee,
    colors: [{ name: "Navy", value: "#1E2A3A" }, { name: "Sand", value: "#C8B79C" }, { name: "White", value: "#F4F2EC" }],
    wholesaleEnabled: true,
    wholesalePrice: 660,
    wholesaleMinOrder: 24,
    featured: true,
    stockProfile: "normal",
  },
  {
    sku: "KLD-DEMO-003",
    name: "Studio Weight Tee",
    slug: "demo-studio-weight-tee",
    category: "T-Shirts",
    price: 1299,
    compareAtPrice: 1599,
    description: "Dense jersey tee with a slightly boxy profile designed to hold its shape.",
    image: IMAGES.foldedTee,
    colors: [{ name: "Charcoal", value: "#414141" }, { name: "Bone", value: "#DDD5C8" }],
    wholesaleEnabled: false,
    featured: true,
    stockProfile: "normal",
    offer: { type: "fixed", value: 150, label: "Launch Offer", badge: "SAVE ₹150" },
  },
  {
    sku: "KLD-DEMO-004",
    name: "Box Fit Essential Tee",
    slug: "demo-box-fit-essential-tee",
    category: "T-Shirts",
    price: 1099,
    compareAtPrice: 1399,
    description: "Compact box fit with balanced sleeve length and a soft washed finish.",
    image: IMAGES.fashion,
    colors: [{ name: "Mocha", value: "#8A6F5A" }, { name: "Stone", value: "#AAA399" }],
    wholesaleEnabled: false,
    featured: true,
    stockProfile: "low",
  },
  {
    sku: "KLD-DEMO-005",
    name: "Relaxed Oxford Shirt",
    slug: "demo-relaxed-oxford-shirt",
    category: "Shirts",
    price: 1699,
    compareAtPrice: 1999,
    description: "Relaxed oxford shirt with a soft structured collar and an easy everyday drape.",
    image: IMAGES.shirt,
    colors: [{ name: "White", value: "#F4F2EC" }, { name: "Sky", value: "#B9CEDD" }],
    wholesaleEnabled: true,
    wholesalePrice: 1180,
    wholesaleMinOrder: 15,
    featured: true,
    stockProfile: "normal",
    offer: { type: "sale-price", value: 1499, label: "Edit Price", badge: "SPECIAL" },
  },
  {
    sku: "KLD-DEMO-006",
    name: "Utility Overshirt",
    slug: "demo-utility-overshirt",
    category: "Shirts",
    price: 2199,
    compareAtPrice: 2599,
    description: "A clean layering overshirt with utility pockets and a relaxed straight hem.",
    image: IMAGES.neutral,
    colors: [{ name: "Olive", value: "#66705A" }, { name: "Black", value: "#1B1B1B" }],
    wholesaleEnabled: true,
    wholesalePrice: 1540,
    wholesaleMinOrder: 12,
    featured: false,
    stockProfile: "normal",
  },
  {
    sku: "KLD-DEMO-007",
    name: "Essential Crew Tee",
    slug: "demo-essential-crew-tee",
    category: "Essentials",
    price: 799,
    compareAtPrice: 999,
    description: "Light everyday crew tee built for repeat wear and easy layering.",
    image: IMAGES.whiteTee,
    colors: [{ name: "White", value: "#F7F7F2" }, { name: "Grey", value: "#A7A7A7" }, { name: "Black", value: "#171717" }],
    wholesaleEnabled: true,
    wholesalePrice: 520,
    wholesaleMinOrder: 30,
    featured: false,
    stockProfile: "normal",
  },
  {
    sku: "KLD-DEMO-008",
    name: "Washed Cotton Tee",
    slug: "demo-washed-cotton-tee",
    category: "T-Shirts",
    price: 1199,
    compareAtPrice: 1399,
    description: "Soft garment-washed cotton with subtle depth and an easy regular silhouette.",
    image: IMAGES.blackTee,
    colors: [{ name: "Washed Black", value: "#2A2927" }, { name: "Ash", value: "#B7B5AF" }],
    wholesaleEnabled: false,
    featured: false,
    stockProfile: "low",
  },
  {
    sku: "KLD-DEMO-009",
    name: "Drop Shoulder Tee",
    slug: "demo-drop-shoulder-tee",
    category: "Oversized T-Shirts",
    price: 1299,
    compareAtPrice: 1599,
    description: "Pronounced drop shoulder with a clean wide body and premium cotton handle.",
    image: IMAGES.fashion,
    colors: [{ name: "Stone", value: "#A8A098" }, { name: "Navy", value: "#202B3C" }],
    wholesaleEnabled: true,
    wholesalePrice: 850,
    wholesaleMinOrder: 20,
    featured: true,
    stockProfile: "normal",
    offer: { type: "percentage", value: 15, label: "Member Preview", badge: "15% OFF" },
  },
  {
    sku: "KLD-DEMO-010",
    name: "Clean Pocket Tee",
    slug: "demo-clean-pocket-tee",
    category: "Essentials",
    price: 899,
    compareAtPrice: 1099,
    description: "Minimal chest-pocket tee with a regular fit and smooth compact cotton.",
    image: IMAGES.foldedTee,
    colors: [{ name: "Off White", value: "#EEEAE1" }, { name: "Olive", value: "#6B725E" }],
    wholesaleEnabled: true,
    wholesalePrice: 590,
    wholesaleMinOrder: 24,
    featured: false,
    stockProfile: "normal",
  },
  {
    sku: "KLD-DEMO-011",
    name: "Relaxed Utility Trouser",
    slug: "demo-relaxed-utility-trouser",
    category: "Bottoms",
    price: 1899,
    compareAtPrice: 2299,
    description: "Straight relaxed trouser with practical pockets and a comfortable everyday rise.",
    image: IMAGES.neutral,
    colors: [{ name: "Olive", value: "#66705A" }, { name: "Black", value: "#1B1B1B" }],
    wholesaleEnabled: true,
    wholesalePrice: 1320,
    wholesaleMinOrder: 12,
    featured: true,
    stockProfile: "normal",
  },
  {
    sku: "KLD-DEMO-012",
    name: "Straight Fit Pant",
    slug: "demo-straight-fit-pant",
    category: "Bottoms",
    price: 1799,
    compareAtPrice: 2099,
    description: "Clean straight-leg pant with a balanced rise and understated everyday finish.",
    image: IMAGES.neutral,
    colors: [{ name: "Black", value: "#181818" }, { name: "Stone", value: "#A49E94" }],
    wholesaleEnabled: false,
    featured: false,
    stockProfile: "low",
    offer: { type: "fixed", value: 200, label: "Selected Style", badge: "SAVE ₹200" },
  },
  {
    sku: "KLD-DEMO-013",
    name: "Heavyweight Hoodie",
    slug: "demo-heavyweight-hoodie",
    category: "Hoodies",
    price: 2499,
    compareAtPrice: 2899,
    description: "Heavy fleece hoodie with a structured hood, roomy body and clean rib finish.",
    image: IMAGES.blackTee,
    colors: [{ name: "Black", value: "#141414" }, { name: "Heather Grey", value: "#9B9B9B" }],
    wholesaleEnabled: true,
    wholesalePrice: 1760,
    wholesaleMinOrder: 10,
    featured: true,
    stockProfile: "normal",
  },
  {
    sku: "KLD-DEMO-014",
    name: "Minimal Zip Hoodie",
    slug: "demo-minimal-zip-hoodie",
    category: "Hoodies",
    price: 2699,
    compareAtPrice: 3199,
    description: "Clean zip hoodie with minimal hardware and a relaxed layer-friendly silhouette.",
    image: IMAGES.fashion,
    colors: [{ name: "Charcoal", value: "#3C3C3C" }, { name: "Bone", value: "#DDD5C8" }],
    wholesaleEnabled: false,
    featured: false,
    stockProfile: "out",
  },
  {
    sku: "KLD-DEMO-015",
    name: "Classic Everyday Shirt",
    slug: "demo-classic-everyday-shirt",
    category: "Shirts",
    price: 1599,
    compareAtPrice: 1899,
    description: "Versatile everyday shirt with a clean collar, relaxed body and easy sleeve line.",
    image: IMAGES.shirt,
    colors: [{ name: "White", value: "#F7F6F1" }, { name: "Blue", value: "#AFC3D4" }],
    wholesaleEnabled: true,
    wholesalePrice: 1090,
    wholesaleMinOrder: 15,
    featured: false,
    stockProfile: "normal",
  },
  {
    sku: "KLD-DEMO-016",
    name: "Summer Lightweight Tee",
    slug: "demo-summer-lightweight-tee",
    category: "Essentials",
    price: 899,
    compareAtPrice: 1099,
    description: "Breathable lightweight cotton tee for warm days and simple everyday layering.",
    image: IMAGES.whiteTee,
    colors: [{ name: "White", value: "#F8F8F3" }, { name: "Sand", value: "#CFC0A7" }],
    wholesaleEnabled: true,
    wholesalePrice: 580,
    wholesaleMinOrder: 30,
    featured: false,
    stockProfile: "normal",
  },
  {
    sku: "KLD-DEMO-017",
    name: "Premium Rib Tee",
    slug: "demo-premium-rib-tee",
    category: "T-Shirts",
    price: 1399,
    compareAtPrice: 1699,
    description: "Premium compact cotton tee finished with a firm rib neckline and refined proportions.",
    image: IMAGES.foldedTee,
    colors: [{ name: "Black", value: "#171717" }, { name: "Cream", value: "#E7DFC9" }],
    wholesaleEnabled: false,
    featured: true,
    stockProfile: "normal",
    offer: { type: "percentage", value: 12, label: "Featured Offer", badge: "12% OFF" },
  },
  {
    sku: "KLD-DEMO-018",
    name: "Daily Uniform Tee",
    slug: "demo-daily-uniform-tee",
    category: "Essentials",
    price: 999,
    compareAtPrice: 1199,
    description: "A straightforward everyday uniform tee with dependable fit and easy repeat wear.",
    image: IMAGES.blackTee,
    colors: [{ name: "Black", value: "#171717" }, { name: "White", value: "#F5F5F0" }, { name: "Navy", value: "#222D3E" }],
    wholesaleEnabled: true,
    wholesalePrice: 640,
    wholesaleMinOrder: 24,
    featured: false,
    stockProfile: "normal",
  },
  {
    sku: "KLD-DEMO-019",
    name: "Relaxed Lounge Pant",
    slug: "demo-relaxed-lounge-pant",
    category: "Bottoms",
    price: 1499,
    compareAtPrice: 1799,
    description: "Soft relaxed pant with a clean straight line and easy elasticated waist.",
    image: IMAGES.neutral,
    colors: [{ name: "Charcoal", value: "#454545" }, { name: "Mocha", value: "#806A59" }],
    wholesaleEnabled: false,
    featured: false,
    stockProfile: "low",
  },
  {
    sku: "KLD-DEMO-020",
    name: "Essential Layer Hoodie",
    slug: "demo-essential-layer-hoodie",
    category: "Hoodies",
    price: 2299,
    compareAtPrice: 2699,
    description: "Midweight everyday hoodie designed as a clean layer for repeat wear.",
    image: IMAGES.fashion,
    colors: [{ name: "Navy", value: "#202B3A" }, { name: "Grey", value: "#9B9B98" }],
    wholesaleEnabled: true,
    wholesalePrice: 1580,
    wholesaleMinOrder: 12,
    featured: false,
    stockProfile: "normal",
  },
];

const CUSTOMERS = [
  ["Akhil S.", "9000000001", "Kakkanad", "682030"],
  ["Rizwan K.", "9000000002", "Edappally", "682024"],
  ["Naveen M.", "9000000003", "Aluva", "683101"],
  ["Joel T.", "9000000004", "Thrippunithura", "682301"],
  ["Shamil A.", "9000000005", "Kalamassery", "683104"],
  ["Arun P.", "9000000006", "Palarivattom", "682025"],
  ["Nihal R.", "9000000007", "Vyttila", "682019"],
  ["Sreejith V.", "9000000008", "Fort Kochi", "682001"],
  ["Adil N.", "9000000009", "Thrissur", "680001"],
  ["Fahad M.", "9000000010", "Kozhikode", "673001"],
  ["Vishnu K.", "9000000011", "Kannur", "670001"],
  ["Rahul R.", "9000000012", "Kottayam", "686001"],
  ["Niyas P.", "9000000013", "Alappuzha", "688001"],
  ["Ajmal H.", "9000000014", "Malappuram", "676505"],
  ["Jithin T.", "9000000015", "Kochi", "682011"],
  ["Shan P.", "9000000016", "Perumbavoor", "683542"],
  ["Amal J.", "9000000017", "Muvattupuzha", "686661"],
  ["Nabeel K.", "9000000018", "Angamaly", "683572"],
  ["Rohan V.", "9000000019", "Cherthala", "688524"],
  ["Irfan A.", "9000000020", "Kondotty", "673638"],
  ["Sanjay S.", "9000000021", "Chalakudy", "680307"],
  ["Midhun P.", "9000000022", "Irinjalakuda", "680121"],
  ["Ameen R.", "9000000023", "Tirur", "676101"],
  ["Alan B.", "9000000024", "Pala", "686575"],
  ["Kevin D.", "9000000025", "Ernakulam", "682018"],
] as const;

const ORDER_DAY_OFFSETS = [
  0, 1, 1, 2, 3, 4, 5, 6, 8, 9,
  11, 12, 14, 15, 17, 19, 21, 23, 25, 27,
  29, 31, 32, 34, 36, 38, 41, 43, 45, 47,
  49, 51, 54, 56, 58, 60, 62, 65, 67, 69,
  71, 73, 75, 78, 80, 82, 84, 86, 88, 89,
] as const;

const REVIEW_SEEDS = [
  ["Arjun M.", "Kochi", 5, "Fabric feels substantial without being too heavy. The neckline holds its shape well."],
  ["Nikhil R.", "Thrissur", 4, "The relaxed fit looks clean and the sleeve length is balanced."],
  ["Adil K.", "Kozhikode", 5, "The oxford has enough structure for work but still feels easy through the day."],
  ["Rahul S.", "Kottayam", 4, "Colour and finish are understated and easy to pair with denim or trousers."],
  ["Vishnu P.", "Kannur", 5, "The heavier tee drapes better than a regular basic and does not feel clingy."],
  ["Fahad N.", "Malappuram", 4, "Good everyday fit with clean finishing around the neck and sleeves."],
  ["Joel A.", "Aluva", 5, "The fabric feels premium and the sizing was consistent with the chart."],
  ["Niyas M.", "Kakkanad", 4, "Minimal design, good weight and easy to wear repeatedly."],
  ["Amal T.", "Vyttila", 5, "The shirt sits well untucked and the collar keeps a clean shape."],
  ["Rohan J.", "Alappuzha", 4, "The box fit is relaxed without looking too wide."],
  ["Ameen P.", "Tirur", 5, "Good balance between comfort and structure. Works well as a daily essential."],
  ["Kevin B.", "Ernakulam", 4, "The trouser has a clean straight line and feels comfortable for long wear."],
] as const;

function buildSizeStocks(
  productIndex: number,
  colorIndex: number,
  profile: DemoProductSeed["stockProfile"],
) {
  if (profile === "out") {
    return Object.fromEntries(STANDARD_SIZES.map((size) => [size, 0]));
  }

  if (profile === "low") {
    return Object.fromEntries(
      STANDARD_SIZES.map((size, sizeIndex) => [
        size,
        (productIndex + colorIndex + sizeIndex) % 2,
      ]),
    );
  }

  return Object.fromEntries(
    STANDARD_SIZES.map((size, sizeIndex) => [
      size,
      7 + ((productIndex * 5 + colorIndex * 3 + sizeIndex * 2) % 18),
    ]),
  );
}

function sumStocks(values: Record<string, number>) {
  return Object.values(values).reduce((sum, value) => sum + value, 0);
}

function demoCreatedAt(daysAgo: number, index: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(10 + (index % 9), (index * 13) % 60, 0, 0);
  return date.toISOString();
}

async function seedProducts() {
  const products = await Promise.all(
    PRODUCT_SEEDS.map(async (seed, productIndex) => {
      const colorVariants = seed.colors.map((color, colorIndex) => {
        const sizeStocks = buildSizeStocks(
          productIndex,
          colorIndex,
          seed.stockProfile,
        );
        return {
          name: color.name,
          value: color.value,
          image: seed.image,
          images: [seed.image],
          sizeStocks,
          stock: sumStocks(sizeStocks),
        };
      });

      const stock = colorVariants.reduce(
        (sum, variant) => sum + (variant.stock ?? 0),
        0,
      );

      const input: ProductWriteInput = {
        sku: seed.sku,
        name: seed.name,
        slug: seed.slug,
        category: seed.category,
        price: seed.price,
        compareAtPrice: seed.compareAtPrice,
        description: seed.description,
        sizes: STANDARD_SIZES,
        colors: seed.colors.map((color) => color.name),
        colorVariants,
        stock,
        wholesaleEnabled: seed.wholesaleEnabled,
        wholesalePrice: seed.wholesalePrice ?? null,
        wholesaleMinOrder: seed.wholesaleMinOrder ?? null,
        featured: seed.featured,
        status: "active",
        image: seed.image,
        imagePublicId: null,
        tryOnImage: null,
        tryOnImagePublicId: null,
        sortOrder: 10 + productIndex * 10,
        offerEnabled: Boolean(seed.offer),
        offerType: seed.offer?.type ?? "sale-price",
        offerValue: seed.offer?.value ?? null,
        offerLabel: seed.offer?.label ?? null,
        offerBadge: seed.offer?.badge ?? null,
        offerStartsAt: null,
        offerEndsAt: null,
        offerCountdown: false,
        isDemo: true,
      };

      return createProduct(input);
    }),
  );

  return products;
}

async function seedOrders(products: Product[]) {
  const statuses = [
    "Delivered",
    "Delivered",
    "Delivered",
    "Shipped",
    "Delivered",
    "Packed",
    "Confirmed",
    "Delivered",
    "New",
    "Cancelled",
  ] as const;

  const payments = [
    "Paid",
    "Cash on Delivery",
    "Paid",
    "Cash on Delivery",
    "Paid",
    "Pending",
  ] as const;

  await Promise.all(
    ORDER_DAY_OFFSETS.map(async (daysAgo, index) => {
      const customer = CUSTOMERS[index % CUSTOMERS.length];
      const first = products[(index * 3) % products.length];
      const second = products[(index * 3 + 5) % products.length];
      const third = products[(index * 3 + 9) % products.length];
      const firstQty = index % 6 === 0 ? 2 : 1;
      const items = [
        {
          productId: first.id,
          name: first.name,
          sku: first.sku,
          size: STANDARD_SIZES[index % STANDARD_SIZES.length],
          color: first.colors[index % first.colors.length],
          quantity: firstQty,
          unitPrice: first.price,
          unitCost: Math.round(first.price * 0.56),
        },
      ];

      if (index % 2 === 0) {
        items.push({
          productId: second.id,
          name: second.name,
          sku: second.sku,
          size: STANDARD_SIZES[(index + 1) % STANDARD_SIZES.length],
          color: second.colors[(index + 1) % second.colors.length],
          quantity: 1,
          unitPrice: second.price,
          unitCost: Math.round(second.price * 0.58),
        });
      }

      if (index % 7 === 0) {
        items.push({
          productId: third.id,
          name: third.name,
          sku: third.sku,
          size: STANDARD_SIZES[(index + 2) % STANDARD_SIZES.length],
          color: third.colors[0],
          quantity: 1,
          unitPrice: third.price,
          unitCost: Math.round(third.price * 0.6),
        });
      }

      await createOrder({
        customerName: customer[0],
        phone: customer[1],
        addressLine1: `${22 + (index % 31)} Demo Street`,
        addressLine2: "Internal demo address",
        landmark: "Near Central Junction",
        city: customer[2],
        state: "Kerala",
        pincode: customer[3],
        items,
        deliveryCharge: index % 4 === 0 ? 0 : 79,
        shippingCost: 49 + (index % 3) * 10,
        discount: index % 8 === 0 ? 150 : index % 5 === 0 ? 75 : 0,
        paymentStatus: payments[index % payments.length],
        status: statuses[index % statuses.length],
        notes: `${SEED_TAG} Internal hardcoded demo order #${index + 1}.`,
        isDemo: true,
        createdAt: demoCreatedAt(daysAgo, index),
      });
    }),
  );

  return ORDER_DAY_OFFSETS.length;
}

async function seedTestimonials(products: Product[]) {
  await Promise.all(
    REVIEW_SEEDS.map(async ([name, location, rating, quote], index) => {
      const product = products[index % products.length];
      await createTestimonial({
        name,
        location,
        rating,
        quote,
        productSlug: product.slug,
        showOnHome: false,
        enabled: false,
        pending: true,
        submittedByCustomer: false,
        isDemo: true,
      });
    }),
  );

  return REVIEW_SEEDS.length;
}

async function seedHero(products: Product[]) {
  const seeds = products.slice(0, 4).map((product, index) => ({
    kind: index === 1 ? ("offer" as const) : ("product" as const),
    productId: product.id,
    label: `[DEMO] FEATURE ${index + 1}`,
    title:
      index === 0
        ? "ESSENTIALS WITHOUT NOISE."
        : index === 1
          ? "THE EVERYDAY EDIT."
          : index === 2
            ? "HEAVYWEIGHT. CLEAN. REPEAT."
            : "BUILT FOR DAILY WEAR.",
    subtitle: product.description,
    button: "View product",
    href: `/products/${product.slug}`,
    badge: index === 1 ? "DEMO OFFER" : "DEMO FEATURE",
    discountText: index === 1 ? "10% PREVIEW" : "",
    imageUrl: product.image ?? "",
    imagePublicId: null,
    startsAt: null,
    endsAt: null,
    showCountdown: false,
    ctaStyle: "light" as const,
    imagePosition: "center" as const,
    enabled: false,
    order: 100 + index * 10,
    isDemo: true,
  }));

  await Promise.all(seeds.map((seed) => createHeroSlide(seed)));
  return seeds.length;
}

async function seedAnnouncements() {
  const seeds = [
    {
      text: "Free shipping on prepaid orders above ₹1,999",
      linkLabel: "Shop the collection",
      linkHref: "/products",
      enabled: false,
      sortOrder: 100,
      isDemo: true,
    },
    {
      text: "New essentials prepared for the next drop",
      linkLabel: "Explore products",
      linkHref: "/products",
      enabled: false,
      sortOrder: 110,
      isDemo: true,
    },
    {
      text: "Dealer ordering available for selected styles",
      linkLabel: "Dealer enquiry",
      linkHref: "/wholesale",
      enabled: false,
      sortOrder: 120,
      isDemo: true,
    },
    {
      text: "Selected styles available with introductory pricing",
      linkLabel: "View catalog",
      linkHref: "/products",
      enabled: false,
      sortOrder: 130,
      isDemo: true,
    },
  ];

  await Promise.all(seeds.map((seed) => createAnnouncement(seed)));
  return seeds.length;
}

export async function seedRealisticInternalData() {
  await setDemoModeEnabled(true);

  // A hardcoded demo pack is reset before every generation so repeated runs
  // always produce the same predictable admin/testing dataset.
  await clearRealisticInternalData();

  const products = await seedProducts();
  const [orders, testimonials, hero, announcements] = await Promise.all([
    seedOrders(products),
    seedTestimonials(products),
    seedHero(products),
    seedAnnouncements(),
  ]);

  return {
    mode: "hardcoded-internal-demo",
    publicVisibility: {
      products: "active while Demo Mode is ON",
      testimonials: "pending + disabled",
      hero: "disabled",
      announcements: "disabled",
      orders: "admin only",
    },
    products: {
      created: products.length,
      skipped: 0,
      imagesUploaded: 0,
    },
    orders: {
      created: orders,
      skipped: 0,
    },
    testimonials: {
      created: testimonials,
      skipped: 0,
    },
    hero: {
      created: hero,
      skipped: 0,
    },
    announcements: {
      created: announcements,
      skipped: 0,
    },
    warnings: [] as string[],
  };
}

export async function clearRealisticInternalData() {
  const [products, orders, testimonials, hero, announcements] =
    await Promise.all([
      deleteDemoProducts(),
      deleteDemoOrders(),
      deleteDemoTestimonials(),
      deleteDemoHeroSlides(),
      deleteDemoAnnouncements(),
    ]);

  return {
    products: products.deletedCount,
    orders: orders.deletedCount,
    testimonials: testimonials.deletedCount,
    hero: hero.deletedCount,
    announcements: announcements.deletedCount,
  };
}
