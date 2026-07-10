"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";

type EventStatus = "draft" | "published" | "archived";

interface AdminEvent {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  locationName: string;
  locationAddress: string;
  summary: string;
  description: string;
  rsvpUrl: string;
  status: EventStatus;
  order: number;
}

const emptyEvent: AdminEvent = {
  id: "",
  slug: "",
  title: "",
  startsAt: "",
  locationName: "",
  locationAddress: "",
  summary: "",
  description: "",
  rsvpUrl: "",
  status: "draft",
  order: 0,
};

export function AdminEventsClient() {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [draft, setDraft] = useState<AdminEvent>(emptyEvent);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const authHeader = useCallback(async (currentUser = user) => {
    if (!currentUser) {
      throw new Error("Please sign in first.");
    }

    return {
      Authorization: `Bearer ${await currentUser.getIdToken()}`,
    };
  }, [user]);

  const loadEvents = useCallback(async (currentUser = user, clearMessage = true) => {
    setIsLoading(true);
    if (clearMessage) {
      setMessage("");
    }

    try {
      const response = await fetch("/api/admin/events", {
        headers: await authHeader(currentUser),
      });
      const result = (await response.json()) as {
        ok: boolean;
        events?: AdminEvent[];
        message?: string;
      };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Could not load events.");
      }

      setEvents(result.events || []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not load events.");
    } finally {
      setIsLoading(false);
    }
  }, [authHeader, user]);

  useEffect(() => {
    try {
      setAuth(getClientAuth());
    } catch {
      setMessage("Firebase is not configured for admin sign-in yet.");
    }
  }, []);

  useEffect(() => {
    if (!auth) {
      return;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        void loadEvents(nextUser);
      } else {
        setEvents([]);
      }
    });
  }, [auth, loadEvents]);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      if (!auth) {
        throw new Error("Firebase is not configured for admin sign-in yet.");
      }
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Signed in.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Sign-in failed. Check the editor email and password.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/events", {
        method: draft.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeader()),
        },
        body: JSON.stringify(draft),
      });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Could not save event.");
      }

      setMessage(result.message || "Event saved.");
      setDraft(emptyEvent);
      await loadEvents(undefined, false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save event.");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteEvent(id: string) {
    if (!window.confirm("Delete this event?")) {
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/events", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(await authHeader()),
        },
        body: JSON.stringify({ id }),
      });
      const result = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.message || "Could not delete event.");
      }

      setMessage("Event deleted.");
      await loadEvents(undefined, false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete event.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateDraft(key: keyof AdminEvent, value: string) {
    setDraft((current) => ({
      ...current,
      [key]: key === "order" ? Number(value) : value,
      slug:
        key === "title" && !current.id
          ? slugify(value)
          : key === "slug"
            ? slugify(value)
            : current.slug,
    }));
  }

  if (!user) {
    return (
      <section className="section">
        <article className="card adminPanel">
          <h2>Editor sign in</h2>
          <p className="meta">
            Use the editor email/password created in Firebase Auth emulator or
            production Firebase Auth.
          </p>
          <form className="form" onSubmit={handleSignIn}>
            <label>
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button className="button primary" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
            {message ? <p role="status">{message}</p> : null}
          </form>
        </article>
      </section>
    );
  }

  return (
    <section className="section adminGrid">
      <div>
        <div className="sectionTitle">
          <h2>Manage events</h2>
          <p className="lead">
            Signed in as {user.email}. Create, edit, publish, archive, or delete
            event records.
          </p>
          <div className="actions">
            <button
              className="button secondary"
              type="button"
              onClick={() => {
                if (auth) {
                  void signOut(auth);
                }
              }}
            >
              Sign out
            </button>
            <button className="button secondary" type="button" onClick={() => loadEvents()}>
              Refresh
            </button>
          </div>
        </div>
        <div className="eventList">
          {events.length ? (
            events.map((event) => (
              <article className="card" key={event.id}>
                <h3>{event.title}</h3>
                <p className="meta">
                  {event.startsAt} | {event.status}
                </p>
                <p>{event.summary}</p>
                <div className="actions">
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => setDraft(event)}
                  >
                    Edit
                  </button>
                  <button
                    className="button secondary"
                    type="button"
                    onClick={() => deleteEvent(event.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          ) : (
            <article className="card">
              <h3>No events yet</h3>
              <p>Create the first event with the form.</p>
            </article>
          )}
        </div>
      </div>
      <article className="card">
        <h2>{draft.id ? "Edit event" : "Create event"}</h2>
        <form className="form" onSubmit={handleSave}>
          <label>
            Title
            <input
              name="title"
              required
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
            />
          </label>
          <label>
            Slug
            <input
              name="slug"
              required
              value={draft.slug}
              onChange={(event) => updateDraft("slug", event.target.value)}
            />
          </label>
          <label>
            Start date/time
            <input
              name="startsAt"
              placeholder="2026-09-07T18:00:00-07:00"
              required
              value={draft.startsAt}
              onChange={(event) => updateDraft("startsAt", event.target.value)}
            />
          </label>
          <label>
            Location name
            <input
              name="locationName"
              required
              value={draft.locationName}
              onChange={(event) => updateDraft("locationName", event.target.value)}
            />
          </label>
          <label>
            Location address
            <input
              name="locationAddress"
              value={draft.locationAddress}
              onChange={(event) => updateDraft("locationAddress", event.target.value)}
            />
          </label>
          <label>
            Summary
            <textarea
              name="summary"
              required
              rows={3}
              value={draft.summary}
              onChange={(event) => updateDraft("summary", event.target.value)}
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              required
              rows={5}
              value={draft.description}
              onChange={(event) => updateDraft("description", event.target.value)}
            />
          </label>
          <label>
            RSVP/ticket URL
            <input
              name="rsvpUrl"
              type="url"
              value={draft.rsvpUrl}
              onChange={(event) => updateDraft("rsvpUrl", event.target.value)}
            />
          </label>
          <div className="fieldGrid two">
            <label>
              Status
              <select
                name="status"
                value={draft.status}
                onChange={(event) =>
                  updateDraft("status", event.target.value as EventStatus)
                }
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              Display order
              <input
                name="order"
                type="number"
                value={draft.order}
                onChange={(event) => updateDraft("order", event.target.value)}
              />
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save event"}
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => setDraft(emptyEvent)}
            >
              Clear
            </button>
          </div>
          {message ? <p role="status">{message}</p> : null}
        </form>
      </article>
    </section>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
