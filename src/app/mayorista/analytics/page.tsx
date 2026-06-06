"use client"

import { TrendingUp, Eye, MousePointerClick, ShoppingBag } from "lucide-react"

export default function MayoristaAnalytics() {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
  const data = [30, 45, 38, 52, 48, 70, 65]
  const max = Math.max(...data)

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent">Analytics</span>
          </h1>
          <p className="text-gray-400 mt-1">Métricas detalladas de tu negocio</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Eye, label: "Visitas Totales", value: "1,847", change: "+23%", color: "blue" },
            { icon: MousePointerClick, label: "WhatsApp Clicks", value: "342", change: "+15%", color: "purple" },
            { icon: ShoppingBag, label: "Productos Vendidos", value: "28", change: "+40%", color: "cyan" },
            { icon: TrendingUp, label: "Tasa Conversión", value: "8.2%", change: "+2.1%", color: "green" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl border border-white/10 bg-white/[0.03]">
              <s.icon className={`w-5 h-5 text-${s.color}-500 mb-3`} />
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
              <div className="text-xs text-green-400 mt-0.5">{s.change}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-bold text-white mb-6">Visitas esta semana</h2>
          <div className="flex items-end gap-3 h-40">
            {data.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500">{v}</span>
                <div
                  className="w-full rounded-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:from-blue-500 hover:to-blue-300"
                  style={{ height: `${(v / max) * 100}%` }}
                />
                <span className="text-xs text-gray-500">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
