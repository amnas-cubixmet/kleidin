"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        placeholder="Email address"
        required
        aria-label="Email address"
      />
      <button type="submit">{submitted ? "Subscribed" : "Subscribe"}</button>
    </form>
  );
}
