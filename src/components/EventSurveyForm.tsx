"use client";

import { useState, type FormEvent } from "react";
import type { PublicSurvey } from "@/lib/events/surveys";

export function EventSurveyForm({ survey }: { survey: PublicSurvey }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const answers: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
    for (const question of survey.questions) {
      answers[question.id] = question.type === "multiple_choice" ? formData.getAll(question.id) : formData.get(question.id) || "";
    }
    setSubmitting(true);
    setErrors({});
    setMessage("");
    try {
      const response = await fetch(`/api/events/${encodeURIComponent(survey.eventSlug)}/surveys/${encodeURIComponent(survey.slug)}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respondent: {
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            email: formData.get("email"),
            phone: formData.get("phone"),
          },
          answers,
          website: formData.get("website"),
        }),
      });
      const result = await response.json() as { ok: boolean; message: string; errors?: Record<string, string> };
      setMessage(result.message);
      setErrors(result.errors || {});
      if (result.ok) {
        form.reset();
        setSubmitted(true);
      }
    } catch {
      setMessage("Your response could not be saved. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return <div className="surveyThanks" role="status"><span aria-hidden="true">✓</span><h2>Mèsi / Thank you!</h2><p>{message}</p></div>;
  }

  return (
    <form className="eventSurveyForm" onSubmit={submit} noValidate>
      <fieldset className="surveyRespondent">
        <legend><span aria-hidden="true">i</span>Your information</legend>
        <p>First name is required. The remaining contact details are optional and securely stored.</p>
        <div className="formGrid">
          <label className="field"><span>First name *</span><input name="firstName" autoComplete="given-name" maxLength={80} required aria-invalid={Boolean(errors.firstName)} />{errors.firstName ? <small className="fieldError">{errors.firstName}</small> : null}</label>
          <label className="field"><span>Last name (optional)</span><input name="lastName" autoComplete="family-name" maxLength={80} /></label>
          <label className="field"><span>Email (optional)</span><input name="email" type="email" autoComplete="email" maxLength={254} aria-invalid={Boolean(errors.email)} />{errors.email ? <small className="fieldError">{errors.email}</small> : null}</label>
          <label className="field"><span>Phone number (optional)</span><input name="phone" type="tel" autoComplete="tel" maxLength={30} aria-invalid={Boolean(errors.phone)} />{errors.phone ? <small className="fieldError">{errors.phone}</small> : null}</label>
        </div>
      </fieldset>
      {survey.questions.map((question, index) => (
        <fieldset className="surveyQuestion" key={question.id}>
          <legend><span>{index + 1}</span>{question.prompt}{question.required ? " *" : ""}</legend>
          {question.type === "short_text" || question.type === "email" ? (
            <input name={question.id} type={question.type === "email" ? "email" : "text"} maxLength={2000} required={question.required} aria-invalid={Boolean(errors[question.id])} />
          ) : question.type === "long_text" ? (
            <textarea name={question.id} rows={5} maxLength={2000} required={question.required} aria-invalid={Boolean(errors[question.id])} />
          ) : question.type === "rating" ? (
            <div className="surveyRating">
              {[1, 2, 3, 4, 5].map((rating) => <label key={rating}><input name={question.id} type="radio" value={rating} required={question.required} /><span>{rating}<small>{rating === 1 ? "Low" : rating === 5 ? "Excellent" : ""}</small></span></label>)}
            </div>
          ) : (
            <div className="surveyChoices">
              {question.options.map((option) => <label key={option}><input name={question.id} type={question.type === "multiple_choice" ? "checkbox" : "radio"} value={option} required={question.required && question.type === "single_choice"} /><span>{option}</span></label>)}
            </div>
          )}
          {errors[question.id] ? <small className="fieldError">{errors[question.id]}</small> : null}
        </fieldset>
      ))}
      <label className="feedbackHoneypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      <button className="button primaryAction" type="submit" disabled={submitting}>{submitting ? "Submitting…" : "Submit response"}</button>
      {message ? <p className="formStatus" role="status">{message}</p> : null}
    </form>
  );
}
