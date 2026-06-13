"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, Eye, MousePointerClick, ShoppingBag, Loader2 } from "lucide-react"

export default function MayoristaAnalytics() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ visitas: 0, clics: 0, productos: 0 })

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: { user: u } } = await supabase.auth.getUser()
      if (!u) { router.push("/auth/login"); return }

      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      const { count: totalProds } = await supabase
        .from("productos")
        .select("*", { count: "exact", head: true })
        .eq("mayorista_id", u.id)
        .eq("activo", true)

      const { count: totalClicks } = await supabase
        .from("clics")
        .select("*", { count: "exact", head: true })
        .eq("producto_id", u.id)

      const { data: visitas } = await supabase
        .from("visitas_diarias")
        .select("visitas, clics_whatsapp")
        .eq("mayorista_id", u.id)

      const totalVisitas = visitas?.reduce((acc, v) => acc + (v.visitas || 0), 0) || 0

      setStats({
        visitas: totalVisitas,
        clics: totalClicks || 0,
        productos: totalProds || 0,
      })

      setLoading(false)
    })()
  }, [router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Analytics</span>
          </h1>
          <p className="text-gray-400 mt-1">Métricas detalladas de tu negocio</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Eye, label: "Visitas Totales", value: stats.visitas.toLocaleString(), color: "blue" },
            { icon: MousePointerClick, label: "WhatsApp Clicks", value: stats.clics.toLocaleString(), color: "purple" },
            { icon: ShoppingBag, label: "Productos Activos", value: stats.productos.toLocaleString(), color: "cyan" },
            { icon: TrendingUp, label: "Tasa Conversión", value: stats.visitas > 0 ? `${((stats.clics / stats.visitas) * 100).toFixed(1)}%` : "0%", color: "green" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
              <s.icon className={`w-5 h-5 text-${s.color}-500 mb-3`} />
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
