"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, MapPin, Filter, ArrowRight, SearchX, Shield, Loader2, Store, Landmark, Truck } from "lucide-react"

interface ProductoConVendedor {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  moneda: string
  activo: boolean
  destacado: boolean
  mayorista_id: string | null
  minorista_id: string | null
  categorias: { nombre: string; slug: string } | null
  mayoristas: { nombre_negocio: string; whatsapp: string; provincia: string; verificada: boolean; acepta_transferencia: boolean; tipo_envio: string } | null
  minoristas: { nombre_negocio: string; whatsapp: string; provincia: string; verificada: boolean; acepta_transferencia: boolean; tipo_envio: string } | null
}

interface Categoria {
  id: string
  nombre: string
  slug: string
}

export default function ProductosPage() {
  const [search, setSearch] = useState("")
  const [selectedProv, setSelectedProv] = useState("")
  const [selectedCat, setSelectedCat] = useState("")
  const [productos, setProductos] = useState<ProductoConVendedor[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: prods } = await supabase
        .from("productos")
        .select("*, categorias!left(nombre, slug), mayoristas!left(nombre_negocio, whatsapp, provincia, verificada, acepta_transferencia, tipo_envio), minoristas!left(nombre_negocio, whatsapp, provincia, verificada, acepta_transferencia, tipo_envio)")
        .eq("activo", true)
        .order("destacado", { ascending: false })
        .order("created_at", { ascending: false })
      setProductos(prods || [])

      const { data: cats } = await supabase.from("categorias").select("*").order("nombre")
      setCategorias(cats || [])
      setLoading(false)
    })()
  }, [])

  const provincias = [...new Set(productos.map((p) => {
    if (p.mayoristas) return p.mayoristas.provincia
    if (p.minoristas) return p.minoristas.provincia
    return ""
  }).filter(Boolean))]

  const filtered = productos.filter((p) => {
    if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false
    const provincia = p.mayoristas?.provincia || p.minoristas?.provincia || ""
    if (selectedProv && provincia !== selectedProv) return false
    if (selectedCat && p.categorias?.slug !== selectedCat) return false
    return true
  })

  const getVendedor = (p: ProductoConVendedor) => p.mayoristas || p.minoristas

  const handleWhatsApp = (p: ProductoConVendedor) => {
    const v = getVendedor(p)
    const msg = encodeURIComponent(`Hola, vi este producto en NexaCuba: ${p.nombre} ($${p.precio} ${p.moneda}). ¿Está disponible?`)
    window.open(`https://wa.me/${v?.whatsapp?.replace(/[^0-9]/g, "")}?text=${msg}`, "_blank")
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

  const envioLabels: Record<string, string> = {
    domicilio: "Envío a casa",
    recogida: "Recogida",
    ambos: "Envío + Recogida",
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-black">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            Productos <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Disponibles</span>
          </h1>
          <p className="text-gray-400 text-lg">Explora ofertas de mayoristas y minoristas verificados en toda Cuba</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text" placeholder="Buscar productos..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 z-10" />
            <select
              value={selectedProv} onChange={(e) => setSelectedProv(e.target.value)}
              className="appearance-none pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors min-w-[180px]"
            >
              <option value="" className="bg-gray-900">Todas las provincias</option>
              {provincias.map((p) => (
                <option key={p} value={p} className="bg-gray-900">{p}</option>
              ))}
            </select>
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50 transition-colors min-w-[160px]"
            >
              <option value="" className="bg-gray-900">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.slug} className="bg-gray-900">{c.nombre}</option>
              ))}
            </select>
            <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => {
            const v = getVendedor(p)
            return (
              <div
                key={p.id}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-blue-500/30 hover:-translate-y-1 transition-all"
              >
                <div className="relative overflow-hidden">
                  <div className="w-full h-56 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                    <Store className="w-16 h-16 text-white/20" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-blue-400 font-medium">{v?.nombre_negocio}</span>
                    <span className="text-xs text-gray-500">· {v?.provincia}</span>
                    {v?.verificada && <Shield className="w-3 h-3 text-green-400" />}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {v?.acepta_transferencia && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <Landmark className="w-2.5 h-2.5" /> Transferencia
                      </span>
                    )}
                    {v?.tipo_envio && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        <Truck className="w-2.5 h-2.5" /> {envioLabels[v.tipo_envio] || v.tipo_envio}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{p.nombre}</h3>
                  {p.descripcion && <p className="text-gray-400 text-sm mb-4 line-clamp-2">{p.descripcion}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">
                      ${p.precio} {p.moneda}
                    </span>
                    <button
                      onClick={() => handleWhatsApp(p)}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:scale-105 transition-transform"
                    >
                      Contactar <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <SearchX className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p>No se encontraron productos con esos filtros.</p>
          </div>
        )}
      </div>
    </div>
  )
}
