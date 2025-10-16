import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDashboardUrl(role: string): string {
  const normalizedRole = role.toUpperCase()
  
  switch (normalizedRole) {
    case "ADMIN":
      return "/admin"
    case "SUB_ADMIN":
      return "/sous-admin"
    case "TRAINER":
    case "TEACHER":
      return "/formateur"
    case "STUDENT":
      return "/etudiant"
    default:
      return "/etudiant"
  }
}
