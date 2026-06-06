import Link from "next/link"

const categories = [
  { icon: "📱", name: "Tecnología", slug: "tecnologia" },
  { icon: "👕", name: "Moda", slug: "moda" },
  { icon: "🍎", name: "Alimentos", slug: "alimentos" },
  { icon: "🏠", name: "Hogar", slug: "hogar" },
  { icon: "⚽", name: "Deportes", slug: "deportes" },
  { icon: "✨", name: "Más", slug: "mas" },
]

export function CategoriesSection() {
  return (
    <section id="categorias" className="py-24 px-5 bg-gradient-to-b from-black via-gray-950 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent font-semibold text-xs sm:text-sm uppercase tracking-[.2em]">
            Navega por
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mt-4 mb-6">
            Categorías <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Top</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Encuentra lo que necesitas al mejor precio</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/productos?categoria=${cat.slug}`}
              className="rounded-2xl p-6 text-center border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] hover:border-blue-500/30 hover:-translate-y-1 transition-all"
            >
              <span className="text-5xl block mb-3">{cat.icon}</span>
              <span className="text-sm font-semibold text-white">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
