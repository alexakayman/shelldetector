// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Placeholder for future middleware logic
  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: "/api/companies/:path*",
};
