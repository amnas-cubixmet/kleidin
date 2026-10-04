"use client";

import Image from "next/image";
import { StarRatingInput } from "@/components/StarRatingInput";
import {
  type ChangeEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Testimonial } from "@/types/testimonial";

type Props = {
  productSlug?: string;
  title?: string;
  eyebrow?: string;
};

type SubmissionDraft = {
  name: string;
  location: string;
  quote: string;
  rating: number;
};

const emptyDraft: SubmissionDraft = {
  name: "",
  location: "",
  quote: "",
  rating: 5,
};

export function TestimonialsSection({
  productSlug,
  title = "Customer Stories",
  eyebrow = "",
}: Props) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [draft, setDraft] = useState<SubmissionDraft>(emptyDraft);
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const query = productSlug
        ? "?productSlug=" + encodeURIComponent(productSlug)
        : "";
      const response = await fetch("/api/testimonials" + query, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load reviews.");
      setItems((data.testimonials ?? []) as Testimonial[]);
    } catch {
      setItems([]);
    }
  }, [productSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(
    () =>
      [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items],
  );

  const loopItems = useMemo(() => {
    if (!visible.length) return [];
    const copies = Math.max(1, Math.ceil(4 / visible.length));
    return Array.from({ length: copies }, () => visible)
      .flat()
      .map((item, index) => ({ item, loopKey: `${item.id}-${index}` }));
  }, [visible]);

  function handleProductImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Keep the product photo under 5 MB.");
      event.target.value = "";
      return;
    }

    if (productImagePreview) URL.revokeObjectURL(productImagePreview);
    setProductImageFile(file);
    setProductImagePreview(URL.createObjectURL(file));
    setMessage("");
  }

  function clearProductImage() {
    if (productImagePreview) URL.revokeObjectURL(productImagePreview);
    setProductImageFile(null);
    setProductImagePreview("");
  }

  async function submitStory(event: FormEvent) {
    event.preventDefault();

    if (!draft.name.trim() || !draft.quote.trim()) {
      setMessage("Name and your story are required.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const body = new FormData();
      body.set("name", draft.name.trim());
      body.set("location", draft.location.trim());
      body.set("quote", draft.quote.trim());
      body.set("rating", String(draft.rating));
      if (productSlug) body.set("productSlug", productSlug);
      if (productImageFile) body.set("productImage", productImageFile);

      const response = await fetch("/api/testimonials", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit review.");

      setDraft(emptyDraft);
      clearProductImage();
      setMessage(data.message || "Thank you. Your story was submitted for review.");
      await load();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not submit review.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function StoryCard({
    item,
    duplicate = false,
  }: {
    item: Testimonial;
    duplicate?: boolean;
  }) {
    return (
      <article className="customer-story-card" aria-hidden={duplicate || undefined}>
        <div className="customer-story-body">
          <div className="customer-story-card-top">
            {item.productImage ? (
              <div className="customer-story-product-thumb">
                <Image
                  src={item.productImage}
                  alt={duplicate ? "" : "Customer product photo"}
                  fill
                  sizes="56px"
                  className="customer-story-product-image"
                />
              </div>
            ) : (
              <div className="customer-story-product-thumb customer-story-product-thumb-empty">
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div
                className="customer-story-rating"
                aria-label={duplicate ? undefined : item.rating + " out of 5 stars"}
              >
                {"★".repeat(Math.max(1, Math.min(5, item.rating)))}
              </div>

              <div className="customer-story-person">
                <strong>{item.name}</strong>
                {item.location ? <span>{item.location}</span> : null}
              </div>
            </div>
          </div>

          <blockquote>“{item.quote}”</blockquote>
        </div>
      </article>
    );
  }

  return (
    <section className="customer-stories-section">
      <div className="customer-stories-head">
        <div>
          {eyebrow ? <p>{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
      </div>

      {loopItems.length ? (
        <div className="customer-stories-loop" aria-label="Customer testimonials">
          <div className="customer-stories-track">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="customer-stories-set"
                aria-hidden={copy === 1 || undefined}
              >
                {loopItems.map(({ item, loopKey }) => (
                  <StoryCard
                    key={`${copy}-${loopKey}`}
                    item={item}
                    duplicate={copy === 1}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="customer-stories-empty">
          {productSlug
            ? "No published customer story for this product yet."
            : "Customer stories will appear here after review."}
        </div>
      )}

      <div className="customer-story-submit-wrap">
        <div className="customer-story-submit-copy">
          <p>SHARE YOUR STORY</p>
          <h3>Wore it? Tell us.</h3>
          <span>
            {productSlug
              ? "Share your experience and optionally upload a photo of the product you received."
              : "Share how KLEID.IN fits into your everyday rotation."}
          </span>
        </div>

        <form className="customer-story-form" onSubmit={submitStory}>
          <div className="customer-story-form-grid">
            <label>
              <span>Name</span>
              <input
                value={draft.name}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Your name"
              />
            </label>

            <label>
              <span>Location</span>
              <input
                value={draft.location}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                placeholder="Optional"
              />
            </label>
          </div>

          <label>
            <span>Your story</span>
            <textarea
              value={draft.quote}
              onChange={(event) =>
                setDraft((current) => ({ ...current, quote: event.target.value }))
              }
              placeholder="How did it fit, feel or wear?"
            />
          </label>

          <div className="customer-story-form-grid customer-story-form-grid-bottom">
            <div className="customer-story-rating-field">
              <span>Rating</span>
              <StarRatingInput
                value={draft.rating}
                onChange={(rating) =>
                  setDraft((current) => ({ ...current, rating }))
                }
                theme="dark"
                label="Your rating"
              />
            </div>

            <label className="customer-story-photo-field">
              <span>Product photo (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleProductImage}
              />
              <small>Uploaded securely to Cloudinary after submission.</small>
            </label>
          </div>

          {productImagePreview ? (
            <div className="customer-story-photo-preview">
              <Image
                src={productImagePreview}
                alt="Product photo preview"
                width={84}
                height={84}
                unoptimized
              />
              <div>
                <strong>Product photo ready</strong>
                <button type="button" onClick={clearProductImage}>
                  Remove photo
                </button>
              </div>
            </div>
          ) : null}

          {message ? <p className="customer-story-form-message">{message}</p> : null}

          <button
            type="submit"
            className="customer-story-submit-button"
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit story"}
          </button>
        </form>
      </div>
    </section>
  );
}
