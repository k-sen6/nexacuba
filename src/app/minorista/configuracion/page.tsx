"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function MinoristaConfigPage() {
  const router = useRouter()
  const [perfil, setPerfil] = useState<any>(null)
  const [minorista, setMinorista] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); return }
      const { data: perf } = await supabase.from("perfiles").select("*").eq("id", user.id).single()
      setPerfil(perf)
      const { data: may } = await supabase.from("minoristas").select("*").eq("id", user.id).single()
      setMinorista(may)
      setLoading(false)
    })()
  }, [router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  const envioLabels: Record<string, string> = {
    domicilio: "Envío a domicilio",
    recogida: "Recogida en local",
    ambos: "Envío y recogida",
  }

  const fields = [
    { label: "Nombre del Negocio", value: minorista?.nombre_negocio || "—" },
    { label: "WhatsApp", value: minorista?.whatsapp || "—" },
    { label: "Provincia", value: minorista?.provincia || "—" },
    { label: "Email", value: perfil?.email || "—" },
    { label: "Transferencia", value: minorista?.acepta_transferencia ? "Sí" : "No" },
    { label: "Tipo de envío", value: envioLabels[minorista?.tipo_envio] || "—" },
    { label: "Plan", value: minorista?.plan || "gratis" },
    { label: "Cuenta creada", value: perfil?.created_at ? new Date(perfil.created_at).toLocaleDateString("es-CU") : "—" },
  ]

  const planesCUP = [
    { plan: "Básico", price: "500", features: ["50 productos", "Analytics completos", "Soporte email"] },
    { plan: "Pro", price: "1,000", features: ["200 productos", "Analytics avanzados", "Soporte prioritario", "API acceso"] },
    { plan: "Enterprise", price: "2,500", features: ["Productos ilimitados", "Analytics en tiempo real", "Soporte 24/7", "API + Webhooks", "Equipo ilimitado"] },
  ]

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Configuración</span>
          </h1>
          <p className="text-gray-400 mt-1">Gestiona tu perfil, plan y métodos de pago/envío</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-bold text-white mb-4">Plan Actual</h2>
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-black text-white capitalize">{minorista?.plan || "Gratis"}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">Activo</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {minorista?.plan === "gratis" ? "Hasta 10 productos · Analytics básicos" : "Productos ilimitados · Analytics completos"}
                  </p>
                </div>
                <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm rounded-full hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
                  Mejorar Plan
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-bold text-white mb-4">Perfil del Negocio</h2>
              <div className="space-y-4">
                {fields.map((f) => (
                  <div key={f.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <span className="text-sm text-gray-400">{f.label}</span>
                    <span className="text-sm text-white font-medium">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-gray-400 mb-2 font-medium">Planes disponibles</div>
            {planesCUP.map((p) => (
              <div key={p.plan} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-blue-500/30 transition-all">
                <h3 className="font-bold text-white text-lg">{p.plan}</h3>
                <div className="text-2xl font-black mt-2 mb-4">
                  <span className="text-white">${p.price}</span>
                  <span className="text-sm text-gray-400 font-normal"> CUP/mes</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {p.features.map((f) => (
                    <li key={f} className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full py-2.5 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-all">
                  Contratar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
