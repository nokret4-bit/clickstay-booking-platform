import { PrismaClient, FacilityKind, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding simplified database...");

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@clickstay.local" },
    update: {
      passwordHash: adminPassword,
      role: Role.ADMIN,
    },
    create: {
      id: "admin001",
      email: "admin@clickstay.local",
      name: "Admin User",
      role: Role.ADMIN,
      passwordHash: adminPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });
  console.log("✅ Created admin user:", admin.email);

  // Create facilities
  const facilities = [
    {
      id: "fac001",
      name: "Deluxe Room 101",
      kind: FacilityKind.ROOM,
      description: "Spacious deluxe room with king-size bed and ocean view",
      capacity: 2,
      price: 2500,
      photos: [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
      ],
      amenities: ["WiFi", "Air Conditioning", "TV", "Mini Fridge", "Hot Shower"],
    },
    {
      id: "fac002",
      name: "Standard Room 102",
      kind: FacilityKind.ROOM,
      description: "Cozy standard room with queen-size bed",
      capacity: 2,
      price: 2000,
      photos: ["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800"],
      amenities: ["WiFi", "Air Conditioning", "TV", "Hot Shower"],
    },
    {
      id: "fac003",
      name: "Family Suite 103",
      kind: FacilityKind.ROOM,
      description: "Large family suite with two queen beds",
      capacity: 4,
      price: 3500,
      photos: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"],
      amenities: ["WiFi", "Air Conditioning", "TV", "Mini Fridge", "Hot Shower", "Living Area"],
    },
    {
      id: "fac004",
      name: "Premium Cottage A",
      kind: FacilityKind.COTTAGE,
      description: "Premium cottage with direct pool access",
      capacity: 8,
      price: 6500,
      photos: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
      amenities: ["Pool Access", "BBQ Grill", "Outdoor Seating", "WiFi", "Refrigerator", "Kitchen"],
    },
    {
      id: "fac005",
      name: "Standard Cottage B",
      kind: FacilityKind.COTTAGE,
      description: "Standard cottage near the pool area",
      capacity: 6,
      price: 5000,
      photos: ["https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800"],
      amenities: ["Pool Access", "BBQ Grill", "WiFi", "Refrigerator"],
    },
    {
      id: "fac006",
      name: "Grand Function Hall",
      kind: FacilityKind.HALL,
      description: "Elegant function hall perfect for weddings and corporate events",
      capacity: 100,
      price: 15000,
      photos: ["https://images.unsplash.com/photo-1519167758481-83f29da8c2b0?w=800"],
      amenities: [
        "Sound System",
        "Projector & Screen",
        "Stage",
        "Tables & Chairs for 100",
        "Air Conditioning",
        "Kitchen Access",
      ],
    },
  ];

  for (const facility of facilities) {
    await prisma.facility.upsert({
      where: { id: facility.id },
      update: { ...facility, updatedAt: new Date() },
      create: { ...facility, createdAt: new Date(), updatedAt: new Date() },
    });
  }

  console.log(`✅ Created ${facilities.length} facilities`);
  console.log("\n🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
