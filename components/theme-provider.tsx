'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

type ThemeProviderProps = {
  children: React.ReactNode
  attribute?: string | undefined
  defaultTheme?: string | undefined
  enableSystem?: boolean | undefined
  disableTransitionOnChange?: boolean | undefined
  storageKey?: string | undefined
  themes?: string[] | undefined
  forcedTheme?: string | undefined
  enableColorScheme?: boolean | undefined
  nonce?: string | undefined
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // @ts-expect-error - next-themes types issue
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
