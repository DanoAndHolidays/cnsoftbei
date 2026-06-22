import { streamChatCompletion } from './api';
import pathsData from '../data/learningPaths.json';
import type { StructuredLearningPath, PathModule } from '../types';

export const allPaths = pathsData.paths as StructuredLearningPath[];
export type { PathModule };

// ==================== 获取学生画像摘要 ====================
export function getProfileSummary(): Record<string, any> {
  const saved = localStorage.getItem('studentProfile');
  if (!saved) return {};
  try {
    const profile = JSON.parse(saved);
    return {
      name: profile.name,
      major: profile.major,
      grade: profile.grade,
      dimensions: profile.dimensions,
    };
  } catch {
    return {};
  }
}

// ==================== 画像 → 路径匹配度计算 ====================
export function calculatePathMatchScore(
  path: StructuredLearningPath,
  profile: Record<string, any>
): number {
  if (!profile.dimensions) return 30;

  const dimensions: { key: string; value: string; level: string }[] = profile.dimensions;
  const dimMap: Record<string, { value: string; level: string }> = {};
  dimensions.forEach((d: any) => { dimMap[d.key] = { value: d.value, level: d.level }; });

  let totalScore = 0;
  let weights = 0;

  for (const pt of path.profileMatchTags) {
    const [dimKey, ...prefParts] = pt.split(':');
    const pref = prefParts.join(':').toLowerCase();

    const dim = dimMap[dimKey];
    if (!dim) continue;

    // 检查维度值是否匹配路径偏好
    const dimValue = dim.value.toLowerCase();
    const dimLevel = dim.level;

    let match = 50; // 默认中等匹配

    // 按关键词匹配
    if (pref.includes('python') && (dimValue.includes('python') || dimValue.includes('编程'))) {
      match = dimLevel === '高' ? 100 : dimLevel === '中' ? 70 : 40;
    } else if (pref.includes('javascript') && dimValue.includes('javascript')) {
      match = dimLevel === '高' ? 100 : dimLevel === '中' ? 70 : 40;
    } else if (pref.includes('web') && (dimValue.includes('web') || dimValue.includes('前端'))) {
      match = dimLevel === '高' ? 90 : dimLevel === '中' ? 65 : 35;
    } else if (pref.includes('后端') && (dimValue.includes('后端') || dimValue.includes('java') || dimValue.includes('go'))) {
      match = dimLevel === '高' ? 90 : dimLevel === '中' ? 65 : 35;
    } else if (pref.includes('算法') && (dimValue.includes('算法') || dimValue.includes('ai'))) {
      match = dimLevel === '高' ? 95 : dimLevel === '中' ? 70 : 40;
    } else if (pref.includes('数据') && (dimValue.includes('数据') || dimValue.includes('数据库') || dimValue.includes('sql'))) {
      match = dimLevel === '高' ? 90 : dimLevel === '中' ? 65 : 35;
    } else if (pref.includes('理论') && dimLevel === '高') {
      match = 85;
    } else if (pref.includes('实践') && dimValue.includes('实践')) {
      match = dimLevel === '高' ? 90 : dimLevel === '中' ? 70 : 40;
    } else if (pref.includes('go') && (dimValue.includes('go') || dimValue.includes('后端'))) {
      match = dimLevel === '高' ? 90 : dimLevel === '中' ? 65 : 35;
    } else if (pref.includes('rust') && (dimValue.includes('rust') || dimValue.includes('系统编程'))) {
      match = dimLevel === '高' ? 90 : dimLevel === '中' ? 65 : 35;
    } else if ((pref.includes('c#') || pref.includes('dotnet')) && (dimValue.includes('c#') || dimValue.includes('后端') || dimValue.includes('net'))) {
      match = dimLevel === '高' ? 90 : dimLevel === '中' ? 65 : 35;
    } else if (pref.includes('android') && (dimValue.includes('android') || dimValue.includes('移动'))) {
      match = dimLevel === '高' ? 90 : dimLevel === '中' ? 65 : 35;
    } else if ((pref.includes('devops') || pref.includes('sre')) && (dimValue.includes('devops') || dimValue.includes('云原生') || dimValue.includes('运维'))) {
      match = dimLevel === '高' ? 85 : dimLevel === '中' ? 60 : 35;
    } else if (pref.includes('docker') && dimValue.includes('docker')) {
      match = dimLevel === '高' ? 88 : dimLevel === '中' ? 62 : 35;
    } else if (pref.includes('kubernetes') && dimValue.includes('kubernetes')) {
      match = dimLevel === '高' ? 88 : dimLevel === '中' ? 62 : 35;
    }

    totalScore += match;
    weights += 1;
  }

  return weights > 0 ? Math.round(totalScore / weights) : 50;
}

// ==================== 获取排序后的推荐路径 ====================
export function getRecommendedPaths(): { path: StructuredLearningPath; score: number; isBest: boolean }[] {
  const profile = getProfileSummary();
  const scored = allPaths.map(path => ({
    path,
    score: calculatePathMatchScore(path, profile),
  }));
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0]?.score || 0;
  return scored.map(s => ({
    ...s,
    isBest: s.score === best && s.score > 50,
  }));
}

// ==================== AI 推荐路径 ====================
export async function getAIRecommendation(onChunk?: (text: string) => void): Promise<{
  recommendedPathId: string;
  reason: string;
} | null> {
  const profile = getProfileSummary();
  const dimensions = profile.dimensions || [];
  const dimText = dimensions.map((d: any) => `- ${d.label}: ${d.value} (${d.level})`).join('\n');

  const pathsText = allPaths.map((p, i) =>
    `${i + 1}. ${p.name} (${p.id}): ${p.description}\n   标签: ${p.tags.join(', ')}\n   匹配标签: ${p.profileMatchTags.join(', ')}`
  ).join('\n');

  const messages = [
    {
      role: 'system' as const,
      content: `你是学习路径规划专家。根据学生的学习画像和可用路径，推荐最合适的学习路径。

学生画像维度：
${dimText}

可用学习路径：
${pathsText}

请分析学生的知识基础、兴趣方向和认知风格，选择最适合学生的学习路径。
输出JSON格式（只输出JSON）：
{
  "recommendedPathId": "路径ID",
  "reason": "推荐理由（100字以内，说明为什么这个路径适合该学生）"
}`,
    },
    {
      role: 'user' as const,
      content: `请根据我的学习画像，推荐最适合我的学习路径。`,
    },
  ];

  let fullResponse = '';
  await streamChatCompletion(
    messages,
    (chunk, isThinking) => {
      if (!isThinking) {
        fullResponse += chunk;
        onChunk?.(chunk);
      }
    },
  );

  try {
    let jsonStr = fullResponse;
    const m = fullResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || fullResponse.match(/\{[\s\S]*\}/);
    if (m) jsonStr = m[1] || m[0];
    jsonStr = jsonStr.includes('{') ? jsonStr.substring(jsonStr.indexOf('{')).replace(/```/g, '') : jsonStr;
    const result = JSON.parse(jsonStr);
    return { recommendedPathId: result.recommendedPathId, reason: result.reason };
  } catch {
    // AI 失败时回退到规则匹配
    const scored = getRecommendedPaths();
    if (scored.length > 0) {
      return {
        recommendedPathId: scored[0].path.id,
        reason: `基于您的学习画像分析（${dimensions.map((d: any) => d.label).join('、')}），推荐此路径最符合您当前的学习阶段。`,
      };
    }
    return null;
  }
}
