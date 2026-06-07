"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, MapPin, Filter, ArrowRight, SearchX } from "lucide-react"

const allProducts = [
  { id: "1", name: "Smartphone 5G Pro", price: 299, img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=300&fit=crop", desc: '6.7" AMOLED, 128GB', mayorista: "TechCuba Store", provincia: "La Habana", whatsapp: "+5355555555" },
  { id: "2", name: "Auriculares ANC Pro", price: 89, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop", desc: "Cancelación Ruido, 30h", mayorista: "ElectroCuba", provincia: "Matanzas", whatsapp: "+5355555556" },
  { id: "3", name: "Nike Air Max 2026", price: 129, img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop", desc: "Originales, Tallas 6-12", mayorista: "Sneakers Cuba", provincia: "La Habana", whatsapp: "+5355555557" },
  { id: "4", name: "Smartwatch Ultra", price: 149, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop", desc: "GPS, Monitor Cardíaco", mayorista: "TechCuba Store", provincia: "La Habana", whatsapp: "+5355555555" },
  { id: "5", name: "iPad Pro M2", price: 799, img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop", desc: '11" Liquid Retina', mayorista: "ElectroCuba", provincia: "Matanzas", whatsapp: "+5355555556" },
  { id: "6", name: "Cámara Sony ZV-E10", price: 699, img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop", desc: "4K, Vlog perfecto", mayorista: "PhotoCuba", provincia: "Holguín", whatsapp: "+5355555558" },
  { id: "7", name: "Monitor LG UltraGear", price: 399, img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop", desc: "144Hz, 1ms, G-Sync", mayorista: "TechCuba Store", provincia: "La Habana", whatsapp: "+5355555555" },
  { id: "8", name: "Teclado Mecánico RGB", price: 89, img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop", desc: "Switch Red, Programable", mayorista: "ElectroCuba", provincia: "Matanzas", whatsapp: "+5355555556" },
]

export default function ProductosPage() {
  const [search, setSearch] = useState("")
  const [selectedProv, setSelectedProv] = useState("")

  const provincias = [...new Set(allProducts.map((p) => p.provincia))]
  const filtered = allProducts.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    if (selectedProv && p.provincia !== selectedProv) return false
    return true
  })

  const handleWhatsApp = (product: typeof allProducts[0]) => {
    const msg = encodeURIComponent(`Hola, vi este producto en NexaCuba: ${product.name} ($${product.price}). ¿Está disponible?`)
    window.open(`https://wa.me/${product.whatsapp}?text=${msg}`, "_blank")
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-black">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-black mb-3">
            Productos <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Disponibles</span>
          </h1>
          <p className="text-gray-400 text-lg">Explora ofertas de mayoristas verificados en toda Cuba</p>
        </div>

        {/* Search + Filter */}
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
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-blue-500/30 hover:-translate-y-1 transition-all"
            >
              <div className="relative overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-5">
                <div className="text-xs text-blue-400 font-medium mb-1">{p.mayorista} · {p.provincia}</div>
                <h3 className="text-lg font-bold text-white mb-1">{p.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{p.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">
                    ${p.price} USD
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
          ))}
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
