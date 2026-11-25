import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AuthError } from "./auth";

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Thrown when a required query parameter is missing; mapped to HTTP 400. */
export class QueryError extends Error {
  constructor(message = "Bad request") {
    super(message);
    this.name = "QueryError";
  }
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status });
}

export function created<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 });
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function fail(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Wraps a route handler so thrown errors become consistent JSON responses.
 * Keeps every handler free of repetitive try/catch (no duplicated error logic).
 */
export async function handle(
  fn: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof AuthError) return fail("Unauthorized", 401);
    if (err instanceof NotFoundError) return fail(err.message, 404);
    if (err instanceof QueryError) return fail(err.message, 400);
    if (err instanceof SyntaxError) return fail("Invalid JSON body", 400);
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", issues: err.flatten() },
        { status: 422 },
      );
    }
    console.error("[api] unhandled error:", err);
    return fail("Something went wrong", 500);
  }
}
