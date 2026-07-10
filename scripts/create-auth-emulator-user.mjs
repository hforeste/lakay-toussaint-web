const host = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-lakay-toussaint";
const email = process.env.ADMIN_EMAIL || "editor@example.com";
const password = process.env.ADMIN_PASSWORD || "password123";

const response = await fetch(
  `http://${host}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  },
);

if (response.ok) {
  const result = await response.json();
  console.log(JSON.stringify({ ok: true, projectId, email, uid: result.localId }, null, 2));
  process.exit(0);
}

const error = await response.json().catch(() => ({}));
const message = error?.error?.message || "Could not create editor user.";

if (message === "EMAIL_EXISTS") {
  console.log(JSON.stringify({ ok: true, projectId, email, alreadyExists: true }, null, 2));
  process.exit(0);
}

console.error(message);
process.exit(1);
