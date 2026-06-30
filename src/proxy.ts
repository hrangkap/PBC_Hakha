import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "admin_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    // If admin is disabled, return 404 — as if the route doesn't exist
    if (process.env.ADMIN_ENABLED !== "true") {
      return new NextResponse(null, { status: 404 });
    }

    // Admin is enabled — protect the dashboard with session check
    if (pathname.startsWith("/admin/dashboard")) {
      const token = request.cookies.get(COOKIE_NAME)?.value;
      if (!token || !/^[0-9a-f]{64}$/.test(token)) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
