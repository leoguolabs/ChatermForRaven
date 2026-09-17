import type { ThemePreset } from '../../../shared/themes/types'

/** Apply the selected theme's appearance and solid UI colors. */
export function applyThemeToDocument(preset: ThemePreset): void {
  const root = document.documentElement
  root.className = `theme-${preset.appearance}`
  root.dataset.themeId = preset.id

  for (const [cssVar, value] of Object.entries(preset.uiTokens)) {
    root.style.setProperty(cssVar, value)
  }
}
