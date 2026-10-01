"use client";

type Props = {
  value: number;
  onChange: (value: number) => void;
  theme?: "light" | "dark";
  label?: string;
};

export function StarRatingInput({
  value,
  onChange,
  theme = "light",
  label = "Rating",
}: Props) {
  const safeValue = Math.max(1, Math.min(5, value));

  return (
    <div
      className={`star-rating-input star-rating-input-${theme}`}
      role="group"
      aria-label={label}
    >
      <div className="star-rating-buttons">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={rating <= safeValue ? "active" : ""}
            aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
            aria-pressed={rating === safeValue}
            onClick={() => onChange(rating)}
          >
            <span aria-hidden="true">★</span>
          </button>
        ))}
      </div>

      <strong>{safeValue} / 5</strong>
    </div>
  );
}
