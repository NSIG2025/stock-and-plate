"use client"
import { useSession } from "next-auth/react"

interface AdSlotProps {
  slot?: string
  className?: string
}

export function AdSlot({ slot, className }: AdSlotProps) {
  const { data: session } = useSession()
  const isPro = session?.user?.subscriptionTier === "PRO"

  // Pro users see no ads
  if (isPro) return null

  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID
  if (!publisherId) {
    // AdSense not configured yet — show placeholder
    return (
      <div className={`bg-[#E8DCC8]/60 border border-dashed border-[#8B4513]/20 rounded text-center py-4 px-2 ${className}`}>
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#8B7355]/50">Advertisement</p>
      </div>
    )
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={`ca-pub-${publisherId}`}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
