"use client"

import { useState } from "react"
import { Plus, Trash2, Edit3 } from "lucide-react"

interface ProductItem {
  id: string
  name: string
  price: number
  category: string
  stock: number
  active: boolean
}

export default function MayoristaProductos() {
  const [products] = useState<ProductItem[]>([
    { id: "1", name: "Smartphone 5G Pro", price: 299, category: "Tecnología", stock: 15, active: true },
    { id: "2", name: "Auriculares ANC Pro", price: 89, category: "Tecnología", stock: 30, active: true },
    { id: "3", name: "Smartwatch Ultra", price: 149, category: "Tecnología", stock: 8, active: true },
  ])

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black">
              Mis <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Productos</span>
            </h1>
            <p className="text-gray-400 mt-1">Gestiona tu catálogo de productos</p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm rounded-full hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
            <Plus className="w-4 h-4" /> Añadir Producto
          </button>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Producto</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Precio</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Categoría</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Stock</th>
                <th className="text-left p-4 text-sm text-gray-400 font-medium">Estado</th>
                <th className="text-right p-4 text-sm text-gray-400 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-white font-medium">{p.name}</td>
                  <td className="p-4 text-white">${p.price} USD</td>
                  <td className="p-4 text-gray-400">{p.category}</td>
                  <td className="p-4 text-gray-400">{p.stock}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.active ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
                      {p.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-all"><Edit3 className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
