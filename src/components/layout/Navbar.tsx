"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Menu, X, Store, LogIn, UserPlus, LayoutDashboard, LogOut, Package, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("nexacuba-theme")
    if (stored === "light") {
      setDark(false)
      document.documentElement.classList.add("light")
    }
  }, [])

  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("light", !next)
    localStorage.setItem("nexacuba-theme", next ? "dark" : "light")
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUser(data.user)
        const { data: perfil } = await supabase
          .from("perfiles")
          .select("rol")
          .eq("id", data.user.id)
          .single()
        setRole(perfil?.rol || "cliente")
      }
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setRole(null)
    router.push("/")
    router.refresh()
  }

  const dashboardLink = role === "mayorista"
    ? "/mayorista/dashboard"
    : role === "minorista"
    ? "/minorista/dashboard"
    : null

  const productosLink = role === "mayorista"
    ? "/mayorista/productos"
    : role === "minorista"
    ? "/minorista/productos"
    : null

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-300 bg-black/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Store className="w-6 h-6 text-blue-500" />
          <span className="text-xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">
              Nexa
            </span>
            <span className="text-white">Cuba</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/productos" className="text-sm text-gray-300 hover:text-white transition-colors">
            Productos
          </Link>
          <Link href="/#como-funciona" className="text-sm text-gray-300 hover:text-white transition-colors">
            Cómo Funciona
          </Link>

          {user ? (
            <>
              {dashboardLink && (
                <Link
                  href={dashboardLink}
                  className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}
              {productosLink && (
                <Link
                  href={productosLink}
                  className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  <Package className="w-4 h-4" />
                  Mis Productos
                </Link>
              )}
              <button onClick={toggleTheme} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-xs text-gray-400 hover:text-white hover:border-blue-500/50 transition-all" title={dark ? "Modo claro" : "Modo oscuro"}>
                {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {dark ? "Claro" : "Oscuro"}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 border border-white/20 text-gray-300 hover:text-white hover:border-red-500/30 text-sm rounded-full transition-all"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white transition-colors">
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm rounded-full hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className={cn("md:hidden overflow-hidden transition-all duration-300", open ? "max-h-96" : "max-h-0")}>
        <div className="flex flex-col px-6 pb-6 gap-2 border-t border-white/10 bg-black/90 backdrop-blur-xl">
          <Link onClick={() => setOpen(false)} href="/productos" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">
            Productos
          </Link>
          <Link onClick={() => setOpen(false)} href="/#como-funciona" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">
            Cómo Funciona
          </Link>
          <hr className="border-white/10" />
          {user ? (
            <>
              {dashboardLink && (
                <Link onClick={() => setOpen(false)} href={dashboardLink} className="flex items-center gap-2 px-4 py-3 text-blue-400 hover:text-white hover:bg-white/5 rounded-lg">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
              )}
              <button onClick={() => { toggleTheme(); setOpen(false) }} className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} {dark ? "Modo Claro" : "Modo Oscuro"}
              </button>
              <button onClick={() => { handleLogout(); setOpen(false) }} className="flex items-center justify-center gap-2 px-4 py-3 border border-white/20 text-gray-300 rounded-full hover:border-red-500/30 transition-all">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link onClick={() => setOpen(false)} href="/auth/login" className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </Link>
              <Link onClick={() => setOpen(false)} href="/auth/register" className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full text-center">
                <UserPlus className="w-4 h-4" /> Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
