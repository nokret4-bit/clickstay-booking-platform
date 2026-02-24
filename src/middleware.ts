import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;
  const searchParams = url.searchParams;

  // Read JWT in edge-safe way; requires NEXTAUTH_SECRET set
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const userRole = token?.role;

  // Pre-booking enforcement for facility browsing
  const PROTECTED_ROUTES = ["/browse", "/unit"];
  const PUBLIC_ROUTES = ["/", "/book", "/browse/availability", "/checkout", "/booking", "/admin", "/cashier", "/bookings", "/api", "/auth", "/_next", "/favicon.ico"];

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

  // Admin routes - only accessible by ADMIN role
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (userRole !== "ADMIN") {
      // Redirect staff to cashier dashboard, guests to homepage
      const redirectUrl = userRole === "STAFF" ? "/cashier" : "/";
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
  }

  // Cashier routes - accessible by ADMIN and STAFF
  if (pathname.startsWith("/cashier")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      return NextResponse.redirect(new URL("/", req.url));
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
