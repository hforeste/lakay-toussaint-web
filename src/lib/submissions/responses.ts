import { NextResponse } from "next/server";
import type { FieldErrors } from "./validation";

export type FormApiResponse = {
  ok: boolean;
  message: string;
  fieldErrors?: FieldErrors;
};

export function validationErrorResponse(fieldErrors: FieldErrors, message = "Please fix the highlighted fields.") {
  return NextResponse.json<FormApiResponse>(
    {
      ok: false,
      message,
      fieldErrors,
    },
    { status: 422 },
  );
}

export function successResponse(message: string, init?: ResponseInit) {
  return NextResponse.json<FormApiResponse>(
    {
      ok: true,
      message,
    },
    init,
  );
}

export function serverErrorResponse(message = "We could not send your request. Please try again.") {
  return NextResponse.json<FormApiResponse>(
    {
      ok: false,
      message,
    },
    { status: 500 },
  );
}
