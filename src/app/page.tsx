import Link from "next/link"
import { Package, Sparkles, ShoppingCart, BarChart3, Crown, Check } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8]" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      {/* Nav */}
      <nav className="border-b border-[#2C1810]/10 bg-[#F5F0E8]/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg width="28" height="28" viewBox="0 0 160 160" fill="none">
              <path d="M28 152 L28 74 Q28 16 80 16 Q132 16 132 74 L132 152" stroke="#2C1810" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <rect x="42" y="104" width="76" height="7" rx="2" fill="#8B4513"/>
              <rect x="50" y="78" width="16" height="24" rx="3" fill="none" stroke="#2C1810" strokeWidth="2.2"/>
              <rect x="72" y="70" width="16" height="32" rx="3" fill="none" stroke="#2C1810" strokeWidth="2.2"/>
              <rect x="94" y="86" width="14" height="16" rx="3" fill="none" stroke="#2C1810" strokeWidth="2.2"/>
            </svg>
            <div>
              <p className="font-bold text-[#2C1810] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Stock &amp; Plate</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-[#2C1810]/60 hover:text-[#2C1810] transition-colors">Sign In</Link>
            <Link href="/register" className="bg-[#2C1810] text-[#F5F0E8] text-sm px-4 py-2 rounded hover:bg-[#3d2214] transition-colors">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#8B4513] opacity-70 mb-6">From Pantry to Plate</p>
        <h1 className="text-5xl md:text-7xl font-bold text-[#2C1810] leading-[0.95] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          Every Kitchen,<br /><em className="italic text-[#D4A853]">Accounted For.</em>
        </h1>
        <p className="text-lg text-[#8B7355] max-w-2xl mx-auto mb-10 leading-relaxed">
          Track your pantry, cost your recipes, build smart shopping lists, and let AI suggest what to cook tonight — all from one beautiful, cloud-synced app.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="bg-[#2C1810] text-[#F5F0E8] px-8 py-3.5 rounded text-base font-medium hover:bg-[#3d2214] transition-colors">
            Start Free — No Credit Card
          </Link>
          <Link href="/login" className="border border-[#2C1810]/20 text-[#2C1810] px-8 py-3.5 rounded text-base hover:bg-[#2C1810]/5 transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#2C1810] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#D4A853] opacity-60 text-center mb-4">What&apos;s Inside</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#F5F0E8] text-center mb-16" style={{ fontFamily: "'Playfair Display', serif" }}>
            Built for the Way You Actually Cook.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Package, title: "Pantry Tracking", desc: "Know exactly what you have, where it is, and when it expires. Set min-stock alerts so you never run short." },
              { icon: ShoppingCart, title: "Smart Shopping", desc: "Pick the recipes you want to cook. The app builds your shopping list and subtracts what you already have." },
              { icon: Sparkles, title: "AI Recipe Suggestions", desc: "Tell the AI what's in your pantry. It suggests 3 recipes you can make right now — no grocery run needed." },
              { icon: BarChart3, title: "Pro: Restaurant Tools", desc: "Financial dashboard, menu costing, food cost %, sales tracking, supplier management — everything the pro kitchen demands." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 rounded-lg p-6 border border-white/[0.08]">
                <Icon size={24} className="text-[#D4A853] mb-4" />
                <h3 className="font-bold text-[#F5F0E8] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{title}</h3>
                <p className="text-[#E8DCC8]/55 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#8B4513] opacity-70 text-center mb-4">Pricing</p>
        <h2 className="text-3xl md:text-4xl font-bold text-[#2C1810] text-center mb-16" style={{ fontFamily: "'Playfair Display', serif" }}>
          Two Tiers. One Platform.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-white rounded-xl border border-[#2C1810]/10 p-8 shadow-sm">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#8B7355] mb-2">Home Cook</p>
            <p className="text-4xl font-bold text-[#2C1810] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Free</p>
            <p className="text-[#8B7355] text-sm mb-8">Always free, forever.</p>
            <ul className="space-y-3 mb-8">
              {["Pantry inventory tracking","Ingredient cost tracking","Recipe builder","AI recipe suggestions","Smart shopping lists","Low stock alerts","Cloud sync & accounts"].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#2C1810]">
                  <Check size={15} className="text-[#4A6741] shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block text-center bg-[#2C1810] text-[#F5F0E8] py-2.5 rounded hover:bg-[#3d2214] transition-colors text-sm font-medium">
              Get Started Free
            </Link>
          </div>
          {/* Pro */}
          <div className="bg-[#2C1810] rounded-xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <Crown size={20} className="text-[#D4A853]" />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#D4A853] opacity-70 mb-2">Restaurant Pro</p>
            <p className="text-4xl font-bold text-[#F5F0E8] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>$12<span className="text-lg font-normal opacity-60">/mo</span></p>
            <p className="text-[#E8DCC8]/50 text-sm mb-8">Everything in Free, plus:</p>
            <ul className="space-y-3 mb-8">
              {["Financial dashboard","Menu & plate costing","Food cost % calculator","Sales recording","Delivery tracking","Supplier management","CSV/PDF export"].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-[#F5F0E8]">
                  <Check size={15} className="text-[#D4A853] shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/register" className="block text-center bg-[#D4A853] text-[#2C1810] py-2.5 rounded hover:bg-[#c49640] transition-colors text-sm font-semibold">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2C1810]/10 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#2C1810]/30">Stock &amp; Plate · 2026</p>
          <div className="flex gap-6">
            <Link href="/login" className="text-xs text-[#2C1810]/40 hover:text-[#2C1810]/70 transition-colors">Sign In</Link>
            <Link href="/register" className="text-xs text-[#2C1810]/40 hover:text-[#2C1810]/70 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
