"use client";

import { FormEvent, ReactNode, useState } from "react";
import styles from "./know-your-rights.module.css";

type FormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  whatsappOptIn: boolean;
  attendeeCount: string;
  city: string;
  county: string;
  attendance: string;
  accommodations: string;
  mediaAcknowledgement: boolean;
};
type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  firstName: "", lastName: "", dateOfBirth: "", gender: "", email: "",
  phone: "", whatsappPhone: "", whatsappOptIn: false, attendeeCount: "1",
  city: "", county: "", attendance: "", accommodations: "",
  mediaAcknowledgement: false,
};

function Field({ label, error, id, required = true, children }: { label: string; error?: string; id: string; required?: boolean; children: ReactNode }) {
  return (
    <label>
      <span>{label} {required && <span aria-hidden="true">*</span>}</span>
      {children}
      {error && <span id={`${id}-error`} className={styles.fieldError} role="alert">{error}</span>}
    </label>
  );
}

export function RegistrationForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function error(field: keyof FormValues) { return errors[field]; }

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateForm() {
    const next: FormErrors = {};
    if (!values.firstName.trim()) next.firstName = "Prenon obligatwa / First name is required.";
    if (!values.lastName.trim()) next.lastName = "Siyati obligatwa / Last name is required.";
    if (!values.dateOfBirth) next.dateOfBirth = "Dat nesans obligatwa / Date of birth is required.";
    if (!values.gender) next.gender = "Chwazi yon opsyon / Please select an option.";
    if (!values.email.trim()) next.email = "Imèl obligatwa / Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = "Antre yon imèl ki valab / Enter a valid email address.";
    if (!values.phone.trim()) next.phone = "Nimewo telefòn obligatwa / Phone number is required.";
    else if (values.phone.replace(/\D/g, "").length < 10) next.phone = "Antre yon nimewo ki valab / Enter a valid phone number.";
    if (values.whatsappPhone && values.whatsappPhone.replace(/\D/g, "").length < 7) next.whatsappPhone = "Antre yon nimewo WhatsApp ki valab / Enter a valid WhatsApp number.";
    if (values.whatsappPhone && !values.whatsappOptIn) next.whatsappOptIn = "Bay konsantman pou mesaj WhatsApp / Consent is required for WhatsApp updates.";
    const count = Number(values.attendeeCount);
    if (!Number.isInteger(count) || count < 1 || count > 5) next.attendeeCount = "Ant 1 ak 5 patisipan / Enter 1 to 5 attendees.";
    if (!values.city.trim()) next.city = "Vil obligatwa / City is required.";
    if (!values.county.trim()) next.county = "Konte obligatwa / County is required.";
    if (!values.attendance) next.attendance = "Chwazi fason w ap patisipe / Please select how you will attend.";
    if (!values.mediaAcknowledgement) next.mediaAcknowledgement = "Ou dwe rekonèt avi foto ak medya a / Please acknowledge the Photo & Media Notice.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setSubmitted(false);
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/events/know-your-rights/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName, lastName: values.lastName, email: values.email,
          phone: values.phone, attendeeCount: Number(values.attendeeCount),
          whatsappPhone: values.whatsappPhone, whatsappOptIn: values.whatsappOptIn,
          dateOfBirth: values.dateOfBirth, gender: values.gender, city: values.city,
          county: values.county, attendanceMode: values.attendance,
          accommodations: values.accommodations, mediaAcknowledgement: values.mediaAcknowledgement,
        }),
      });
      const result = await response.json() as { ok?: boolean; message?: string; errors?: Record<string, string> };
      if (!response.ok || !result.ok) {
        const apiErrors = result.errors || {};
        if (apiErrors.attendanceMode && !apiErrors.attendance) apiErrors.attendance = apiErrors.attendanceMode;
        setErrors(apiErrors as FormErrors);
        setStatus(`Enskripsyon an pa fini / Registration could not be completed.${result.message ? ` ${result.message}` : ""}`);
        return;
      }
      setStatus(`Enskripsyon konfime / Registration confirmed.${result.message ? ` ${result.message}` : ""}`);
      setSubmitted(true);
      setValues(initialValues);
      setErrors({});
    } catch {
      setStatus("Enskripsyon an pa fini. Eseye ankò / Registration could not be completed. Please try again.");
    } finally { setSubmitting(false); }
  }

  function describedBy(field: keyof FormValues) { return error(field) ? `${field}-error` : undefined; }

  return (
    <form className={styles.registrationForm} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>
        <Field id="firstName" label="Prenon / First name" error={error("firstName")}>
          <input
            type="text"
            name="firstName"
            autoComplete="given-name"
            value={values.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            aria-invalid={Boolean(error("firstName"))}
            aria-describedby={describedBy("firstName")}
          />
        </Field>
        <Field id="lastName" label="Siyati / Last name" error={error("lastName")}>
          <input
            type="text"
            name="lastName"
            autoComplete="family-name"
            value={values.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            aria-invalid={Boolean(error("lastName"))}
            aria-describedby={describedBy("lastName")}
          />
        </Field>
        <Field id="dateOfBirth" label="Dat nesans / Date of birth" error={error("dateOfBirth")}>
          <input
            type="date"
            name="dateOfBirth"
            value={values.dateOfBirth}
            onChange={(e) => updateField("dateOfBirth", e.target.value)}
            aria-invalid={Boolean(error("dateOfBirth"))}
            aria-describedby={describedBy("dateOfBirth")}
          />
        </Field>
        <Field id="gender" label="Sèks / Gender" error={error("gender")}>
          <select
            name="gender"
            value={values.gender}
            onChange={(e) => updateField("gender", e.target.value)}
            aria-invalid={Boolean(error("gender"))}
            aria-describedby={describedBy("gender")}
          >
            <option value="">Chwazi / Select</option>
            <option value="female">Fi / Female</option>
            <option value="male">Gason / Male</option>
            <option value="nonbinary">Non-binè / Non-binary</option>
            <option value="other">Lòt / Other</option>
            <option value="prefer-not-to-say">Mwen prefere pa di / Prefer not to say</option>
          </select>
        </Field>
        <Field id="email" label="Imèl / Email" error={error("email")}>
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            aria-invalid={Boolean(error("email"))}
            aria-describedby={describedBy("email")}
          />
        </Field>
        <Field id="phone" label="Nimewo telefòn / Phone number" error={error("phone")}>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={values.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            aria-invalid={Boolean(error("phone"))}
            aria-describedby={describedBy("phone")}
          />
        </Field>
        <Field id="whatsappPhone" label="WhatsApp (opsyonèl / optional)" required={false} error={error("whatsappPhone")}>
          <input
            type="tel"
            name="whatsappPhone"
            autoComplete="tel"
            placeholder="+1 206 555 0100"
            value={values.whatsappPhone}
            onChange={(e) => updateField("whatsappPhone", e.target.value)}
            aria-invalid={Boolean(error("whatsappPhone"))}
            aria-describedby={describedBy("whatsappPhone")}
          />
        </Field>
        <Field id="attendeeCount" label="Kantite patisipan / Number of attendees" error={error("attendeeCount")}>
          <input
            type="number"
            name="attendeeCount"
            min={1}
            max={5}
            value={values.attendeeCount}
            onChange={(e) => updateField("attendeeCount", e.target.value)}
            aria-invalid={Boolean(error("attendeeCount"))}
            aria-describedby={describedBy("attendeeCount")}
          />
        </Field>
        <Field id="city" label="Vil / City" error={error("city")}>
          <input
            type="text"
            name="city"
            autoComplete="address-level2"
            value={values.city}
            onChange={(e) => updateField("city", e.target.value)}
            aria-invalid={Boolean(error("city"))}
            aria-describedby={describedBy("city")}
          />
        </Field>
        <Field id="county" label="Konte / County" error={error("county")}>
          <input
            type="text"
            name="county"
            value={values.county}
            onChange={(e) => updateField("county", e.target.value)}
            aria-invalid={Boolean(error("county"))}
            aria-describedby={describedBy("county")}
          />
        </Field>
      </div>

      <fieldset className={styles.attendanceFieldset}>
        <legend>Kijan w ap patisipe? / How will you attend? <span aria-hidden="true">*</span></legend>
        <label><input type="radio" name="attendance" value="in-person" checked={values.attendance === "in-person"} onChange={(e) => updateField("attendance", e.target.value)} /><span>An pèsòn / In person</span></label>
        <label><input type="radio" name="attendance" value="zoom" checked={values.attendance === "zoom"} onChange={(e) => updateField("attendance", e.target.value)} /><span>Zoom</span></label>
        {error("attendance") && <span id="attendance-error" className={styles.fieldError} role="alert">{error("attendance")}</span>}
      </fieldset>

      <label className={styles.fullField}>
        <span>Akomodasyon, entèpretasyon, oswa aksè / Accessibility, interpretation, or other accommodations</span>
        <textarea
          name="accommodations"
          rows={4}
          placeholder="Opsyonèl / Optional"
          value={values.accommodations}
          onChange={(e) => updateField("accommodations", e.target.value)}
        />
      </label>

      <div>
        <label className={styles.consent}>
          <input
            type="checkbox"
            name="whatsappOptIn"
            checked={values.whatsappOptIn}
            onChange={(e) => updateField("whatsappOptIn", e.target.checked)}
            aria-invalid={Boolean(error("whatsappOptIn"))}
            aria-describedby={describedBy("whatsappOptIn")}
          />
          <span>Mwen dakò resevwa mesaj WhatsApp sou evènman sa a. / I agree to receive WhatsApp messages about this event.</span>
        </label>
        {error("whatsappOptIn") && <span id="whatsappOptIn-error" className={styles.fieldError} role="alert">{error("whatsappOptIn")}</span>}
      </div>

      <div>
        <label className={styles.consent}>
          <input
            type="checkbox"
            name="mediaAcknowledgement"
            checked={values.mediaAcknowledgement}
            onChange={(e) => updateField("mediaAcknowledgement", e.target.checked)}
            aria-invalid={Boolean(error("mediaAcknowledgement"))}
            aria-describedby={describedBy("mediaAcknowledgement")}
          />
          <span>Mwen rekonèt foto, videyo, oswa odyo ka fèt pandan evènman an, epi mwen li Avi Foto ak Medya a. / I acknowledge that photography, video, or audio recording may take place during the event and that I have reviewed the Photo &amp; Media Notice.</span>
        </label>
        {error("mediaAcknowledgement") && <span id="mediaAcknowledgement-error" className={styles.fieldError} role="alert">{error("mediaAcknowledgement")}</span>}
      </div>

      <button className={styles.submitButton} type="submit" disabled={submitting}>
        {submitting ? "Enskripsyon an ap fèt / Registration in progress" : "Konplete enskripsyon / Complete registration"}
      </button>
      {status && <p className={styles.formStatus} role={submitted ? "status" : "alert"}>{status}</p>}
      <p className={styles.requiredNote}><span aria-hidden="true">*</span> Obligatwa / Required</p>
    </form>
  );
}
