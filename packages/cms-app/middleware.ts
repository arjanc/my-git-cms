import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname === '/admin' || req.nextUrl.pathname === '/admin/'
  const isOnEditor = req.nextUrl.pathname.startsWith('/admin/editor')

  if ((isOnDashboard || isOnEditor) && !isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/auth/signin', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
