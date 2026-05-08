import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded border border-[#2C1810]/20 bg-white px-3 py-1 text-sm text-[#2C1810] placeholder:text-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#D4A853] disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
Input.displayName = "Input"
