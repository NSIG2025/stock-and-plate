export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#2C1810] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg width="36" height="36" viewBox="0 0 160 160" fill="none">
              <path d="M28 152 L28 74 Q28 16 80 16 Q132 16 132 74 L132 152" stroke="#D4A853" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              <rect x="42" y="104" width="76" height="7" rx="2" fill="#D4A853" opacity="0.9"/>
              <rect x="50" y="78" width="16" height="24" rx="3" fill="none" stroke="#D4A853" strokeWidth="2.2"/>
              <rect x="72" y="70" width="16" height="32" rx="3" fill="none" stroke="#D4A853" strokeWidth="2.2"/>
              <rect x="94" y="86" width="14" height="16" rx="3" fill="none" stroke="#D4A853" strokeWidth="2.2"/>
            </svg>
            <p className="text-2xl font-bold text-[#F5F0E8]" style={{ fontFamily: "'Playfair Display', serif" }}>Stock &amp; Plate</p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#D4A853] opacity-50">From Pantry to Plate</p>
        </div>
        <div className="bg-[#F5F0E8] rounded-2xl border border-white/10 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  )
}
