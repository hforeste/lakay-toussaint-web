import { initializeTestDatabase } from "../support/test-database";

export default async function globalSetup() {
  await initializeTestDatabase();
}
