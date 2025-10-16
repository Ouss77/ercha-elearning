import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Role-based route protection (DRY)
    const roleByPrefix = {
      "/admin": "ADMIN",
      "/sub-admin": "SUB_ADMIN",
      "/teacher": "TRAINER",
      "/student": "STUDENT",
    } as const

    for (const [prefix, requiredRole] of Object.entries(roleByPrefix)) {
      if (path.startsWith(prefix) && token?.role !== requiredRole) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    }
  }
)

export const config = {
  matcher: ["/admin/:path*", "/sub-admin/:path*", "/teacher/:path*", "/student/:path*"]
}
