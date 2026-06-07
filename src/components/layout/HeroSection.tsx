"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowRight, Shield, Zap, Truck, Flag } from "lucide-react"

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const distortionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      if (distortionRef.current && sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          distortionRef.current.style.left = e.clientX + "px"
          distortionRef.current.style.top = e.clientY + "px"
          distortionRef.current.style.opacity = "1"
        }
      }
    }
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [])

  return (
    <section ref={sectionRef} id="inicio" className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
      <div className="absolute top-1/4 left-10 w-[30rem] h-[30rem] bg-blue-600/20 rounded-full blur-[150px] animate-pulse" />
      <div className="absolute bottom-1/3 right-10 w-[25rem] h-[25rem] bg-purple-600/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/3 right-1/4 w-[20rem] h-[20rem] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "4s" }} />
      <div ref={distortionRef} className="space-distortion fixed pointer-events-none z-[1] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.25),rgba(139,92,246,0.1),transparent_70%)] blur-[60px] translate-[-50%_-50%] opacity-0 transition-opacity duration-300" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16 z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 backdrop-blur-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500" />
              </span>
              <Flag className="w-4 h-4 text-blue-400" /> El marketplace B2B de Cuba
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight mb-6">
              <span className="block text-white">Conectamos</span>
              <span className="block bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 bg-[length:300%_300%] animate-liquid bg-clip-text text-transparent text-5xl sm:text-6xl lg:text-7xl xl:text-8xl mt-2">
                Mayoristas
              </span>
              <span className="block text-white text-xl sm:text-2xl lg:text-3xl font-light mt-4">
                con Clientes en toda Cuba
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
              La plataforma donde mayoristas cubanos publican sus ofertas y los clientes compran directamente vía WhatsApp.
              <span className="text-white font-medium"> Sin comisiones por venta.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/register?rol=mayorista"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold text-lg rounded-full hover:shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:scale-105 transition-all"
              >
                Soy Mayorista <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/register?rol=cliente"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/20 text-white font-semibold text-lg rounded-full hover:bg-white/10 hover:border-white/30 transition-all backdrop-blur-sm"
              >
                Quiero Comprar
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/5">
              {[
                { icon: Shield, label: "Proveedores Verificados", desc: "Todos los mayoristas pasan validación" },
                { icon: Zap, label: "Conexión Directa", desc: "WhatsApp directo al vendedor" },
                { icon: Truck, label: "Envío a Toda Cuba", desc: "Entrega en todas las provincias" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <item.icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-6 gap-3">
              <div className="col-span-4 row-span-2 rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-sm">
                <img src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=500&fit=crop&auto=format&q=80" alt="Productos premium" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-2 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=250&fit=crop&auto=format&q=80" alt="Smartwatch" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-3 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <img src="https://images.unsplash.com/photo-1560343090-f0409e92791a?w=350&h=250&fit=crop&auto=format&q=80" alt="Zapatos" className="w-full h-full object-cover" />
              </div>
              <div className="col-span-3 rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=350&h=250&fit=crop&auto=format&q=80" alt="Zapatillas" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/10 rounded-full blur-[60px]" />
          </div>
        </div>
      </div>
    </section>
  )
}
