import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // If passcode protection isn't configured, just allow everything (good for local dev if they remove it)
  if (!process.env.APP_PASSCODE) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow access to login and auth API
  if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Check for the secure cookie
  const authCookie = request.cookies.get("auth_session");
  const isAuthenticated = authCookie?.value === "authenticated";

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Optionally pass the callback URL so we can redirect them back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
