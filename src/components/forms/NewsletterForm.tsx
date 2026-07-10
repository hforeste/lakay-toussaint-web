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

export function NewsletterForm() {
  const formId = useId();
  const [submitState, setSubmitState] = useState<SubmitState>(initialSubmitState);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ ...initialSubmitState, status: "submitting" });

    const form = event.currentTarget;
    const response = await fetch("/api/newsletter", {
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

      <label htmlFor={`${formId}-firstName`}>First name</label>
      <input id={`${formId}-firstName`} name="firstName" type="text" autoComplete="given-name" />

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

      <button type="submit" disabled={submitState.status === "submitting"}>
        {submitState.status === "submitting" ? "Signing up..." : "Sign up"}
      </button>
    </form>
  );
}
