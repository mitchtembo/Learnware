import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Helper to log in edge (appears in Vercel function logs)
function edgeLog(tag: string, info: Record<string, unknown>) {
  try {
    // eslint-disable-next-line no-console
    console.error(`[middleware:${tag}]`, JSON.stringify(info))
  } catch {
    // noop
  }
}

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = request.nextUrl

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    edgeLog('missing-env', { SUPABASE_URL: !!SUPABASE_URL, SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY })
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  let user = null as null | { id: string }
  try {
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // Only set on the response (recommended pattern)
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
          },
        },
      },
    )

    // IMPORTANT: don't add logic between client creation & getUser
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser()
    user = supabaseUser as typeof user
  } catch (err: any) {
    edgeLog('getUser-error', { message: err?.message, stack: err?.stack })
    // Let the request continue rather than 500
    return NextResponse.next()
  }

  const publicPaths = [
    '/auth/login',
    '/auth/signup', // legacy (if used anywhere)
    '/auth/sign-up',
    '/auth/forgot-password',
    '/auth/sign-up-success',
    '/auth/error',
    '/auth/callback',
  ]

  const isPublic = publicPaths.includes(pathname)

  if (!user && !isPublic) {
    url.pathname = '/auth/login'
    edgeLog('redirect-login', { from: pathname })
    return NextResponse.redirect(url)
  }

  if (user && isPublic) {
    url.pathname = '/'
    edgeLog('redirect-home', { from: pathname })
    return NextResponse.redirect(url)
  }

  // Add small debug header (viewable in network tab)
  response.headers.set('x-middleware', 'session')
  response.headers.set('x-user', user ? '1' : '0')
  return response
}
