"use client";

import { useState } from "react";

export function CancelRegistrationButton({ slug, token }: { slug: string; token: string }) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  async function cancel() {
    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/events/${encodeURIComponent(slug)}/registration/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        },
      );
      const result = (await response.json()) as { ok: boolean; message: string };
      setMessage(result.message);
      setCancelled(result.ok);
    } catch {
      setMessage("The registration could not be cancelled. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        className="button primaryAction"
        type="button"
        disabled={submitting || cancelled}
        onClick={cancel}
      >
        {submitting ? "Cancelling..." : cancelled ? "Registration cancelled" : "Cancel registration"}
      </button>
      {message ? <p className="formStatus" role="status">{message}</p> : null}
    </div>
  );
}
