/**
 * feedback — 用户反馈服务
 *
 * 使用 localStorage 存储，支持提交、查询、标记已处理。
 */

export interface Feedback {
  id: string
  userId: string
  userName: string
  userRole: string
  type: 'bug' | 'feature' | 'other'
  title: string
  content: string
  status: 'pending' | 'resolved'
  createdAt: string
  resolvedAt?: string
}

const FEEDBACK_KEY = 'feedbacks'

function loadAll(): Feedback[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(items: Feedback[]): void {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(items))
}

/** 用户提交反馈 */
export function submitFeedback(
  userId: string,
  userName: string,
  userRole: string,
  type: Feedback['type'],
  title: string,
  content: string,
): Feedback {
  const items = loadAll()
  const fb: Feedback = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    userName,
    userRole,
    type,
    title,
    content,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  items.unshift(fb)
  saveAll(items)
  return fb
}

/** 获取所有反馈（管理员用） */
export function getAllFeedbacks(): Feedback[] {
  return loadAll()
}

/** 获取某用户的反馈 */
export function getUserFeedbacks(userId: string): Feedback[] {
  return loadAll().filter(f => f.userId === userId)
}

/** 标记反馈为已处理 */
export function resolveFeedback(id: string): void {
  const items = loadAll()
  const fb = items.find(f => f.id === id)
  if (fb) {
    fb.status = 'resolved'
    fb.resolvedAt = new Date().toISOString()
    saveAll(items)
  }
}

/** 删除反馈 */
export function deleteFeedback(id: string): void {
  const items = loadAll().filter(f => f.id !== id)
  saveAll(items)
}

/** 统计 */
export function getFeedbackStats(): { total: number; pending: number; resolved: number } {
  const items = loadAll()
  return {
    total: items.length,
    pending: items.filter(f => f.status === 'pending').length,
    resolved: items.filter(f => f.status === 'resolved').length,
  }
}
