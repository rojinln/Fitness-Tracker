import "server-only";

/** Session-signing secret, as bytes for jose. Fails fast if misconfigured. */
export function getAuthSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set it in .env (see .env.example).",
    );
  }
  return new TextEncoder().encode(secret);
}

export const isProd = process.env.NODE_ENV === "production";
