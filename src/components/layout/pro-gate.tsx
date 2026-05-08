"use client"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Crown } from "lucide-react"

export function ProGate({ children, feature = "This feature" }: { children: React.ReactNode; feature?: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const isPro = session?.user?.subscriptionTier === "PRO" || session?.user?.isAdmin === true

  if (isPro) return <>{children}</>

  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-[#D4A853]/15 flex items-center justify-center mb-6">
        <Crown size={28} className="text-[#D4A853]" />
      </div>
      <h2 className="font-display text-2xl font-bold text-[#2C1810] mb-3">Pro Feature</h2>
      <p className="text-[#8B7355] max-w-xs mb-8 leading-relaxed">
        {feature} is available on Stock & Plate Pro. Upgrade to unlock the full restaurant toolkit.
      </p>
      <Button variant="gold" size="lg" onClick={() => router.push("/upgrade")}>
        Upgrade to Pro — $12/mo
      </Button>
    </div>
  )
}
