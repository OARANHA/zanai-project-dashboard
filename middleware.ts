import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/', '/api/auth']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  
  // Admin routes that require admin role
  const adminRoutes = ['/admin', '/api/admin']
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))
  
  // Skip middleware for public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Get the auth token from the request
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  try {
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Check admin role for admin routes
    if (isAdminRoute) {
      // Here you would check if the user has admin role
      // For now, we'll use a simple check - in production, you'd check the user's role in your database
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (!userData || !['admin', 'company_admin'].includes(userData.role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
    
    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('user-id', user.id)
      requestHeaders.set('user-email', user.email || '')
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
    
    return NextResponse.next()
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}