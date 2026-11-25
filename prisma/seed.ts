import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/server/password";

const prisma = new PrismaClient();

/**
 * Seeds a demo account so you can log in immediately:
 *   email: demo@bloom.app   password: bloom1234
 * Built-in exercises are code constants, not DB rows, so nothing else to seed.
 */
async function main() {
  const email = "demo@bloom.app";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Demo user already exists (${email}).`);
    return;
  }
  const passwordHash = await hashPassword("bloom1234");
  await prisma.user.create({
    data: { email, name: "Demo", passwordHash, settings: { create: {} } },
  });
  console.log(`Seeded demo user → ${email} / bloom1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
