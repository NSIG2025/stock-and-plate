"use client"
import { useState } from "react"
import { Crown, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const PRO_FEATURES = ["Financial dashboard & profit tracking","Menu & plate costing","Food cost % per dish","Sales recording","Delivery tracking","Supplier management","CSV/PDF export","No ads"]

export default function UpgradePage() {
  const [loading, setLoading] = useState(false)

  async function checkout() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"checkout"})})
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error("Could not start checkout")
    } catch { toast.error("Checkout failed") }
    finally { setLoading(false) }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[#D4A853]/15 flex items-center justify-center mx-auto mb-4">
          <Crown size={28} className="text-[#D4A853]"/>
        </div>
        <h1 className="font-display text-3xl font-bold text-[#2C1810] mb-2">Upgrade to Pro</h1>
        <p className="text-[#8B7355]">Unlock the full restaurant &amp; food truck toolkit</p>
      </div>

      <div className="bg-[#2C1810] rounded-2xl p-8 shadow-xl">
        <div className="flex items-end gap-2 mb-1">
          <span className="font-display text-5xl font-bold text-[#F5F0E8]">$12</span>
          <span className="text-[#E8DCC8]/50 mb-2">/month</span>
        </div>
        <p className="text-[#D4A853]/70 font-mono text-[10px] uppercase tracking-widest mb-8">Billed monthly · Cancel anytime</p>

        <ul className="space-y-3 mb-8">
          {PRO_FEATURES.map(f=>(
            <li key={f} className="flex items-center gap-3 text-sm text-[#F5F0E8]">
              <Check size={16} className="text-[#D4A853] shrink-0"/>
              {f}
            </li>
          ))}
        </ul>

        <Button variant="gold" size="lg" className="w-full" onClick={checkout} disabled={loading}>
          {loading?"Redirecting to checkout...":"Upgrade Now — $12/mo"}
        </Button>
        <p className="text-center text-[#E8DCC8]/30 text-xs mt-4">Secure payment via Stripe</p>
      </div>

      <div className="mt-6 p-4 bg-[#4A6741]/10 rounded-lg border border-[#4A6741]/20 flex items-start gap-3">
        <Sparkles size={16} className="text-[#4A6741] mt-0.5 shrink-0"/>
        <div>
          <p className="text-sm font-medium text-[#2C1810]">All Free features stay free</p>
          <p className="text-xs text-[#8B7355] mt-0.5">Pantry, recipes, AI chef, and shopping lists are always free. Pro adds the business layer on top.</p>
        </div>
      </div>
    </div>
  )
}
