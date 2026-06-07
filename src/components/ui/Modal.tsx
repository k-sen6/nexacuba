"use client"

import { useEffect, useRef } from "react"
import { X } from "lucide-react"

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-lg rounded-2xl bg-gray-950 border border-white/10 text-white backdrop:bg-black/60 backdrop:backdrop-blur-sm p-0"
    >
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-xl font-bold">{title}</h2>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </dialog>
  )
}
