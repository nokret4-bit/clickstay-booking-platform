import type { Role } from "@prisma/client";

export const PERMISSION_KEYS = [
  "cashier",
  "view_bookings",
  "manage_bookings",
  "view_facilities",
  "manage_facilities",
  "view_reports",
  "manage_pricing",
  "manage_staff",
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];
export type PermissionMap = Record<PermissionKey, boolean>;

export const EMPTY_PERMISSIONS: PermissionMap = {
  cashier: false,
  view_bookings: false,
  manage_bookings: false,
  view_facilities: false,
  manage_facilities: false,
  view_reports: false,
  manage_pricing: false,
  manage_staff: false,
};

/**
 * Normalize permissions from any source (DB JSON, API, etc.)
 * Handles null, undefined, objects, strings, etc.
 * Returns a complete PermissionMap with all keys.
 */
export function normalizePermissions(raw: unknown): PermissionMap {
  // If raw is null or undefined, return empty permissions
  if (raw === null || raw === undefined) {
    return { ...EMPTY_PERMISSIONS };
  }

  // If it's a string (JSON), try to parse it
  let parsed: Record<string, unknown> = {};
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      // If JSON parse fails, treat as empty
      return { ...EMPTY_PERMISSIONS };
    }
  } else if (typeof raw === "object" && raw !== null) {
    // If it's already an object, use it directly
    parsed = raw as Record<string, unknown>;
  }

  // Build result with explicit type checking
  const result: PermissionMap = { ...EMPTY_PERMISSIONS };
  for (const key of PERMISSION_KEYS) {
    // Explicitly check for true value
    result[key] = parsed[key] === true;
  }

  return result;
}

export function hasPermission(
  role: Role | undefined,
  rawPermissions: unknown,
  permission: PermissionKey
): boolean {
  // ADMIN role always has all permissions
  if (role === "ADMIN") return true;
  
  // Only STAFF can have granular permissions
  if (role !== "STAFF") return false;
  
  // Normalize and check the specific permission
  const permissions = normalizePermissions(rawPermissions);
  return permissions[permission] === true;
}

export function getDefaultStaffLanding(rawPermissions: unknown): string {
  return "/dashboard";
}

export function getRequiredPermissionForPath(pathname: string): PermissionKey | null {
  if (pathname.startsWith("/cashier")) return "cashier";
  if (pathname.startsWith("/dashboard/reservations") || pathname.startsWith("/admin/reservations")) return "view_bookings";
  if (pathname.startsWith("/dashboard/facilities") || pathname.startsWith("/admin/facilities")) return "view_facilities";
  if (pathname.startsWith("/dashboard/reports") || pathname.startsWith("/admin/reports")) return "view_reports";
  if (pathname.startsWith("/dashboard/analytics") || pathname.startsWith("/admin/analytics")) return "view_reports";
  if (pathname.startsWith("/dashboard/activity-logs") || pathname.startsWith("/admin/activity-logs")) return "view_reports";
  if (pathname.startsWith("/dashboard/pricing") || pathname.startsWith("/admin/pricing")) return "manage_pricing";
  if (pathname.startsWith("/dashboard/staff") || pathname.startsWith("/admin/staff")) return "manage_staff";
  return null;
}

