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

/**
 * Get avatar URL with fallback to default avatar
 * @param avatarUrl - The avatar URL from user profile
 * @returns Valid avatar URL or default avatar path
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  const DEFAULT_AVATAR = '/avatars/default.png'
  
  if (!avatarUrl || avatarUrl.trim() === '') {
    return DEFAULT_AVATAR
  }
  
  return avatarUrl
}

/**
 * Get user initials from name for avatar fallback
 * @param name - User's full name
 * @returns Two-letter initials (uppercase)
 */
export function getUserInitials(name: string | null | undefined): string {
  if (!name || name.trim() === '') {
    return 'U'
  }
  
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
