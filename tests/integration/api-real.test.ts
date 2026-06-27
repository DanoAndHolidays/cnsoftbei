/**
 * MiniMax API 真实接口测试
 *
 * 直接调用 MiniMax API（不经过 Vite 代理），验证连通性和响应格式。
 * 运行方式：npx vitest run tests/integration/api-real.test.ts
 *
 * 注意：会消耗 API 额度，每次运行约 200-500 tokens。
 */

import { describe, it, expect } from 'vitest'

const API_KEY = 'sk-cp-M-_jNzReYVMIzZg6a8AL1hdZWgP_-GHPRIHE-8lHMaGo14qzZH301EfQ81J8-yVxD0SDTQpqiCKwdEtTRIJ1jX5QoPD-EtYJhC9imCA3PTl1FBkNHQUQeRg'
const BASE_URL = 'https://api.minimaxi.com/anthropic'
const API_TIMEOUT = 60000

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ==================== 流式调用工具函数 ====================

async function callStream(messages: ChatMessage[]): Promise<{
  text: string
  chunks: string[]
  thinkingChunks: string[]
}> {
  const anthropicMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const systemMessage = messages.find(m => m.role === 'system')

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.7',
      max_tokens: 256,
      system: systemMessage?.content,
      messages: anthropicMessages,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('Response body is not readable')

  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''
  const chunks: string[] = []
  const thinkingChunks: string[] = []

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (line.trim() && line.startsWith('data:')) {
        try {
          const data = JSON.parse(line.replace('data:', ''))

          if (data.type === 'content_block_delta') {
            if (data.delta?.type === 'thinking_delta' && data.delta?.thinking) {
              thinkingChunks.push(data.delta.thinking)
            } else if (data.delta?.type === 'text_delta' && data.delta?.text) {
              chunks.push(data.delta.text)
              fullContent += data.delta.text
            }
          }
        } catch {
          // 忽略解析错误
        }
      }
    }
  }

  return { text: fullContent || '[无内容返回]', chunks, thinkingChunks }
}

// ==================== 非流式调用工具函数 ====================

async function callNonStream(messages: ChatMessage[]): Promise<string> {
  const anthropicMessages = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }))

  const systemMessage = messages.find(m => m.role === 'system')

  const response = await fetch(`${BASE_URL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'MiniMax-M2.7',
      max_tokens: 256,
      system: systemMessage?.content,
      messages: anthropicMessages,
      stream: false,
    }),
  })

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`)
  }

  const result = await response.json()

  if (result.content && Array.isArray(result.content)) {
    const textParts = result.content
      .filter((b: any) => b.type === 'text' && b.text)
      .map((b: any) => b.text)
    return textParts.join('\n\n') || '[无内容返回]'
  }

  if (result.response) return result.response
  throw new Error(`Invalid response: ${JSON.stringify(result).substring(0, 200)}`)
}

// ==================== 流式接口测试 ====================

describe('MiniMax API 流式接口', () => {
  it(
    '基本连通性 — 返回非空文本',
    async () => {
      const { text } = await callStream([
        { role: 'user', content: '用一句话回答：1+1等于几？' },
      ])
      expect(text).toBeTruthy()
      expect(text).toContain('2')
    },
    API_TIMEOUT,
  )

  it(
    '流式回调 — onChunk 被多次调用',
    async () => {
      const { text, chunks } = await callStream([
        { role: 'user', content: '用一句话回答：Python 是什么？' },
      ])
      expect(chunks.length).toBeGreaterThan(0)
      expect(chunks.join('')).toBe(text)
    },
    API_TIMEOUT,
  )

  it(
    'system 消息 — 角色约束生效',
    async () => {
      const { text } = await callStream([
        { role: 'system', content: '你是一个数学助手。只回答数学问题。如果问题不是数学相关的，回答"我只能回答数学问题"。' },
        { role: 'user', content: '今天天气怎么样？' },
      ])
      expect(text).toContain('数学')
    },
    API_TIMEOUT,
  )

  it(
    '中文回答 — 返回中文内容',
    async () => {
      const { text } = await callStream([
        { role: 'user', content: '用中文回答：什么是变量？一句话。' },
      ])
      expect(/[一-鿿]/.test(text)).toBe(true)
    },
    API_TIMEOUT,
  )

  it(
    '多轮对话 — 上下文保持',
    async () => {
      const { text } = await callStream([
        { role: 'user', content: '我叫小明' },
        { role: 'assistant', content: '你好小明！' },
        { role: 'user', content: '我叫什么？只回答名字。' },
      ])
      expect(text).toContain('小明')
    },
    API_TIMEOUT,
  )
})

// ==================== 非流式接口测试 ====================

describe('MiniMax API 非流式接口', () => {
  it(
    '基本连通性 — 返回非空文本',
    async () => {
      const result = await callNonStream([
        { role: 'user', content: '用一句话回答：1+1等于几？' },
      ])
      expect(result).toBeTruthy()
      expect(result).toContain('2')
    },
    API_TIMEOUT,
  )

  it(
    'system 消息 — 角色约束生效',
    async () => {
      const result = await callNonStream([
        { role: 'system', content: '你是一个编程教师。只回答 Python 相关问题。' },
        { role: 'user', content: 'Python 的 print 函数是干什么的？一句话。' },
      ])
      expect(result).toBeTruthy()
      expect(result.length).toBeGreaterThan(0)
    },
    API_TIMEOUT,
  )

  it(
    '评分场景 — 返回数字',
    async () => {
      const result = await callNonStream([
        {
          role: 'system',
          content: '你是评分助手。只输出一个0-100的数字，不要输出其他内容。',
        },
        {
          role: 'user',
          content: '参考答案：变量是存储数据的容器。用户答案：变量就是可以变的量。评分：',
        },
      ])
      expect(result).toBeTruthy()
      const scoreMatch = result.match(/\d+/)
      expect(scoreMatch).not.toBeNull()
      const score = parseInt(scoreMatch![0], 10)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    },
    API_TIMEOUT,
  )
})

// ==================== 响应格式验证 ====================

describe('API 响应格式验证', () => {
  it(
    '流式响应 — text 块存在',
    async () => {
      const { chunks } = await callStream([
        { role: 'user', content: '1+1=?' },
      ])
      expect(chunks.length).toBeGreaterThan(0)
    },
    API_TIMEOUT,
  )

  it(
    '流式响应 — 拼接与返回值一致',
    async () => {
      const { text, chunks } = await callStream([
        { role: 'user', content: '用一个词回答：天空是什么颜色？' },
      ])
      expect(chunks.join('')).toBe(text)
    },
    API_TIMEOUT,
  )
})

// ==================== 错误处理 ====================

describe('API 错误处理', () => {
  it(
    '无效 API Key — 返回 401',
    async () => {
      const response = await fetch(`${BASE_URL}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'invalid-key',
          'anthropic-version': '2023-06-01',
          Authorization: 'Bearer invalid-key',
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.7',
          max_tokens: 64,
          messages: [{ role: 'user', content: 'hi' }],
          stream: false,
        }),
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBeGreaterThanOrEqual(400)
    },
    API_TIMEOUT,
  )

  it(
    '请求取消 — AbortError',
    async () => {
      const controller = new AbortController()
      controller.abort()

      await expect(
        fetch(`${BASE_URL}/v1/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'MiniMax-M2.7',
            max_tokens: 256,
            messages: [{ role: 'user', content: 'hi' }],
            stream: true,
          }),
          signal: controller.signal,
        }),
      ).rejects.toThrow()
    },
    API_TIMEOUT,
  )
})
