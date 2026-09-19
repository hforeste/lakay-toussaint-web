import type { PublicEvent } from "./types";

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        character
      ] || character,
  );
}

function eventDate(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(date);
}

async function sendEmail(message: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REGISTRATION_EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Registration email is not configured.");
    }

    console.info(`[email skipped in development] ${message.subject}`);
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": message.idempotencyKey,
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}.`);
  }

  return response.json();
}

export function sendRegistrationConfirmation({
  registrationId,
  email,
  firstName,
  attendeeCount,
  event,
  cancellationToken,
}: {
  registrationId: string;
  email: string;
  firstName: string;
  attendeeCount: number;
  event: PublicEvent;
  cancellationToken: string;
}) {
  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const cancelUrl = `${appUrl}/events/${encodeURIComponent(event.slug)}/registration/cancel?token=${encodeURIComponent(cancellationToken)}`;
  const date = eventDate(event.startsAt, event.timeZone);
  const safeName = escapeHtml(firstName);
  const safeTitle = escapeHtml(event.title);

  return sendEmail({
    to: email,
    subject: `Registration confirmed: ${event.title}`,
    idempotencyKey: `registration-confirmed-${registrationId}`,
    text: `Hi ${firstName}, your registration for ${event.title} is confirmed for ${attendeeCount} attendee(s). Date: ${date}. Location: ${event.locationName}. Cancel your registration: ${cancelUrl}`,
    html: `<p>Hi ${safeName},</p><p>Your registration for <strong>${safeTitle}</strong> is confirmed for ${attendeeCount} attendee(s).</p><p><strong>Date:</strong> ${escapeHtml(date)}<br><strong>Location:</strong> ${escapeHtml(event.locationName)}</p><p><a href="${escapeHtml(cancelUrl)}">Review or cancel your registration</a></p>`,
  });
}

export function sendCancellationConfirmation({
  registrationId,
  email,
  firstName,
  attendeeCount,
  eventTitle,
}: {
  registrationId: string;
  email: string;
  firstName: string;
  attendeeCount: number;
  eventTitle: string;
}) {
  return sendEmail({
    to: email,
    subject: `Registration cancelled: ${eventTitle}`,
    idempotencyKey: `registration-cancelled-${registrationId}`,
    text: `Hi ${firstName}, your registration for ${eventTitle} has been cancelled for ${attendeeCount} attendee(s).`,
    html: `<p>Hi ${escapeHtml(firstName)},</p><p>Your registration for <strong>${escapeHtml(eventTitle)}</strong> has been cancelled for ${attendeeCount} attendee(s).</p>`,
  });
}
