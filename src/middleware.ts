import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabaseResponse = await updateSession(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll() {},
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && pathname.startsWith("/mayorista")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (!user && pathname.startsWith("/minorista")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (!user && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (user) {
    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", user.id)
      .single()

    const rol = perfil?.rol

    if (pathname.startsWith("/mayorista") && rol !== "mayorista") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (pathname.startsWith("/minorista") && rol !== "minorista") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (pathname.startsWith("/admin") && rol !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/mayorista/:path*", "/minorista/:path*", "/admin/:path*"],
}
