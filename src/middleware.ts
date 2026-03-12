import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/gallery/:id/delete", "/api/drawings/:path*"],
};

export function middleware(req: NextRequest) {
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");

  if (isApiRoute && req.method !== "DELETE") {
    return NextResponse.next();
  }

  const authorization = req.headers.get("authorization");

  if (authorization) {
    const encoded = authorization.split(" ")[1];
    const [user, password] = atob(encoded).split(":");

    if (
      user === process.env.BASIC_AUTH_USER &&
      password === process.env.BASIC_AUTH_PASSWORD
    ) {
      return NextResponse.next();
    }
  }

  return new Response("Authentication Required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin"',
    },
  });
}
