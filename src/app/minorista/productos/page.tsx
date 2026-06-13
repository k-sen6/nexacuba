"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, Edit3, Loader2, Package, Star } from "lucide-react"
import { Modal } from "@/components/ui/Modal"
import { ProductForm } from "@/components/products/ProductForm"
import { toast } from "sonner"

interface Producto {
  id: string
  nombre: string
  precio: number
  moneda: string
  categoria_id: string | null
  stock: number | null
  activo: boolean
  destacado: boolean
  descripcion: string | null
  imagenes: string[]
  categorias?: { nombre: string } | null
}

export default function MinoristaProductos() {
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Producto | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/auth/login"); setLoading(false); return }
      const { data: cats } = await supabase.from("categorias").select("*").order("nombre")
      setCategorias(cats || [])
      const { data: prods } = await supabase
        .from("productos")
        .select("*, categorias!left(nombre)")
        .eq("minorista_id", user.id)
        .order("creado_en", { ascending: false })
      setProductos(prods || [])
      setLoading(false)
    })()
  }, [router])

  const openCreate = () => { setEditProduct(null); setModalOpen(true) }
  const openEdit = (p: Producto) => { setEditProduct(p); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditProduct(null); loadProducts() }

  const loadProducts = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from("productos")
      .select("*, categorias!left(nombre)")
      .eq("minorista_id", user.id)
      .order("creado_en", { ascending: false })
    setProductos(data || [])
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const supabase = createClient()
    const { error } = await supabase.from("productos").delete().eq("id", deleteId)
    if (error) {
      toast.error("Error al eliminar el producto")
      return
    }
    toast.success("Producto eliminado")
    setDeleteId(null)
    loadProducts()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )

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
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-sm rounded-full hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
            <Plus className="w-4 h-4" /> Añadir Producto
          </button>
        </div>

        {productos.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">No tienes productos aún</p>
            <p className="text-gray-500 text-sm mb-6">Publica tu primer producto y aparece en el catálogo</p>
            <button onClick={openCreate} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all">
              <Plus className="w-4 h-4" /> Publicar Primer Producto
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="text-left p-4 text-sm text-gray-400 font-medium">Producto</th>
                    <th className="text-left p-4 text-sm text-gray-400 font-medium">Precio</th>
                    <th className="text-left p-4 text-sm text-gray-400 font-medium">Categoría</th>
                    <th className="text-left p-4 text-sm text-gray-400 font-medium">Stock</th>
                    <th className="text-left p-4 text-sm text-gray-400 font-medium">Destacado</th>
                    <th className="text-left p-4 text-sm text-gray-400 font-medium">Estado</th>
                    <th className="text-right p-4 text-sm text-gray-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 text-white font-medium">{p.nombre}</td>
                      <td className="p-4 text-white">${p.precio} {p.moneda}</td>
                      <td className="p-4 text-gray-400">{p.categorias?.nombre || "—"}</td>
                      <td className="p-4 text-gray-400">{p.stock ?? "∞"}</td>
                      <td className="p-4">
                        {p.destacado ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><Star className="w-3 h-3 fill-amber-400" /> Destacado</span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.activo
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {p.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-all">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(p.id)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editProduct ? "Editar Producto" : "Nuevo Producto"}>
        <ProductForm
          onClose={closeModal}
          product={editProduct || undefined}
          categorias={categorias}
          tipoVendedor="minorista"
        />
      </Modal>

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar Producto">
        <p className="text-gray-300 mb-6">¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-white/20 text-white font-medium hover:bg-white/10 transition-all">
            Cancelar
          </button>
          <button onClick={handleDelete} className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all">
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  )
}
