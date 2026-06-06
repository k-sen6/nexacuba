export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-24 px-5 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)]" />
      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent font-semibold text-xs sm:text-sm uppercase tracking-[.2em]">
            Proceso Simple
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mt-4 mb-6">
            ¿Cómo <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Funciona?</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Tres pasos para conectar con mayoristas en Cuba</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {[
            { num: "1", title: "Explora Ofertas", desc: "Navega por cientos de productos de mayoristas verificados en toda Cuba." },
            { num: "2", title: "Contacta Directo", desc: "Un clic te lleva al WhatsApp del mayorista. Sin intermediarios." },
            { num: "3", title: "Recibe tu Pedido", desc: "Coordina envío y pago directamente con el vendedor." },
          ].map((step) => (
            <div key={step.num} className="rounded-2xl p-8 text-center border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:border-blue-500/30 hover:-translate-y-1 transition-all">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-3xl font-black text-white shadow-lg shadow-blue-500/20">
                {step.num}
              </div>
              <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">
                {step.title}
              </h3>
              <p className="text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
