import { describe, it, expect } from 'vitest'
import { getResolvedTerminalTheme } from '../terminalTheme'
import { THEME_PRESETS } from '../../../../shared/themes/presets'

describe('getResolvedTerminalTheme', () => {
  it('preserves the solid terminal colors for every theme', () => {
    for (const preset of Object.values(THEME_PRESETS)) {
      expect(getResolvedTerminalTheme(preset.id)).toEqual(preset.terminalTheme)
      expect(getResolvedTerminalTheme(preset.id)).not.toBe(preset.terminalTheme)
    }
  })

  it('auto resolves by provided system theme', () => {
    const dark = getResolvedTerminalTheme('auto', 'dark')
    const light = getResolvedTerminalTheme('auto', 'light')
    expect(dark.background).not.toBe(light.background)
  })
})
