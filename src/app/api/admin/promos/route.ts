import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - List all promos
export async function GET() {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(promos);
  } catch (error) {
    console.error("Error fetching promos:", error);
    return NextResponse.json(
      { error: "Failed to fetch promos" },
      { status: 500 }
    );
  }
}

// POST - Create new promo
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, mediaUrl, mediaType, bgColor, facilityLink, isActive, order } = body;

    if (!mediaUrl) {
      return NextResponse.json(
        { error: "Media is required" },
        { status: 400 }
      );
    }

    const promo = await prisma.promo.create({
      data: {
        title,
        description,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || "IMAGE",
        bgColor: bgColor || "from-amber-100 to-yellow-50",
        facilityLink: facilityLink || null,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    });

    // Log activity
    await prisma.promoActivity.create({
      data: {
        promoId: promo.id,
        action: "CREATED",
        userId: session.user.id,
        userName: session.user.name || session.user.email,
        details: `Created new promo with ${mediaType === 'VIDEO' ? 'video' : 'image'}`,
      },
    });

    return NextResponse.json(promo, { status: 201 });
  } catch (error) {
    console.error("Error creating promo:", error);
    return NextResponse.json(
      { error: "Failed to create promo" },
      { status: 500 }
    );
  }
}
