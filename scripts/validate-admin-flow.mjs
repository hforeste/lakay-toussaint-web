const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const appUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const email = process.env.ADMIN_EMAIL || "editor@example.com";
const password = process.env.ADMIN_PASSWORD || "password123";
const runId = `admin-runtime-${Date.now()}`;

await createUserIfNeeded();
const idToken = await signIn();

const unauthenticated = await fetch(`${appUrl}/api/admin/events`);
assert(unauthenticated.status === 401, "Unauthenticated admin API should return 401.");

const adminPage = await fetch(`${appUrl}/admin/events`);
assert(adminPage.ok, "Admin events page should load.");
const adminHtml = await adminPage.text();
assert(adminHtml.includes("Event management"), "Admin events page should render heading.");

const created = await adminFetch("POST", {
  slug: runId,
  title: "Admin Runtime Event",
  startsAt: "2026-10-12T18:00:00-07:00",
  locationName: "Admin Runtime Venue",
  locationAddress: "Seattle, WA",
  summary: "Created through the authenticated admin event flow.",
  description:
    "This event verifies authenticated editor creation through the admin route used by the UI.",
  rsvpUrl: "https://example.com/admin-runtime",
  status: "published",
  order: 50,
});

assert(created.event?.id === runId, "Created event should use the slug as document id.");

const listAfterCreate = await adminFetch("GET");
assert(
  listAfterCreate.events.some((event) => event.id === runId),
  "Created event should appear in admin event list.",
);

await adminFetch("PUT", {
  ...created.event,
  title: "Admin Runtime Event Updated",
  summary: "Updated through the authenticated admin event flow.",
});

const listAfterUpdate = await adminFetch("GET");
assert(
  listAfterUpdate.events.some(
    (event) => event.id === runId && event.title === "Admin Runtime Event Updated",
  ),
  "Updated event should appear with edited title.",
);

const publicEventsPage = await fetch(`${appUrl}/events`);
assert(publicEventsPage.ok, "Public events page should load.");
const publicHtml = await publicEventsPage.text();
assert(
  publicHtml.includes("Admin Runtime Event Updated"),
  "Public Events page should render the published admin-created event.",
);

await adminFetch("DELETE", { id: runId });
const listAfterDelete = await adminFetch("GET");
assert(
  !listAfterDelete.events.some((event) => event.id === runId),
  "Deleted event should no longer appear in admin event list.",
);

console.log(
  JSON.stringify(
    {
      ok: true,
      appUrl,
      email,
      eventId: runId,
      validations: [
        "unauthenticated admin API rejected",
        "admin page loaded",
        "editor signed in through Firebase Auth emulator",
        "event created through admin API used by UI",
        "event updated through admin API used by UI",
        "published admin event appeared on public Events page",
        "event deleted through admin API used by UI",
      ],
    },
    null,
    2,
  ),
);
process.exit(0);

async function adminFetch(method, payload) {
  const response = await fetch(`${appUrl}/api/admin/events`, {
    method,
    headers: {
      Authorization: `Bearer ${idToken}`,
      ...(payload ? { "Content-Type": "application/json" } : {}),
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(result.message || `${method} admin request failed.`);
  }

  return result;
}

async function createUserIfNeeded() {
  const response = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  if (response.ok) {
    return;
  }

  const error = await response.json().catch(() => ({}));
  if (error?.error?.message !== "EMAIL_EXISTS") {
    throw new Error(error?.error?.message || "Could not create admin user.");
  }
}

async function signIn() {
  const response = await fetch(
    `http://${authHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result?.error?.message || "Could not sign in admin user.");
  }

  return result.idToken;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
