"use client";

import { FormEvent, useState } from "react";
import styles from "./know-your-rights.module.css";

type FormValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  city: string;
  county: string;
  attendance: string;
  accommodations: string;
  mediaAcknowledgement: boolean;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  email: "",
  phone: "",
  city: "",
  county: "",
  attendance: "",
  accommodations: "",
  mediaAcknowledgement: false,
};

export function RegistrationForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!values.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!values.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!values.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required.";
    }

    if (!values.gender) {
      nextErrors.gender = "Please select a gender option.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(values.email)) {
        nextErrors.email = "Enter a valid email address.";
      }
    }

    if (!values.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else {
      const digits = values.phone.replace(/\D/g, "");

      if (digits.length < 10) {
        nextErrors.phone = "Enter a valid phone number.";
      }
    }

    if (!values.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!values.county.trim()) {
      nextErrors.county = "County is required.";
    }

    if (!values.attendance) {
      nextErrors.attendance = "Please select how you will attend.";
    }

    if (!values.mediaAcknowledgement) {
      nextErrors.mediaAcknowledgement =
        "You must acknowledge the Photo & Media Notice.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    // Backend submission will be added later.
    console.log("Valid registration:", values);
  }

  function updateField<K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    // Remove the error as soon as the user starts correcting the field.
    if (errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }
  }

  return (
    <form
      className={styles.registrationForm}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.formGrid}>
        {/* First name */}
        <label>
          <span>
            First name <span aria-hidden="true">*</span>
          </span>

          <input
            type="text"
            name="firstName"
            autoComplete="given-name"
            value={values.firstName}
            onChange={(event) =>
              updateField("firstName", event.target.value)
            }
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={
              errors.firstName ? "firstName-error" : undefined
            }
          />

          {errors.firstName && (
            <span
              id="firstName-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.firstName}
            </span>
          )}
        </label>

        {/* Last name */}
        <label>
          <span>
            Last name <span aria-hidden="true">*</span>
          </span>

          <input
            type="text"
            name="lastName"
            autoComplete="family-name"
            value={values.lastName}
            onChange={(event) =>
              updateField("lastName", event.target.value)
            }
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={
              errors.lastName ? "lastName-error" : undefined
            }
          />

          {errors.lastName && (
            <span
              id="lastName-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.lastName}
            </span>
          )}
        </label>

        {/* Date of birth */}
        <label>
          <span>
            Date of birth <span aria-hidden="true">*</span>
          </span>

          <input
            type="date"
            name="dateOfBirth"
            value={values.dateOfBirth}
            onChange={(event) =>
              updateField("dateOfBirth", event.target.value)
            }
            aria-invalid={Boolean(errors.dateOfBirth)}
            aria-describedby={
              errors.dateOfBirth ? "dateOfBirth-error" : undefined
            }
          />

          {errors.dateOfBirth && (
            <span
              id="dateOfBirth-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.dateOfBirth}
            </span>
          )}
        </label>

        {/* Gender */}
        <label>
          <span>
            Gender <span aria-hidden="true">*</span>
          </span>

          <select
            name="gender"
            value={values.gender}
            onChange={(event) =>
              updateField("gender", event.target.value)
            }
            aria-invalid={Boolean(errors.gender)}
            aria-describedby={
              errors.gender ? "gender-error" : undefined
            }
          >
            <option value="">Select an option</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="nonbinary">Non-binary</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">
              Prefer not to say
            </option>
          </select>

          {errors.gender && (
            <span
              id="gender-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.gender}
            </span>
          )}
        </label>

        {/* Email */}
        <label>
          <span>
            Email address <span aria-hidden="true">*</span>
          </span>

          <input
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) =>
              updateField("email", event.target.value)
            }
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "email-error" : undefined
            }
          />

          {errors.email && (
            <span
              id="email-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.email}
            </span>
          )}
        </label>

        {/* Phone */}
        <label>
          <span>
            Phone number <span aria-hidden="true">*</span>
          </span>

          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={values.phone}
            onChange={(event) =>
              updateField("phone", event.target.value)
            }
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={
              errors.phone ? "phone-error" : undefined
            }
          />

          {errors.phone && (
            <span
              id="phone-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.phone}
            </span>
          )}
        </label>

        {/* City */}
        <label>
          <span>
            City <span aria-hidden="true">*</span>
          </span>

          <input
            type="text"
            name="city"
            autoComplete="address-level2"
            value={values.city}
            onChange={(event) =>
              updateField("city", event.target.value)
            }
            aria-invalid={Boolean(errors.city)}
            aria-describedby={
              errors.city ? "city-error" : undefined
            }
          />

          {errors.city && (
            <span
              id="city-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.city}
            </span>
          )}
        </label>

        {/* County */}
        <label>
          <span>
            County <span aria-hidden="true">*</span>
          </span>

          <input
            type="text"
            name="county"
            value={values.county}
            onChange={(event) =>
              updateField("county", event.target.value)
            }
            aria-invalid={Boolean(errors.county)}
            aria-describedby={
              errors.county ? "county-error" : undefined
            }
          />

          {errors.county && (
            <span
              id="county-error"
              className={styles.fieldError}
              role="alert"
            >
              {errors.county}
            </span>
          )}
        </label>
      </div>

      {/* Attendance */}
      <fieldset className={styles.attendanceFieldset}>
        <legend>
          How will you attend? <span aria-hidden="true">*</span>
        </legend>

        <label>
          <input
            type="radio"
            name="attendance"
            value="in-person"
            checked={values.attendance === "in-person"}
            onChange={(event) =>
              updateField("attendance", event.target.value)
            }
          />
          <span>In person</span>
        </label>

        <label>
          <input
            type="radio"
            name="attendance"
            value="zoom"
            checked={values.attendance === "zoom"}
            onChange={(event) =>
              updateField("attendance", event.target.value)
            }
          />
          <span>Zoom</span>
        </label>

        {errors.attendance && (
          <span
            className={styles.fieldError}
            role="alert"
          >
            {errors.attendance}
          </span>
        )}
      </fieldset>

      {/* Optional accommodations */}
      <label className={styles.fullField}>
        <span>
          Accessibility, interpretation, or other accommodations
        </span>

        <textarea
          name="accommodations"
          rows={4}
          placeholder="Optional"
          value={values.accommodations}
          onChange={(event) =>
            updateField("accommodations", event.target.value)
          }
        />
      </label>

      {/* Photo/media acknowledgment */}
      <div>
        <label className={styles.consent}>
          <input
            type="checkbox"
            name="mediaAcknowledgement"
            checked={values.mediaAcknowledgement}
            onChange={(event) =>
              updateField(
                "mediaAcknowledgement",
                event.target.checked,
              )
            }
          />

          <span>
            I acknowledge that photography, video, or audio recording may
            take place during the event and that I have reviewed the Photo
            &amp; Media Notice.
          </span>
        </label>

        {errors.mediaAcknowledgement && (
          <span
            className={styles.fieldError}
            role="alert"
          >
            {errors.mediaAcknowledgement}
          </span>
        )}
      </div>

      <button
        className={styles.submitButton}
        type="submit"
      >
        Complete Registration
      </button>

      <p className={styles.requiredNote}>
        <span aria-hidden="true">*</span> Required field
      </p>
    </form>
  );
}