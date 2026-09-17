import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'

// Ensure `self` exists for MonacoEnvironment assignment in component
;(globalThis as any).self = globalThis

const { monacoMocks } = vi.hoisted(() => {
  const model = {
    updateOptions: vi.fn(),
    getLineCount: vi.fn(() => 12),
    getLineMaxColumn: vi.fn((line: number) => line + 10)
  }

  const editorInstance = {
    onDidChangeModelContent: vi.fn(),
    onDidContentSizeChange: vi.fn(),
    getValue: vi.fn(() => ''),
    setValue: vi.fn(),
    getModel: vi.fn(() => model),
    updateOptions: vi.fn(),
    layout: vi.fn(),
    dispose: vi.fn(),
    getContentHeight: vi.fn(() => 120),
    setSelection: vi.fn(),
    revealLineInCenter: vi.fn(),
    focus: vi.fn(),
    getSelection: vi.fn(() => null),
    executeEdits: vi.fn()
  }

  return {
    monacoMocks: {
      model,
      editorInstance
    }
  }
})

// -----------------------------------------------------------------------------
// Mocks for Monaco + ESM contrib modules + workers
// -----------------------------------------------------------------------------
vi.mock('monaco-editor', () => {
  return {
    Selection: class {
      constructor(
        public startLineNumber: number,
        public startColumn: number,
        public endLineNumber: number,
        public endColumn: number
      ) {}
    },
    editor: {
      create: vi.fn(() => monacoMocks.editorInstance),
      defineTheme: vi.fn(),
      setModelLanguage: vi.fn(),
      getEditors: vi.fn(() => [monacoMocks.editorInstance])
    }
  }
})

vi.mock('monaco-editor/esm/vs/editor/contrib/folding/browser/folding', () => ({}))
vi.mock('monaco-editor/esm/vs/editor/contrib/find/browser/findController', () => ({}))

vi.mock('monaco-editor/esm/vs/editor/editor.worker?worker', () => ({ default: class EditorWorker {} }))
vi.mock('monaco-editor/esm/vs/language/json/json.worker?worker', () => ({ default: class JsonWorker {} }))
vi.mock('monaco-editor/esm/vs/language/css/css.worker?worker', () => ({ default: class CssWorker {} }))
vi.mock('monaco-editor/esm/vs/language/html/html.worker?worker', () => ({ default: class HtmlWorker {} }))
vi.mock('monaco-editor/esm/vs/language/typescript/ts.worker?worker', () => ({ default: class TsWorker {} }))

vi.mock('@/store/editorConfig', async () => {
  const { ref } = await import('vue')
  return {
    useEditorConfigStore: () => ({
      config: ref({
        fontSize: 14,
        fontFamily: 'cascadia-mono',
        tabSize: 4,
        wordWrap: 'off',
        minimap: true,
        mouseWheelZoom: true,
        cursorBlinking: 'blink',
        lineHeight: 0
      }),
      monacoOptions: {},
      loadConfig: vi.fn(() => Promise.resolve())
    }),
    getFontFamily: (fontKey: string) => (fontKey ? `"${fontKey}", monospace` : 'monospace')
  }
})

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

vi.mock('@/utils/eventBus', () => ({
  default: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  }
}))

vi.mock('@/services/userConfigStoreService', () => ({
  userConfigStore: {
    getConfig: vi.fn().mockResolvedValue({})
  }
}))

vi.mock('@/utils/themeUtils', () => ({
  getMonacoTheme: () => 'vs-dark'
}))

vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    run: vi.fn().mockResolvedValue(undefined)
  }
}))

// Import after mocks
import MonacoEditor from '@views/components/Editors/base/monacoEditor.vue'
import KnowledgeCenterEditor from '@views/components/Editors/KnowledgeCenterEditor.vue'
import mermaid from 'mermaid'

describe('monacoEditor theme', () => {
  it('creates a solid editor even when a legacy background class is present', async () => {
    document.body.classList.add('has-custom-bg')
    const wrapper = mount(MonacoEditor, { props: { modelValue: '' } })
    try {
      await flushPromises()
      expect(wrapper.classes()).not.toContain('with-custom-bg')
      expect(monacoMocks.editorInstance.onDidChangeModelContent).toHaveBeenCalled()
    } finally {
      wrapper.unmount()
      document.body.className = ''
    }
  })
})

describe('KnowledgeCenterEditor markdown highlight', () => {
  const markdownContent = ['```python', 'def hello():', '    print("Hello, World!")', '```'].join('\n')

  const flushPromises = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  beforeEach(() => {
    ;(window as any).api = {
      kbEnsureRoot: vi.fn().mockResolvedValue(undefined),
      kbReadFile: vi.fn().mockResolvedValue({
        content: markdownContent,
        mtimeMs: 1
      }),
      kbWriteFile: vi.fn(),
      kbCreateImage: vi.fn()
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render highlighted code blocks in preview', async () => {
    const wrapper = mount(KnowledgeCenterEditor, {
      props: {
        relPath: 'docs/test.md',
        mode: 'preview'
      },
      global: {
        stubs: {
          MonacoEditor: { template: '<div />' }
        }
      }
    })

    await nextTick()
    await flushPromises()

    const preview = wrapper.find('.kb-preview')
    expect(preview.exists()).toBe(true)
    expect(preview.html()).toContain('hljs-')
  })

  it('should apply table alignment styles in preview', async () => {
    ;(window as any).api.kbReadFile.mockResolvedValueOnce({
      content: ['| a | b | c |', '| :-- | :-: | --: |', '| 1 | 2 | 3 |'].join('\n'),
      mtimeMs: 1
    })

    const wrapper = mount(KnowledgeCenterEditor, {
      props: {
        relPath: 'docs/table.md',
        mode: 'preview'
      },
      global: {
        stubs: {
          MonacoEditor: { template: '<div />' }
        }
      }
    })

    await nextTick()
    await flushPromises()

    const preview = wrapper.find('.kb-preview')
    expect(preview.exists()).toBe(true)
    expect(preview.html()).toContain('text-align: center')
    expect(preview.html()).toContain('text-align: right')
  })

  it('should preserve safe html tags in preview', async () => {
    ;(window as any).api.kbReadFile.mockResolvedValueOnce({
      content: ['<details>', '<summary>Click to expand</summary>', 'Content', '</details>', '', '<kbd>Ctrl</kbd> + <kbd>C</kbd>'].join('\n'),
      mtimeMs: 1
    })

    const wrapper = mount(KnowledgeCenterEditor, {
      props: {
        relPath: 'docs/html.md',
        mode: 'preview'
      },
      global: {
        stubs: {
          MonacoEditor: { template: '<div />' }
        }
      }
    })

    await nextTick()
    await flushPromises()

    const preview = wrapper.find('.kb-preview')
    expect(preview.exists()).toBe(true)
    expect(preview.html()).toContain('<details')
    expect(preview.html()).toContain('<summary>')
    expect(preview.html()).toContain('<kbd>')
  })

  it('should render mermaid diagrams in preview', async () => {
    ;(window as any).api.kbReadFile.mockResolvedValueOnce({
      content: ['```mermaid', 'sequenceDiagram', '  A->>B: Hello', '```'].join('\n'),
      mtimeMs: 1
    })

    const wrapper = mount(KnowledgeCenterEditor, {
      props: {
        relPath: 'docs/diagram.md',
        mode: 'preview'
      },
      global: {
        stubs: {
          MonacoEditor: { template: '<div />' }
        }
      }
    })

    await nextTick()
    await flushPromises()
    await nextTick()
    await flushPromises()

    const preview = wrapper.find('.kb-preview')
    expect(preview.exists()).toBe(true)
    expect(preview.html()).toContain('class="mermaid"')
    expect(mermaid.initialize).toHaveBeenCalled()
    expect(mermaid.run).toHaveBeenCalled()
  })

  it('should jump to requested lines and retrigger when jumpToken changes', async () => {
    ;(window as any).api.kbReadFile.mockResolvedValueOnce({
      content: ['line1', 'line2', 'line3'].join('\n'),
      mtimeMs: 1
    })
    monacoMocks.model.getLineCount.mockReturnValue(8)
    monacoMocks.model.getLineMaxColumn.mockImplementation((line: number) => line * 10)

    const wrapper = mount(KnowledgeCenterEditor, {
      props: {
        relPath: 'docs/jump.md',
        mode: 'editor',
        startLine: 99,
        endLine: 120,
        jumpToken: 'jump-1'
      }
    })

    await nextTick()
    await flushPromises()
    await nextTick()

    expect(monacoMocks.editorInstance.setSelection).toHaveBeenCalled()
    expect(monacoMocks.editorInstance.revealLineInCenter).toHaveBeenCalled()
    expect(monacoMocks.editorInstance.focus).toHaveBeenCalled()

    const initialJumpCount = monacoMocks.editorInstance.setSelection.mock.calls.length
    expect(monacoMocks.editorInstance.setSelection).toHaveBeenLastCalledWith({
      startLineNumber: 8,
      startColumn: 1,
      endLineNumber: 8,
      endColumn: 80
    })
    expect(monacoMocks.editorInstance.revealLineInCenter).toHaveBeenLastCalledWith(8)

    await wrapper.setProps({
      jumpToken: 'jump-2'
    })
    await nextTick()
    await flushPromises()
    await nextTick()

    expect(monacoMocks.editorInstance.setSelection.mock.calls.length).toBeGreaterThan(initialJumpCount)
    expect(monacoMocks.editorInstance.revealLineInCenter.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(monacoMocks.editorInstance.focus.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(monacoMocks.editorInstance.setSelection).toHaveBeenLastCalledWith({
      startLineNumber: 8,
      startColumn: 1,
      endLineNumber: 8,
      endColumn: 80
    })
  })
})
