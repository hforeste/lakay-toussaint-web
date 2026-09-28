import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// Keep uploads in the event hero-image namespace. The id is either a database
// UUID or a generated id for an event that has not been saved yet.
const HERO_PATH = /^events\/(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|drafts\/[a-z0-9_-]{1,80})\/hero\/[a-z0-9][a-z0-9._-]{0,119}\.(?:jpe?g|png|webp)$/i;

function isAllowedHeroPath(pathname: string) {
  return HERO_PATH.test(pathname) && !pathname.includes("..") && pathname === pathname.trim();
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  try {
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname) => {
        if (!isAllowedHeroPath(pathname)) {
          throw new Error("Uploads must use an event hero-image path.");
        }

        return {
          allowedContentTypes: [...ALLOWED_CONTENT_TYPES],
          maximumSizeInBytes: MAX_IMAGE_SIZE,
          addRandomSuffix: true,
          allowOverwrite: false,
        };
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Blob upload request failed", error);
    return NextResponse.json({ error: "Unable to prepare the image upload." }, { status: 400 });
  }
}
