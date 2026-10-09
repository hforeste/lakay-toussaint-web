import { expect, test } from "@playwright/test";
import { insertTestEvent, resetTestData } from "../support/test-database";

test.beforeEach(async () => {
  await resetTestData();
});

test("a visitor registers for a published event", async ({ page }) => {
  await insertTestEvent();
  await page.goto("/events/registration-test-event");

  await expect(page.getByText("Registration open", { exact: false }).first()).toBeVisible();
  await page.getByLabel(/First name/).fill("Marie");
  await page.getByLabel(/Last name/).fill("Toussaint");
  await page.getByRole("textbox", { name: "Imèl / Email *" }).fill("marie@example.com");
  await page.getByLabel(/Total attending/).fill("2");
  await page.getByRole("button", { name: /Complete registration/ }).click();

  await expect(page.getByRole("status")).toContainText("Your registration is confirmed.");
  await expect(page.getByLabel(/First name/)).toHaveValue("");
  await page.reload();
  await expect(page.getByText("8", { exact: true }).first()).toBeVisible();
});

test("the admin can authenticate and find a public registration", async ({ page, request }) => {
  const event = await insertTestEvent();
  const response = await request.post("http://127.0.0.1:3100/api/events/registration-test-event/registration", {
    data: {
      firstName: "Jean",
      lastName: "Baptiste",
      email: "jean@example.com",
      attendeeCount: 2,
      whatsappPhone: "",
      whatsappOptIn: false,
    },
  });
  expect(response.status()).toBe(201);
  const unauthorized = await request.post(`http://127.0.0.1:3101/api/events/${event.id}/registrations/query`, {
    data: {},
  });
  expect(unauthorized.status()).toBe(401);

  const login = await page.request.post("http://127.0.0.1:3101/api/login", {
    form: { password: "registration-test-admin-password" },
    maxRedirects: 0,
  });
  expect(login.status()).toBe(303);
  await page.goto("http://127.0.0.1:3101/");
  await expect(page.getByRole("heading", { name: "Events", exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Registration Test Event/ }).click();
  await page.getByRole("button", { name: "Registrations" }).click();
  await expect(page.getByText("jean@example.com")).toBeVisible();
  await page.getByPlaceholder("Name or email").fill("Baptiste");
  await expect(page.getByText("Jean Baptiste")).toBeVisible();
  await expect(page.getByText("2", { exact: true }).first()).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("registration-test-event-registrations.csv");
});

test("the admin rejects an invalid password", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/login");
  await page.getByLabel("Admin password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("alert")).toContainText("not valid");
});
