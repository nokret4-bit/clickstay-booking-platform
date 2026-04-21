import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { hasPermission, normalizePermissions, PERMISSION_KEYS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/**
 * DEBUG ENDPOINT - Check user permissions and auth state
 * Remove in production!
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true,
        isActive: true,
      },
    });

    // Normalize permissions both ways to check for issues
    const sessionPermissions = session.user.permissions || {};
    const normalizedSessionPermissions = normalizePermissions(sessionPermissions);
    const normalizedDBPermissions = normalizePermissions(dbUser?.permissions);

    // Check each permission
    const permissionChecks = PERMISSION_KEYS.map((key) => ({
      permission: key,
      sessionValue: sessionPermissions[key] ?? null,
      dbValue: (dbUser?.permissions as Record<string, any>)?.[key] ?? null,
      normalizedSessionValue: normalizedSessionPermissions[key],
      normalizedDBValue: normalizedDBPermissions[key],
      hasAccess: hasPermission(session.user.role, sessionPermissions, key),
    }));

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
      session: {
        permissions: sessionPermissions,
        isActive: session.user.isActive,
      },
      database: {
        permissions: dbUser?.permissions,
        isActive: dbUser?.isActive,
      },
      normalized: {
        sessionPermissions: normalizedSessionPermissions,
        dbPermissions: normalizedDBPermissions,
      },
      permissionChecks,
      warnings: [
        sessionPermissions !== normalizedSessionPermissions
          ? "⚠️  Session permissions differ from normalized values"
          : null,
        JSON.stringify(sessionPermissions) !== JSON.stringify(normalizedDBPermissions)
          ? "⚠️  Session and DB permissions don't match"
          : null,
        !dbUser?.isActive ? "⚠️  User is marked inactive in database" : null,
      ].filter(Boolean),
    });
  } catch (error) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to debug permissions" },
      { status: 500 }
    );
  }
}
