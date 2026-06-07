"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Store, Mail, Lock, AlertTriangle, MailQuestion } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registrado = searchParams.get("registrado")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setNeedsConfirmation(false)
    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      if (authError.message.includes("Email not confirmed") || authError.message.includes("email_not_confirmed")) {
        setNeedsConfirmation(true)
      } else {
        setError(authError.message)
      }
      setLoading(false)
      return
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol")
      .eq("id", data.user.id)
      .single()

    if (perfil?.rol === "mayorista") {
      router.push("/mayorista/dashboard")
    } else if (perfil?.rol === "admin") {
      router.push("/admin")
    } else {
      router.push("/productos")
    }
    router.refresh()
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
          <h1 className="text-3xl font-bold text-white">Iniciar Sesión</h1>
          <p className="text-gray-400 mt-2">Accede al marketplace B2B de Cuba</p>
        </div>

        {registrado && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm text-center">
            <MailQuestion className="w-5 h-5 inline-block mr-2" />
            Te enviamos un correo de confirmación. Revisa tu bandeja de entrada (y SPAM) y haz clic en el enlace para activar tu cuenta.
          </div>
        )}

        {needsConfirmation && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
              <AlertTriangle className="w-5 h-5" />
              Correo no confirmado
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Revisa tu bandeja de entrada (y SPAM) y haz clic en el enlace de confirmación que te enviamos.
              Si el enlace te lleva a localhost, ve a Supabase Dashboard → Authentication → Settings
              y cambia <strong>Site URL</strong> a: <code className="text-blue-300 block mt-1 text-xs break-all">https://k-sen6.github.io/nexacuba</code>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="email" placeholder="Correo electrónico" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="password" placeholder="Contraseña" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50"
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
