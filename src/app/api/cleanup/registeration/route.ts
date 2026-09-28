import { DatabaseConfigurationError } from "@/lib/database";
import { deleteExpiredRegistrationData } from "@/lib/events/repository";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

async function cleanup(request: Request) {
  if (!authorized(request)) {
    return Response.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const deletedRegistrations = await deleteExpiredRegistrationData();
    return Response.json({ ok: true, deletedRegistrations });
  } catch (error) {
    if (error instanceof DatabaseConfigurationError) {
      return Response.json(
        { ok: false, message: "DATABASE_URL is not configured." },
        { status: 503 },
      );
    }

    console.error("Registration cleanup failed.", error);
    return Response.json(
      { ok: false, message: "Registration cleanup failed." },
      { status: 500 },
    );
  }
}

export const GET = cleanup;
export const POST = cleanup;
