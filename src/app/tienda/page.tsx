"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Store, MapPin, Phone, Shield, ArrowRight, Loader2, Star, Landmark, Truck } from "lucide-react"

function StoreContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get("id")

  const [mayorista, setMayorista] = useState<any>(null)
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { router.push("/productos"); return }
    const supabase = createClient()
    ;(async () => {
      const { data: may } = await supabase
        .from("mayoristas")
        .select("*, perfiles!inner(email)")
        .eq("id", id)
        .single()
      setMayorista(may)

      if (may) {
        const { data: prods } = await supabase
          .from("productos")
          .select("*, categorias!left(nombre, slug)")
          .eq("mayorista_id", id)
          .eq("activo", true)
          .order("destacado", { ascending: false })
          .order("created_at", { ascending: false })
        setProductos(prods || [])
      }
      setLoading(false)
    })()
  }, [id, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  if (!mayorista) return (
    <div className="min-h-screen flex items-center justify-center bg-black pt-24">
      <div className="text-center">
        <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Tienda no encontrada</p>
        <Link href="/productos" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">Ver productos →</Link>
      </div>
    </div>
  )

  const envioLabels: Record<string, string> = {
    domicilio: "Envío a domicilio",
    recogida: "Recogida en local",
    ambos: "Envío a domicilio y recogida",
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/5 to-purple-600/5 p-8 mb-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl sm:text-4xl font-black text-white">{mayorista.nombre_negocio}</h1>
                {mayorista.verificada && (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                    <Shield className="w-3 h-3" /> Verificado
                  </span>
                )}
              </div>
              {mayorista.descripcion && <p className="text-gray-400 mt-2">{mayorista.descripcion}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {mayorista.provincia && (
              <div className="flex items-center gap-1.5 text-gray-300">
                <MapPin className="w-4 h-4 text-blue-500" />
                {mayorista.provincia}
              </div>
            )}
            {mayorista.whatsapp && (
              <a href={`https://wa.me/${mayorista.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank"
                className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors">
                <Phone className="w-4 h-4" />
                {mayorista.whatsapp}
              </a>
            )}
            <div className="flex items-center gap-1.5 text-gray-300">
              <Store className="w-4 h-4 text-purple-500" />
              {productos.length} productos
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            {mayorista.acepta_transferencia && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Landmark className="w-3.5 h-3.5" /> Acepta transferencia
              </span>
            )}
            {mayorista.tipo_envio && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Truck className="w-3.5 h-3.5" /> {envioLabels[mayorista.tipo_envio] || mayorista.tipo_envio}
              </span>
            )}
          </div>
        </div>

        {productos.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Productos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productos.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-blue-500/30 hover:-translate-y-1 transition-all group">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.nombre} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
                  )}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      {p.categorias && <span className="text-xs text-blue-400 font-medium">{p.categorias.nombre}</span>}
                      {p.destacado && <span className="inline-flex items-center gap-1 text-xs text-amber-400"><Star className="w-3 h-3 fill-amber-400" /> Destacado</span>}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{p.nombre}</h3>
                    {p.descripcion && <p className="text-gray-400 text-sm mb-4 line-clamp-2">{p.descripcion}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                        ${p.precio} {p.moneda}
                      </span>
                      <a href={`https://wa.me/${mayorista.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hola, vi este producto en NexaCuba: ${p.nombre} ($${p.precio} ${p.moneda})`)}`}
                        target="_blank"
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform">
                        Contactar <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Esta tienda no tiene productos publicados aún</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function StorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <StoreContent />
    </Suspense>
  )
}
