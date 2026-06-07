"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Package, BarChart3, Settings, TrendingUp, ShoppingBag, Eye, MousePointerClick, Store, LogOut, Loader2 } from "lucide-react"

export default function MayoristaDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    productosActivos: 0,
    visitasHoy: 0,
    clicsWhatsApp: 0,
    totalProductos: 0,
    topProductos: [] as { nombre: string; visitas: number; clics: number }[],
  })

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push("/auth/login"); return }
      setUser(u)

      const { data: perf } = await supabase
        .from("perfiles")
        .select("*, mayoristas!left(*)")
        .eq("id", u.id)
        .single()
      setPerfil(perf)

      const { count: totalActivos } = await supabase
        .from("productos")
        .select("*", { count: "exact", head: true })
        .eq("mayorista_id", u.id)
        .eq("activo", true)

      const { count: totalProd } = await supabase
        .from("productos")
        .select("*", { count: "exact", head: true })
        .eq("mayorista_id", u.id)

      const { data: clics } = await supabase
        .from("clics")
        .select("created_at")
        .eq("producto_id", u.id)
        .gte("created_at", new Date(new Date().setHours(0,0,0,0)).toISOString())

      setStats({
        productosActivos: totalActivos || 0,
        totalProductos: totalProd || 0,
        visitasHoy: 0,
        clicsWhatsApp: clics?.length || 0,
        topProductos: [],
      })
      setLoading(false)
    })()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  const cards = [
    { icon: Eye, label: "Visitas Hoy", value: stats.visitasHoy.toString() || "0", color: "blue" },
    { icon: MousePointerClick, label: "WhatsApp Clicks", value: stats.clicsWhatsApp.toString(), change: "Hoy", color: "purple" },
    { icon: ShoppingBag, label: "Productos", value: stats.productosActivos.toString(), sub: `${stats.totalProductos} total`, color: "cyan" },
    { icon: TrendingUp, label: "Plan Actual", value: perfil?.mayoristas?.plan || "Gratis", color: "green" },
  ]

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black">
              Panel de <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Control</span>
            </h1>
            <p className="text-gray-400 mt-1">
              Bienvenido de nuevo, {perfil?.nombre || user?.user_metadata?.nombre || "Mayorista"}
            </p>
          </div>
          <button onClick={handleLogout} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-red-500/30 transition-all">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {cards.map((stat) => (
            <div key={stat.label} className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-3 mb-3">
                <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                <span className="text-sm text-gray-400">{stat.label}</span>
              </div>
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              {stat.sub && <div className="text-xs text-gray-500 mt-1">{stat.sub}</div>}
            </div>
          ))}
        </div>

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

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Tus Productos</h2>
            <Link href="/mayorista/productos" className="text-sm text-blue-400 hover:text-blue-300">Gestionar</Link>
          </div>
          {stats.totalProductos === 0 ? (
            <p className="text-gray-500 text-center py-8">Aún no has publicado productos. <Link href="/mayorista/productos" className="text-blue-400">Publica tu primero</Link></p>
          ) : (
            <p className="text-gray-400">
              Tienes <span className="text-white font-medium">{stats.productosActivos}</span> productos activos de{" "}
              <span className="text-white font-medium">{stats.totalProductos}</span> en total.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
