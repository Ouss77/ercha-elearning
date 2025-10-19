/**
 * Predefined avatar options
 * Users can select from these or upload their own
 */

export const PREDEFINED_AVATARS = [
  { id: 'default', path: '/avatars/default.png', name: 'Par défaut' },
  { id: 'avatar-1', path: '/avatars/avatar-1.png', name: 'Avatar 1' },
  { id: 'avatar-2', path: '/avatars/avatar-2.png', name: 'Avatar 2' },
  { id: 'avatar-3', path: '/avatars/avatar-3.png', name: 'Avatar 3' },
  { id: 'avatar-4', path: '/avatars/avatar-4.png', name: 'Avatar 4' },
  { id: 'avatar-5', path: '/avatars/avatar-5.png', name: 'Avatar 5' },
  { id: 'avatar-6', path: '/avatars/avatar-6.png', name: 'Avatar 6' },
] as const

export const DEFAULT_AVATAR_PATH = '/avatars/default.png'

/**
 * Get avatar URL with fallback to default
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  if (!avatarUrl || avatarUrl.trim() === '') {
    return DEFAULT_AVATAR_PATH
  }
  return avatarUrl
}
