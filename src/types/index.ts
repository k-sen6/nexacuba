export type RolUsuario = "cliente" | "mayorista" | "minorista" | "admin"

export interface PerfilUsuario {
  id: string
  email: string
  rol: RolUsuario
  nombre: string
  telefono?: string
  avatar_url?: string
  created_at: string
}

export interface Mayorista extends PerfilUsuario {
  nombre_negocio: string
  descripcion?: string
  whatsapp: string
  direccion?: string
  provincia: string
  acepta_transferencia: boolean
  tipo_envio: "domicilio" | "recogida" | "ambos"
  verificada: boolean
  plan: PlanSuscripcion
  plan_activo_hasta?: string
}

export interface Minorista extends PerfilUsuario {
  nombre_negocio: string
  descripcion?: string
  whatsapp: string
  direccion?: string
  provincia: string
  acepta_transferencia: boolean
  tipo_envio: "domicilio" | "recogida" | "ambos"
  verificada: boolean
  plan: PlanSuscripcion
  plan_activo_hasta?: string
}

export type PlanSuscripcion = "gratis" | "basico" | "pro" | "enterprise"

export interface PlanInfo {
  id: PlanSuscripcion
  nombre: string
  precio_mensual: number
  moneda: string
  productos_max: number
  analytics: boolean
  soporte_preferente: boolean
  equipo_ilimitado: boolean
  api_acceso: boolean
}

export interface Categoria {
  id: string
  nombre: string
  icono: string
  slug: string
}

export interface Producto {
  id: string
  mayorista_id?: string
  minorista_id?: string
  nombre: string
  descripcion: string
  precio: number
  moneda: "USD" | "CUP"
  imagenes: string[]
  categoria_id: string
  stock?: number
  destacado: boolean
  activo: boolean
  created_at: string
  mayorista?: Pick<Mayorista, "nombre_negocio" | "whatsapp" | "provincia" | "verificada" | "acepta_transferencia" | "tipo_envio">
  minorista?: Pick<Minorista, "nombre_negocio" | "whatsapp" | "provincia" | "verificada" | "acepta_transferencia" | "tipo_envio">
}

export interface Oferta {
  id: string
  producto_id: string
  precio_oferta: number
  fecha_inicio: string
  fecha_fin: string
  activa: boolean
}

export interface ClickLead {
  id: string
  producto_id: string
  cliente_id?: string
  ip?: string
  created_at: string
}

export interface Suscripcion {
  id: string
  vendedor_id: string
  vendedor_tipo: "mayorista" | "minorista"
  plan: PlanSuscripcion
  monto: number
  fecha_inicio: string
  fecha_fin: string
  activa: boolean
  stripe_subscription_id?: string
}

export interface DashboardStats {
  total_visitas: number
  total_clicks_whatsapp: number
  total_leads: number
  total_productos: number
  visitas_por_dia: { fecha: string; visitas: number }[]
  productos_top: { nombre: string; clicks: number; producto_id: string }[]
  conversion_rate: number
}
