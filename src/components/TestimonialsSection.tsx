"use client";

import Image from "next/image";
import { StarRatingInput } from "@/components/StarRatingInput";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  readTestimonials,
  writeTestimonials,
  TESTIMONIAL_UPDATED_EVENT,
} from "@/lib/testimonials";
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
  productImage: string;
};

const emptyDraft: SubmissionDraft = {
  name: "",
  location: "",
  quote: "",
  rating: 5,
  productImage: "",
};

export function TestimonialsSection({
  productSlug,
  title = "Customer Stories",
  eyebrow = "",
}: Props) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [draft, setDraft] = useState<SubmissionDraft>(emptyDraft);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const sync = () => setItems(readTestimonials());
    sync();

    window.addEventListener("storage", sync);
    window.addEventListener(TESTIMONIAL_UPDATED_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(TESTIMONIAL_UPDATED_EVENT, sync);
    };
  }, []);

  const visible = useMemo(
    () =>
      items
        .filter((item) => {
          if (!item.enabled || item.pending) return false;
          if (productSlug) return item.productSlug === productSlug;
          return item.showOnHome;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items, productSlug],
  );

  const loopItems = useMemo(() => {
    if (!visible.length) return [];

    const copies = Math.max(1, Math.ceil(4 / visible.length));
    return Array.from({ length: copies }, () => visible)
      .flat()
      .map((item, index) => ({ item, loopKey: `${item.id}-${index}` }));
  }, [visible]);

  function handleProductImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    if (file.size > 1500000) {
      setMessage("Keep the product photo under 1.5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        productImage: typeof reader.result === "string" ? reader.result : "",
      }));
      setMessage("");
    };
    reader.readAsDataURL(file);
  }

  function submitStory(event: FormEvent) {
    event.preventDefault();

    if (!draft.name.trim() || !draft.quote.trim()) {
      setMessage("Name and your story are required.");
      return;
    }

    const current = readTestimonials();
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : "customer-story-" + Date.now();

    const next: Testimonial = {
      id,
      name: draft.name.trim(),
      location: draft.location.trim() || undefined,
      quote: draft.quote.trim(),
      rating: draft.rating,
      productImage: draft.productImage || undefined,
      productSlug: productSlug || undefined,
      showOnHome: !productSlug,
      enabled: false,
      pending: true,
      submittedByCustomer: true,
      createdAt: new Date().toISOString(),
    };

    writeTestimonials([next, ...current]);
    setDraft(emptyDraft);
    setMessage("Thank you. Your story was submitted for review.");
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
                  unoptimized={item.productImage.startsWith("data:")}
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
              <span>Product photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleProductImage}
              />
              <small>Optional — upload the product you received or wore.</small>
            </label>
          </div>

          {draft.productImage ? (
            <div className="customer-story-photo-preview">
              <Image
                src={draft.productImage}
                alt="Product photo preview"
                width={84}
                height={84}
                unoptimized
              />
              <div>
                <strong>Product photo ready</strong>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((current) => ({ ...current, productImage: "" }))
                  }
                >
                  Remove photo
                </button>
              </div>
            </div>
          ) : null}

          {message ? <p className="customer-story-form-message">{message}</p> : null}

          <button type="submit" className="customer-story-submit-button">
            Submit story
          </button>
        </form>
      </div>
    </section>
  );
}
