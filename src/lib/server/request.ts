import "server-only";
import type { NextRequest } from "next/server";
import type { ZodType } from "zod";
import { QueryError } from "./http";

/** Parse + validate a JSON request body in one step. */
export async function parseBody<T>(
  req: NextRequest,
  schema: ZodType<T>,
): Promise<T> {
  const json = await req.json();
  return schema.parse(json);
}

/** Read a required query param or return a 400 (as a thrown response). */
export function requireQuery(req: NextRequest, key: string): string {
  const value = req.nextUrl.searchParams.get(key);
  if (!value) throw new QueryError(`Missing "${key}" query parameter`);
  return value;
}

export function optionalQuery(req: NextRequest, key: string): string | null {
  return req.nextUrl.searchParams.get(key);
}
