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

export function BusinessForm() {
  const formId = useId();
  const [submitState, setSubmitState] = useState<SubmitState>(initialSubmitState);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ ...initialSubmitState, status: "submitting" });

    const form = event.currentTarget;
    const response = await fetch("/api/business-submissions", {
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

      <label htmlFor={`${formId}-businessName`}>Business name</label>
      <input
        id={`${formId}-businessName`}
        name="businessName"
        type="text"
        required
        aria-invalid={Boolean(submitState.fieldErrors.businessName)}
        aria-describedby={submitState.fieldErrors.businessName ? `${formId}-businessName-error` : undefined}
      />
      {submitState.fieldErrors.businessName ? (
        <p id={`${formId}-businessName-error`}>{submitState.fieldErrors.businessName}</p>
      ) : null}

      <label htmlFor={`${formId}-contactName`}>Contact name</label>
      <input
        id={`${formId}-contactName`}
        name="contactName"
        type="text"
        autoComplete="name"
        required
        aria-invalid={Boolean(submitState.fieldErrors.contactName)}
        aria-describedby={submitState.fieldErrors.contactName ? `${formId}-contactName-error` : undefined}
      />
      {submitState.fieldErrors.contactName ? (
        <p id={`${formId}-contactName-error`}>{submitState.fieldErrors.contactName}</p>
      ) : null}

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

      <label htmlFor={`${formId}-businessType`}>Business type</label>
      <input id={`${formId}-businessType`} name="businessType" type="text" />

      <label htmlFor={`${formId}-website`}>Website</label>
      <input id={`${formId}-website`} name="website" type="url" autoComplete="url" />

      <label htmlFor={`${formId}-phone`}>Phone</label>
      <input id={`${formId}-phone`} name="phone" type="tel" autoComplete="tel" />

      <label htmlFor={`${formId}-message`}>How would you like to partner?</label>
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
        {submitState.status === "submitting" ? "Sending..." : "Send partnership request"}
      </button>
    </form>
  );
}
