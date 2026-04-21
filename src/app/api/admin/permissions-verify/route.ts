import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import { hasPermission, normalizePermissions } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

/**
 * ADMIN-ONLY ENDPOINT - Verify and fix staff permissions
 * Only admins can use this to check and repair permission data
 * Remove or restrict access in production
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all STAFF users and check their permissions
    const staffUsers = await prisma.user.findMany({
      where: { role: "STAFF" },
      select: {
        id: true,
        email: true,
        name: true,
        permissions: true,
      },
    });

    const analysis = staffUsers.map((user) => {
      const raw = user.permissions;
      const normalized = normalizePermissions(raw);
      const hasIssue = JSON.stringify(raw) !== JSON.stringify(normalized);
      
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        rawPermissions: raw,
        normalizedPermissions: normalized,
        hasIssue,
      };
    });

    const issuesFound = analysis.filter((a) => a.hasIssue).length;

    return NextResponse.json({
      totalStaffUsers: staffUsers.length,
      issuesFound,
      users: analysis,
      message: issuesFound > 0 ? `Found ${issuesFound} users with permission issues. Call POST to fix.` : "All permissions look good!",
    });
  } catch (error) {
    console.error("Permission verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify permissions" },
      { status: 500 }
    );
  }
}

/**
 * POST - Fix all staff permission issues
 * Normalizes permissions for all STAFF users
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all STAFF users
    const staffUsers = await prisma.user.findMany({
      where: { role: "STAFF" },
      select: { id: true, permissions: true },
    });

    let fixedCount = 0;

    // Normalize and fix each user's permissions
    for (const user of staffUsers) {
      const normalized = normalizePermissions(user.permissions);
      
      // Update the user with normalized permissions
      await prisma.user.update({
        where: { id: user.id },
        data: { permissions: normalized },
      });
      
      fixedCount++;
    }

    // Log the fix action
    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_STAFF",
          entity: "User",
          entityId: "BULK",
          data: { bulkFixPermissions: true, usersFixed: fixedCount },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Fixed permissions for ${fixedCount} staff users`,
      fixedCount,
    });
  } catch (error) {
    console.error("Permission fix error:", error);
    return NextResponse.json(
      { error: "Failed to fix permissions" },
      { status: 500 }
    );
  }
}
