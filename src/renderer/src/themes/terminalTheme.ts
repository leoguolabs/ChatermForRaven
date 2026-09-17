import { resolveThemePreset } from '../../../shared/themes/resolve'
import type { Appearance, ThemeId } from '../../../shared/themes/types'
import { getSystemTheme } from '@/utils/themeUtils'

/** Resolve the xterm.js colors, including the selected theme's solid background. */
export function getResolvedTerminalTheme(userTheme: ThemeId, system?: Appearance) {
  const sys: Appearance = system ?? (getSystemTheme() as Appearance)
  return { ...resolveThemePreset(userTheme, sys).terminalTheme }
}
