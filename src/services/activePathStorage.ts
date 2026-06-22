import { getAllBankIds, getBank } from './practiceGrader';
import type { StructuredLearningPathData } from '../types';

const KEY = 'activeStructuredPath';

/**
 * 加载当前活跃的结构化路径，并对每个节点做引用校验。
 * 解析失败时清除 localStorage 并返回 null。
 */
export function loadActiveStructuredPath(): StructuredLearningPathData | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw) as StructuredLearningPathData;
    if (!data || !Array.isArray(data.nodes)) {
      localStorage.removeItem(KEY);
      return null;
    }

    // 校验每个节点
    const validBankIds = getAllBankIds();
    data.nodes = data.nodes.map(n => ({
      ...n,
      valid: validBankIds.includes(n.questionBankId) &&
        !!getBank(n.questionBankId)?.modules.find(m => m.id === n.moduleId),
    }));

    return data;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

/**
 * 保存当前活跃的结构化路径。
 */
export function saveActiveStructuredPath(path: StructuredLearningPathData): void {
  localStorage.setItem(KEY, JSON.stringify(path));
}

/**
 * 清除当前活跃路径。
 */
export function clearActiveStructuredPath(): void {
  localStorage.removeItem(KEY);
}