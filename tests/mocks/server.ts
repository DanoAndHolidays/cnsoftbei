/**
 * server.ts
 *
 * msw 服务器实例 — 用于 Vitest 测试环境
 */
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
