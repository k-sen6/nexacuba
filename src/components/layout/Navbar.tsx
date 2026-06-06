"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Store, LogIn, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [open, setOpen] = useState(false)

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
          <Link href="/productos" className="text-sm text-gray-300 hover:text-white transition-colors">Productos</Link>
          <Link href="/#como-funciona" className="text-sm text-gray-300 hover:text-white transition-colors">Cómo Funciona</Link>
          <Link href="/auth/login" className="text-sm text-gray-300 hover:text-white transition-colors">Iniciar Sesión</Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm rounded-full hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-105 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            Registrarse
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className={cn("md:hidden overflow-hidden transition-all duration-300", open ? "max-h-80" : "max-h-0")}>
        <div className="flex flex-col px-6 pb-6 gap-2 border-t border-white/10 bg-black/90 backdrop-blur-xl">
          <Link onClick={() => setOpen(false)} href="/productos" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">Productos</Link>
          <Link onClick={() => setOpen(false)} href="/#como-funciona" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">Cómo Funciona</Link>
          <hr className="border-white/10" />
          <Link onClick={() => setOpen(false)} href="/auth/login" className="flex items-center gap-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">
            <LogIn className="w-4 h-4" /> Iniciar Sesión
          </Link>
          <Link onClick={() => setOpen(false)} href="/auth/register" className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full text-center">
            <UserPlus className="w-4 h-4" /> Registrarse
          </Link>
        </div>
      </div>
    </nav>
  )
}
