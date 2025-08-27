import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Si l'utilisateur tente d'accéder au dashboard sans être admin
    if (req.nextUrl.pathname.startsWith("/admin/dashboard")) {
      if (!req.nextauth.token?.isAdmin) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Pour les routes admin, vérifier que l'utilisateur est connecté
        if (req.nextUrl.pathname.startsWith("/admin/dashboard")) {
          return token?.isAdmin === true
        }
        
        // Pour d'autres routes, autoriser
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    // Autres routes admin à protéger si besoin
  ],
}