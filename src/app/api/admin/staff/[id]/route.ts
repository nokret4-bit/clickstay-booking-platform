import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { hasPermission, normalizePermissions } from "@/lib/permissions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasPermission(session.user.role, session.user.permissions, "manage_staff")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, isActive, permissions } = body;

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: {
        name,
        isActive,
        ...(permissions !== undefined && { permissions: normalizePermissions(permissions) }),
      },
    });

    // Log audit
    if (session?.user?.id) {
      const auditData: Record<string, unknown> = { name, isActive };
      if (permissions !== undefined) {
        auditData.permissions = normalizePermissions(permissions);
      }
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "UPDATE_STAFF",
          entity: "User",
          entityId: user.id,
          data: auditData,
        },
      });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update staff error:", error);
    return NextResponse.json(
      { error: "Failed to update staff account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasPermission(session.user.role, session.user.permissions, "manage_staff")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent deleting yourself
    if (id === session?.user?.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    // Log audit
    if (session?.user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "DELETE_STAFF",
          entity: "User",
          entityId: id,
          data: {},
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete staff error:", error);
    return NextResponse.json(
      { error: "Failed to delete staff account" },
      { status: 500 }
    );
  }
}
