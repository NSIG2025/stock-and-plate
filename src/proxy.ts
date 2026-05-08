import { withAuth } from "next-auth/middleware"
import type { NextRequest } from "next/server"

export default withAuth(function proxy(_req: NextRequest) {
  return undefined
})

export const config = {
  matcher: [
    "/pantry/:path*",
    "/ingredients/:path*",
    "/recipes/:path*",
    "/shopping/:path*",
    "/ai/:path*",
    "/plates/:path*",
    "/dashboard/:path*",
    "/sales/:path*",
    "/deliveries/:path*",
    "/suppliers/:path*",
    "/settings/:path*",
    "/upgrade/:path*",
    "/admin/:path*",
  ],
}
