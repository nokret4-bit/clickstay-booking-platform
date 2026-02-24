import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

// GET - Fetch single facility
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const facility = await prisma.facility.findUnique({
      where: { id },
    });

    if (!facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 });
    }

    return NextResponse.json(facility);
  } catch (error) {
    console.error("Admin facility GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch facility" },
      { status: 500 }
    );
  }
}

// PUT - Update facility
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const facility = await prisma.facility.update({
      where: { id },
      data: {
        name: body.name,
        kind: body.kind,
        description: body.description,
        capacity: body.capacity,
        price: body.price,
        photos: body.photos,
        amenities: body.amenities,
        isActive: body.isActive,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error("Admin facility PUT error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update facility" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete facility
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

    // Soft delete - just set isActive to false
    const facility = await prisma.facility.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, facility });
  } catch (error) {
    console.error("Admin facility DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete facility" },
      { status: 500 }
    );
  }
}
