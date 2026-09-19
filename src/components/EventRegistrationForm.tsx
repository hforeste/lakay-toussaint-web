"use client";

import { useState, type FormEvent } from "react";

type FieldErrors = Partial<
  Record<
    "firstName" | "lastName" | "email" | "attendeeCount" | "whatsappPhone" | "whatsappOptIn",
    string
  >
>;

export function EventRegistrationForm({
  slug,
  maxPartySize,
}: {
  slug: string;
  maxPartySize: number;
}) {
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setErrors({});
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/events/${encodeURIComponent(slug)}/registration`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          attendeeCount: Number(formData.get("attendeeCount")),
          whatsappPhone: formData.get("whatsappPhone"),
          whatsappOptIn: formData.get("whatsappOptIn") === "on",
        }),
      });
      const result = (await response.json()) as {
        ok: boolean;
        message: string;
        errors?: FieldErrors;
      };
      setMessage(result.message);
      setErrors(result.errors || {});

      if (result.ok) {
        form.reset();
      }
    } catch {
      setMessage("Registration could not be completed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="formPanel eventRegistrationForm" onSubmit={submit} noValidate>
      <h2>Register for this event</h2>
      <p>
        Registration details are used only to plan this event and communicate with you about it.
        They are deleted 90 days after the event.
      </p>
      <div className="formGrid">
        <label className="field">
          <span>First name *</span>
          <input name="firstName" autoComplete="given-name" required aria-invalid={Boolean(errors.firstName)} />
          {errors.firstName ? <small className="fieldError">{errors.firstName}</small> : null}
        </label>
        <label className="field">
          <span>Last name</span>
          <input name="lastName" autoComplete="family-name" />
        </label>
        <label className="field">
          <span>Email *</span>
          <input name="email" type="email" autoComplete="email" required aria-invalid={Boolean(errors.email)} />
          {errors.email ? <small className="fieldError">{errors.email}</small> : null}
        </label>
        <label className="field">
          <span>Total attending, including you *</span>
          <input
            name="attendeeCount"
            type="number"
            inputMode="numeric"
            min={1}
            max={maxPartySize}
            defaultValue={1}
            required
            aria-invalid={Boolean(errors.attendeeCount)}
          />
          {errors.attendeeCount ? <small className="fieldError">{errors.attendeeCount}</small> : null}
        </label>
        <label className="field formGridFull">
          <span>WhatsApp phone number</span>
          <input name="whatsappPhone" type="tel" autoComplete="tel" placeholder="+1 206 555 0100" aria-invalid={Boolean(errors.whatsappPhone)} />
          {errors.whatsappPhone ? <small className="fieldError">{errors.whatsappPhone}</small> : null}
        </label>
      </div>
      <label className="checkbox eventConsent">
        <input name="whatsappOptIn" type="checkbox" />
        <span>I agree to receive WhatsApp messages about this event.</span>
      </label>
      {errors.whatsappOptIn ? <small className="fieldError">{errors.whatsappOptIn}</small> : null}
      <button className="button primaryAction" type="submit" disabled={submitting}>
        {submitting ? "Registering..." : "Complete registration"}
      </button>
      {message ? <p className="formStatus" role="status">{message}</p> : null}
    </form>
  );
}
