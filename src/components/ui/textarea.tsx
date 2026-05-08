import * as React from "react"
import { cn } from "@/lib/utils"

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[80px] w-full rounded border border-[#2C1810]/20 bg-white px-3 py-2 text-sm text-[#2C1810] placeholder:text-[#8B7355] focus:outline-none focus:ring-2 focus:ring-[#D4A853] resize-none",
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"
