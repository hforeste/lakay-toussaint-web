import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  connectAuthEmulator,
  getAuth,
  type Auth,
} from "firebase/auth";
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
  type Firestore,
} from "firebase/firestore";
import { eventSeedRecords } from "../../data";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let emulatorConnected = false;
let authEmulatorConnected = false;

export function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

export function getFirebaseApp(): FirebaseApp {
  if (!hasFirebaseConfig()) {
    throw new Error(
      "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables.",
    );
  }

  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export function getDb(): Firestore {
  const db = getFirestore(getFirebaseApp());

  if (
    process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true" &&
    !emulatorConnected
  ) {
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    emulatorConnected = true;
  }

  return db;
}

export function getClientAuth(): Auth {
  const auth = getAuth(getFirebaseApp());

  if (
    process.env.NEXT_PUBLIC_FIREBASE_USE_EMULATOR === "true" &&
    !authEmulatorConnected
  ) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", {
      disableWarnings: true,
    });
    authEmulatorConnected = true;
  }

  return auth;
}

export interface PublicEvent {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  locationName: string;
  locationAddress: string;
  summary: string;
  description: string;
  rsvpUrl: string;
  status: "draft" | "published" | "archived";
  order: number;
}

export async function getEvents(): Promise<PublicEvent[]> {
  if (!hasFirebaseConfig()) {
    return eventSeedRecords.map((event) => ({ ...event }));
  }

  const eventsQuery = query(
    collection(getDb(), "events"),
    where("status", "==", "published"),
    orderBy("startsAt", "asc"),
  );
  const snapshot = await getDocs(eventsQuery);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Omit<PublicEvent, "id">;
    return { id: doc.id, ...data };
  });
}

export async function getEventBySlug(slug: string) {
  const events = await getEvents();
  return events.find((event) => event.slug === slug || event.id === slug);
}

export async function submitToCollection(
  collectionName:
    | "contactSubmissions"
    | "businessSubmissions"
    | "volunteers"
    | "eventRegistrations",
  payload: Record<string, unknown>,
) {
  if (!hasFirebaseConfig()) {
    throw new Error("Firebase is not configured for submissions.");
  }

  return addDoc(collection(getDb(), collectionName), {
    ...payload,
    createdAt: serverTimestamp(),
  });
}
