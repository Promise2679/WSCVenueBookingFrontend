import type { ThemeDefinition } from 'vuetify'

import { brandPalette, neutralPalette, semanticPalette } from './colors'

export const wscLightTheme: ThemeDefinition = {
  colors: {
    background: neutralPalette.background,
    error: semanticPalette.error,
    info: semanticPalette.info,
    'on-background': neutralPalette.onBackground,
    'on-primary': brandPalette.onPrimary,
    'on-surface': neutralPalette.onSurface,
    outline: neutralPalette.outline,
    primary: brandPalette.primary,
    'primary-darken-1': brandPalette.primaryDark,
    secondary: semanticPalette.secondary,
    success: semanticPalette.success,
    surface: neutralPalette.surface,
    'surface-bright': neutralPalette.surface,
    'surface-light': neutralPalette.surfaceAlt,
    'surface-variant': neutralPalette.surfaceVariant,
    warning: semanticPalette.warning
  },
  dark: false
}

export const themeOptions = { defaultTheme: 'wscLight', themes: { wscLight: wscLightTheme } } as const
