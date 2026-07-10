"use client";

import { useId, useState, type FormEvent } from "react";
import { initialSubmitState, type FormApiResponse, type SubmitState } from "./types";

async function parseResponse(response: Response): Promise<FormApiResponse> {
  try {
    return (await response.json()) as FormApiResponse;
  } catch {
    return {
      ok: false,
      message: "Something went wrong. Please try again.",
    };
  }
}

export function ContactForm() {
  const formId = useId();
  const [submitState, setSubmitState] = useState<SubmitState>(initialSubmitState);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ ...initialSubmitState, status: "submitting" });

    const form = event.currentTarget;
    const response = await fetch("/api/contact", {
      method: "POST",
      body: new FormData(form),
    });
    const result = await parseResponse(response);

    if (result.ok) {
      form.reset();
      setSubmitState({
        status: "success",
        message: result.message,
        fieldErrors: {},
      });
      return;
    }

    setSubmitState({
      status: "error",
      message: result.message,
      fieldErrors: result.fieldErrors ?? {},
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div role="status" aria-live="polite">
        {submitState.message}
      </div>

      <label htmlFor={`${formId}-name`}>Name</label>
      <input
        id={`${formId}-name`}
        name="name"
        type="text"
        autoComplete="name"
        required
        aria-invalid={Boolean(submitState.fieldErrors.name)}
        aria-describedby={submitState.fieldErrors.name ? `${formId}-name-error` : undefined}
      />
      {submitState.fieldErrors.name ? <p id={`${formId}-name-error`}>{submitState.fieldErrors.name}</p> : null}

      <label htmlFor={`${formId}-email`}>Email</label>
      <input
        id={`${formId}-email`}
        name="email"
        type="email"
        autoComplete="email"
        required
        aria-invalid={Boolean(submitState.fieldErrors.email)}
        aria-describedby={submitState.fieldErrors.email ? `${formId}-email-error` : undefined}
      />
      {submitState.fieldErrors.email ? <p id={`${formId}-email-error`}>{submitState.fieldErrors.email}</p> : null}

      <label htmlFor={`${formId}-subject`}>Subject</label>
      <input id={`${formId}-subject`} name="subject" type="text" />

      <label htmlFor={`${formId}-phone`}>Phone</label>
      <input id={`${formId}-phone`} name="phone" type="tel" autoComplete="tel" />

      <label htmlFor={`${formId}-message`}>Message</label>
      <textarea
        id={`${formId}-message`}
        name="message"
        required
        rows={5}
        aria-invalid={Boolean(submitState.fieldErrors.message)}
        aria-describedby={submitState.fieldErrors.message ? `${formId}-message-error` : undefined}
      />
      {submitState.fieldErrors.message ? (
        <p id={`${formId}-message-error`}>{submitState.fieldErrors.message}</p>
      ) : null}

      <label htmlFor={`${formId}-newsletter`}>
        <input id={`${formId}-newsletter`} name="newsletterOptIn" type="checkbox" />
        Sign me up for updates.
      </label>

      <button type="submit" disabled={submitState.status === "submitting"}>
        {submitState.status === "submitting" ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
