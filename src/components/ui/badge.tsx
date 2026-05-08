import * as React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "pro" | "free" | "success" | "warning"
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-widest font-semibold",
        {
          "bg-[#2C1810]/10 text-[#2C1810]": variant === "default",
          "bg-[#D4A853]/20 text-[#8B4513] border border-[#D4A853]/40": variant === "pro",
          "bg-[#4A6741]/15 text-[#4A6741]": variant === "free",
          "bg-green-100 text-green-800": variant === "success",
          "bg-amber-100 text-amber-800": variant === "warning",
        },
        className
      )}
      {...props}
    />
  )
}
