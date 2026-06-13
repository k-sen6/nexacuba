"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"

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
    imagen_url?: string | null
  }
  categorias: { id: string; nombre: string }[]
  tipoVendedor: "mayorista" | "minorista"
}

export function ProductForm({ onClose, product, categorias, tipoVendedor }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(product?.imagen_url || null)
  const [form, setForm] = useState({
    nombre: product?.nombre || "",
    descripcion: product?.descripcion || "",
    precio: product?.precio?.toString() || "",
    moneda: product?.moneda || "CUP",
    categoria_id: product?.categoria_id || "",
    stock: product?.stock?.toString() || "",
    destacado: product?.destacado || false,
    activo: product?.activo ?? true,
  })

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }))

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes")
      return
    }
    if (f.size > 2 * 1024 * 1024) {
      toast.error("La imagen no puede superar 2MB")
      return
    }
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
  }

  const clearFile = () => {
    setFile(null)
    if (previewUrl && !product?.imagen_url) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(product?.imagen_url || null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const uploadImage = async (userId: string): Promise<string | null> => {
    if (!file) return null
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split(".").pop() || "jpg"
    const fileName = `${userId}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from("productos")
      .upload(fileName, file)
    if (uploadError) {
      toast.error("Error al subir la imagen")
      setUploading(false)
      return null
    }
    const { data: urlData } = supabase.storage
      .from("productos")
      .getPublicUrl(fileName)
    setUploading(false)
    return urlData?.publicUrl || null
  }

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

    let imagen_url = product?.imagen_url || null
    if (file && user) {
      imagen_url = await uploadImage(user.id)
      if (!imagen_url) {
        setLoading(false)
        return
      }
    }

    const baseData: Record<string, any> = {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      precio: parseFloat(form.precio),
      moneda: form.moneda,
      categoria_id: form.categoria_id || null,
      stock: form.stock ? parseInt(form.stock) : null,
      destacado: form.destacado,
      activo: form.activo,
      imagen_url,
    }

    if (!product) {
      if (tipoVendedor === "mayorista") {
        baseData.mayorista_id = user?.id
      } else {
        baseData.minorista_id = user?.id
      }
    }

    if (product) {
      const { error: err } = await supabase.from("productos").update(baseData).eq("id", product.id)
      if (err) { setError(err.message); setLoading(false); return }
      toast.success("Producto actualizado correctamente")
    } else {
      const { error: err } = await supabase.from("productos").insert(baseData)
      if (err) { setError(err.message); setLoading(false); return }
      toast.success("Producto creado correctamente")
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

      <div>
        <label className="block text-sm text-gray-400 mb-1.5">Imagen del producto</label>
        <div className="flex items-start gap-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 transition-colors overflow-hidden shrink-0"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-gray-500 mb-1" />
                <span className="text-[10px] text-gray-500">Subir foto</span>
              </>
            )}
          </div>
          {previewUrl && (
            <button type="button" onClick={clearFile} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
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
            <option value="CUP" className="bg-gray-900">CUP</option>
            <option value="USD" className="bg-gray-900">USD</option>
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
          {(loading || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
          {uploading ? "Subiendo imagen..." : product ? "Guardar Cambios" : "Crear Producto"}
        </button>
      </div>
    </form>
  )
}
