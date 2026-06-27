import { describe, it, expect, beforeEach } from 'vitest'

// ==================== localStorage 压力测试 ====================

describe('localStorage 大量数据读写压力', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  // ---------- 写入性能 ----------
  describe('写入性能', () => {
    it('1000 条 PracticeResult 写入 < 200ms', () => {
      const results = Array.from({ length: 1000 }, (_, i) => ({
        questionId: `q-${i}`,
        moduleId: `module-${(i % 4) + 1}`,
        userAnswer: i % 2 === 0 ? 'A' : 'B',
        isCorrect: i % 3 !== 0,
        submittedAt: new Date().toISOString(),
      }))

      const state = {
        planId: 'stress-test',
        results,
        moduleProgress: [],
        tagScores: [],
        updatedAt: new Date().toISOString(),
      }

      const start = performance.now()
      localStorage.setItem('practiceState', JSON.stringify(state))
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(200)
    })

    it('100 条画像快照写入 < 100ms', () => {
      const profile = {
        id: 'stress-test',
        name: '压力测试用户',
        major: '计算机科学',
        grade: '大三',
        dimensions: Array.from({ length: 6 }, (_, i) => ({
          key: `dim-${i}`,
          label: `维度${i}`,
          value: `测试值${i}`,
          level: '中',
        })),
        learningProfile: {
          user: { id: 'stress-test', name: '测试', major: 'CS', grade: '大三' },
          knowledgeBase: Array.from({ length: 50 }, (_, i) => ({
            tag: `tag-${i}`,
            mastery: '一般',
            score: 60,
            source: '练习',
          })),
          cognitiveStyle: { label: '文字型', source: '练习' },
          errorProne: [],
          learningPace: { label: '中等接受', estimatedStudyHours: 10, source: '练习' },
          interestDirection: { labels: ['前端开发'], source: '练习' },
          studyHabit: { label: '边做边学', source: '练习' },
          updatedAt: '',
          source: '练习',
        },
      }

      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        profile.id = `user-${i}`
        localStorage.setItem('studentProfile', JSON.stringify(profile))
      }
      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(100)
    })
  })

  // ---------- 读取性能 ----------
  describe('读取性能', () => {
    it('1000 条记录读取 + JSON.parse < 50ms', () => {
      // 先写入
      const results = Array.from({ length: 1000 }, (_, i) => ({
        questionId: `q-${i}`,
        moduleId: `module-${(i % 4) + 1}`,
        userAnswer: 'A',
        isCorrect: true,
        submittedAt: '',
      }))
      localStorage.setItem('practiceState', JSON.stringify({ planId: 'test', results, moduleProgress: [], tagScores: [], updatedAt: '' }))

      const start = performance.now()
      const loaded = JSON.parse(localStorage.getItem('practiceState')!)
      const elapsed = performance.now() - start

      expect(loaded.results).toHaveLength(1000)
      expect(elapsed).toBeLessThan(50)
    })

    it('频繁读写交替 — 100 次 < 500ms', () => {
      const start = performance.now()
      for (let i = 0; i < 100; i++) {
        const state = { counter: i, data: 'x'.repeat(1000) }
        localStorage.setItem('test', JSON.stringify(state))
        const loaded = JSON.parse(localStorage.getItem('test')!)
        expect(loaded.counter).toBe(i)
      }
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(500)
    })
  })

  // ---------- 容量测试 ----------
  describe('容量限制', () => {
    it('大量 cycleLogs 不超过 5MB', () => {
      const logs = Array.from({ length: 20 }, (_, i) => ({
        cycleId: `cycle-${i}`,
        source: '练习',
        before: { profile: null },
        after: { profile: null, evaluation: null },
        notes: [`note-${i}`],
        createdAt: new Date().toISOString(),
      }))

      const state = {
        planId: 'test',
        results: Array.from({ length: 500 }, (_, i) => ({
          questionId: `q-${i}`,
          moduleId: 'module-1',
          userAnswer: 'A',
          isCorrect: true,
          submittedAt: '',
        })),
        moduleProgress: [],
        tagScores: [],
        cycleLogs: logs,
        updatedAt: '',
      }

      localStorage.setItem('practiceState', JSON.stringify(state))
      const size = new Blob([localStorage.getItem('practiceState')!]).size

      // 5MB = 5 * 1024 * 1024
      expect(size).toBeLessThan(5 * 1024 * 1024)
      // 合理范围内（通常 < 500KB）
      expect(size).toBeLessThan(500 * 1024)
    })

    it('大文本画像不超过 1MB', () => {
      const profile = {
        id: 'test',
        name: '测试',
        major: 'CS',
        grade: '大三',
        dimensions: Array.from({ length: 6 }, () => ({
          key: 'test',
          label: '测试',
          value: 'x'.repeat(10000),
          level: '中',
        })),
      }

      localStorage.setItem('studentProfile', JSON.stringify(profile))
      const size = new Blob([localStorage.getItem('studentProfile')!]).size
      expect(size).toBeLessThan(1024 * 1024)
    })
  })

  // ---------- 数据一致性 ----------
  describe('数据一致性', () => {
    it('写入后立即读取 — 数据一致', () => {
      const original = {
        planId: 'consistency-test',
        results: [{ questionId: 'q1', isCorrect: true }],
        moduleProgress: [{ moduleId: 'm1', score: 85 }],
        tagScores: [{ tag: 'syntax', score: 90 }],
        updatedAt: '2026-01-01T00:00:00.000Z',
      }

      localStorage.setItem('practiceState', JSON.stringify(original))
      const loaded = JSON.parse(localStorage.getItem('practiceState')!)

      expect(loaded.planId).toBe(original.planId)
      expect(loaded.results[0].questionId).toBe('q1')
      expect(loaded.tagScores[0].score).toBe(90)
    })

    it('覆盖写入 — 读取到最新值', () => {
      localStorage.setItem('key', JSON.stringify({ version: 1 }))
      localStorage.setItem('key', JSON.stringify({ version: 2 }))
      const loaded = JSON.parse(localStorage.getItem('key')!)
      expect(loaded.version).toBe(2)
    })
  })
})

// ==================== JSON 序列化性能 ====================

describe('JSON 序列化/反序列化性能', () => {
  it('序列化 10000 条记录 < 200ms', () => {
    const data = Array.from({ length: 10000 }, (_, i) => ({
      id: `item-${i}`,
      value: Math.random(),
      tags: ['tag-a', 'tag-b'],
      nested: { a: 1, b: 'hello' },
    }))

    const start = performance.now()
    const json = JSON.stringify(data)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(200)
    expect(json.length).toBeGreaterThan(0)
  })

  it('反序列化 10000 条记录 < 100ms', () => {
    const data = Array.from({ length: 10000 }, (_, i) => ({
      id: `item-${i}`,
      value: i,
    }))
    const json = JSON.stringify(data)

    const start = performance.now()
    const parsed = JSON.parse(json)
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(100)
    expect(parsed).toHaveLength(10000)
  })
})
