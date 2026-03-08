import * as React from "react"

import { cn } from "../../lib/utils"

interface CustomInputProps extends React.ComponentProps<"input"> {
  emailError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, emailError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          `w-full rounded-lg border bg-zinc-800 px-3 py-2 text-sm text-zinc-50
           placeholder:text-zinc-500
           focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 focus:ring-offset-zinc-900
           disabled:cursor-not-allowed disabled:opacity-50
           transition-colors
           ${emailError ? 'border-red-500/70' : 'border-zinc-700 hover:border-zinc-600'}`,
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }