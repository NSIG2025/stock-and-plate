import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "gold"
  size?: "sm" | "md" | "lg"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A853] disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[#2C1810] text-[#F5F0E8] hover:bg-[#3d2214]": variant === "default",
            "border border-[#2C1810]/20 text-[#2C1810] hover:bg-[#2C1810]/5": variant === "outline",
            "text-[#2C1810] hover:bg-[#2C1810]/8": variant === "ghost",
            "bg-red-700 text-white hover:bg-red-800": variant === "danger",
            "bg-[#D4A853] text-[#2C1810] hover:bg-[#c49640] font-semibold": variant === "gold",
          },
          {
            "h-7 px-3 text-xs": size === "sm",
            "h-9 px-4 text-sm": size === "md",
            "h-11 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
