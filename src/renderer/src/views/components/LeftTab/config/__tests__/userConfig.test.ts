import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { Tabs, Divider } from 'ant-design-vue'
import UserConfig from '../userConfig.vue'
import eventBus from '@/utils/eventBus'

vi.mock('@/views/components/LeftTab/setting/general.vue', () => ({ default: { template: '<div>general-settings</div>' } }))
vi.mock('@/views/components/LeftTab/setting/terminal.vue', () => ({ default: { template: '<div>terminal-settings</div>' } }))
vi.mock('@/views/components/LeftTab/setting/extensions.vue', () => ({ default: { template: '<div>extensions-settings</div>' } }))
vi.mock('@/views/components/LeftTab/setting/ai.vue', () => ({ default: { template: '<div>ai-settings</div>' } }))
vi.mock('@/views/components/LeftTab/setting/model.vue', () => ({ default: { template: '<div>model-settings</div>' } }))
vi.mock('@/views/components/LeftTab/setting/shortcuts.vue', () => ({ default: { template: '<div>shortcuts-settings</div>' } }))
vi.mock('@/views/components/LeftTab/setting/rules.vue', () => ({ default: { template: '<div>rules-settings</div>' } }))
vi.mock('@/views/components/LeftTab/setting/mcp.vue', () => ({ default: { template: '<div>mcp-settings</div>' } }))
vi.mock('@/views/components/LeftTab/setting/skills.vue', () => ({ default: { template: '<div>skills-settings</div>' } }))

const wrappers: ReturnType<typeof mount>[] = []
afterEach(() => {
  wrappers.forEach((wrapper) => wrapper.unmount())
  wrappers.length = 0
})

function renderSettings() {
  const wrapper = mount(UserConfig, {
    global: {
      components: { ATabs: Tabs, ATabPane: Tabs.TabPane, ADivider: Divider },
      mocks: { $t: (key: string) => key }
    }
  })
  wrappers.push(wrapper)
  return wrapper
}

describe('settings navigation', () => {
  it('shows only supported settings and opens the selected page', async () => {
    const wrapper = renderSettings()
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs.map((tab) => tab.text())).toEqual([
      'user.general',
      'user.terminal',
      'user.extensions',
      'user.models',
      'user.aiPreferences',
      'mcp.title',
      'skills.title',
      'user.rules',
      'user.shortcuts'
    ])
    await tabs[6].trigger('click')
    expect(tabs[6].attributes('aria-selected')).toBe('true')
    expect(wrapper.text()).toContain('skills-settings')
  })

  it('preserves terminal and model shortcuts after removing settings pages', async () => {
    const wrapper = renderSettings()
    eventBus.emit('switchToTerminalTab')
    await nextTick()
    expect(wrapper.get('[role="tab"][aria-selected="true"]').text()).toBe('user.terminal')
    eventBus.emit('switchToModelSettingsTab')
    await nextTick()
    expect(wrapper.get('[role="tab"][aria-selected="true"]').text()).toBe('user.models')
  })
})
