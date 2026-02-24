/**
 * Database Configuration for Local and Render Environments
 * 
 * Features:
 * - Auto-detects Render vs Local environment
 * - Supports both Prisma ORM and pg (node-postgres)
 * - Secure logging (no credentials exposed)
 * - SSL configuration for Render
 * - Connection testing and error handling
 */

import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

// ============================================
// Environment Detection
// ============================================

const dbUrl = process.env.DATABASE_URL;
const isRender = !!process.env.RENDER;
const usePrisma = process.env.USE_PRISMA !== "false"; // Default to Prisma

// ============================================
// Validation
// ============================================

if (!dbUrl) {
  console.error("❌ DATABASE_URL is missing. Please check your environment variables.");
  process.exit(1);
}

// Extract host for logging (safely)
const extractHost = (url: string): string => {
  try {
    const match = url.match(/@([^/]+)/);
    if (!match || !match[1]) return "unknown host";
    return match[1].split(":")[0] || "unknown host";
  } catch {
    return "unknown host";
  }
};

const dbHost = extractHost(dbUrl!); // Safe because we check for null above
const environment = isRender ? "Render" : "Local";

// ============================================
// Prisma Client Configuration
// ============================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient | undefined;

if (usePrisma) {
  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });

  // Prevent multiple instances in development
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  // Test Prisma connection
  prisma.$connect()
    .then(() => {
      console.log(`✅ Connected to ${environment} PostgreSQL (Prisma): ${dbHost}`);
    })
    .catch((err: Error) => {
      console.error(`❌ Prisma connection failed: ${err.message}`);
      process.exit(1);
    });
}

// ============================================
// pg (node-postgres) Configuration
// ============================================

let pool: Pool | undefined;

if (!usePrisma) {
  pool = new Pool({
    connectionString: dbUrl,
    ssl: isRender ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Test pg connection
  pool.query("SELECT 1")
    .then(() => {
      console.log(`✅ Connected to ${environment} PostgreSQL (pg): ${dbHost}`);
    })
    .catch((err: Error) => {
      console.error(`❌ pg connection failed: ${err.message}`);
      process.exit(1);
    });

  // Handle pool errors
  pool.on("error", (err: Error) => {
    console.error("❌ Unexpected database error:", err.message);
  });
}

// ============================================
// Exports
// ============================================

// Export Prisma client (primary) - ensure it's defined
if (!prisma && usePrisma) {
  throw new Error("Prisma client failed to initialize");
}

export { prisma };

// Export pg pool (if needed)
export { pool };

// Default export based on USE_PRISMA setting
const db = usePrisma ? prisma : pool;
export default db;

// Export utility to check connection
export const checkConnection = async (): Promise<boolean> => {
  try {
    if (usePrisma && prisma) {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } else if (pool) {
      await pool.query("SELECT 1");
      return true;
    }
    return false;
  } catch (err) {
    console.error("❌ Connection check failed:", err instanceof Error ? err.message : "Unknown error");
    return false;
  }
};

// Export environment info
export const dbInfo = {
  environment,
  host: dbHost,
  isRender,
  usePrisma,
};
