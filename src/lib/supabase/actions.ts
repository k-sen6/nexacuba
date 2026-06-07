"use server"

import { createServerSupabase } from "./server"
import { revalidatePath } from "next/cache"

export async function getProductos(mayoristaId?: string) {
  const supabase = await createServerSupabase()
  let query = supabase
    .from("productos")
    .select("*, mayoristas!inner(nombre_negocio, whatsapp, provincia), categorias!left(nombre, slug)")

  if (mayoristaId) {
    query = query.eq("mayorista_id", mayoristaId)
  }

  const { data, error } = await query.order("creado_en", { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getProducto(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("productos")
    .select("*, mayoristas!inner(nombre_negocio, whatsapp, provincia), categorias!left(nombre, slug)")
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function crearProducto(formData: FormData) {
  const supabase = await createServerSupabase()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("No autenticado")

  const producto = {
    mayorista_id: user.user.id,
    nombre: formData.get("nombre") as string,
    descripcion: formData.get("descripcion") as string,
    precio: parseFloat(formData.get("precio") as string),
    moneda: (formData.get("moneda") as string) || "USD",
    categoria_id: formData.get("categoria_id") as string || null,
    stock: formData.get("stock") ? parseInt(formData.get("stock") as string) : null,
    destacado: formData.get("destacado") === "true",
    activo: true,
  }

  const { error } = await supabase.from("productos").insert(producto)
  if (error) throw new Error(error.message)
  revalidatePath("/mayorista/productos")
}

export async function editarProducto(id: string, formData: FormData) {
  const supabase = await createServerSupabase()

  const producto = {
    nombre: formData.get("nombre") as string,
    descripcion: formData.get("descripcion") as string,
    precio: parseFloat(formData.get("precio") as string),
    moneda: (formData.get("moneda") as string) || "USD",
    categoria_id: formData.get("categoria_id") as string || null,
    stock: formData.get("stock") ? parseInt(formData.get("stock") as string) : null,
    destacado: formData.get("destacado") === "true",
    activo: formData.get("activo") === "true",
  }

  const { error } = await supabase.from("productos").update(producto).eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/mayorista/productos")
}

export async function eliminarProducto(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from("productos").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/mayorista/productos")
}

export async function getCategorias() {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from("categorias").select("*").order("nombre")
  if (error) throw new Error(error.message)
  return data
}

export async function getPerfilActual() {
  const supabase = await createServerSupabase()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return null

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*, mayoristas!left(*)")
    .eq("id", user.user.id)
    .single()

  return perfil
}

export async function getDashboardStats(mayoristaId: string) {
  const supabase = await createServerSupabase()

  const { count: totalProductos } = await supabase
    .from("productos")
    .select("*", { count: "exact", head: true })
    .eq("mayorista_id", mayoristaId)
    .eq("activo", true)

  const { count: totalClicks } = await supabase
    .from("clics")
    .select("*", { count: "exact", head: true })
    .eq("producto_id", mayoristaId)

  return {
    totalProductos: totalProductos || 0,
    totalClicks: totalClicks || 0,
  }
}
