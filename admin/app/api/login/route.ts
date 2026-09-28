import { NextResponse } from "next/server";
import { ADMIN_COOKIE, passwordMatches, sessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");
  if (typeof password !== "string" || !passwordMatches(password)) {
    return NextResponse.redirect(new URL("/login?error=invalid", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(ADMIN_COOKIE, sessionToken(), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
