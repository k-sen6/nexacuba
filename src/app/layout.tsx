import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "NexaCuba | Marketplace Mayorista",
  description: "La plataforma B2B que conecta mayoristas con clientes en Cuba. Ofertas, catálogos y gestión de ventas.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  )
}
