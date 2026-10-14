/** Pure validation helpers for direct MongoDB product-demo imports. */
export const SEED_SOURCE = "kleidin-demo-products-v1";
const isStagingName = /(^|[-_])(demo|dev|test|staging|sandbox)($|[-_])/i;

function string(value, field, max = 500) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new Error(field + " must be a non-empty string (max " + max + " chars).");
  }
  return value.trim();
}

function integer(value, field, min = 0, max = 1000000) {
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new Error(field + " must be an integer in [" + min + ", " + max + "].");
  }
  return value;
}

function names(value, field) {
  if (!Array.isArray(value) || !value.length || value.length > 12) {
    throw new Error(field + " must contain 1–12 entries.");
  }
  const result = value.map((entry) => string(entry, field, 50));
  if (new Set(result).size !== result.length) throw new Error("Duplicate " + field + ".");
  return result;
}

export function allowedImage(path) {
  if (typeof path !== "string") return false;
  if (/^\/images\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|avif)$/i.test(path)) return true;
  try {
    const url = new URL(path);
    return url.protocol === "https:" && (
      url.hostname === "res.cloudinary.com" ||
      (url.hostname === "purepng.com" && url.pathname.startsWith("/public/uploads/large/"))
    );
  } catch {
    return false;
  }
}

export function normalizeDemoProducts(rawProducts) {
  if (!Array.isArray(rawProducts) || !rawProducts.length || rawProducts.length > 100) {
    throw new Error("The input must be a JSON array of 1–100 products.");
  }
  const seenSku = new Set();
  const seenSlug = new Set();
  return rawProducts.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error("Product " + (index + 1) + " is not an object.");
    }
    const name = string(raw.name, "name", 120);
    const sku = string(raw.sku, "sku", 40).toUpperCase();
    const slug = string(raw.slug, "slug", 100);
    if (!/^DEMO-[A-Z0-9-]{3,32}$/.test(sku)) throw new Error(name + ": SKU must start with DEMO-.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(name + ": invalid slug.");
    if (seenSku.has(sku) || seenSlug.has(slug)) throw new Error("Duplicate SKU or slug: " + name);
    seenSku.add(sku);
    seenSlug.add(slug);

    const price = integer(raw.price, name + " price", 1);
    const costPrice = raw.costPrice === undefined ? undefined : integer(raw.costPrice, name + " costPrice");
    if (costPrice !== undefined && costPrice > price) throw new Error(name + ": cost cannot exceed price.");
    const compareAtPrice = raw.compareAtPrice === undefined ? undefined : integer(raw.compareAtPrice, name + " compareAtPrice", price + 1);
    const sizes = names(raw.sizes, "sizes");
    const colors = names(raw.colors, "colors");
    const image = string(raw.image, "image");
    if (!allowedImage(image)) throw new Error(name + ": image host is not permitted by Next.js.");

    if (!Array.isArray(raw.colorVariants) || raw.colorVariants.length !== colors.length) {
      throw new Error(name + ": each color must have one colorVariants entry.");
    }
    const colorVariants = raw.colorVariants.map((variant) => {
      if (!variant || typeof variant !== "object" || Array.isArray(variant)) throw new Error(name + ": invalid variant.");
      const variantName = string(variant.name, "color variant name", 50);
      if (!colors.includes(variantName)) throw new Error(name + ": variant color missing from colors.");
      const value = string(variant.value, "color hex", 40);
      if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(name + ": invalid color code.");
      const variantImage = variant.image === undefined ? image : string(variant.image, "variant image");
      if (!allowedImage(variantImage)) throw new Error(name + ": invalid variant image.");
      if (!variant.sizeStocks || typeof variant.sizeStocks !== "object" || Array.isArray(variant.sizeStocks)) {
        throw new Error(name + ": missing sizeStocks.");
      }
      if (Object.keys(variant.sizeStocks).length !== sizes.length) {
        throw new Error(name + ": sizeStocks keys must match all sizes.");
      }
      const sizeStocks = {};
      for (const size of sizes) sizeStocks[size] = integer(variant.sizeStocks[size], "stock for " + size, 0, 9999);
      return {
        name: variantName, value, image: variantImage, images: [variantImage],
        sizeStocks, stock: Object.values(sizeStocks).reduce((sum, n) => sum + n, 0),
      };
    });
    if (new Set(colorVariants.map((v) => v.name)).size !== colors.length) throw new Error(name + ": duplicate colors.");

    return {
      demo: true,
      seedSource: SEED_SOURCE,
      sku, slug, name,
      category: string(raw.category, "category", 60),
      description: string(raw.description, "description", 900),
      price,
      ...(costPrice === undefined ? {} : { costPrice }),
      ...(compareAtPrice === undefined ? {} : { compareAtPrice }),
      image, sizes, colors, colorVariants,
      stock: colorVariants.reduce((sum, variant) => sum + variant.stock, 0),
      status: "active",
      featured: raw.featured === true,
      featuredSortOrder: index + 1,
      featuredAnimationEnabled: raw.featured === true,
      animationSortOrder: index + 1,
      spotlight: false,
      wholesaleEnabled: false,
      sortOrder: index + 1,
      offerEnabled: false,
    };
  });
}

export function validateTarget({ uri, dbName, confirmDb, allowLiveDb, nodeEnv }) {
  if (!/^mongodb(?:\+srv)?:\/\//.test(uri ?? "")) throw new Error("MONGODB_URI must be configured.");
  if (!/^[a-zA-Z0-9_-]{1,60}$/.test(dbName ?? "")) throw new Error("Explicit MONGODB_DB is required.");
  if (dbName !== confirmDb) throw new Error("Pass --confirm-db=" + dbName + " to write to this database.");
  if (nodeEnv === "production") throw new Error("Refusing to seed with NODE_ENV=production.");
  if (!isStagingName.test(dbName) && !allowLiveDb) {
    throw new Error("Non-staging DB refused. Use --allow-live-db for an intentionally selected live database.");
  }
  return dbName;
}
