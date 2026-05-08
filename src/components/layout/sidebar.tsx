"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
  Package, BookOpen, ShoppingCart, Sparkles,
  LayoutDashboard, UtensilsCrossed, Truck, Users,
  BarChart3, Settings, Crown, LogOut, ChevronRight, Shield
} from "lucide-react"

const FREE_LINKS = [
  { href: "/pantry",      label: "Pantry",        icon: Package },
  { href: "/ingredients", label: "Ingredients",   icon: BookOpen },
  { href: "/recipes",     label: "Recipes",       icon: UtensilsCrossed },
  { href: "/shopping",    label: "Shopping",      icon: ShoppingCart },
  { href: "/ai",          label: "AI Chef",       icon: Sparkles },
]

const PRO_LINKS = [
  { href: "/dashboard",   label: "Dashboard",     icon: BarChart3 },
  { href: "/plates",      label: "Menu & Plates", icon: LayoutDashboard },
  { href: "/sales",       label: "Sales",         icon: BarChart3 },
  { href: "/deliveries",  label: "Deliveries",    icon: Truck },
  { href: "/suppliers",   label: "Suppliers",     icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isPro = session?.user?.subscriptionTier === "PRO" || session?.user?.isAdmin === true
  const isAdmin = session?.user?.isAdmin === true

  return (
    <aside className="w-64 shrink-0 bg-[#2C1810] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/8">
        <Link href="/pantry" className="flex items-center gap-3 group">
          <svg width="32" height="32" viewBox="0 0 160 160" fill="none">
            <path d="M28 152 L28 74 Q28 16 80 16 Q132 16 132 74 L132 152" stroke="#D4A853" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
            <rect x="42" y="104" width="76" height="7" rx="2" fill="#D4A853" opacity="0.9"/>
            <rect x="50" y="78" width="16" height="24" rx="3" fill="none" stroke="#D4A853" strokeWidth="2.2"/>
            <rect x="72" y="70" width="16" height="32" rx="3" fill="none" stroke="#D4A853" strokeWidth="2.2"/>
            <rect x="94" y="86" width="14" height="16" rx="3" fill="none" stroke="#D4A853" strokeWidth="2.2"/>
          </svg>
          <div>
            <p className="font-display text-[#F5F0E8] text-lg font-bold leading-tight">Stock &amp; Plate</p>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4A853] opacity-60">From Pantry to Plate</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        <NavSection label="Kitchen" links={FREE_LINKS} pathname={pathname} />

        <div className="pt-4 pb-1 px-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#D4A853] opacity-50">Pro</span>
            {!isPro && <span className="text-[9px] font-mono uppercase tracking-widest text-[#D4A853]/40 border border-[#D4A853]/20 rounded-full px-1.5">Locked</span>}
          </div>
        </div>
        <NavSection links={PRO_LINKS} pathname={pathname} isPro={isPro} />
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-white/8 pt-3">
        {!isPro && (
          <Link href="/upgrade" className="flex items-center gap-2 px-3 py-2 rounded text-[#D4A853] hover:bg-[#D4A853]/10 transition-colors text-sm font-medium">
            <Crown size={16} /> Upgrade to Pro
          </Link>
        )}
        {isAdmin && (
          <Link href="/admin" className={cn("flex items-center gap-2 px-3 py-2 rounded text-[#D4A853]/70 hover:bg-[#D4A853]/10 hover:text-[#D4A853] transition-colors text-sm", pathname === "/admin" && "bg-[#D4A853]/15 text-[#D4A853]")}>
            <Shield size={16} />
            Admin
          </Link>
        )}
        <Link href="/settings" className={cn("flex items-center gap-2 px-3 py-2 rounded text-[#F5F0E8]/60 hover:bg-white/6 hover:text-[#F5F0E8] transition-colors text-sm", pathname === "/settings" && "bg-white/8 text-[#F5F0E8]")}>
          <Settings size={16} />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-2 px-3 py-2 rounded text-[#F5F0E8]/40 hover:bg-white/6 hover:text-[#F5F0E8]/70 transition-colors text-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>
        {session?.user && (
          <div className="px-3 pt-2 border-t border-white/8 mt-2">
            <p className="text-[11px] text-[#F5F0E8]/40 truncate">{session.user.email}</p>
            {isPro && <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4A853] opacity-70 mt-0.5">Pro</p>}
          </div>
        )}
      </div>
    </aside>
  )
}

function NavSection({ label, links, pathname, isPro }: { label?: string; links: typeof FREE_LINKS; pathname: string; isPro?: boolean }) {
  return (
    <>
      {label && <p className="px-3 py-1 text-[9px] font-mono uppercase tracking-widest text-[#F5F0E8]/25">{label}</p>}
      {links.map(({ href, label, icon: Icon }) => {
        const locked = isPro === false
        const active = pathname === href
        return (
          <Link
            key={href}
            href={locked ? "/upgrade" : href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors group",
              active ? "bg-[#D4A853]/15 text-[#D4A853]" : "text-[#F5F0E8]/55 hover:bg-white/6 hover:text-[#F5F0E8]",
              locked && "opacity-40"
            )}
          >
            <Icon size={16} className="shrink-0" />
            <span className="flex-1">{label}</span>
            {locked && <ChevronRight size={12} className="opacity-40" />}
          </Link>
        )
      })}
    </>
  )
}
