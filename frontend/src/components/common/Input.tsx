import * as React from 'react'
import { Label } from '@/components/ui/label'
import { Input as UiInput } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface InputProps extends React.ComponentProps<typeof UiInput> {
  id?: string
  label?: React.ReactNode
  helperText?: React.ReactNode
  error?: string | null
  className?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, helperText, error = null, className, ...props }, ref) => {
    const inputId = id ?? (props.name ? String(props.name) : undefined)

    return (
      <div className={cn('flex w-full flex-col', className)}>
        {label ? (
          <Label htmlFor={inputId} className="mb-1">
            {label}
          </Label>
        ) : null}

        <UiInput
          id={inputId}
          ref={ref}
          aria-invalid={!!error}
          {...props}
        />

        {error ? (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
