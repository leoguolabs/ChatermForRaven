<template>
  <div class="userInfo">
    <a-card
      :bordered="false"
      class="userInfo-container"
    >
      <a-form
        :colon="false"
        label-align="left"
        wrapper-align="right"
        :label-col="{ span: 7, offset: 0 }"
        :wrapper-col="{ span: 17, class: 'right-aligned-wrapper' }"
        class="custom-form"
      >
        <a-form-item>
          <template #label>
            <span class="label-text">{{ $t('user.baseSetting') }}</span>
          </template>
        </a-form-item>
        <a-form-item
          :label="$t('user.theme')"
          class="user_my-ant-form-item"
        >
          <a-select
            v-model:value="userConfig.theme"
            style="width: 240px"
            class="theme-select"
            :dropdown-match-select-width="false"
            @change="changeTheme"
          >
            <a-select-opt-group
              v-for="group in themeOptionGroups"
              :key="group.labelKey"
              :label="$t(group.labelKey)"
            >
              <a-select-option
                v-for="option in group.options"
                :key="option.value"
                :value="option.value"
              >
                <span class="theme-option-content">
                  <span
                    class="theme-option-swatch"
                    :style="getThemeSwatchStyle(option)"
                  >
                    <span class="theme-option-swatch-surface"></span>
                    <span class="theme-option-swatch-accent"></span>
                  </span>
                  <span class="theme-option-label">{{ $t(option.labelKey) }}</span>
                </span>
              </a-select-option>
            </a-select-opt-group>
          </a-select>
        </a-form-item>

        <a-form-item
          :label="$t('user.defaultLayout')"
          class="user_my-ant-form-item"
        >
          <a-radio-group
            v-model:value="userConfig.defaultLayout"
            class="custom-radio-group"
            @change="changeDefaultLayout"
          >
            <a-radio value="terminal">{{ $t('user.defaultLayoutTerminal') }}</a-radio>
            <a-radio value="agents">{{ $t('user.defaultLayoutAgents') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          :label="$t('user.language')"
          class="user_my-ant-form-item"
        >
          <a-select
            v-model:value="userConfig.language"
            class="language-select"
            @change="changeLanguage"
          >
            <a-select-option value="zh-CN">简体中文</a-select-option>
            <a-select-option value="zh-TW">繁體中文</a-select-option>
            <a-select-option value="en-US">English</a-select-option>
            <a-select-option value="de-DE">Deutsch</a-select-option>
            <a-select-option value="fr-FR">Français</a-select-option>
            <a-select-option value="it-IT">Italiano</a-select-option>
            <a-select-option value="pt-PT">Português</a-select-option>
            <a-select-option value="ru-RU">Русский</a-select-option>
            <a-select-option value="ja-JP">日本語</a-select-option>
            <a-select-option value="ko-KR">한국어</a-select-option>
            <a-select-option value="ar-AR">العربية</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          :label="$t('user.watermark')"
          class="user_my-ant-form-item"
        >
          <a-radio-group
            v-model:value="userConfig.watermark"
            class="custom-radio-group"
          >
            <a-radio value="open">{{ $t('user.watermarkOpen') }}</a-radio>
            <a-radio value="close">{{ $t('user.watermarkClose') }}</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- Editor Settings -->
        <a-form-item class="editor-settings-section">
          <template #label>
            <span class="label-text">{{ $t('user.editorSettings') }}</span>
          </template>
        </a-form-item>

        <a-form-item
          :label="$t('user.editorFontSize')"
          class="user_my-ant-form-item"
        >
          <a-input-number
            v-model:value="editorConfig.fontSize"
            :min="8"
            :max="32"
            :step="1"
            style="width: 120px"
            @change="saveEditorConfig"
          />
        </a-form-item>

        <a-form-item
          :label="$t('user.editorLineHeight')"
          class="user_my-ant-form-item"
        >
          <a-input-number
            v-model:value="editorConfig.lineHeight"
            :min="0"
            :max="48"
            :step="1"
            style="width: 120px"
            @change="saveEditorConfig"
          />
        </a-form-item>

        <a-form-item
          :label="$t('user.editorFont')"
          class="user_my-ant-form-item"
        >
          <a-select
            v-model:value="editorConfig.fontFamily"
            class="language-select"
            @change="saveEditorConfig"
          >
            <a-select-option
              v-for="opt in FONT_FAMILY_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ $t(opt.labelKey) }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          :label="$t('user.editorTabSize') + '(' + $t('common.space') + ')'"
          class="user_my-ant-form-item"
        >
          <a-input-number
            v-model:value="editorConfig.tabSize"
            :min="1"
            :max="8"
            :step="1"
            style="width: 120px"
            @change="saveEditorConfig"
          />
        </a-form-item>

        <a-form-item
          :label="$t('user.editorWordWrap')"
          class="user_my-ant-form-item"
        >
          <a-radio-group
            v-model:value="editorConfig.wordWrap"
            class="custom-radio-group"
            @change="saveEditorConfig"
          >
            <a-radio value="on">{{ $t('common.open') }}</a-radio>
            <a-radio value="off">{{ $t('common.close') }}</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          :label="$t('user.editorMinimap')"
          class="user_my-ant-form-item"
        >
          <a-radio-group
            v-model:value="editorConfig.minimap"
            class="custom-radio-group"
            @change="saveEditorConfig"
          >
            <a-radio :value="true">{{ $t('common.open') }}</a-radio>
            <a-radio :value="false">{{ $t('common.close') }}</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item
          :label="$t('user.editorMouseWheelZoom')"
          class="user_my-ant-form-item"
        >
          <a-radio-group
            v-model:value="editorConfig.mouseWheelZoom"
            class="custom-radio-group"
            @change="saveEditorConfig"
          >
            <a-radio :value="true">{{ $t('common.open') }}</a-radio>
            <a-radio :value="false">{{ $t('common.close') }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import { notification } from 'ant-design-vue'
import { userConfigStore, remoteApplyGuard } from '@/services/userConfigStoreService'
import { userConfigStore as configStore } from '@/store/userConfigStore'
import { useEditorConfigStore, type EditorConfig, FONT_FAMILY_OPTIONS } from '@/store/editorConfig'
import eventBus from '@/utils/eventBus'
import { getActualTheme, getSystemTheme, addSystemThemeListener } from '@/utils/themeUtils'
import { resolveThemePreset } from '../../../../../../shared/themes/resolve'
import { THEME_PRESETS } from '../../../../../../shared/themes/presets'
import { applyThemeToDocument } from '@/themes/applyTheme'
import type { ThemeId } from '../../../../../../shared/themes/types'
import { useI18n } from 'vue-i18n'

const logger = createRendererLogger('settings.general')
const api = window.api
const { locale, t } = useI18n()
const editorConfigStore = useEditorConfigStore()

const userConfig = ref({
  language: 'zh-CN',
  watermark: 'open',
  theme: 'dark',
  defaultLayout: 'terminal'
})

interface ThemeOptionPreview {
  value: ThemeId
  labelKey: string
  background: string
  surface: string
  accent: string
  accentAlt?: string
  border: string
}

const THEME_LABEL_KEYS: Record<Exclude<ThemeId, 'auto'>, string> = {
  dark: 'user.themeDark',
  light: 'user.themeLight',
  'termius-dark': 'user.themeTermiusDark',
  'termius-light': 'user.themeTermiusLight',
  'flexoki-dark': 'user.themeFlexokiDark',
  'flexoki-light': 'user.themeFlexokiLight',
  'kanagawa-wave': 'user.themeKanagawaWave',
  'kanagawa-dragon': 'user.themeKanagawaDragon',
  'kanagawa-lotus': 'user.themeKanagawaLotus',
  'hacker-blue': 'user.themeHackerBlue',
  'hacker-green': 'user.themeHackerGreen',
  'dracula-night': 'user.themeDraculaNight',
  'catppuccin-mocha': 'user.themeCatppuccinMocha',
  'catppuccin-latte': 'user.themeCatppuccinLatte',
  'gruvbox-dark': 'user.themeGruvboxDark',
  'nord-frost': 'user.themeNordFrost'
}

const buildThemePreview = (themeId: ThemeId): ThemeOptionPreview => {
  if (themeId === 'auto') {
    const dark = THEME_PRESETS.dark.uiTokens
    const light = THEME_PRESETS.light.uiTokens
    return {
      value: 'auto',
      labelKey: 'user.themeAuto',
      background: `linear-gradient(135deg, ${dark['--bg-color']} 0%, ${dark['--bg-color']} 49%, ${light['--bg-color']} 51%, ${light['--bg-color']} 100%)`,
      surface: `linear-gradient(90deg, ${dark['--bg-color-secondary']} 0%, ${light['--bg-color-secondary']} 100%)`,
      accent: dark['--button-bg-color'],
      accentAlt: light['--button-bg-color'],
      border: '#94a3b8'
    }
  }

  const preset = THEME_PRESETS[themeId]
  return {
    value: themeId,
    labelKey: THEME_LABEL_KEYS[themeId],
    background: preset.uiTokens['--bg-color'],
    surface: preset.uiTokens['--bg-color-secondary'],
    accent: preset.uiTokens['--button-bg-color'],
    border: preset.uiTokens['--border-color-light']
  }
}

const themeOptionGroups = computed(() => [
  {
    labelKey: 'user.themeGroupSystem',
    options: [buildThemePreview('auto')]
  },
  {
    labelKey: 'user.themeGroupDefault',
    options: [buildThemePreview('dark'), buildThemePreview('light')]
  },
  {
    labelKey: 'user.themeGroupOfficial',
    options: [
      buildThemePreview('termius-dark'),
      buildThemePreview('termius-light'),
      buildThemePreview('flexoki-dark'),
      buildThemePreview('flexoki-light'),
      buildThemePreview('kanagawa-wave'),
      buildThemePreview('kanagawa-dragon'),
      buildThemePreview('kanagawa-lotus'),
      buildThemePreview('hacker-blue'),
      buildThemePreview('hacker-green'),
      buildThemePreview('dracula-night'),
      buildThemePreview('catppuccin-mocha'),
      buildThemePreview('catppuccin-latte'),
      buildThemePreview('gruvbox-dark'),
      buildThemePreview('nord-frost')
    ]
  }
])

const getThemeSwatchStyle = (option: ThemeOptionPreview): Record<string, string> => ({
  '--theme-preview-bg': option.background,
  '--theme-preview-surface': option.surface,
  '--theme-preview-accent': option.accent,
  '--theme-preview-accent-alt': option.accentAlt || option.accent,
  '--theme-preview-border': option.border
})

// Editor config form state (synced from store on load)
const editorConfig = ref<EditorConfig>({
  fontSize: 14,
  fontFamily: 'cascadia-mono',
  tabSize: 4,
  wordWrap: 'off',
  minimap: true,
  mouseWheelZoom: true,
  cursorBlinking: 'blink',
  lineHeight: 0
})

const loadSavedConfig = async () => {
  try {
    const savedConfig = await userConfigStore.getConfig()
    if (savedConfig) {
      userConfig.value = {
        ...userConfig.value,
        ...savedConfig,
        defaultLayout: savedConfig.defaultLayout || 'terminal',
        watermark: (savedConfig.watermark || 'open') as 'open' | 'close'
      } as any

      const preset = resolveThemePreset(userConfig.value.theme as ThemeId, getSystemTheme() as 'dark' | 'light')
      applyThemeToDocument(preset)
      eventBus.emit('updateTheme', {
        themeId: userConfig.value.theme,
        appearance: preset.appearance,
        preset
      })
      api.updateTheme(userConfig.value.theme)
    }

    // Load editor config from store
    await editorConfigStore.loadConfig()
    editorConfig.value = editorConfigStore.getConfigSnapshot()
  } catch (error) {
    logger.error('Failed to load config', { error: error })
    notification.error({
      message: t('user.loadConfigFailed'),
      description: t('user.loadConfigFailedDescription')
    })
    const fallbackPreset = resolveThemePreset('dark' as ThemeId, getSystemTheme() as 'dark' | 'light')
    applyThemeToDocument(fallbackPreset)
    userConfig.value.theme = 'dark'
  }
}

const saveConfig = async () => {
  try {
    const configToStore = {
      language: userConfig.value.language,
      watermark: (userConfig.value.watermark || 'open') as 'open' | 'close',
      theme: userConfig.value.theme,
      defaultLayout: userConfig.value.defaultLayout
    }
    await userConfigStore.saveConfig(configToStore as any)
    eventBus.emit('updateWatermark', configToStore.watermark)
    const savedPreset = resolveThemePreset(configToStore.theme as ThemeId, getSystemTheme() as 'dark' | 'light')
    eventBus.emit('updateTheme', {
      themeId: configToStore.theme,
      appearance: savedPreset.appearance,
      preset: savedPreset
    })
  } catch (error) {
    logger.error('Failed to save config', { error: error })
    notification.error({
      message: t('user.error'),
      description: t('user.saveConfigFailedDescription')
    })
  }
}

watch(
  () => userConfig.value,
  async () => {
    if (remoteApplyGuard.isApplying) return
    await saveConfig()
  },
  { deep: true }
)

const reloadConfigOnSync = async () => {
  await loadSavedConfig()
}

const reloadEditorConfigOnSync = async () => {
  try {
    await editorConfigStore.loadConfig()
    editorConfig.value = editorConfigStore.getConfigSnapshot()
  } catch (error) {
    logger.error('Failed to reload editor config on sync', { error })
  }
}

let systemThemeListener: (() => void) | null = null

onMounted(async () => {
  await loadSavedConfig()

  eventBus.on('userConfigSyncApplied', reloadConfigOnSync)
  eventBus.on('editorConfigSyncApplied', reloadEditorConfigOnSync)

  // Add system theme change listener
  setupSystemThemeListener()

  // Listen for default layout changes from header
  eventBus.on('defaultLayoutChanged', (mode) => {
    if (mode === 'terminal' || mode === 'agents') {
      userConfig.value.defaultLayout = mode
    }
  })
})

onBeforeUnmount(() => {
  eventBus.off('defaultLayoutChanged')
  eventBus.off('userConfigSyncApplied', reloadConfigOnSync)
  eventBus.off('editorConfigSyncApplied', reloadEditorConfigOnSync)

  // Remove system theme listener
  if (systemThemeListener) {
    systemThemeListener()
    systemThemeListener = null
  }
})

const changeLanguage = async () => {
  locale.value = userConfig.value.language
  localStorage.setItem('lang', userConfig.value.language)
  configStore().updateLanguage(userConfig.value.language)

  // Notify other components that language has changed, need to refresh data
  eventBus.emit('languageChanged', userConfig.value.language)
}

// Setup system theme change listener
const setupSystemThemeListener = () => {
  const listener = addSystemThemeListener(async (_newSystemTheme: string) => {
    // Only update theme if user has selected 'auto' mode
    if (userConfig.value.theme === 'auto') {
      const actualTheme = getActualTheme(userConfig.value.theme)
      const currentTheme = document.documentElement.className.replace('theme-', '')

      if (currentTheme !== actualTheme) {
        // System theme changed, update application theme
        const preset = resolveThemePreset('auto' as ThemeId, getSystemTheme() as 'dark' | 'light')
        applyThemeToDocument(preset)
        eventBus.emit('updateTheme', {
          themeId: 'auto',
          appearance: preset.appearance,
          preset
        })
        // Update main process window controls
        await api.updateTheme(userConfig.value.theme)
        logger.info(`System theme changed, updating application theme to ${actualTheme}`)
      }
    }
  })
  systemThemeListener = listener as () => void

  // Listen for system theme changes from main process (Windows)
  if (window.api && window.api.onSystemThemeChanged) {
    window.api.onSystemThemeChanged((newSystemTheme) => {
      if (userConfig.value.theme === 'auto') {
        const currentTheme = document.documentElement.className.replace('theme-', '')
        if (currentTheme !== newSystemTheme) {
          const preset = resolveThemePreset('auto' as ThemeId, newSystemTheme as 'dark' | 'light')
          applyThemeToDocument(preset)
          eventBus.emit('updateTheme', {
            themeId: 'auto',
            appearance: preset.appearance,
            preset
          })
          logger.info(`System theme changed to ${newSystemTheme} (from main process)`)
        }
      }
    })
  }
}

const changeTheme = async () => {
  try {
    const preset = resolveThemePreset(userConfig.value.theme as ThemeId, getSystemTheme() as 'dark' | 'light')
    applyThemeToDocument(preset)
    eventBus.emit('updateTheme', {
      themeId: userConfig.value.theme,
      appearance: preset.appearance,
      preset
    })
    // Update main process window controls immediately
    configStore().updateTheme(userConfig.value.theme)
    await api.updateTheme(userConfig.value.theme)
    await saveConfig()
  } catch (error) {
    logger.error('Failed to change theme', { error: error })
    notification.error({
      message: t('user.themeSwitchFailed'),
      description: t('user.themeSwitchFailedDescription')
    })
  }
}

const changeDefaultLayout = async () => {
  // Switch to the selected layout immediately
  eventBus.emit('switch-mode', userConfig.value.defaultLayout)
  eventBus.emit('switch-mode', userConfig.value.defaultLayout)
  await saveConfig()
}

// Save editor config to store and persist via IPC
const saveEditorConfig = async () => {
  try {
    await editorConfigStore.updateConfig(editorConfig.value)
  } catch (error) {
    logger.error('Failed to save editor config', { error: error })
    notification.error({
      message: t('user.saveFailed'),
      description: t('user.saveConfigFailedDescription')
    })
  }
}
</script>

<style scoped>
.userInfo {
  width: 100%;
}

.userInfo-container {
  width: 100%;
  background-color: var(--bg-color) !important;
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  color: var(--text-color);
}

:deep(.ant-card) {
  background-color: var(--bg-color) !important;
}

:deep(.ant-card-body) {
  padding: 16px;
  background-color: var(--bg-color);
}

.custom-form {
  color: var(--text-color);
  align-content: center;
}

.custom-form :deep(.ant-form-item-label) {
  padding-right: 20px;
}

.custom-form :deep(.ant-form-item-label > label) {
  color: var(--text-color);
}

.custom-form :deep(.ant-input),
.custom-form :deep(.ant-input-number),
.custom-form :deep(.ant-radio-wrapper) {
  color: var(--text-color);
}

.custom-form :deep(.ant-input-number) {
  background-color: var(--input-number-bg);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  transition: all 0.3s;
  width: 100px !important;
}

.custom-form :deep(.ant-input-number:hover),
.custom-form :deep(.ant-input-number:focus),
.custom-form :deep(.ant-input-number-focused) {
  background-color: var(--input-number-hover-bg);
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.custom-form :deep(.ant-input-number-input) {
  height: 32px;
  padding: 4px 8px;
  background-color: transparent;
  color: var(--text-color);
}

.label-text {
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
}

.user_my-ant-form-item {
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: rgba(0, 0, 0, 0.65);
  font-size: 30px;
  font-variant: tabular-nums;
  line-height: 1.5;
  list-style: none;
  -webkit-font-feature-settings: 'tnum';
  font-feature-settings: 'tnum';
  margin-bottom: 14px;
  vertical-align: top;
  color: #ffffff;
}

.language-select,
.theme-select {
  width: 180px !important;
  text-align: left;
}

.theme-select {
  width: 240px !important;
}

.language-select :deep(.ant-select-selector),
.theme-select :deep(.ant-select-selector) {
  background-color: var(--select-bg);
  border: 1px solid var(--select-border);
  border-radius: 6px;
  color: var(--text-color);
  transition: all 0.3s;
  height: 32px;
}

.language-select :deep(.ant-select-selector:hover),
.theme-select :deep(.ant-select-selector:hover) {
  border-color: #1890ff;
  background-color: var(--select-hover-bg);
}

.language-select :deep(.ant-select-focused .ant-select-selector),
.language-select :deep(.ant-select-selector:focus),
.theme-select :deep(.ant-select-focused .ant-select-selector),
.theme-select :deep(.ant-select-selector:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  background-color: var(--select-hover-bg);
}

.language-select :deep(.ant-select-selection-item),
.theme-select :deep(.ant-select-selection-item) {
  color: var(--text-color);
  font-size: 14px;
  line-height: 32px;
}

.theme-select :deep(.ant-select-item-option-content) {
  display: flex;
  align-items: center;
}

.language-select :deep(.ant-select-arrow),
.theme-select :deep(.ant-select-arrow) {
  color: var(--text-color);
  opacity: 0.7;
}

.theme-option-content {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.theme-option-swatch {
  position: relative;
  width: 28px;
  height: 18px;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid var(--theme-preview-border);
  border-radius: 6px;
  background: var(--theme-preview-bg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.theme-option-swatch-surface {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 14px;
  height: 4px;
  border-radius: 999px;
  background: var(--theme-preview-surface);
}

.theme-option-swatch-accent {
  position: absolute;
  right: 4px;
  bottom: 4px;
  width: 10px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--theme-preview-accent) 0%, var(--theme-preview-accent-alt) 100%);
}

.theme-option-label {
  display: inline-flex;
  align-items: center;
}

.divider-container {
  width: calc(65%);
  margin: -10px calc(16%);
}

:deep(.right-aligned-wrapper) {
  text-align: right;
  color: #ffffff;
}

.checkbox-md :deep(.ant-checkbox-inner) {
  width: 20px;
  height: 20px;
}

.editor-settings-section {
  margin-top: 35px;
}
</style>
