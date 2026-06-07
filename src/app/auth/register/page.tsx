"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Store, Mail, Lock, User, Phone, Building2, MapPin, CheckCircle, ArrowRight, ShoppingCart } from "lucide-react"

function RegisterForm() {
  const searchParams = useSearchParams()
  const rolParam = searchParams.get("rol") || "cliente"
  const [rol, setRol] = useState<"cliente" | "mayorista">(rolParam as "cliente" | "mayorista")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const [form, setForm] = useState({
    email: "", password: "", nombre: "", telefono: "",
    nombre_negocio: "", provincia: "", whatsapp: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const supabase = createClient()

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          rol,
          nombre: form.nombre,
          telefono: form.telefono,
          nombre_negocio: form.nombre_negocio,
          provincia: form.provincia,
          whatsapp: form.whatsapp,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setRegisteredEmail(form.email)
    setSuccess(true)
    setLoading(false)
  }

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 pt-24 pb-12 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
        <div className="relative w-full max-w-md text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-3">Cuenta Creada</h1>
          <p className="text-gray-300 mb-6">
            Tu cuenta <strong className="text-white">{registeredEmail}</strong> ha sido creada exitosamente.
            Ya puedes iniciar sesión.
          </p>

          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all"
          >
            Ir a Iniciar Sesión <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 pt-24 pb-12 bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-black mb-6">
            <Store className="w-7 h-7 text-blue-500" />
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Nexa</span>
            <span className="text-white">Cuba</span>
          </Link>
          <h1 className="text-3xl font-bold text-white">Crear Cuenta</h1>
          <p className="text-gray-400 mt-2">Únete al marketplace B2B de Cuba</p>
        </div>

        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
          {(["cliente", "mayorista"] as const).map((r) => (
            <button
              key={r}
              onClick={() => { setRol(r); setError("") }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all inline-flex items-center justify-center gap-1.5 ${
                rol === r ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              {r === "cliente" ? <><ShoppingCart className="w-4 h-4" /> Cliente</> : <><Store className="w-4 h-4" /> Mayorista</>}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text" placeholder="Nombre completo" required
              value={form.nombre} onChange={(e) => update("nombre", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email" placeholder="Correo electrónico" required
              value={form.email} onChange={(e) => update("email", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password" placeholder="Contraseña (mín. 6 caracteres)" required minLength={6}
              value={form.password} onChange={(e) => update("password", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="tel" placeholder="Teléfono (opcional)"
              value={form.telefono} onChange={(e) => update("telefono", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {rol === "mayorista" && (
            <>
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text" placeholder="Nombre del negocio" required
                  value={form.nombre_negocio} onChange={(e) => update("nombre_negocio", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text" placeholder="Provincia" required
                  value={form.provincia} onChange={(e) => update("provincia", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="tel" placeholder="WhatsApp del negocio (+53...)" required
                  value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : `Crear Cuenta ${rol === "mayorista" ? "como Mayorista" : ""}`}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 font-medium">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}
