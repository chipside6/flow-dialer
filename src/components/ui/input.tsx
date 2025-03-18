
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, placeholder, ...props }, ref) => {
    // Create more mobile-friendly placeholder if original is too long
    const mobileOptimizedPlaceholder = placeholder && typeof placeholder === 'string' && placeholder.length > 30 
      ? `${placeholder.substring(0, 27)}...` 
      : placeholder;
    
    const isFileInput = type === 'file';
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-ellipsis md:text-sm",
          isFileInput && "text-sm file:mr-2 file:py-1.5 file:px-2 file:rounded-md file:text-xs file:font-medium file:whitespace-nowrap",
          className
        )}
        placeholder={mobileOptimizedPlaceholder as string}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
