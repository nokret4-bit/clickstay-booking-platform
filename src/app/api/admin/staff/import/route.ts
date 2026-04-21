import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { hasPermission } from "@/lib/permissions";

interface StaffRow {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  isActive?: boolean | string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasPermission(session.user.role, session.user.permissions, "manage_staff")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls") && !file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Invalid file format. Please upload an Excel or CSV file." },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    
    if (!sheetName) {
      return NextResponse.json(
        { error: "No sheets found in the uploaded file" },
        { status: 400 }
      );
    }
    
    const worksheet = workbook.Sheets[sheetName];
    
    if (!worksheet) {
      return NextResponse.json(
        { error: "Unable to read the worksheet" },
        { status: 400 }
      );
    }
    
    const data = XLSX.utils.sheet_to_json<StaffRow>(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No data found in the uploaded file" },
        { status: 400 }
      );
    }

    // Validate required columns
    const requiredColumns = ["name", "email", "password", "role"];
    const firstRow = data[0];
    
    if (!firstRow) {
      return NextResponse.json(
        { error: "File appears to be empty" },
        { status: 400 }
      );
    }
    
    const rowKeys = Object.keys(firstRow).map(k => k.toLowerCase());
    const missingColumns = requiredColumns.filter(
      (col) => !rowKeys.includes(col.toLowerCase())
    );

    if (missingColumns.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required columns: ${missingColumns.join(", ")}. Required: Name, Email, Password, Role`,
        },
        { status: 400 }
      );
    }

    // Process and validate data
    const errors: string[] = [];
    const successfulImports: any[] = [];
    const createdUsers: any[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row) {
        continue;
      }
      
      const rowNumber = i + 2; // +2 because Excel is 1-indexed and we skip header

      try {
        // Validate required fields
        const name = String(row.name || "").trim();
        const email = String(row.email || "").trim().toLowerCase();
        const password = String(row.password || "").trim();
        const role = String(row.role || "STAFF").trim().toUpperCase();
        const isActive = row.isActive === undefined ? true : String(row.isActive).toLowerCase() !== "false";

        // Validation
        if (!name) {
          errors.push(`Row ${rowNumber}: Name is required`);
          continue;
        }

        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          errors.push(`Row ${rowNumber}: Valid email is required`);
          continue;
        }

        if (!password || password.length < 8) {
          errors.push(`Row ${rowNumber}: Password must be at least 8 characters`);
          continue;
        }

        if (!["ADMIN", "STAFF"].includes(role)) {
          errors.push(`Row ${rowNumber}: Role must be either "ADMIN" or "STAFF"`);
          continue;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          errors.push(`Row ${rowNumber}: Email "${email}" already exists`);
          continue;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            name,
            email,
            passwordHash,
            role: role as "ADMIN" | "STAFF",
            isActive,
            updatedAt: new Date(),
          },
        });

        // Log audit
        await prisma.auditLog.create({
          data: {
            userId: session.user?.id || "system",
            action: "IMPORT_STAFF",
            entity: "User",
            entityId: user.id,
            data: { email, source: "bulk_import" },
          },
        });

        createdUsers.push({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        });

        successfulImports.push({
          name,
          email,
          role,
          status: "Created successfully",
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Row ${rowNumber}: Failed to import - ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: data.length,
        successful: successfulImports.length,
        failed: errors.length,
      },
      successfulImports,
      errors: errors.length > 0 ? errors : undefined,
      createdUsers,
    });
  } catch (error) {
    console.error("Staff import error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to import staff data",
      },
      { status: 500 }
    );
  }
}
