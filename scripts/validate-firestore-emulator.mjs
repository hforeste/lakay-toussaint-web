import { initializeApp, getApps } from "firebase/app";
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  getDocs,
  getFirestore,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-lakay-toussaint";
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
      authDomain:
        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
        `${projectId}.firebaseapp.com`,
      projectId,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "demo-app-id",
    });

const db = getFirestore(app);
connectFirestoreEmulator(db, "127.0.0.1", 8080);
const adminApp = getAdminApps().length
  ? getAdminApps()[0]
  : initializeAdminApp({ projectId });
const adminDb = getAdminFirestore(adminApp);

const runId = `runtime-${Date.now()}`;

const events = [
  {
    id: `${runId}-taste-of-haiti`,
    slug: `${runId}-taste-of-haiti`,
    title: "Runtime Validation Event One",
    startsAt: "2026-09-07T18:00:00-07:00",
    locationName: "Runtime Test Venue",
    locationAddress: "Seattle, WA",
    summary: "Runtime validation event seeded into emulator Firestore.",
    description:
      "This event verifies that public event pages can be backed by Firebase event records.",
    rsvpUrl: "https://example.com/runtime-event-one",
    status: "published",
    order: 1,
  },
  {
    id: `${runId}-1804`,
    slug: `${runId}-1804`,
    title: "Runtime Validation Event Two",
    startsAt: "2027-01-01T18:00:00-08:00",
    locationName: "Runtime Test Hall",
    locationAddress: "Seattle, WA",
    summary: "Second runtime validation event seeded into emulator Firestore.",
    description:
      "This event verifies multiple Firebase event records can be read in date order.",
    rsvpUrl: "https://example.com/runtime-event-two",
    status: "published",
    order: 2,
  },
];

async function main() {
  for (const event of events) {
    await adminDb.collection("events").doc(event.id).set(event);
  }

  const eventSnapshot = await getDocs(
    query(
      collection(db, "events"),
      where("status", "==", "published"),
      orderBy("startsAt", "asc"),
    ),
  );
  const readEvents = eventSnapshot.docs
    .map((eventDoc) => eventDoc.data())
    .filter((event) => String(event.slug).startsWith(runId));

  assert(readEvents.length === 2, "Expected to read 2 seeded event records.");

  const writes = [
    {
      collectionName: "contactSubmissions",
      payload: {
        name: "Runtime Contact",
        email: "runtime-contact@example.com",
        reason: "Runtime validation",
        message: "Testing contactSubmissions write.",
      },
    },
    {
      collectionName: "businessSubmissions",
      payload: {
        businessName: "Runtime Business",
        contactName: "Runtime Owner",
        email: "runtime-business@example.com",
        category: "Professional services",
        description: "Testing businessSubmissions write.",
        consent: true,
        status: "new",
      },
    },
    {
      collectionName: "volunteers",
      payload: {
        name: "Runtime Volunteer",
        email: "runtime-volunteer@example.com",
        interests: ["Event day help"],
      },
    },
    {
      collectionName: "eventRegistrations",
      payload: {
        name: "Runtime Attendee",
        email: "runtime-attendee@example.com",
        eventId: events[0].id,
        attendees: 2,
      },
    },
  ];

  for (const write of writes) {
    const ref = await addDoc(collection(db, write.collectionName), {
      ...write.payload,
      runId,
      createdAt: serverTimestamp(),
    });
    const snapshot = await adminDb.collection(write.collectionName).doc(ref.id).get();
    assert(snapshot.exists, `Expected ${write.collectionName} write to exist.`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        projectId,
        runId,
        eventsRead: readEvents.length,
        collectionsWritten: writes.map((write) => write.collectionName),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
