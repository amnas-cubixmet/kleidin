import type { Testimonial } from "@/types/testimonial";
import { deleteCloudinaryImage } from "@/lib/cloudinary";
import { getMongoDatabase } from "@/lib/mongodb";

export type TestimonialCreateInput = {
  name: string;
  quote: string;
  location?: string;
  rating: number;
  productSlug?: string;
  productImage?: string;
  productImagePublicId?: string;
  showOnHome?: boolean;
  enabled?: boolean;
  pending?: boolean;
  submittedByCustomer?: boolean;
};

type TestimonialDocument = Testimonial & {
  updatedAt: string;
  isDemo?: boolean;
};

function toTestimonial(doc: TestimonialDocument): Testimonial {
  return {
    id: doc.id,
    name: doc.name,
    quote: doc.quote,
    location: doc.location,
    productImage: doc.productImage,
    productImagePublicId: doc.productImagePublicId,
    rating: Number(doc.rating),
    productSlug: doc.productSlug,
    showOnHome: Boolean(doc.showOnHome),
    enabled: Boolean(doc.enabled),
    pending: Boolean(doc.pending),
    submittedByCustomer: Boolean(doc.submittedByCustomer),
    createdAt: doc.createdAt,
  };
}

export async function listPublishedTestimonials(productSlug?: string) {
  const db = await getMongoDatabase();

  const filter: Record<string, unknown> = productSlug
    ? {
        productSlug,
        isDemo: { $ne: true },
        enabled: true,
        pending: false,
      }
    : {
        isDemo: { $ne: true },
        enabled: true,
        pending: false,
        showOnHome: true,
      };

  const rows = await db
    .collection<TestimonialDocument>("testimonials")
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();

  return rows.map(toTestimonial);
}

export async function listAllTestimonials() {
  const db = await getMongoDatabase();
  const rows = await db
    .collection<TestimonialDocument>("testimonials")
    .find({ isDemo: { $ne: true } })
    .sort({ createdAt: -1 })
    .toArray();

  return rows.map(toTestimonial);
}

export async function createTestimonial(input: TestimonialCreateInput) {
  const db = await getMongoDatabase();
  const now = new Date().toISOString();

  const document: TestimonialDocument = {
    id: crypto.randomUUID(),
    name: input.name,
    quote: input.quote,
    location: input.location,
    productImage: input.productImage,
    productImagePublicId: input.productImagePublicId,
    rating: input.rating,
    productSlug: input.productSlug,
    showOnHome: input.showOnHome ?? !input.productSlug,
    enabled: input.enabled ?? false,
    pending: input.pending ?? true,
    submittedByCustomer: input.submittedByCustomer ?? true,
    createdAt: now,
    updatedAt: now,
  };

  await db
    .collection<TestimonialDocument>("testimonials")
    .insertOne(document);

  return toTestimonial(document);
}

export async function updateTestimonialModeration(
  id: string,
  values: { enabled: boolean; pending: boolean },
) {
  const db = await getMongoDatabase();
  const row = await db
    .collection<TestimonialDocument>("testimonials")
    .findOneAndUpdate(
      { id },
      {
        $set: {
          enabled: values.enabled,
          pending: values.pending,
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" },
    );

  return row ? toTestimonial(row) : null;
}

export async function deleteTestimonial(id: string) {
  const db = await getMongoDatabase();
  const collection = db.collection<TestimonialDocument>("testimonials");
  const row = await collection.findOne({ id });

  await collection.deleteOne({ id });

  if (row?.productImagePublicId) {
    try {
      await deleteCloudinaryImage(row.productImagePublicId);
    } catch (error) {
      console.error("Review deleted but Cloudinary cleanup failed:", error);
    }
  }
}

