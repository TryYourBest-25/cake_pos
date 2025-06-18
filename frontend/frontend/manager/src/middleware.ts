import { NextRequest, NextResponse } from "next/server";

/**
 * Routes cần xác thực
 */
const protectedRoutes = [
  "/dashboard",
  "/users",
  "/products",
  "/orders",
  "/reports",
  "/settings",
];

/**
 * Routes chỉ dành cho guest (chưa đăng nhập)
 */
const guestOnlyRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

/**
 * Public routes (không cần xác thực)
 */
const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Tạm thời disable middleware auth check vì auth được handle ở client-side
  // TODO: Implement proper server-side auth check
  
  // Redirect root path to login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
}; 