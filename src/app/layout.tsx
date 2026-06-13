import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "NexaCuba | Marketplace Mayorista & Minorista",
  description: "La plataforma B2B que conecta mayoristas y minoristas con clientes en Cuba. Ofertas, catálogos y gestión de ventas.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "NexaCuba", statusBarStyle: "black-translucent" },
  icons: { apple: "/icon-192.svg" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem("nexacuba-theme");if(t==="light")document.documentElement.classList.add("light")}catch(e){}})()`
        }} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Toaster position="bottom-right" theme="dark" />
      </body>
    </html>
  )
}
