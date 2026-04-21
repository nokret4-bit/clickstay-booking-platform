import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getDefaultStaffLanding, getRequiredPermissionForPath, hasPermission } from "@/lib/permissions";

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  // Read JWT in edge-safe way; requires NEXTAUTH_SECRET set
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const userRole = token?.role;
  const userPermissions = token?.permissions;
  const isActive = token?.isActive ?? true;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const redirectUrl = new URL(pathname.replace("/admin", "/dashboard"), req.url);
    redirectUrl.search = url.search;
    return NextResponse.redirect(redirectUrl);
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const rewrittenPath = pathname.replace("/dashboard", "/admin");
    const rewrittenUrl = req.nextUrl.clone();
    rewrittenUrl.pathname = rewrittenPath;

    if (!isLoggedIn || !token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isActive) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!userRole) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (userRole === "STAFF") {
      const requiredPermission = getRequiredPermissionForPath(pathname);
      if (requiredPermission && !hasPermission(userRole, userPermissions, requiredPermission)) {
        return NextResponse.redirect(new URL(getDefaultStaffLanding(userPermissions), req.url));
      }
      if (!requiredPermission && pathname !== "/dashboard") {
        return NextResponse.redirect(new URL(getDefaultStaffLanding(userPermissions), req.url));
      }
    } else if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.rewrite(rewrittenUrl);
  }

  // Pre-booking enforcement for facility browsing
  const PROTECTED_ROUTES = ["/browse", "/unit"];
  const PUBLIC_ROUTES = ["/", "/book", "/browse/availability", "/checkout", "/booking", "/api", "/auth", "/_next", "/favicon.ico"];
  const ADMIN_ROUTES = ["/admin"];
  const STAFF_ROUTES = ["/cashier"];
  const AUTHENTICATED_ROUTES = ["/bookings"];

  // Check if the path is public
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // Special handling for /browse route - redirect to book
    if (pathname === "/browse") {
      return NextResponse.redirect(new URL("/book", req.url));
    }
    
    // Allow other public routes
    return NextResponse.next();
  }

  // Check if this is a protected route that requires pre-booking
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    // Allow access to availability page with proper parameters
    if (pathname.startsWith("/browse/availability")) {
      const checkIn = searchParams.get("checkIn");
      const checkOut = searchParams.get("checkOut");
      const category = searchParams.get("category");

      // If all required parameters are present, allow access
      if (checkIn && checkOut && category) {
        return NextResponse.next();
      }

      // Otherwise, redirect to booking page
      const redirectUrl = new URL("/book", req.url);
      redirectUrl.searchParams.set("redirect", pathname);
      redirectUrl.searchParams.set("message", "Please select your dates and category first");
      return NextResponse.redirect(redirectUrl);
    }

    // For unit pages, check if coming from availability or have proper parameters
    if (pathname.startsWith("/unit/")) {
      const referer = req.headers.get("referer");
      
      // Allow if coming from availability page or if it's a direct access with booking context
      if (referer && referer.includes("/browse/availability")) {
        return NextResponse.next();
      }
      
      // For direct access, redirect to booking page
      const redirectUrl = new URL("/book", req.url);
      redirectUrl.searchParams.set("redirect", pathname);
      redirectUrl.searchParams.set("message", "Please select your dates and category first");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Admin routes are redirected to /dashboard above
  if (pathname.startsWith("/admin")) {
    // If not logged in, redirect to login
    if (!isLoggedIn || !token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isActive) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Allow STAFF only for explicitly permission-mapped admin pages
    if (userRole === "STAFF") {
      const requiredPermission = getRequiredPermissionForPath(pathname);
      if (!requiredPermission || !hasPermission(userRole, userPermissions, requiredPermission)) {
        return NextResponse.redirect(new URL(getDefaultStaffLanding(userPermissions), req.url));
      }
      return NextResponse.next();
    }

    // If logged in but not ADMIN/STAFF, redirect home
    if (userRole && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    // If no role found, also redirect to login
    if (!userRole) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // User is ADMIN, allow access
    return NextResponse.next();
  }

  // Cashier routes - accessible by ADMIN and STAFF
  if (pathname.startsWith("/cashier")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!isActive) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (userRole === "STAFF" && !hasPermission(userRole, userPermissions, "cashier")) {
      return NextResponse.redirect(new URL(getDefaultStaffLanding(userPermissions), req.url));
    }
  }

  // Bookings routes - require login
  if (pathname.startsWith("/bookings") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
