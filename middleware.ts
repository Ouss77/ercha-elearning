import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Check if user is inactive - redirect to login
    if (token && (token as any).active === false) {
      return NextResponse.redirect(new URL("/connexion?error=inactive", req.url))
    }

    // Role-based route protection (DRY)
    const roleByPrefix = {
      "/admin": "ADMIN",
      "/sous-admin": "SUB_ADMIN",
      "/formateur": "TRAINER",
      "/etudiant": "STUDENT",
    } as const

    for (const [prefix, requiredRole] of Object.entries(roleByPrefix)) {
      if (path.startsWith(prefix)) {
        if (!token) {
          return NextResponse.redirect(new URL("/connexion", req.url))
        }
        if (token.role !== requiredRole) {
          return NextResponse.redirect(new URL("/non-autorise", req.url))
        }
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Always return true here - actual auth check happens in middleware function
        return true
      }
    }
  }
)

export const config = {
  matcher: ["/admin/:path*", "/sous-admin/:path*", "/formateur/:path*", "/etudiant/:path*"]
}
