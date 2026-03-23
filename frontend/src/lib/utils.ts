import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number, currency = 'USD', locale = undefined) {
  try {
    const formatter = new Intl.NumberFormat(locale ?? undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    })
    return formatter.format(value)
  } catch (e) {
    // Fallback
    return `${currency} ${value.toFixed(2)}`
  }
}
