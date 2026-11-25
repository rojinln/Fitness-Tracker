import "server-only";
import type { UserDTO } from "@/lib/domain";
import { prisma } from "../db";
import { hashPassword, verifyPassword } from "../password";

export async function emailExists(email: string): Promise<boolean> {
  return (await prisma.user.count({ where: { email } })) > 0;
}

/** Create a user with default settings in one go. */
export async function createUser(
  email: string,
  password: string,
  name: string,
): Promise<UserDTO> {
  const passwordHash = await hashPassword(password);
  return prisma.user.create({
    data: { email, passwordHash, name, settings: { create: {} } },
    select: { id: true, email: true, name: true },
  });
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<UserDTO | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  return { id: user.id, email: user.email, name: user.name };
}
