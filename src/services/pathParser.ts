import { getAllBankIds, getBank } from './practiceGrader';
import type {
  StructuredLearningPathData,
  StructuredLearningNode,
  PathParseResult,
} from '../types';

/**
 * 从 AI 流式输出文本中提取 JSON 并校验节点引用是否合法。
 * - 自动识别 ```json``` 代码块
 * - 逐节点校验 questionBankId/moduleId
 * - 校验失败的节点标 valid:false，不阻断整条路径
 * - 有效节点数 < 1 时返回 errors
 */
export function parseStructuredPathResponse(
  rawText: string,
  validBankIds: string[] = getAllBankIds()
): PathParseResult {
  // 1. 提取 JSON 字符串
  const codeBlock = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  let jsonStr = codeBlock ? codeBlock[1] : rawText;
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  // 2. JSON.parse
  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    return { ok: false, errors: [`JSON 解析失败: ${(e as Error).message}`] };
  }

  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.nodes)) {
    return { ok: false, errors: ['JSON 结构不合法：缺少 nodes 数组'] };
  }

  // 3. 校验节点
  const errors: string[] = [];
  const validatedNodes: StructuredLearningNode[] = parsed.nodes.map((node: any, idx: number) => {
    const questionBankId = String(node.questionBankId || '').trim();
    const moduleId = String(node.moduleId || '').trim();
    const valid = validBankIds.includes(questionBankId) &&
      !!getBank(questionBankId)?.modules.find(m => m.id === moduleId);

    if (!valid) {
      errors.push(`节点 ${idx + 1}（${node.title || '未命名'}）引用无效：${questionBankId}/${moduleId}`);
    }

    return {
      id: `node-${idx + 1}`,
      title: String(node.title || `${questionBankId}/${moduleId}`),
      description: String(node.description || ''),
      status: idx === 0 ? 'in-progress' : 'locked',
      progress: 0,
      estimatedHours: typeof node.estimatedHours === 'number' ? node.estimatedHours : 8,
      questionBankId,
      moduleId,
      moduleName: getBank(questionBankId)?.modules.find(m => m.id === moduleId)?.name,
      isEntry: !!node.isEntry,
      valid,
    };
  });

  // 4. 至少一个有效节点
  const validCount = validatedNodes.filter(n => n.valid).length;
  if (validCount === 0) {
    return { ok: false, errors: [...errors, '所有节点引用都无效'] };
  }

  const path: StructuredLearningPathData = {
    id: `ai-${Date.now()}`,
    title: String(parsed.title || 'AI 生成的学习路径'),
    description: String(parsed.description || '基于您的主题生成'),
    source: 'ai-generated',
    nodes: validatedNodes,
    createdAt: new Date().toISOString(),
  };

  return { ok: true, path };
}

/**
 * 从学习路径列表中构建 StructuredLearningPathData（用于"采用预定义路径"）。
 */
export function adoptPredefinedPath(
  predefinedId: string,
  title: string,
  description: string,
  modules: { questionBankId: string; moduleId: string; name: string; estimatedHours?: number; isEntry?: boolean }[]
): StructuredLearningPathData {
  const nodes: StructuredLearningNode[] = modules.map((m, idx) => ({
    id: `node-${idx + 1}`,
    title: m.name,
    description: `学习 ${m.name}`,
    status: idx === 0 ? 'in-progress' : 'locked',
    progress: 0,
    estimatedHours: m.estimatedHours || 8,
    questionBankId: m.questionBankId,
    moduleId: m.moduleId,
    moduleName: m.name,
    isEntry: m.isEntry || idx === 0,
    valid: getAllBankIds().includes(m.questionBankId) && !!getBank(m.questionBankId)?.modules.find(bm => bm.id === m.moduleId),
  }));

  return {
    id: `adopted-${predefinedId}-${Date.now()}`,
    title,
    description,
    source: 'adopted',
    predefinedId,
    nodes,
    createdAt: new Date().toISOString(),
  };
}
