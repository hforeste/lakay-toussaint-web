import { chromium } from "playwright-core";
import { readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const authHost = process.env.FIREBASE_AUTH_EMULATOR_HOST || "127.0.0.1:9099";
const appUrl = process.env.APP_URL || "http://127.0.0.1:3000";
const email = process.env.ADMIN_EMAIL || "editor@example.com";
const password = process.env.ADMIN_PASSWORD || "password123";
const runId = `ui-runtime-${Date.now()}`;
const initialTitle = `UI Runtime Event ${runId}`;
const updatedTitle = `UI Runtime Event Updated ${runId}`;

await createUserIfNeeded();

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || findCliChromiumExecutable(),
});
const page = await browser.newPage();

try {
  page.on("dialog", (dialog) => dialog.accept());

  await page.goto(`${appUrl}/admin/events`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("heading", { name: "Manage events" }).waitFor();

  await page.getByLabel("Title").fill(initialTitle);
  await page.getByLabel("Slug").fill(runId);
  await page.getByLabel("Start date/time").fill("2026-11-15T18:00:00-08:00");
  await page.getByLabel("Location name").fill("UI Runtime Venue");
  await page.getByLabel("Location address").fill("Seattle, WA");
  await page.getByLabel("Summary").fill("Created through the real admin UI.");
  await page
    .getByLabel("Description")
    .fill("This validates sign-in, create, edit, delete, and public read behavior through the browser UI.");
  await page.getByLabel("RSVP/ticket URL").fill("https://example.com/ui-runtime");
  await page.getByLabel("Status").selectOption("published");
  await page.getByLabel("Display order").fill("60");
  await page.getByRole("button", { name: "Save event" }).click();
  await page.getByRole("heading", { name: initialTitle }).waitFor();

  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: initialTitle }) })
    .getByRole("button", { name: "Edit" })
    .click();
  await page.getByRole("heading", { name: "Edit event" }).waitFor();
  await page.getByLabel("Slug").waitFor();
  await page.getByLabel("Title").fill(updatedTitle);
  await page.getByRole("button", { name: "Save event" }).click();
  await page.getByRole("heading", { name: updatedTitle }).waitFor();

  await page.goto(`${appUrl}/events`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: updatedTitle }).waitFor();

  await page.goto(`${appUrl}/admin/events`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Manage events" }).waitFor();
  await page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: updatedTitle }) })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.getByRole("heading", { name: updatedTitle }).waitFor({ state: "detached" });

  console.log(
    JSON.stringify(
      {
        ok: true,
        appUrl,
        email,
        eventId: runId,
        validations: [
          "signed in through admin UI",
          "created event through admin UI form",
          "edited event through admin UI form",
          "published event appeared on public Events page",
          "deleted event through admin UI",
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
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

function findCliChromiumExecutable() {
  const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
  const browsersRoot = join(projectRoot, ".playwright", "browsers");
  const shellFolder = readdirSync(browsersRoot).find((entry) =>
    entry.startsWith("chromium_headless_shell-"),
  );

  if (!shellFolder) {
    throw new Error(
      "Missing @playwright/cli Chromium shell. Run `npx playwright-cli install-browser chromium` first.",
    );
  }

  return join(browsersRoot, shellFolder, "chrome-headless-shell-win64", "chrome-headless-shell.exe");
}
