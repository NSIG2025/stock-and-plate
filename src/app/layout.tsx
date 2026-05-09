import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import { Toaster } from "sonner"
import { Providers } from "@/components/layout/providers"

export const metadata: Metadata = {
  title: { default: "Stock & Plate", template: "%s | Stock & Plate" },
  description: "From Pantry to Plate — kitchen intelligence for home cooks and food businesses.",
}

const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {ADSENSE_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${ADSENSE_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#2C1810",
                color: "#F5F0E8",
                border: "1px solid rgba(212,168,83,0.3)",
                fontFamily: "'Source Sans 3', sans-serif",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
