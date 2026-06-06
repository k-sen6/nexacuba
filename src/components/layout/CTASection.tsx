import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 px-5 border-t border-white/10 bg-black">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-black mb-6">
          ¿Eres <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Mayorista?</span>
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Llega a miles de clientes en Cuba. Publica tus productos, recibe consultas directas por WhatsApp y haz crecer tu negocio.
          <span className="text-white font-medium"> Plan gratuito disponible.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register?rol=mayorista"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-lg rounded-full hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:scale-105 transition-all"
          >
            Registrar mi Negocio →
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold text-lg rounded-full hover:bg-white/10 transition-all"
          >
            Explorar Productos
          </Link>
        </div>
      </div>
      <footer className="mt-24 pt-8 border-t border-white/5 text-center text-sm text-gray-500 max-w-7xl mx-auto">
        © 2026 NexaCuba — Marketplace B2B para mayoristas en Cuba.
      </footer>
    </section>
  )
}
