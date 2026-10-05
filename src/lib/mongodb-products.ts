import type {
  Product,
  ProductColorVariant,
  ProductOfferType,
  ProductStatus,
} from "@/types/product";
import type { Filter } from "mongodb";
import { deleteCloudinaryImages } from "@/lib/cloudinary";
import {
  getMongoDatabase,
  isMongoDatabaseConfigured,
} from "@/lib/mongodb";

export type ProductWriteInput = {
  id?: string;
  sku: string;
  name: string;
  slug: string;
  wholesaleSlug?: string | null;
  category: string;
  price: number;
  compareAtPrice?: number | null;
  offerEnabled?: boolean;
  offerType?: ProductOfferType;
  offerValue?: number | null;
  offerLabel?: string | null;
  offerBadge?: string | null;
  offerStartsAt?: string | null;
  offerEndsAt?: string | null;
  offerCountdown?: boolean;
  wholesaleEnabled: boolean;
  wholesalePrice?: number | null;
  wholesaleMinOrder?: number | null;
  description: string;
  sizes: string[];
  colors: string[];
  colorVariants: ProductColorVariant[];
  stock: number;
  featured: boolean;
  status: ProductStatus;
  image?: string | null;
  imagePublicId?: string | null;
  tryOnImage?: string | null;
  tryOnImagePublicId?: string | null;
  sortOrder?: number;
};

type ProductDocument = Product & {
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
};

function toProduct(doc: ProductDocument): Product {
  return {
    id: doc.id,
    sku: doc.sku,
    name: doc.name,
    slug: doc.slug,
    wholesaleSlug: doc.wholesaleSlug,
    category: doc.category,
    price: Number(doc.price),
    compareAtPrice: doc.compareAtPrice,
    offerEnabled: Boolean(doc.offerEnabled),
    offerType: doc.offerType ?? "sale-price",
    offerValue: doc.offerValue,
    offerLabel: doc.offerLabel,
    offerBadge: doc.offerBadge,
    offerStartsAt: doc.offerStartsAt,
    offerEndsAt: doc.offerEndsAt,
    offerCountdown: Boolean(doc.offerCountdown),
    saleEndsAt: doc.offerEndsAt,
    saleLabel: doc.offerLabel,
    wholesaleEnabled: Boolean(doc.wholesaleEnabled),
    wholesalePrice: doc.wholesalePrice,
    wholesaleMinOrder: doc.wholesaleMinOrder,
    description: doc.description,
    sizes: doc.sizes ?? [],
    colors: doc.colors ?? [],
    colorVariants: doc.colorVariants ?? [],
    stock: Number(doc.stock ?? 0),
    featured: Boolean(doc.featured),
    status: doc.status,
    image: doc.image,
    imagePublicId: doc.imagePublicId,
    tryOnImage: doc.tryOnImage,
    tryOnImagePublicId: doc.tryOnImagePublicId,
    sortOrder: doc.sortOrder ?? 100,
  };
}

function toDocument(
  input: ProductWriteInput,
  existing?: ProductDocument | null,
): ProductDocument {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? input.id ?? crypto.randomUUID(),
    sku: input.sku,
    name: input.name,
    slug: input.slug,
    wholesaleSlug: input.wholesaleEnabled
      ? input.wholesaleSlug || `${input.slug}-dealer`
      : undefined,
    category: input.category,
    price: input.price,
    compareAtPrice: input.compareAtPrice ?? undefined,
    offerEnabled: Boolean(input.offerEnabled),
    offerType: input.offerType ?? "sale-price",
    offerValue: input.offerEnabled ? input.offerValue ?? undefined : undefined,
    offerLabel: input.offerEnabled ? input.offerLabel ?? undefined : undefined,
    offerBadge: input.offerEnabled ? input.offerBadge ?? undefined : undefined,
    offerStartsAt: input.offerEnabled
      ? input.offerStartsAt ?? undefined
      : undefined,
    offerEndsAt: input.offerEnabled ? input.offerEndsAt ?? undefined : undefined,
    offerCountdown: input.offerEnabled
      ? Boolean(input.offerCountdown)
      : false,
    saleEndsAt: input.offerEnabled ? input.offerEndsAt ?? undefined : undefined,
    saleLabel: input.offerEnabled ? input.offerLabel ?? undefined : undefined,
    wholesaleEnabled: input.wholesaleEnabled,
    wholesalePrice: input.wholesaleEnabled
      ? input.wholesalePrice ?? undefined
      : undefined,
    wholesaleMinOrder: input.wholesaleEnabled
      ? input.wholesaleMinOrder ?? undefined
      : undefined,
    description: input.description,
    sizes: input.sizes,
    colors: input.colors,
    colorVariants: input.colorVariants,
    stock: input.stock,
    featured: input.featured,
    status: input.status,
    image: input.image ?? undefined,
    imagePublicId: input.imagePublicId ?? undefined,
    tryOnImage: input.tryOnImage ?? undefined,
    tryOnImagePublicId: input.tryOnImagePublicId ?? undefined,
    sortOrder: input.sortOrder ?? 100,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export function isProductDatabaseConfigured() {
  return isMongoDatabaseConfigured();
}

export async function listProducts(options?: { activeOnly?: boolean }) {
  const db = await getMongoDatabase();

  const filter: Filter<ProductDocument> = options?.activeOnly
    ? { isDemo: { $ne: true }, status: { $ne: "draft" as const } }
    : { isDemo: { $ne: true } };

  const rows = await db
    .collection<ProductDocument>("products")
    .find(filter)
    .sort({ sortOrder: 1, createdAt: -1 })
    .toArray();

  return rows.map(toProduct);
}

export async function getProduct(id: string) {
  const db = await getMongoDatabase();
  const row = await db
    .collection<ProductDocument>("products")
    .findOne({ id, isDemo: { $ne: true } });

  return row ? toProduct(row) : null;
}

export async function getProductBySlugFromDb(slug: string) {
  const db = await getMongoDatabase();
  const row = await db
    .collection<ProductDocument>("products")
    .findOne({ slug, isDemo: { $ne: true }, status: { $ne: "draft" } });

  return row ? toProduct(row) : null;
}

export async function getWholesaleProductBySlugFromDb(slug: string) {
  const db = await getMongoDatabase();
  const row = await db
    .collection<ProductDocument>("products")
    .findOne({
      wholesaleSlug: slug,
      wholesaleEnabled: true,
      isDemo: { $ne: true },
      status: { $ne: "draft" },
    });

  return row ? toProduct(row) : null;
}

export async function updateFeaturedProducts(
  items: Array<{ id: string; featured: boolean; sortOrder: number }>,
) {
  const db = await getMongoDatabase();
  const collection = db.collection<ProductDocument>("products");

  if (items.length) {
    await collection.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { id: item.id, isDemo: { $ne: true } },
          update: {
            $set: {
              featured: item.featured,
              sortOrder: Math.max(1, Math.floor(item.sortOrder)),
              updatedAt: new Date().toISOString(),
            },
          },
        },
      })),
      { ordered: false },
    );
  }

  return listProducts();
}

export async function createProduct(input: ProductWriteInput) {
  const db = await getMongoDatabase();
  const document = toDocument(input);

  await db.collection<ProductDocument>("products").insertOne(document);
  return toProduct(document);
}

export async function updateProduct(id: string, input: ProductWriteInput) {
  const db = await getMongoDatabase();
  const collection = db.collection<ProductDocument>("products");
  const existing = await collection.findOne({ id, isDemo: { $ne: true } });
  if (!existing) return null;

  const document = toDocument({ ...input, id }, existing);
  await collection.replaceOne({ id, isDemo: { $ne: true } }, document);

  return toProduct(document);
}

export async function deleteProduct(id: string) {
  const db = await getMongoDatabase();
  const collection = db.collection<ProductDocument>("products");
  const existing = await collection.findOne({ id });
  if (!existing) return false;

  const publicIds = [
    existing.imagePublicId,
    existing.tryOnImagePublicId,
    ...(existing.colorVariants ?? []).flatMap(
      (variant) => variant.imagePublicIds ?? [],
    ),
  ];

  await collection.deleteOne({ id, isDemo: { $ne: true } });

  try {
    await deleteCloudinaryImages(publicIds);
  } catch (error) {
    console.error("Product deleted but Cloudinary cleanup failed:", error);
  }

  return true;
}

