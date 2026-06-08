import '@testing-library/jest-dom/vitest'

// ==================== localStorage Mock ====================
function createStorageMock(name: string) {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => { store[key] = String(value) },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (i: number) => Object.keys(store)[i] ?? null,
    _dump: () => ({ ...store }),
    _setRaw: (data: Record<string, string>) => { store = { ...data } },
  }
}

const localStorageMock = createStorageMock('localStorage')
const sessionStorageMock = createStorageMock('sessionStorage')

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })
Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock })

// ==================== window.dispatchEvent Mock ====================
const listeners: Record<string, Function[]> = {}
const originalAddEventListener = window.addEventListener.bind(window)
const originalRemoveEventListener = window.removeEventListener.bind(window)

window.addEventListener = (type: string, listener: any) => {
  if (!listeners[type]) listeners[type] = []
  listeners[type].push(listener)
  originalAddEventListener(type, listener)
}

window.removeEventListener = (type: string, listener: any) => {
  if (listeners[type]) {
    listeners[type] = listeners[type].filter(l => l !== listener)
  }
  originalRemoveEventListener(type, listener)
}

// ==================== fetch Mock ====================
const originalFetch = globalThis.fetch

// 每个测试前清理
beforeEach(() => {
  localStorageMock.clear()
  sessionStorageMock.clear()
  // 清理事件监听器
  for (const type of Object.keys(listeners)) {
    listeners[type] = []
  }
})

// 导出 mock 工具供测试使用
export { localStorageMock, sessionStorageMock }

// ==================== console 抑制（可选） ====================
// 某些测试会产生预期的 console.error，可在单个测试中用 vi.spyOn 恢复
