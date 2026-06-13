"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Check, X, Shield, Store, CreditCard } from "lucide-react"

interface VendedorItem {
  id: string
  nombre_negocio: string
  whatsapp: string
  provincia: string
  acepta_transferencia: boolean
  tipo_envio: string
  verificada: boolean
  plan: string
  plan_activo_hasta: string | null
  tipo: "mayorista" | "minorista"
  perfiles: { email: string; nombre: string; creado_en: string }
}

export default function AdminPage() {
  const router = useRouter()
  const [vendedores, setVendedores] = useState<VendedorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"mayoristas" | "minoristas">("mayoristas")
  const [stats, setStats] = useState({ total: 0, verificados: 0, activos: 0 })

  const loadData = async () => {
    const supabase = createClient()

    const [mayoristasRes, minoristasRes] = await Promise.all([
      supabase
        .from("mayoristas")
        .select("*, perfiles!inner(email, nombre, creado_en)")
        .order("creado_en", { ascending: false }),
      supabase
        .from("minoristas")
        .select("*, perfiles!inner(email, nombre, creado_en)")
        .order("creado_en", { ascending: false }),
    ])

    const mays: VendedorItem[] = (mayoristasRes.data || []).map((m: any) => ({
      ...m,
      tipo: "mayorista" as const,
    }))

    const mins: VendedorItem[] = (minoristasRes.data || []).map((m: any) => ({
      ...m,
      tipo: "minorista" as const,
    }))

    const todos = [...mays, ...mins]
    setVendedores(todos)
    setStats({
      total: todos.length,
      verificados: todos.filter((v) => v.verificada).length,
      activos: todos.filter((v) => v.plan !== "gratis").length,
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

  const toggleVerificacion = async (item: VendedorItem) => {
    const supabase = createClient()
    const table = item.tipo === "mayorista" ? "mayoristas" : "minoristas"
    await supabase.from(table).update({ verificada: !item.verificada }).eq("id", item.id)
    loadData()
  }

  const cambiarPlan = async (item: VendedorItem, plan: string) => {
    const supabase = createClient()
    const table = item.tipo === "mayorista" ? "mayoristas" : "minoristas"
    const update: any = { plan }
    if (plan !== "gratis") {
      const fin = new Date()
      fin.setMonth(fin.getMonth() + 1)
      update.plan_activo_hasta = fin.toISOString()
    } else {
      update.plan_activo_hasta = null
    }
    await supabase.from(table).update(update).eq("id", item.id)
    loadData()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  const planes = ["gratis", "basico", "pro", "enterprise"]
  const filtered = vendedores.filter((v) =>
    tab === "mayoristas" ? v.tipo === "mayorista" : v.tipo === "minorista"
  )

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
          <p className="text-gray-400">Gestiona mayoristas, minoristas, planes y suscripciones</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Store, label: "Total Vendedores", value: stats.total, color: "blue" },
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

        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
          {(["mayoristas", "minoristas"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              {t}
            </button>
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
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Transf.</th>
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Envío</th>
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Verificado</th>
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Plan</th>
                  <th className="text-left p-4 text-sm text-gray-400 font-medium">Vence</th>
                  <th className="text-right p-4 text-sm text-gray-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={`${m.tipo}-${m.id}`} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="text-white font-medium">{m.nombre_negocio}</div>
                      <div className="text-xs text-gray-500">{m.perfiles?.email || "—"}</div>
                    </td>
                    <td className="p-4 text-white">{m.whatsapp || "—"}</td>
                    <td className="p-4 text-gray-400">{m.provincia || "—"}</td>
                    <td className="p-4 text-center text-sm">{m.acepta_transferencia ? <span className="text-green-400">Sí</span> : <span className="text-gray-500">No</span>}</td>
                    <td className="p-4 text-sm text-gray-400 capitalize">{m.tipo_envio || "—"}</td>
                    <td className="p-4">
                      <button onClick={() => toggleVerificacion(m)} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
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
                        onChange={(e) => cambiarPlan(m, e.target.value)}
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
                            onClick={() => cambiarPlan(m, "gratis")}
                            className="px-3 py-1.5 text-xs rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            Desactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-500 capitalize">
                      No hay {tab} registrados aún
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
