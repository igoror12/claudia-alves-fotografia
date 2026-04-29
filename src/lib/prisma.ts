import { PrismaClient } from "@prisma/client";

// Em dev, Next.js faz hot reload — sem este singleton, criava-se uma nova
// connection a cada reload e esgotava o pool da Postgres em segundos.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
