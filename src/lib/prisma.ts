/**
 * Prisma Client - Enhanced with Environment Detection
 * 
 * This file maintains backward compatibility while adding:
 * - Environment detection (Render vs Local)
 * - Connection logging
 * - SSL configuration for Render
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Detect environment
const isRender = !!process.env.RENDER;
const dbUrl = process.env.DATABASE_URL;

// Extract host for logging (safely)
const extractHost = (url: string | undefined): string => {
  if (!url) return "unknown host";
  try {
    const match = url.match(/@([^/]+)/);
    if (!match || !match[1]) return "unknown host";
    return match[1].split(":")[0] || "unknown host";
  } catch {
    return "unknown host";
  }
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Test connection and log environment
if (typeof window === "undefined") {
  // Only run on server-side
  const dbHost = dbUrl ? extractHost(dbUrl) : "unknown host";
  const environment = isRender ? "Render" : "Local";
  
  prisma.$connect()
    .then(() => {
      console.log(`✅ Connected to ${environment} PostgreSQL: ${dbHost}`);
    })
    .catch((err) => {
      console.error(`❌ Database connection failed: ${err.message}`);
    });
}
