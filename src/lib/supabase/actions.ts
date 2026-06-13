"use server"

import { createServerSupabase } from "./server"
import { revalidatePath } from "next/cache"

export async function getProductos(vendedorId?: string, tipoVendedor?: "mayorista" | "minorista") {
  const supabase = await createServerSupabase()
  let query = supabase
    .from("productos")
    .select("*, mayoristas!left(nombre_negocio, whatsapp, provincia, verificada), minoristas!left(nombre_negocio, whatsapp, provincia, verificada), categorias!left(nombre, slug)")

  if (vendedorId && tipoVendedor === "mayorista") {
    query = query.eq("mayorista_id", vendedorId)
  } else if (vendedorId && tipoVendedor === "minorista") {
    query = query.eq("minorista_id", vendedorId)
  }

  const { data, error } = await query.order("creado_en", { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getProducto(id: string) {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from("productos")
    .select("*, mayoristas!left(nombre_negocio, whatsapp, provincia, verificada), minoristas!left(nombre_negocio, whatsapp, provincia, verificada), categorias!left(nombre, slug)")
    .eq("id", id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function crearProducto(formData: FormData) {
  const supabase = await createServerSupabase()
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error("No autenticado")

  const tipo = formData.get("tipo") as string
  const producto: Record<string, any> = {
    nombre: formData.get("nombre") as string,
    descripcion: formData.get("descripcion") as string,
    precio: parseFloat(formData.get("precio") as string),
    moneda: (formData.get("moneda") as string) || "USD",
    categoria_id: formData.get("categoria_id") as string || null,
    stock: formData.get("stock") ? parseInt(formData.get("stock") as string) : null,
    destacado: formData.get("destacado") === "true",
    activo: true,
  }

  if (tipo === "minorista") {
    producto.minorista_id = user.user.id
  } else {
    producto.mayorista_id = user.user.id
  }

  const { error } = await supabase.from("productos").insert(producto)
  if (error) throw new Error(error.message)

  const path = tipo === "minorista" ? "/minorista/productos" : "/mayorista/productos"
  revalidatePath(path)
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
  revalidatePath("/minorista/productos")
}

export async function eliminarProducto(id: string) {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from("productos").delete().eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/mayorista/productos")
  revalidatePath("/minorista/productos")
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
    .select("*, mayoristas!left(*), minoristas!left(*)")
    .eq("id", user.user.id)
    .single()

  return perfil
}

export async function getDashboardStats(vendedorId: string, tipo: "mayorista" | "minorista") {
  const supabase = await createServerSupabase()

  const idField = tipo === "mayorista" ? "mayorista_id" : "minorista_id"

  const { count: totalProductos } = await supabase
    .from("productos")
    .select("*", { count: "exact", head: true })
    .eq(idField, vendedorId)
    .eq("activo", true)

  const { count: totalClicks } = await supabase
    .from("clics")
    .select("*", { count: "exact", head: true })
    .eq("producto_id", vendedorId)

  return {
    totalProductos: totalProductos || 0,
    totalClicks: totalClicks || 0,
  }
}
