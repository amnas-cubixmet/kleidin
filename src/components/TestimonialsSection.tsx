"use client";

import Image from "next/image";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
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
  image: string;
};

const emptyDraft: SubmissionDraft = {
  name: "",
  location: "",
  quote: "",
  rating: 5,
  image: "",
};

export function TestimonialsSection({
  productSlug,
  title = "Worn. Lived in. Repeated.",
  eyebrow = "CUSTOMER STORIES",
}: Props) {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [draft, setDraft] = useState<SubmissionDraft>(emptyDraft);
  const [message, setMessage] = useState("");
  const [paused, setPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

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

  function slide(direction: 1 | -1) {
    const slider = sliderRef.current;
    if (!slider) return;

    const distance = Math.max(260, slider.clientWidth * 0.92);
    slider.scrollBy({ left: distance * direction, behavior: "smooth" });
  }

  useEffect(() => {
    if (paused || visible.length <= 1) return;

    const timer = window.setInterval(() => {
      const slider = sliderRef.current;
      if (!slider) return;

      const atEnd =
        slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 12;

      if (atEnd) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        slide(1);
      }
    }, 4200);

    return () => window.clearInterval(timer);
  }, [paused, visible.length]);

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }

    if (file.size > 1200000) {
      setMessage("Keep the photo under 1.2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({
        ...current,
        image: typeof reader.result === "string" ? reader.result : "",
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
      image: draft.image || undefined,
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

  return (
    <section className="customer-stories-section">
      <div className="customer-stories-head">
        <div>
          <p>{eyebrow}</p>
          <h2>{title}</h2>
        </div>

        {visible.length > 1 ? (
          <div className="customer-stories-controls" aria-label="Testimonial controls">
            <button type="button" onClick={() => slide(-1)} aria-label="Previous story">
              ←
            </button>
            <button type="button" onClick={() => slide(1)} aria-label="Next story">
              →
            </button>
          </div>
        ) : null}
      </div>

      {visible.length ? (
        <div
          ref={sliderRef}
          className="customer-stories-slider"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          {visible.map((item) => (
            <article key={item.id} className="customer-story-card">
              <div className="customer-story-person">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="customer-story-avatar"
                  />
                ) : (
                  <div className="customer-story-avatar customer-story-avatar-fallback">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <strong>{item.name}</strong>
                  {item.location ? <span>{item.location}</span> : null}
                </div>
              </div>

              <div
                className="customer-story-rating"
                aria-label={item.rating + " out of 5 stars"}
              >
                {"★".repeat(Math.max(1, Math.min(5, item.rating)))}
              </div>

              <blockquote>“{item.quote}”</blockquote>
            </article>
          ))}
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
              ? "Share your experience with this product."
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
            <label>
              <span>Rating</span>
              <select
                value={draft.rating}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    rating: Number(event.target.value),
                  }))
                }
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} star{rating === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </label>

            <label className="customer-story-photo-field">
              <span>Photo</span>
              <input type="file" accept="image/*" onChange={handleImage} />
            </label>
          </div>

          {draft.image ? (
            <div className="customer-story-photo-preview">
              <Image
                src={draft.image}
                alt="Story photo preview"
                width={48}
                height={48}
                unoptimized
              />
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({ ...current, image: "" }))
                }
              >
                Remove photo
              </button>
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
