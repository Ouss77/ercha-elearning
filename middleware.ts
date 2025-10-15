import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Role-based route protection
    if (path.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    if (path.startsWith("/sub-admin") && token?.role !== "SUB_ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    if (path.startsWith("/teacher") && token?.role !== "TRAINER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
    }
    if (path.startsWith("/student") && token?.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/unauthorized", req.url))
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
