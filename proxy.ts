import { NextResponse, type NextRequest } from "next/server";
import { LOGIN_PATH, loginUrl } from "@/lib/api/auth";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname === LOGIN_PATH || request.cookies.has("session")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(loginUrl(`${pathname}${search}`), request.url));
}

export const config = {
  matcher: "/admin/:path*",
};
