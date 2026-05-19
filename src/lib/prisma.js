import { PrismaClient } from "@prisma/client";

export const prisma = globalThis.__pawberryPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__pawberryPrisma = prisma;
}
