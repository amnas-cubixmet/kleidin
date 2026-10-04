import { isCloudinaryConfigured, uploadCloudinaryImage } from "@/lib/cloudinary";
import { createAnnouncement, listAnnouncements } from "@/lib/mongodb-announcements";
import { createHeroSlide, listHeroSlides } from "@/lib/mongodb-hero";
import { createOrder, listOrders } from "@/lib/mongodb-orders";
import { createProduct, listProducts, type ProductWriteInput } from "@/lib/mongodb-products";
import { createTestimonial, listAllTestimonials } from "@/lib/mongodb-testimonials";
import type { Product } from "@/types/product";

const SEED_TAG = "[KLEID_INTERNAL_SEED_V1]";
const STANDARD_SIZES = ["S", "M", "L", "XL", "2XL"];

type SeedProduct = {
  sku: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  compareAtPrice: number;
  description: string;
  colors: Array<{ name: string; value: string }>;
  imageSource: string;
  wholesaleEnabled: boolean;
  wholesalePrice?: number;
  wholesaleMinOrder?: number;
  featured: boolean;
  offer?: {
    type: "sale-price" | "percentage" | "fixed";
    value: number;
    label: string;
    badge: string;
  };
};

const PRODUCT_SEEDS: SeedProduct[] = [
  {
    sku: "KLD-TEST-001",
    name: "Core Heavy Tee",
    slug: "core-heavy-tee",
    category: "T-Shirts",
    price: 1199,
    compareAtPrice: 1499,
    description:
      "A heavyweight everyday tee with a clean regular fit, dense cotton hand-feel and structured neckline.",
    colors: [
      { name: "Washed Black", value: "#171717" },
      { name: "Off White", value: "#EEEAE1" },
    ],
    imageSource:
      "https://images.unsplash.com/photo-1583743814966-8936f37f0b?auto=format&fit=crop&w=1400&q=88",
    wholesaleEnabled: true,
    wholesalePrice: 790,
    wholesaleMinOrder: 20,
    featured: true,
    offer: {
      type: "percentage",
      value: 10,
      label: "Internal weekend preview",
      badge: "10% OFF",
    },
  },
  {
    sku: "KLD-TEST-002",
    name: "Relaxed Oxford Shirt",
    slug: "relaxed-oxford-shirt",
    category: "Shirts",
    price: 1699,
    compareAtPrice: 1999,
    description:
      "A relaxed oxford shirt with a soft structured collar, easy drape and versatile everyday proportions.",
    colors: [
      { name: "White", value: "#F4F2EC" },
      { name: "Sky", value: "#B9CEDD" },
    ],
    imageSource:
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1400&q=88",
    wholesaleEnabled: true,
    wholesalePrice: 1180,
    wholesaleMinOrder: 15,
    featured: true,
  },
  {
    sku: "KLD-TEST-003",
    name: "Everyday Oversized Tee",
    slug: "everyday-oversized-tee",
    category: "T-Shirts",
    price: 999,
    compareAtPrice: 1299,
    description:
      "An easy oversized silhouette with dropped shoulders, soft cotton jersey and a clean minimal finish.",
    colors: [
      { name: "Navy", value: "#1E2A3A" },
      { name: "Sand", value: "#C8B79C" },
    ],
    imageSource:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=88",
    wholesaleEnabled: true,
    wholesalePrice: 660,
    wholesaleMinOrder: 24,
    featured: true,
  },
  {
    sku: "KLD-TEST-004",
    name: "Studio Weight Tee",
    slug: "studio-weight-tee",
    category: "T-Shirts",
    price: 1299,
    compareAtPrice: 1599,
    description:
      "A substantial cotton tee designed to hold shape through repeat wear with a slightly boxy studio fit.",
    colors: [
      { name: "Charcoal", value: "#414141" },
      { name: "Bone", value: "#DDD5C8" },
    ],
    imageSource:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1400&q=88",
    wholesaleEnabled: false,
    featured: false,
    offer: {
      type: "fixed",
      value: 150,
      label: "Internal launch offer",
      badge: "SAVE ₹150",
    },
  },
  {
    sku: "KLD-TEST-005",
    name: "Relaxed Utility Trouser",
    slug: "relaxed-utility-trouser",
    category: "Bottoms",
    price: 1899,
    compareAtPrice: 2299,
    description:
      "A relaxed straight-leg trouser with practical pockets, clean lines and a comfortable everyday rise.",
    colors: [
      { name: "Olive", value: "#66705A" },
      { name: "Black", value: "#1B1B1B" },
    ],
    imageSource:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=88",
    wholesaleEnabled: true,
    wholesalePrice: 1320,
    wholesaleMinOrder: 12,
    featured: false,
  },
  {
    sku: "KLD-TEST-006",
    name: "Box Fit Essential Tee",
    slug: "box-fit-essential-tee",
    category: "T-Shirts",
    price: 1099,
    compareAtPrice: 1399,
    description:
      "A compact box-fit tee with balanced sleeve length, clean neck rib and a soft washed finish.",
    colors: [
      { name: "Mocha", value: "#8A6F5A" },
      { name: "Stone", value: "#AAA399" },
    ],
    imageSource:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1400&q=88",
    wholesaleEnabled: false,
    featured: false,
  },
];

const REVIEW_SEEDS = [
  {
    name: "Arjun M.",
    location: "Internal QA",
    rating: 5,
    quote:
      "Fabric weight feels premium and the neckline keeps its shape well. The fit reads clean rather than oversized.",
  },
  {
    name: "Nikhil R.",
    location: "Internal QA",
    rating: 4,
    quote:
      "The shoulder drop is balanced and the cotton has a good everyday hand-feel. Sizing feels consistent.",
  },
  {
    name: "Adil K.",
    location: "Internal QA",
    rating: 5,
    quote:
      "The oxford has enough structure for work but still feels relaxed. Easy to wear through a full day.",
  },
  {
    name: "Rahul S.",
    location: "Internal QA",
    rating: 4,
    quote:
      "Colour and finish feel understated in person. The overall silhouette works well with both denim and trousers.",
  },
  {
    name: "Vishnu P.",
    location: "Internal QA",
    rating: 5,
    quote:
      "The heavier tee drapes better than a regular lightweight basic and does not feel clingy.",
  },
  {
    name: "Fahad N.",
    location: "Internal QA",
    rating: 4,
    quote:
      "Straightforward everyday fit with good sleeve length and a cleaner finish than most basic tees.",
  },
];

const ORDER_CUSTOMERS = [
  ["Akhil S.", "9000000001", "Kakkanad", "682030"],
  ["Rizwan K.", "9000000002", "Edappally", "682024"],
  ["Naveen M.", "9000000003", "Aluva", "683101"],
  ["Joel T.", "9000000004", "Thrippunithura", "682301"],
  ["Shamil A.", "9000000005", "Kalamassery", "683104"],
  ["Arun P.", "9000000006", "Palarivattom", "682025"],
  ["Nihal R.", "9000000007", "Vyttila", "682019"],
  ["Sreejith V.", "9000000008", "Fort Kochi", "682001"],
] as const;

async function uploadSeedImage(seed: SeedProduct) {
  const response = await fetch(seed.imageSource, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not download image for ${seed.name}.`);
  }

  return uploadCloudinaryImage({
    bytes: await response.arrayBuffer(),
    contentType: response.headers.get("content-type") || "image/jpeg",
    filename: seed.slug + ".jpg",
    folder: "kleidin/demo/products/" + seed.slug,
  });
}

function buildSizeStocks(productIndex: number, colorIndex: number) {
  return Object.fromEntries(
    STANDARD_SIZES.map((size, sizeIndex) => [
      size,
      5 + ((productIndex * 4 + colorIndex * 3 + sizeIndex * 2) % 14),
    ]),
  );
}

function sumStocks(values: Record<string, number>) {
  return Object.values(values).reduce((sum, value) => sum + value, 0);
}

async function seedProducts() {
  const existing = await listProducts();
  const bySku = new Map(existing.map((product) => [product.sku, product]));
  const created: Product[] = [];
  const warnings: string[] = [];
  let uploadedImages = 0;

  for (const [productIndex, seed] of PRODUCT_SEEDS.entries()) {
    const current = bySku.get(seed.sku);
    if (current) {
      created.push(current);
      continue;
    }

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    try {
      const image = await uploadSeedImage(seed);
      imageUrl = image.url;
      imagePublicId = image.publicId;
      uploadedImages += 1;
    } catch (error) {
      warnings.push(
        error instanceof Error ? error.message : `Image failed for ${seed.name}.`,
      );
    }

    const colorVariants = seed.colors.map((color, colorIndex) => {
      const sizeStocks = buildSizeStocks(productIndex, colorIndex);
      return {
        name: color.name,
        value: color.value,
        ...(imageUrl ? { image: imageUrl, images: [imageUrl] } : {}),
        ...(imagePublicId ? { imagePublicIds: [imagePublicId] } : {}),
        sizeStocks,
        stock: sumStocks(sizeStocks),
      };
    });

    const totalStock = colorVariants.reduce(
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
      stock: totalStock,
      wholesaleEnabled: seed.wholesaleEnabled,
      wholesalePrice: seed.wholesalePrice ?? null,
      wholesaleMinOrder: seed.wholesaleMinOrder ?? null,
      featured: seed.featured,
      status: "draft",
      image: imageUrl ?? null,
      imagePublicId: imagePublicId ?? null,
      tryOnImage: null,
      tryOnImagePublicId: null,
      sortOrder: 20 + productIndex * 10,
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

    const product = await createProduct(input);
    created.push(product);
    bySku.set(product.sku, product);
  }

  return {
    products: PRODUCT_SEEDS.map((seed) => bySku.get(seed.sku)).filter(
      Boolean,
    ) as Product[],
    createdCount: PRODUCT_SEEDS.filter((seed) => !existing.some((p) => p.sku === seed.sku)).length,
    skippedCount: PRODUCT_SEEDS.filter((seed) => existing.some((p) => p.sku === seed.sku)).length,
    uploadedImages,
    warnings,
  };
}

async function seedOrders(products: Product[]) {
  const existing = await listOrders();
  if (existing.some((order) => order.notes?.includes(SEED_TAG))) {
    return { createdCount: 0, skippedCount: ORDER_CUSTOMERS.length };
  }

  const statuses = [
    "Delivered",
    "Delivered",
    "Shipped",
    "Packed",
    "Confirmed",
    "New",
    "Delivered",
    "Cancelled",
  ] as const;

  const payments = [
    "Paid",
    "Cash on Delivery",
    "Paid",
    "Cash on Delivery",
    "Pending",
    "Pending",
    "Paid",
    "Cash on Delivery",
  ] as const;

  for (const [index, customer] of ORDER_CUSTOMERS.entries()) {
    const first = products[index % products.length];
    const second = products[(index + 2) % products.length];
    const quantity = index % 3 === 0 ? 2 : 1;

    await createOrder({
      customerName: customer[0],
      phone: customer[1],
      addressLine1: `${18 + index} Market Road`,
      addressLine2: "Internal test address",
      landmark: "Near Central Junction",
      city: customer[2],
      state: "Kerala",
      pincode: customer[3],
      items: [
        {
          productId: first.id,
          name: first.name,
          sku: first.sku,
          size: STANDARD_SIZES[index % STANDARD_SIZES.length],
          color: first.colors[0],
          quantity,
          unitPrice: first.price,
          unitCost: Math.round(first.price * 0.58),
        },
        ...(index % 2 === 0
          ? [
              {
                productId: second.id,
                name: second.name,
                sku: second.sku,
                size: STANDARD_SIZES[(index + 1) % STANDARD_SIZES.length],
                color: second.colors[1] ?? second.colors[0],
                quantity: 1,
                unitPrice: second.price,
                unitCost: Math.round(second.price * 0.58),
              },
            ]
          : []),
      ],
      deliveryCharge: index % 3 === 0 ? 0 : 79,
      shippingCost: 55,
      discount: index % 4 === 0 ? 100 : 0,
      paymentStatus: payments[index],
      status: statuses[index],
      notes: `${SEED_TAG} Internal test order for admin workflow verification.`,
      isDemo: true,
    });
  }

  return { createdCount: ORDER_CUSTOMERS.length, skippedCount: 0 };
}

async function seedTestimonials(products: Product[]) {
  const existing = await listAllTestimonials();
  let createdCount = 0;

  for (const [index, review] of REVIEW_SEEDS.entries()) {
    const exists = existing.some(
      (item) =>
        item.submittedByCustomer === false &&
        item.name === review.name &&
        item.quote === review.quote,
    );
    if (exists) continue;

    const product = products[index % products.length];
    await createTestimonial({
      ...review,
      productSlug: product.slug,
      showOnHome: false,
      enabled: false,
      pending: true,
      submittedByCustomer: false,
      isDemo: true,
    });
    createdCount += 1;
  }

  return {
    createdCount,
    skippedCount: REVIEW_SEEDS.length - createdCount,
  };
}

async function seedHero(products: Product[]) {
  const existing = await listHeroSlides();
  const seeds = products.slice(0, 3).map((product, index) => ({
    marker: `[INTERNAL] ${product.name}`,
    input: {
      kind: index === 1 ? ("offer" as const) : ("product" as const),
      productId: product.id,
      label: `[INTERNAL] PREVIEW ${index + 1}`,
      title: product.name.toUpperCase(),
      subtitle: product.description,
      button: "View product",
      href: `/products/${product.slug}`,
      badge: index === 1 ? "OFFER PREVIEW" : "PRODUCT PREVIEW",
      discountText: index === 1 ? "INTERNAL TEST" : "",
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
    },
  }));

  let createdCount = 0;
  for (const seed of seeds) {
    if (existing.some((slide) => slide.label === seed.input.label)) continue;
    await createHeroSlide(seed.input);
    createdCount += 1;
  }

  return { createdCount, skippedCount: seeds.length - createdCount };
}

async function seedAnnouncements() {
  const existing = await listAnnouncements();
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
      text: "New essentials are being prepared for the next drop",
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
  ];

  let createdCount = 0;
  for (const seed of seeds) {
    if (existing.some((item) => item.text === seed.text)) continue;
    await createAnnouncement(seed);
    createdCount += 1;
  }

  return { createdCount, skippedCount: seeds.length - createdCount };
}

export async function seedRealisticInternalData() {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET first.",
    );
  }

  const productResult = await seedProducts();
  if (!productResult.products.length) {
    throw new Error("Could not create or load seed products.");
  }

  const [orders, testimonials, hero, announcements] = await Promise.all([
    seedOrders(productResult.products),
    seedTestimonials(productResult.products),
    seedHero(productResult.products),
    seedAnnouncements(),
  ]);

  return {
    mode: "internal-test-only",
    publicVisibility: {
      products: "draft",
      testimonials: "pending + disabled",
      hero: "disabled",
      announcements: "disabled",
      orders: "admin only",
    },
    products: {
      created: productResult.createdCount,
      skipped: productResult.skippedCount,
      imagesUploaded: productResult.uploadedImages,
    },
    orders: {
      created: orders.createdCount,
      skipped: orders.skippedCount,
    },
    testimonials: {
      created: testimonials.createdCount,
      skipped: testimonials.skippedCount,
    },
    hero: {
      created: hero.createdCount,
      skipped: hero.skippedCount,
    },
    announcements: {
      created: announcements.createdCount,
      skipped: announcements.skippedCount,
    },
    warnings: productResult.warnings,
  };
}
