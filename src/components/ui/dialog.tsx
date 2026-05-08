"use client"
import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#130C08]/60" onClick={onClose} />
      <div className={cn("relative bg-[#F5F0E8] rounded-xl border border-[#2C1810]/15 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto", className)}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#2C1810]/10">
          <h2 className="font-display text-lg font-bold text-[#2C1810]">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#2C1810]/8 transition-colors">
            <X size={18} className="text-[#8B7355]" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
