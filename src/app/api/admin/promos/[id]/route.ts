import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT - Update promo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const body = await request.json();
    const { title, description, mediaUrl, mediaType, bgColor, facilityLink, isActive, order } = body;

    // Get old promo data for comparison
    const oldPromo = await prisma.promo.findUnique({
      where: { id },
    });

    const promo = await prisma.promo.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(mediaUrl !== undefined && { mediaUrl }),
        ...(mediaType !== undefined && { mediaType }),
        ...(bgColor && { bgColor }),
        ...(facilityLink !== undefined && { facilityLink }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
    });

    // Determine action type
    let action = "UPDATED";
    let details = `Updated promo media`;
    
    if (oldPromo && isActive !== undefined && oldPromo.isActive !== isActive) {
      action = isActive ? "ACTIVATED" : "DEACTIVATED";
      details = `${action.toLowerCase()} promo`;
    } else if (mediaUrl !== undefined && oldPromo?.mediaUrl !== mediaUrl) {
      const typeLabel = mediaType === 'VIDEO' ? 'video' : 'image';
      details = mediaUrl ? `Uploaded new ${typeLabel}` : `Removed ${typeLabel}`;
    }

    // Log activity
    await prisma.promoActivity.create({
      data: {
        promoId: promo.id,
        action,
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        details,
      },
    });

    return NextResponse.json(promo);
  } catch (error) {
    console.error("Error updating promo:", error);
    return NextResponse.json(
      { error: "Failed to update promo" },
      { status: 500 }
    );
  }
}

// DELETE - Delete promo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get promo data before deletion
    const promo = await prisma.promo.findUnique({
      where: { id },
    });

    if (!promo) {
      return NextResponse.json({ error: "Promo not found" }, { status: 404 });
    }

    // Log activity before deletion
    await prisma.promoActivity.create({
      data: {
        promoId: id,
        action: "DELETED",
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        details: `Deleted promo ${promo.mediaType === 'VIDEO' ? 'video' : 'image'}`,
      },
    });

    await prisma.promo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting promo:", error);
    return NextResponse.json(
      { error: "Failed to delete promo" },
      { status: 500 }
    );
  }
}
