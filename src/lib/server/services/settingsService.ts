import "server-only";
import type { SettingsDTO } from "@/lib/domain";
import type { SettingsUpdateInput } from "@/lib/validation/schemas";
import { prisma } from "../db";
import { toSettingsDTO } from "../mappers";

async function getRow(userId: string) {
  const existing = await prisma.settings.findUnique({ where: { userId } });
  return existing ?? prisma.settings.create({ data: { userId } });
}

export async function getSettings(userId: string): Promise<SettingsDTO> {
  return toSettingsDTO(await getRow(userId));
}

export async function updateSettings(
  userId: string,
  patch: SettingsUpdateInput,
): Promise<SettingsDTO> {
  await getRow(userId); // ensure a row exists before updating
  const updated = await prisma.settings.update({ where: { userId }, data: patch });
  return toSettingsDTO(updated);
}
