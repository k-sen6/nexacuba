"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Package, BarChart3, Settings, TrendingUp, ShoppingBag, Eye, MousePointerClick, Store, LogOut } from "lucide-react"

export default function MayoristaDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/auth/login")
        return
      }
      setUser(data.user)
      setLoading(false)
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
    </div>
  )

  const stats = [
    { icon: Eye, label: "Visitas Hoy", value: "47", change: "+12%", positive: true },
    { icon: MousePointerClick, label: "WhatsApp Clicks", value: "12", change: "+8%", positive: true },
    { icon: ShoppingBag, label: "Productos", value: "8", change: "—" },
    { icon: TrendingUp, label: "Conversión", value: "25.5%", change: "+3.2%", positive: true },
  ]

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black">
              Panel de <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Control</span>
            </h1>
            <p className="text-gray-400 mt-1">Bienvenido de nuevo, {user?.user_metadata?.nombre || "Mayorista"}</p>
          </div>
          <button onClick={handleLogout} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-red-500/30 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-3">
                <stat.icon className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              {stat.change !== "—" && (
                <div className={`text-xs mt-1 ${stat.positive ? "text-green-400" : "text-red-400"}`}>
                  {stat.change} vs ayer
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Link href="/mayorista/productos" className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-transparent hover:border-blue-500/30 transition-all group">
            <Package className="w-8 h-8 text-blue-500 mb-3" />
            <h3 className="font-bold text-white text-lg mb-1">Gestionar Productos</h3>
            <p className="text-sm text-gray-400">Añade, edita o elimina tus productos</p>
          </Link>
          <Link href="/mayorista/analytics" className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-600/10 to-transparent hover:border-purple-500/30 transition-all group">
            <BarChart3 className="w-8 h-8 text-purple-500 mb-3" />
            <h3 className="font-bold text-white text-lg mb-1">Analytics</h3>
            <p className="text-sm text-gray-400">Métricas detalladas de tu negocio</p>
          </Link>
          <Link href="/mayorista/configuracion" className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-600/10 to-transparent hover:border-cyan-500/30 transition-all group">
            <Settings className="w-8 h-8 text-cyan-500 mb-3" />
            <h3 className="font-bold text-white text-lg mb-1">Configuración</h3>
            <p className="text-sm text-gray-400">Plan, facturación y perfil</p>
          </Link>
        </div>

        {/* Top products preview */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Productos Más Visitados</h2>
            <Link href="/mayorista/analytics" className="text-sm text-blue-400 hover:text-blue-300">Ver todo</Link>
          </div>
          <div className="space-y-4">
            {[
              { name: "Smartphone 5G Pro", views: 234, clicks: 18 },
              { name: "Auriculares ANC Pro", views: 156, clicks: 12 },
              { name: "Smartwatch Ultra", views: 89, clicks: 7 },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-white font-medium">{p.name}</span>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-gray-400">{p.views} vistas</span>
                  <span className="text-green-400">{p.clicks} clics</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
