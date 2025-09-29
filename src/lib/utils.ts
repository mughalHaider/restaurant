import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// ✅ merge tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ✅ get week number from a date
export function getWeek(date: Date): number {
  const firstJan = new Date(date.getFullYear(), 0, 1)
  const days = Math.floor((date.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000))
  return Math.ceil((days + firstJan.getDay() + 1) / 7)
}
