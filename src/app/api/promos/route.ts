import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - List active promos (public)
export async function GET() {
  try {
    const promos = await prisma.promo.findMany({
      where: { isActive: true },
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
