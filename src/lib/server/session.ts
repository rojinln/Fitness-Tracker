import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { getAuthSecret } from "./env";

export const SESSION_COOKIE = "bloom_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
const ALG = "HS256";

export async function signSession(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: ALG })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getAuthSecret());
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
