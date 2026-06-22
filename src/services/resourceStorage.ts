import type { ResourceType } from '../types';

const STORAGE_KEY = 'generatedResources';

export interface GeneratedResource {
  id: string;
  type: ResourceType;
  topic: string;
  content: string;
  createdAt: string;
  relatedProfileKeys: string[];
}

// 保存单个资源
export function saveGeneratedResource(resource: GeneratedResource): void {
  const existing = getAllGeneratedResources();
  existing.unshift(resource);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
}

// 获取所有已生成资源
export function getAllGeneratedResources(): GeneratedResource[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

// 按类型获取资源
export function getResourcesByType(type: ResourceType): GeneratedResource[] {
  return getAllGeneratedResources().filter(r => r.type === type);
}

// 按话题搜索资源
export function searchResources(keyword: string): GeneratedResource[] {
  const lower = keyword.toLowerCase();
  return getAllGeneratedResources().filter(r =>
    r.topic.toLowerCase().includes(lower) ||
    r.content.toLowerCase().includes(lower)
  );
}

// 清除旧资源
export function clearOldResources(daysOld: number = 30): void {
  const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;
  const filtered = getAllGeneratedResources().filter(
    r => new Date(r.createdAt).getTime() > cutoff
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// 触发资源更新事件（供其他模块监听）
export function notifyResourcesUpdated(): void {
  window.dispatchEvent(new CustomEvent('generatedResourcesUpdated'));
}