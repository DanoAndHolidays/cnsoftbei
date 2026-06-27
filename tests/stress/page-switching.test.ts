import { describe, it, expect, beforeEach } from 'vitest'

// ==================== 页面切换压力测试 ====================

// 模拟 PageCacheContext 的缓存行为
function createPageCache() {
  const memoryCache: Record<string, any> = {}

  return {
    getState(pageKey: string) {
      if (memoryCache[pageKey]) return memoryCache[pageKey]
      const raw = sessionStorage.getItem(`page_cache_${pageKey}`)
      if (raw) {
        memoryCache[pageKey] = JSON.parse(raw)
        return memoryCache[pageKey]
      }
      return null
    },
    setState(pageKey: string, state: any) {
      memoryCache[pageKey] = state
      sessionStorage.setItem(`page_cache_${pageKey}`, JSON.stringify(state))
    },
    clearState(pageKey: string) {
      delete memoryCache[pageKey]
      sessionStorage.removeItem(`page_cache_${pageKey}`)
    },
  }
}

describe('页面缓存切换压力', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('100 次页面切换 — 无错误', () => {
    const cache = createPageCache()
    const pages = ['profile', 'path', 'practice', 'tutor', 'assessment', 'resources']

    for (let i = 0; i < 100; i++) {
      const page = pages[i % pages.length]
      // 模拟保存页面状态
      cache.setState(page, {
        scrollY: Math.random() * 1000,
        formData: { input: `test-${i}` },
        timestamp: Date.now(),
      })
      // 模拟读取
      const state = cache.getState(page)
      expect(state).not.toBeNull()
    }
  })

  it('快速切换 — 数据不丢失', () => {
    const cache = createPageCache()

    // 先为每个页面设置状态
    cache.setState('profile', { data: 'profile-data' })
    cache.setState('practice', { data: 'practice-data' })
    cache.setState('tutor', { data: 'tutor-data' })

    // 快速切换
    for (let i = 0; i < 50; i++) {
      expect(cache.getState('profile')?.data).toBe('profile-data')
      expect(cache.getState('practice')?.data).toBe('practice-data')
      expect(cache.getState('tutor')?.data).toBe('tutor-data')
    }
  })

  it('大状态缓存 — 10 个页面各 100KB', () => {
    const cache = createPageCache()
    const bigState = { data: 'x'.repeat(100 * 1024) } // ~100KB

    for (let i = 0; i < 10; i++) {
      cache.setState(`page-${i}`, bigState)
    }

    // 验证所有页面状态可读
    for (let i = 0; i < 10; i++) {
      const state = cache.getState(`page-${i}`)
      expect(state?.data).toHaveLength(100 * 1024)
    }
  })

  it('清除单个页面 — 不影响其他页面', () => {
    const cache = createPageCache()
    cache.setState('profile', { data: 'profile' })
    cache.setState('practice', { data: 'practice' })

    cache.clearState('profile')

    expect(cache.getState('profile')).toBeNull()
    expect(cache.getState('practice')?.data).toBe('practice')
  })
})

// ==================== 大数据集渲染模拟 ====================

describe('大数据集处理性能', () => {
  it('1000 条 PracticeResult 过滤 < 10ms', () => {
    const results = Array.from({ length: 1000 }, (_, i) => ({
      questionId: `q-${i}`,
      moduleId: `module-${(i % 4) + 1}`,
      isCorrect: i % 2 === 0,
      aiScore: i % 5 === 0 ? 80 : undefined,
    }))

    const start = performance.now()
    // 模拟按模块过滤
    const filtered = results.filter(r => r.moduleId === 'module-1')
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(10)
    expect(filtered.length).toBe(250) // 1000/4
  })

  it('1000 条 tagScores 排序 < 10ms', () => {
    const tagScores = Array.from({ length: 1000 }, (_, i) => ({
      tag: `tag-${i}`,
      totalAnswered: 10,
      correctCount: Math.floor(Math.random() * 10),
      score: Math.floor(Math.random() * 100),
    }))

    const start = performance.now()
    tagScores.sort((a, b) => a.score - b.score)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(10)
  })

  it('模块进度重算 — 1000 条结果 + 4 模块 < 50ms', () => {
    const results = Array.from({ length: 1000 }, (_, i) => ({
      questionId: `q-${i}`,
      moduleId: `module-${(i % 4) + 1}`,
      isCorrect: i % 2 === 0,
    }))

    const modules = ['module-1', 'module-2', 'module-3', 'module-4']

    const start = performance.now()
    for (const mod of modules) {
      const modResults = results.filter(r => r.moduleId === mod)
      const correct = modResults.filter(r => r.isCorrect).length
      const score = modResults.length > 0 ? (correct / modResults.length) * 100 : 0
      void score
    }
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(50)
  })

  it('tag 聚合 — 1000 条结果按 tag 分组 < 20ms', () => {
    const tags = ['syntax', 'data-types', 'operators', 'control-flow', 'functions', 'OOP']
    const results = Array.from({ length: 1000 }, (_, i) => ({
      questionId: `q-${i}`,
      tags: [tags[i % tags.length]],
      isCorrect: i % 2 === 0,
    }))

    const start = performance.now()
    const tagMap = new Map<string, { total: number; correct: number }>()
    for (const r of results) {
      for (const tag of r.tags) {
        if (!tagMap.has(tag)) tagMap.set(tag, { total: 0, correct: 0 })
        const entry = tagMap.get(tag)!
        entry.total++
        if (r.isCorrect) entry.correct++
      }
    }
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(20)
    expect(tagMap.size).toBe(tags.length)
  })
})
