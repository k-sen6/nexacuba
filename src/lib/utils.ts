import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = "USD"): string {
  return new Intl.NumberFormat("es-CU", { style: "currency", currency }).format(price)
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

export function generateWhatsAppUrl(phone: string, message: string): string {
  const clean = phone.replace(/[^0-9]/g, "")
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}
