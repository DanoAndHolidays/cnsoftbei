import { describe, it, expect } from 'vitest'
import {
  validateAnswerRules,
  findBestMatchByKeywords,
  extractTokens,
  jaccardSimilarity,
} from '../../src/services/tutorQuality'
import type { QAItem } from '../../src/types'

// ==================== 测试数据工厂 ====================

function makeQA(overrides: Partial<QAItem> = {}): QAItem {
  return {
    id: `qa-${Math.random().toString(36).slice(2, 8)}`,
    question: '测试问题',
    answer: '这是一个测试回答，包含足够的文字内容以通过长度检查。',
    type: 'text',
    helpful: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// ==================== validateAnswerRules 测试 ====================

describe('validateAnswerRules', () => {
  describe('长度检查', () => {
    it('过短的回答不通过', () => {
      const result = validateAnswerRules('短回答', '什么是 Python？')
      expect(result.pass).toBe(false)
      expect(result.reason).toContain('过短')
    })

    it('恰好 50 字的回答通过', () => {
      const answer = '这'.repeat(50)
      const result = validateAnswerRules(answer, '什么是 Python？')
      expect(result.pass).toBe(true)
    })

    it('充分的回答通过', () => {
      const answer = 'Python 是一种解释型、面向对象的高级编程语言，由 Guido van Rossum 于 1991 年创建。它以简洁易读的语法著称，广泛应用于 Web 开发、数据科学和人工智能领域。'
      const result = validateAnswerRules(answer, '什么是 Python？')
      expect(result.pass).toBe(true)
    })
  })

  describe('拒绝性语句检查', () => {
    it('包含"我无法回答"不通过', () => {
      const answer = 'a'.repeat(60) + '我无法回答这个问题'
      const result = validateAnswerRules(answer, '某个问题')
      expect(result.pass).toBe(false)
      expect(result.reason).toContain('拒绝')
    })

    it('包含"抱歉，我无法"不通过', () => {
      const answer = 'a'.repeat(60) + '抱歉，我无法提供此类信息'
      const result = validateAnswerRules(answer, '某个问题')
      expect(result.pass).toBe(false)
    })

    it('包含"I cannot"不通过', () => {
      const answer = 'a'.repeat(60) + 'I cannot help with that'
      const result = validateAnswerRules(answer, 'some question')
      expect(result.pass).toBe(false)
    })

    it('正常回答不含拒绝语句通过', () => {
      const answer = 'Python 是一种编程语言，它支持多种编程范式，包括面向对象和函数式编程。它由 Guido van Rossum 创建，以简洁易读的语法著称。'
      const result = validateAnswerRules(answer, '什么是 Python？')
      expect(result.pass).toBe(true)
    })
  })

  describe('关键词重叠检查', () => {
    it('问题词多且回答无重叠 → 不通过', () => {
      const question = 'Python 的装饰器是什么如何使用它来实现缓存功能'
      const answer = '数据库索引是一种用于提高查询效率的数据结构。B+树索引和哈希索引是两种常见的索引类型，分别适用于范围查询和等值查询场景。'
      const result = validateAnswerRules(answer, question)
      expect(result.pass).toBe(false)
      expect(result.reason).toContain('关键词重叠')
    })

    it('问题词少时跳过重叠检查', () => {
      const question = '装饰器'
      const answer = '这是一段完全不相关的回答内容，没有任何与问题相关的关键词出现。数据库索引是一种用于提高查询效率的数据结构。'
      const result = validateAnswerRules(answer, question)
      // questionWords.length <= 3，跳过重叠检查
      expect(result.pass).toBe(true)
    })

    it('回答与问题有关键词重叠 → 通过', () => {
      const question = 'Python 的装饰器是什么'
      const answer = 'Python 装饰器是一种设计模式，它允许你在不修改原函数代码的情况下为函数添加新的功能。装饰器本质上是一个接收函数作为参数的高阶函数。'
      const result = validateAnswerRules(answer, question)
      expect(result.pass).toBe(true)
    })
  })

  describe('空输入', () => {
    it('空回答不通过', () => {
      const result = validateAnswerRules('', '问题')
      expect(result.pass).toBe(false)
    })

    it('纯空格回答不通过', () => {
      const result = validateAnswerRules('   ', '问题')
      expect(result.pass).toBe(false)
    })
  })
})

// ==================== extractTokens 测试 ====================

describe('extractTokens', () => {
  it('提取中文 2-gram 和英文词', () => {
    const tokens = extractTokens('Python 是一种编程语言')
    expect(tokens.has('python')).toBe(true)
    // 中文 2-gram
    expect(tokens.has('是一')).toBe(true)
    expect(tokens.has('一种')).toBe(true)
    expect(tokens.has('种编')).toBe(true)
    expect(tokens.has('编程')).toBe(true)
    expect(tokens.has('程语')).toBe(true)
    expect(tokens.has('语言')).toBe(true)
    // 单字符不在结果中
    expect(tokens.has('是')).toBe(false)
    expect(tokens.has('编')).toBe(false)
  })

  it('提取英文词', () => {
    const tokens = extractTokens('Hello World programming')
    expect(tokens.has('hello')).toBe(true)
    expect(tokens.has('world')).toBe(true)
    expect(tokens.has('programming')).toBe(true)
  })

  it('混合中英文', () => {
    const tokens = extractTokens('Python 是一种 programming language')
    expect(tokens.has('python')).toBe(true)
    expect(tokens.has('programming')).toBe(true)
    expect(tokens.has('language')).toBe(true)
    expect(tokens.has('是一')).toBe(true)
    expect(tokens.has('一种')).toBe(true)
  })

  it('空字符串返回空集', () => {
    const tokens = extractTokens('')
    expect(tokens.size).toBe(0)
  })

  it('短英文词被忽略（< 3 字符）', () => {
    const tokens = extractTokens('a bc Python')
    expect(tokens.has('a')).toBe(false)
    expect(tokens.has('bc')).toBe(false)
    expect(tokens.has('python')).toBe(true)
  })
})

// ==================== jaccardSimilarity 测试 ====================

describe('jaccardSimilarity', () => {
  it('完全相同 → 1', () => {
    const set = new Set(['a', 'b', 'c'])
    expect(jaccardSimilarity(set, new Set(['a', 'b', 'c']))).toBe(1)
  })

  it('完全不同 → 0', () => {
    const a = new Set(['a', 'b'])
    const b = new Set(['c', 'd'])
    expect(jaccardSimilarity(a, b)).toBe(0)
  })

  it('部分重叠', () => {
    const a = new Set(['a', 'b', 'c'])
    const b = new Set(['b', 'c', 'd'])
    // intersection = 2, union = 4 → 0.5
    expect(jaccardSimilarity(a, b)).toBe(0.5)
  })

  it('两个空集 → 0', () => {
    expect(jaccardSimilarity(new Set(), new Set())).toBe(0)
  })

  it('一个空集 → 0', () => {
    expect(jaccardSimilarity(new Set(['a']), new Set())).toBe(0)
  })
})

// ==================== findBestMatchByKeywords 测试 ====================

describe('findBestMatchByKeywords', () => {
  it('找到最相关的历史 QA', () => {
    const history = [
      makeQA({ id: 'qa-1', question: 'Python 装饰器' }),
      makeQA({ id: 'qa-2', question: 'JavaScript 闭包' }),
      makeQA({ id: 'qa-3', question: 'Python 列表推导式' }),
    ]
    const result = findBestMatchByKeywords('Python 装饰器', history)
    expect(result).not.toBeNull()
    expect(result!.id).toBe('qa-1')
  })

  it('无匹配时返回 null', () => {
    const history = [
      makeQA({ id: 'qa-1', question: '什么是 Python 装饰器' }),
    ]
    const result = findBestMatchByKeywords('量子计算的基本原理', history)
    expect(result).toBeNull()
  })

  it('空历史返回 null', () => {
    const result = findBestMatchByKeywords('Python 装饰器', [])
    expect(result).toBeNull()
  })

  it('空输入返回 null', () => {
    const history = [makeQA({ question: 'Python 装饰器' })]
    const result = findBestMatchByKeywords('', history)
    expect(result).toBeNull()
  })

  it('纯停用词输入返回 null', () => {
    const history = [makeQA({ question: 'Python 装饰器' })]
    const result = findBestMatchByKeywords('的了是在', history)
    expect(result).toBeNull()
  })

  it('英文关键词匹配', () => {
    const history = [
      makeQA({ id: 'qa-1', question: 'Python decorator pattern' }),
      makeQA({ id: 'qa-2', question: 'JavaScript closure concept' }),
    ]
    const result = findBestMatchByKeywords('How to use Python decorator', history)
    expect(result).not.toBeNull()
    expect(result!.id).toBe('qa-1')
  })

  it('跳过空回答的 QA', () => {
    const history = [
      makeQA({ id: 'qa-1', question: 'Python 装饰器', answer: '' }),
      makeQA({ id: 'qa-2', question: 'Python 装饰器', answer: '装饰器是 Python 的一种设计模式...' }),
    ]
    const result = findBestMatchByKeywords('Python 装饰器', history)
    expect(result).not.toBeNull()
    expect(result!.id).toBe('qa-2')
  })

  it('返回相似度最高的候选', () => {
    const history = [
      makeQA({ id: 'qa-1', question: 'Python 装饰器基础概念' }),
      makeQA({ id: 'qa-2', question: 'Python 装饰器' }),
      makeQA({ id: 'qa-3', question: '装饰器高级用法' }),
    ]
    const result = findBestMatchByKeywords('Python 装饰器', history)
    expect(result).not.toBeNull()
    // qa-2 完全匹配，相似度最高
    expect(result!.id).toBe('qa-2')
  })
})
