"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface ProductFormProps {
  onClose: () => void
  product?: {
    id: string
    nombre: string
    descripcion: string | null
    precio: number
    moneda: string
    categoria_id: string | null
    stock: number | null
    destacado: boolean
    activo: boolean
    imagenes: string[]
  }
  categorias: { id: string; nombre: string }[]
}

export function ProductForm({ onClose, product, categorias }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    nombre: product?.nombre || "",
    descripcion: product?.descripcion || "",
    precio: product?.precio?.toString() || "",
    moneda: product?.moneda || "USD",
    categoria_id: product?.categoria_id || "",
    stock: product?.stock?.toString() || "",
    destacado: product?.destacado || false,
    activo: product?.activo ?? true,
  })

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user && !product) {
      setError("Debes iniciar sesión")
      setLoading(false)
      return
    }

    const data = {
      mayorista_id: user?.id,
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      precio: parseFloat(form.precio),
      moneda: form.moneda,
      categoria_id: form.categoria_id || null,
      stock: form.stock ? parseInt(form.stock) : null,
      destacado: form.destacado,
      activo: form.activo,
    }

    if (product) {
      const { error: err } = await supabase.from("productos").update(data).eq("id", product.id)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.from("productos").insert(data)
      if (err) { setError(err.message); setLoading(false); return }
    }

    router.refresh()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Nombre del producto *</label>
        <input
          required value={form.nombre} onChange={(e) => update("nombre", e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
          placeholder="Ej: Smartphone 5G Pro"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Descripción</label>
        <textarea
          value={form.descripcion} onChange={(e) => update("descripcion", e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
          placeholder="Describe el producto..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Precio *</label>
          <input
            type="number" step="0.01" min="0" required
            value={form.precio} onChange={(e) => update("precio", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Moneda</label>
          <select
            value={form.moneda} onChange={(e) => update("moneda", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="USD" className="bg-gray-900">USD</option>
            <option value="CUP" className="bg-gray-900">CUP</option>
            <option value="MLC" className="bg-gray-900">MLC</option>
            <option value="USDT" className="bg-gray-900">USDT</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Categoría</label>
          <select
            value={form.categoria_id} onChange={(e) => update("categoria_id", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500/50"
          >
            <option value="" className="bg-gray-900">Sin categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id} className="bg-gray-900">{cat.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Stock</label>
          <input
            type="number" min="0"
            value={form.stock} onChange={(e) => update("stock", e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
            placeholder="Ilimitado"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" checked={form.destacado}
            onChange={(e) => update("destacado", e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-600"
          />
          <span className="text-sm text-gray-300">Producto destacado</span>
        </label>
        {product && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={form.activo}
              onChange={(e) => update("activo", e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-600"
            />
            <span className="text-sm text-gray-300">Activo</span>
          </label>
        )}
      </div>

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button" onClick={onClose}
          className="flex-1 py-2.5 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit" disabled={loading}
          className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {product ? "Guardar Cambios" : "Crear Producto"}
        </button>
      </div>
    </form>
  )
}
