import { initializeApp, getApps } from "firebase/app";
import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-lakay-toussaint";
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

const runId = `runtime-${Date.now()}`;

async function main() {
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
  ];

  for (const write of writes) {
    await addDoc(collection(db, write.collectionName), {
      ...write.payload,
      runId,
      createdAt: serverTimestamp(),
    });
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        projectId,
        runId,
        collectionsWritten: writes.map((write) => write.collectionName),
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
