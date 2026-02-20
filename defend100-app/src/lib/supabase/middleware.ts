import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Do NOT call supabase.auth.getSession() here.
    // Use getUser() instead — it validates the token against the Supabase Auth server.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Define public routes that don't require authentication
    const publicPaths = ["/login", "/onboarding"]
    const isPublicPath = publicPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    )

    // If user is NOT logged in and trying to access a protected route → redirect to /login
    if (!user && !isPublicPath) {
        const url = request.nextUrl.clone()
        url.pathname = "/login"
        return NextResponse.redirect(url)
    }

    // If user IS logged in and trying to access /login → redirect to /
    if (user && request.nextUrl.pathname.startsWith("/login")) {
        const url = request.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
