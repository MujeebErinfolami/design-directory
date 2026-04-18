import { PrismaClient } from "@prisma/client";
import path from "path";

// Prevent multiple Prisma Client instances during Next.js hot reload in development.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Resolve the database URL. DATABASE_URL from .env is preferred (production/CI).
// During local development and build, fall back to an absolute path so Next.js
// static generation (generateStaticParams) can reach the SQLite file regardless
// of the working directory Prisma happens to resolve the path from.
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  // Absolute path fallback for SQLite dev database
  return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: getDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
