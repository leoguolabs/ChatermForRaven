import { describe, it, expect, beforeEach } from 'vitest'
import { applyThemeToDocument } from '../applyTheme'
import { THEME_PRESETS } from '../../../../shared/themes/presets'

describe('applyThemeToDocument', () => {
  beforeEach(() => {
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme-id')
    document.documentElement.style.cssText = ''
    document.body.className = ''
    document.body.style.cssText = ''
  })

  it('sets appearance class and data-theme-id', () => {
    applyThemeToDocument(THEME_PRESETS['kanagawa-wave'])
    expect(document.documentElement.className).toBe('theme-dark')
    expect(document.documentElement.dataset.themeId).toBe('kanagawa-wave')
  })

  it('writes uiTokens as CSS variables', () => {
    applyThemeToDocument(THEME_PRESETS['flexoki-light'])
    expect(document.documentElement.style.getPropertyValue('--bg-color')).toBe('#f7efdf')
    expect(document.documentElement.style.getPropertyValue('--text-color')).toBe('#372e25')
  })

  it('keeps every preset token intact when switching themes', () => {
    for (const preset of Object.values(THEME_PRESETS)) {
      applyThemeToDocument(preset)
      for (const [key, value] of Object.entries(preset.uiTokens)) {
        expect(document.documentElement.style.getPropertyValue(key)).toBe(value)
      }
    }
  })
})
