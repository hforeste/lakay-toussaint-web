"use client";

import { useState, type FormEvent, type ReactNode } from "react";

interface AsyncFormProps {
  action: string;
  submitLabel: string;
  successLabel?: string;
  children: ReactNode;
}

export function AsyncForm({
  action,
  submitLabel,
  successLabel = "Submitted",
  children,
}: AsyncFormProps) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const form = event.currentTarget;
    const response = await fetch(action, {
      method: "POST",
      body: new FormData(form),
    });
    const result = (await response.json()) as { message?: string };

    setStatus(response.ok ? "success" : "error");
    setMessage(result.message || "Something went wrong. Please try again.");
    setIsSubmitting(false);

    if (response.ok) {
      form.reset();
    }
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {children}
      <button className="button primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : status === "success" ? successLabel : submitLabel}
      </button>
      {message ? (
        <p className={status === "success" ? "formSuccess" : "formError"} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
