import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher(['/sign-in', '/sign-up', '/', '/home'])

const isPublicApiRoute = createRouteMatcher(['/api/video'])
export default clerkMiddleware((auth, req) => {
  const { userId } = auth()
  const currentUrl = new URL(req.url)
  const isAccessingDashboard = currentUrl.pathname === '/home'
  const isApiRequest = currentUrl.pathname.startsWith('/api')

  //user is logged in
  if (userId && isPublicRoute(req) && !isAccessingDashboard) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  //user is not logged in
  if (!userId) {
    // and is trying to access protected routes
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    // requestes for protected API
    if (isApiRequest && !isPublicApiRoute) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
