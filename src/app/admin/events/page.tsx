import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { AdminEventsClient } from "./AdminEventsClient";

export const metadata: Metadata = {
  title: "Admin Events",
  description: "Authenticated editor event management for LTCA.",
};

export default function AdminEventsPage() {
  return (
    <>
      <PageHeader eyebrow="Admin" title="Event management">
        Manage public event records without using scripts or the Firestore
        Console.
      </PageHeader>
      <AdminEventsClient />
    </>
  );
}
