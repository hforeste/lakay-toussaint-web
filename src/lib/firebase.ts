import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  getFirestore,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let emulatorConnected = false;

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

export async function submitToCollection(
  collectionName:
    | "contactSubmissions"
    | "businessSubmissions"
    | "volunteers",
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
