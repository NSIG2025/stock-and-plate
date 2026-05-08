"use client"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Crown, Settings } from "lucide-react"

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name ?? "")
  const [saving, setSaving] = useState(false)
  const isPro = session?.user?.subscriptionTier === "PRO"

  async function saveName() {
    setSaving(true)
    const res = await fetch("/api/user",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({name})})
    setSaving(false)
    if (res.ok) { await update({ name }); toast.success("Name updated") }
    else toast.error("Update failed")
  }

  async function manageSubscription() {
    const res = await fetch("/api/stripe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"portal"})})
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else toast.error("Could not open billing portal")
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Settings" />

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-[#2C1810]/10 p-6">
          <h3 className="font-display font-bold text-[#2C1810] mb-4">Profile</h3>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name"/></div>
            <div><Label>Email</Label><Input value={session?.user?.email??""} disabled className="opacity-50"/></div>
            <Button onClick={saveName} disabled={saving}>{saving?"Saving...":"Save Changes"}</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#2C1810]/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-[#2C1810]">Subscription</h3>
            <Badge variant={isPro?"pro":"free"}>{isPro?"Pro":"Free"}</Badge>
          </div>
          {isPro ? (
            <div>
              <p className="text-sm text-[#8B7355] mb-4">You&apos;re on Stock &amp; Plate Pro. Manage your billing and subscription below.</p>
              <Button variant="outline" onClick={manageSubscription}>Manage Billing</Button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-[#8B7355] mb-4">You&apos;re on the free plan. Upgrade to unlock restaurant tools, financial dashboard, and more.</p>
              <Button variant="gold" onClick={()=>window.location.href="/upgrade"}><Crown size={16}/>Upgrade to Pro — $12/mo</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
