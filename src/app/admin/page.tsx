"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Check, X, Shield, Store, CreditCard } from "lucide-react"

interface MayoristaItem {
  id: string
  nombre_negocio: string
  whatsapp: string
  provincia: string
  verificada: boolean
  plan: string
  plan_activo_hasta: string | null
  perfiles: { email: string; nombre: string; creado_en: string }
}

export default function AdminPage() {
  const router = useRouter()
  const [mayoristas, setMayoristas] = useState<MayoristaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, verificados: 0, activos: 0 })

  const loadData = async () => {
    const supabase = createClient()
    const { data: mays } = await supabase
      .from("mayoristas")
      .select("*, perfiles!inner(email, nombre, creado_en)")
      .order("creado_en", { ascending: false })
    setMayoristas(mays || [])
    setStats({
      total: mays?.length || 0,
      verificados: mays?.filter((m: any) => m.verificada).length || 0,
      activos: mays?.filter((m: any) => m.plan !== "gratis").length || 0,
    })
    setLoading(false)
  }

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return }
      loadData()
    })
  }, [router])

  const toggleVerificacion = async (id: string, current: boolean) => {
    const supabase = createClient()
    await supabase.from("mayoristas").update({ verificada: !current }).eq("id", id)
    loadData()
  }

  const cambiarPlan = async (id: string, plan: string) => {
    const supabase = createClient()
    const update: any = { plan }
    if (plan !== "gratis") {
      const fin = new Date()
      fin.setMonth(fin.getMonth() + 1)
      update.plan_activo_hasta = fin.toISOString()
    } else {
      update.plan_activo_hasta = null
    }
    await supabase.from("mayoristas").update(update).eq("id", id)
    loadData()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  const planes = ["gratis", "basico", "pro", "enterprise"]

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-amber-500" />
            <h1 className="text-3xl sm:text-4xl font-black">
              Panel de <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Administración</span>
            </h1>
          </div>
          <p className="text-gray-400">Gestiona mayoristas, planes y suscripciones</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Store, label: "Total Mayoristas", value: stats.total, color: "blue" },
            { icon: Check, label: "Verificados", value: stats.verificados, color: "green" },
            { icon: CreditCard, label: "Plan de Pago", value: stats.activos, color: "amber" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
              <s.icon className={`w-5 h-5 text-${s.color}-500 mb-2`} />
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Negocio</th>
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Contacto</th>
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Provincia</th>
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Verificado</th>
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Plan</th>
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Vence</th>
                  <th className="text-right p-4 text-sm text-gray-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {mayoristas.map((m) => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="text-white font-medium">{m.nombre_negocio}</div>
                      <div className="text-xs text-gray-500">{m.perfiles?.email || "—"}</div>
                    </td>
                    <td className="p-4 text-white">{m.whatsapp || "—"}</td>
                    <td className="p-4 text-gray-400">{m.provincia || "—"}</td>
                    <td className="p-4">
                      <button onClick={() => toggleVerificacion(m.id, m.verificada)} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                        m.verificada
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : "bg-gray-500/10 text-gray-400 border-gray-500/20 hover:border-green-500/30"
                      }`}>
                        {m.verificada ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {m.verificada ? "Verificado" : "No verificado"}
                      </button>
                    </td>
                    <td className="p-4">
                      <select
                        value={m.plan}
                        onChange={(e) => cambiarPlan(m.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-blue-500/50"
                      >
                        {planes.map((p) => (
                          <option key={p} value={p} className="bg-gray-900 capitalize">{p}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {m.plan_activo_hasta ? new Date(m.plan_activo_hasta).toLocaleDateString("es-CU") : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {m.plan !== "gratis" && (
                          <button
                            onClick={() => cambiarPlan(m.id, "gratis")}
                            className="px-3 py-1.5 text-xs rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {mayoristas.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500">
                      No hay mayoristas registrados aún
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
