import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";

function parseInactiveUntil(input: unknown): Date | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input !== "string") return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// GET - Fetch single facility
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasPermission(session.user.role, session.user.permissions, "view_facilities")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    if (!hasPermission(session.user.role, session.user.permissions, "manage_facilities")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const inactiveUntil = parseInactiveUntil(body.inactiveUntil);

    const facility = await prisma.facility.update({
      where: { id },
      data: {
        name: body.name,
        kind: body.kind,
        description: body.description,
        capacity: body.capacity,
        price: body.price,
        pricingType: body.pricingType || (body.kind === 'HALL' ? 'PER_HEAD' : 'PER_NIGHT'),
        photos: body.photos,
        amenities: body.amenities,
        rules: body.rules,
        freeAmenities: body.freeAmenities,
        extraAdultRate: body.extraAdultRate || null,
        extraChildRate: body.extraChildRate || null,
        isActive: body.isActive,
        inactiveUntil: body.isActive ? null : inactiveUntil,
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
    if (!hasPermission(session.user.role, session.user.permissions, "manage_facilities")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

// PATCH - Update only pricing fields
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
    // Staff with manage_pricing permission can update pricing
    if (!hasPermission(session.user.role, session.user.permissions, "manage_pricing")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { price, extraAdultRate, extraChildRate } = body;

    // Validate price
    if (price !== undefined && (price === null || price === "" || isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
      return NextResponse.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    const facility = await prisma.facility.update({
      where: { id },
      data: {
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(extraAdultRate !== undefined && { extraAdultRate: extraAdultRate ? parseFloat(extraAdultRate) : null }),
        ...(extraChildRate !== undefined && { extraChildRate: extraChildRate ? parseFloat(extraChildRate) : null }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(facility);
  } catch (error) {
    console.error("Admin facility PATCH error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to update pricing" },
      { status: 500 }
    );
  }
}
