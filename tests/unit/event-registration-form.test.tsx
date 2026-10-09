// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
import { CancelRegistrationButton } from "@/components/CancelRegistrationButton";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("EventRegistrationForm", () => {
  it("submits normalized form values and clears a successful form", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      message: "Your registration is confirmed.",
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    const user = userEvent.setup();
    render(<EventRegistrationForm slug="community-event" maxPartySize={3} />);

    await user.type(screen.getByLabelText(/First name/), "Marie");
    await user.type(screen.getByLabelText(/Email/), "marie@example.com");
    fireEvent.change(screen.getByLabelText(/Total attending/), { target: { value: "2" } });
    await user.click(screen.getByRole("button", { name: /Complete registration/ }));

    await screen.findByText("Your registration is confirmed.");
    const request = fetchMock.mock.calls[0];
    expect(request[0]).toBe("/api/events/community-event/registration");
    expect(JSON.parse(String((request[1] as RequestInit).body))).toMatchObject({
      firstName: "Marie",
      email: "marie@example.com",
      attendeeCount: 2,
    });
    expect(screen.getByLabelText(/First name/)).toHaveValue("");
  });

  it("renders server field errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      message: "Please correct the highlighted fields.",
      errors: { email: "Please enter a valid email address." },
    }), { status: 422, headers: { "Content-Type": "application/json" } }));
    const user = userEvent.setup();
    render(<EventRegistrationForm slug="community-event" maxPartySize={3} />);

    await user.click(screen.getByRole("button", { name: /Complete registration/ }));
    expect(await screen.findByText("Please enter a valid email address.")).toBeVisible();
    expect(screen.getByLabelText(/Email/)).toHaveAttribute("aria-invalid", "true");
  });
});

describe("CancelRegistrationButton", () => {
  it("cancels once and disables the action", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      message: "Your registration has been cancelled.",
    }), { headers: { "Content-Type": "application/json" } }));
    const user = userEvent.setup();
    render(<CancelRegistrationButton slug="community-event" token="opaque-token" />);

    await user.click(screen.getByRole("button", { name: "Cancel registration" }));
    await waitFor(() => expect(screen.getByRole("button")).toBeDisabled());
    expect(screen.getByRole("button")).toHaveTextContent("Registration cancelled");
    expect(screen.getByRole("status")).toHaveTextContent("Your registration has been cancelled.");
  });
});
