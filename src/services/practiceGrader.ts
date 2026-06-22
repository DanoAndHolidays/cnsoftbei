import { streamChatCompletion } from './api';
import type {
  PracticeQuestion,
  PracticeResult,
  ModuleProgress,
  TagScore,
  PracticeState,
} from '../types';
import { questions, learningPlan, tagToChinese } from '../data/pythonQuestionBank';
import { initialProfile } from '../data/mockData';
import {
  appendLearningCycleLog,
  buildLearningEvaluationReport,
  syncLearningProfileFromPractice,
  saveProfileAndNotify,
  broadcastEvent,
  SYSTEM_EVENTS,
} from './learningOrchestrator';

// ==================== 路径-练习同步阈值 ====================
/** 模块得分达到此阈值时，路径节点自动标记为已完成 */
export const COMPLETION_THRESHOLD = 80;

// ==================== 题库注册表 ====================
interface QuestionBankData {
  id: string;
  name: string;
  description: string;
  modules: { id: string; name: string; description: string; questionCount: number; tags: string[] }[];
  questions: PracticeQuestion[];
}

const bankRegistry = new Map<string, QuestionBankData>();
[pythonBank, jsBank, dsBank, sqlBank, javaBank, goBank, csharpBank, rustBank, devopsBank, networksBank, linuxBank, mlBank].forEach(bank => {
  bankRegistry.set(bank.id, bank as QuestionBankData);
});

export function getBank(bankId: string): QuestionBankData | undefined {
  return bankRegistry.get(bankId);
}

export function getAllBankIds(): string[] {
  return Array.from(bankRegistry.keys());
}

export function getQuestionsByBank(bankId: string): PracticeQuestion[] {
  const bank = bankRegistry.get(bankId);
  return bank?.questions || [];
}

export function getAllQuestions(): PracticeQuestion[] {
  return Array.from(bankRegistry.values()).flatMap(b => b.questions);
}

export function getModuleInfo(questionBankId: string, moduleId: string) {
  const bank = bankRegistry.get(questionBankId);
  return bank?.modules.find(m => m.id === moduleId);
}

// 向后兼容：默认导出 Python 题库
export const learningPlan = pythonBank;
export const questions = pythonBank.questions as PracticeQuestion[];

// ==================== 活跃学习路径 ====================
const ACTIVE_PATH_KEY = 'activeLearningPath';
const ACTIVE_BANK_KEY = 'activeQuestionBank';

export function setActivePath(pathId: string): void {
  localStorage.setItem(ACTIVE_PATH_KEY, pathId);
}

export function getActivePath(): string | null {
  return localStorage.getItem(ACTIVE_PATH_KEY);
}

export function setActiveBank(bankId: string): void {
  localStorage.setItem(ACTIVE_BANK_KEY, bankId);
}

export function getActiveBank(): string {
  return localStorage.getItem(ACTIVE_BANK_KEY) || 'python-basics';
}

export function getActiveQuestions(): PracticeQuestion[] {
  return getQuestionsByBank(getActiveBank());
}

export function getActiveModuleProgress(): { moduleId: string; name: string; totalQuestions: number }[] {
  const bank = bankRegistry.get(getActiveBank());
  return bank?.modules.map(m => ({
    moduleId: m.id,
    name: m.name,
    totalQuestions: m.questionCount,
  })) || [];
}

// ==================== Tag → 画像维度映射 ====================
const TAG_TO_DIMENSION: Record<string, string> = {
  // Python
  syntax: 'knowledgeBase', 'data-types': 'knowledgeBase', operators: 'knowledgeBase',
  'control-flow': 'knowledgeBase', functions: 'knowledgeBase', modules: 'knowledgeBase',
  scope: 'knowledgeBase', OOP: 'knowledgeBase', classes: 'knowledgeBase',
  inheritance: 'knowledgeBase', polymorphism: 'knowledgeBase', exceptions: 'knowledgeBase',
  files: 'knowledgeBase', decorators: 'knowledgeBase', comprehensions: 'knowledgeBase',
  // JS/Web
  'js-syntax': 'knowledgeBase', 'js-data-types': 'knowledgeBase', 'js-operators': 'knowledgeBase',
  'js-control-flow': 'knowledgeBase', 'js-functions': 'knowledgeBase', 'js-closure': 'knowledgeBase',
  'js-async': 'knowledgeBase', dom: 'knowledgeBase', 'js-events': 'knowledgeBase',
  browser: 'knowledgeBase', http: 'knowledgeBase', fetch: 'knowledgeBase', restful: 'knowledgeBase',
  cors: 'knowledgeBase',
  // DSA
  array: 'knowledgeBase', 'linked-list': 'knowledgeBase', stack: 'knowledgeBase', queue: 'knowledgeBase',
  'binary-tree': 'knowledgeBase', graph: 'knowledgeBase', 'tree-traversal': 'knowledgeBase',
  bfs: 'knowledgeBase', dfs: 'knowledgeBase', sorting: 'knowledgeBase', 'binary-search': 'knowledgeBase',
  complexity: 'knowledgeBase', recursion: 'knowledgeBase', 'dynamic-programming': 'knowledgeBase',
  greedy: 'knowledgeBase', 'divide-conquer': 'knowledgeBase',
  // SQL
  'sql-select': 'knowledgeBase', 'sql-where': 'knowledgeBase', 'sql-aggregation': 'knowledgeBase',
  'sql-join': 'knowledgeBase', 'sql-subquery': 'knowledgeBase', 'sql-union': 'knowledgeBase',
  'database-normalization': 'knowledgeBase', 'database-index': 'knowledgeBase',
  'database-transaction': 'knowledgeBase', 'sql-window': 'knowledgeBase',
  'sql-groupby': 'knowledgeBase', 'sql-optimization': 'knowledgeBase',
  // Java
  'java-syntax': 'knowledgeBase', 'java-data-types': 'knowledgeBase', 'java-operators': 'knowledgeBase',
  'java-control-flow': 'knowledgeBase', 'java-oop': 'knowledgeBase', 'java-classes': 'knowledgeBase',
  'java-inheritance': 'knowledgeBase', 'java-polymorphism': 'knowledgeBase', 'java-exceptions': 'knowledgeBase',
  'java-collections': 'knowledgeBase', 'java-generics': 'knowledgeBase', 'java-stream': 'knowledgeBase',
  'java-threading': 'knowledgeBase', 'java-reflect': 'knowledgeBase',
  // Go
  'go-syntax': 'knowledgeBase', 'go-data-types': 'knowledgeBase', 'go-operators': 'knowledgeBase',
  'go-control-flow': 'knowledgeBase', 'go-functions': 'knowledgeBase', 'go-error': 'knowledgeBase',
  'go-packages': 'knowledgeBase', 'go-concurrency': 'knowledgeBase', 'go-channel': 'knowledgeBase',
  'go-goroutine': 'knowledgeBase', 'go-http': 'knowledgeBase', 'go-json': 'knowledgeBase',
  'go-testing': 'knowledgeBase',
  // C#
  'csharp-syntax': 'knowledgeBase', 'csharp-data-types': 'knowledgeBase', 'csharp-operators': 'knowledgeBase',
  'csharp-control-flow': 'knowledgeBase', 'csharp-oop': 'knowledgeBase', 'csharp-interface': 'knowledgeBase',
  'csharp-delegate': 'knowledgeBase', 'csharp-linq': 'knowledgeBase', 'csharp-async': 'knowledgeBase',
  'csharp-threading': 'knowledgeBase', 'csharp-web': 'knowledgeBase', 'csharp-ef': 'knowledgeBase',
  'csharp-json': 'knowledgeBase',
  // Rust
  'rust-syntax': 'knowledgeBase', 'rust-ownership': 'knowledgeBase', 'rust-borrow': 'knowledgeBase',
  'rust-data-types': 'knowledgeBase', 'rust-lifetime': 'knowledgeBase', 'rust-trait': 'knowledgeBase',
  'rust-generics': 'knowledgeBase', 'rust-result': 'knowledgeBase', 'rust-panic': 'knowledgeBase',
  'rust-modules': 'knowledgeBase', 'rust-threading': 'knowledgeBase', 'rust-concurrency': 'knowledgeBase',
  'rust-smart-pointer': 'knowledgeBase',
  // DevOps
  'linux-shell': 'knowledgeBase', 'linux-permission': 'knowledgeBase', 'linux-file-system': 'knowledgeBase',
  docker: 'knowledgeBase', dockerfile: 'knowledgeBase', 'docker-compose': 'knowledgeBase',
  kubernetes: 'knowledgeBase', kubectl: 'knowledgeBase', 'k8s-pod': 'knowledgeBase',
  cicd: 'knowledgeBase', monitoring: 'knowledgeBase', prometheus: 'knowledgeBase',
  // 计算机网络
  osi: 'knowledgeBase', tcpip: 'knowledgeBase', encapsulation: 'knowledgeBase',
  https: 'knowledgeBase', rest: 'knowledgeBase', cookie: 'knowledgeBase',
  handshake: 'knowledgeBase', reliability: 'knowledgeBase', udp: 'knowledgeBase',
  dns: 'knowledgeBase', cdn: 'knowledgeBase', security: 'knowledgeBase',
  // Linux 基础
  'linux-file': 'knowledgeBase', directory: 'knowledgeBase', 'file-ops': 'knowledgeBase',
  'linux-user': 'knowledgeBase', permission: 'knowledgeBase', chmod: 'knowledgeBase',
  sudo: 'knowledgeBase', bash: 'knowledgeBase', 'shell-script': 'knowledgeBase',
  'linux-process': 'knowledgeBase', systemd: 'knowledgeBase', log: 'knowledgeBase',
  // 机器学习
  supervised: 'knowledgeBase', unsupervised: 'knowledgeBase', regression: 'knowledgeBase',
  classification: 'knowledgeBase', clustering: 'knowledgeBase', 'dim-reduction': 'knowledgeBase',
  evaluation: 'knowledgeBase', metrics: 'knowledgeBase', 'cross-validation': 'knowledgeBase',
  scaling: 'knowledgeBase', 'feature-engineering': 'knowledgeBase', tuning: 'knowledgeBase',
  // 通用
  errorProne: 'errorProne',
  studyHabit: 'studyHabit',
  // 数据库知识
  '数据库基础': 'knowledgeBase',
  'SQL基础': 'knowledgeBase',
  '数据库约束': 'knowledgeBase',
  '数据库索引': 'knowledgeBase',
  '数据库事务': 'knowledgeBase',
  '多表查询': 'knowledgeBase',
  '数据库设计': 'knowledgeBase',
  '数据库运维': 'knowledgeBase',
  '数据库类型': 'knowledgeBase',
};

// ==================== 存储键名 ====================
import { userKey } from './storage';

export { learningPlan, questions, tagToChinese };

// ==================== 客观题判分 ====================
export function checkAnswer(question: PracticeQuestion, userAnswer: string): boolean {
  if (question.type === 'choice') {
    return userAnswer === question.correctAnswer;
  }
  if (question.type === 'truefalse') {
    const expected = question.trueFalseAnswer ? 'true' : 'false';
    return userAnswer === expected;
  }
  if (question.type === 'fill') {
    const expected = (question.fillAnswer || '').trim().toLowerCase();
    return userAnswer.trim().toLowerCase() === expected;
  }
  return false;
}

// ==================== AI 判分（简答题） ====================
export async function gradeByAI(
  question: PracticeQuestion,
  userAnswer: string,
  onChunk?: (text: string) => void
): Promise<number> {
  if (question.type === 'short') {
    const messages = [
      {
        role: 'system' as const,
        content: `你是一个严谨的编程教育评估专家。请根据参考答案为用户的答案评分（0-100分）。
评分标准：
- 90-100：正确理解题意，答案完整准确，有深度
- 70-89：基本正确，有少量遗漏或小错误
- 50-69：理解部分题意，答案有较多不完整或错误
- 20-49：理解基本错误，答案偏离题意
- 0-19：完全错误或未作答

请严格按此标准评分，不要随意给高分。`,
      },
      {
        role: 'user' as const,
        content: `题目：${question.question}

参考答案：${question.sampleAnswer}

用户答案：${userAnswer}

请只输出一个0-100的整数分数，不要输出其他内容。`,
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

    // 提取数字分数 — 取所有匹配中的最高分（AI 常在解释中放低分，最终结论给合理分）
    const allScores = fullResponse.match(/\d+/g);
    if (allScores && allScores.length > 0) {
      const clampedScores = allScores
        .map(s => parseInt(s, 10))
        .map(n => Math.min(100, Math.max(0, n)));
      if (clampedScores.length > 0) return Math.max(...clampedScores);
    }
    return 0;
  }
  return 0;
}

// ==================== 答案相似度计算（Jaccard） ====================
function jaccardSimilarity(a: string, b: string): number {
  const tokenize = (s: string) => {
    // 按中文字符和英文单词分词
    const tokens = s.match(/[一-鿿]|[a-zA-Z]+/g) || [];
    return new Set(tokens.map(t => t.toLowerCase()));
  };
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  return intersection / (setA.size + setB.size - intersection);
}

// ==================== AI 判分合理性断言 ====================
export function assertScoreReasonable(
  score: number,
  userAnswer: string,
  sampleAnswer: string
): { reasonable: boolean; reason?: string } {
  // 两者都为空 — 无法比较，视为合理
  if (!userAnswer.trim() && !sampleAnswer.trim()) {
    return { reasonable: true };
  }

  const similarity = jaccardSimilarity(userAnswer, sampleAnswer);

  // 答案高度相似但分数过低
  if (similarity > 0.6 && score < 40) {
    return {
      reasonable: false,
      reason: `答案相似度 ${(similarity * 100).toFixed(0)}% 但分数仅 ${score}，AI 判分可能偏低`,
    };
  }

  // 答案差异很大但分数过高
  if (similarity < 0.2 && score > 80) {
    return {
      reasonable: false,
      reason: `答案相似度仅 ${(similarity * 100).toFixed(0)}% 但分数 ${score}，AI 判分可能偏高`,
    };
  }

  // 用户答案为空或极短（排除空答案得 0 分的正常情况），分数应很低
  if (userAnswer.trim().length > 0 && userAnswer.trim().length < 5 && score > 30) {
    return {
      reasonable: false,
      reason: `答案仅 ${userAnswer.trim().length} 字但分数 ${score}，AI 判分可能偏高`,
    };
  }

  return { reasonable: true };
}

// ==================== AI 判分一致性校验（并发 3 次取中位数） ====================
export async function gradeByAIVerified(
  question: PracticeQuestion,
  userAnswer: string,
): Promise<{ score: number; confidence: 'high' | 'low'; details: number[] }> {
  if (question.type !== 'short') {
    return { score: 0, confidence: 'high', details: [] };
  }

  // 并发调用 3 次
  const results = await Promise.all(
    Array.from({ length: 3 }, () => gradeByAI(question, userAnswer))
  );

  // 取中位数
  const sorted = [...results].sort((a, b) => a - b);
  const median = sorted[1];

  // 计算偏差
  const maxDeviation = Math.max(
    Math.abs(sorted[0] - median),
    Math.abs(sorted[2] - median)
  );

  // 合理性断言
  const reasonableness = assertScoreReasonable(median, userAnswer, question.sampleAnswer || '');

  const confidence: 'high' | 'low' =
    maxDeviation > 20 || !reasonableness.reasonable ? 'low' : 'high';

  // 第一次结果不合理时自动重试一次
  if (confidence === 'low' && reasonableness.reasonable === false) {
    const retryResults = await Promise.all(
      Array.from({ length: 3 }, () => gradeByAI(question, userAnswer))
    );
    const retrySorted = [...retryResults].sort((a, b) => a - b);
    const retryMedian = retrySorted[1];
    const retryReasonable = assertScoreReasonable(retryMedian, userAnswer, question.sampleAnswer || '');

    if (retryReasonable.reasonable) {
      return {
        score: retryMedian,
        confidence: 'high',
        details: [...results, ...retryResults],
      };
    }
  }

  return { score: median, confidence, details: results };
}

// ==================== 计算模块进度 ====================
export function calculateModuleProgress(
  moduleId: string,
  results: PracticeResult[],
  allQuestions: PracticeQuestion[],
  moduleName?: string
): ModuleProgress {
  const moduleQuestions = allQuestions.filter(q => q.moduleId === moduleId);
  const moduleResults = results.filter(r => r.moduleId === moduleId);

  const totalQuestions = moduleQuestions.length;
  const completedQuestions = moduleResults.length;

  const objectiveResults = moduleResults.filter(r => r.isCorrect !== null);
  const correctCount = objectiveResults.filter(r => r.isCorrect).length;

  const shortResults = moduleResults.filter(r => {
    const q = allQuestions.find(q => q.id === r.questionId);
    return q?.type === 'short';
  });
  const shortAnswerTotalScore = shortResults.reduce((sum, r) => sum + (r.aiScore || 0), 0);

  // 计算总分：客观题每题 50%权重，简答题每题 50%权重
  const objectiveCount = moduleQuestions.filter(q => q.type !== 'short').length;
  const objectiveScore = objectiveCount > 0
    ? (correctCount / objectiveCount) * 50
    : 0;
  const shortScore = totalQuestions > 0
    ? (shortAnswerTotalScore / 100) * 50
    : 0;

  const score = Math.round(objectiveScore + shortScore);

  return {
    moduleId,
    moduleName: moduleName || moduleId,
    totalQuestions,
    completedQuestions,
    correctCount,
    shortAnswerCount: shortResults.length,
    shortAnswerGradedCount: shortResults.filter(r => r.aiScore !== undefined).length,
    shortAnswerTotalScore,
    score,
  };
}

// ==================== 计算 Tag 维度得分 ====================
export function calculateTagScores(
  results: PracticeResult[],
  allQuestions: PracticeQuestion[]
): TagScore[] {
  const tagMap = new Map<string, { total: number; correct: number }>();

  for (const result of results) {
    const question = allQuestions.find(q => q.id === result.questionId);
    if (!question) continue;

    // 加权正确贡献：客观题二值(0/1)，AI 判分题按 aiScore/100 加权
    let weightedCorrect: number;
    if (result.isCorrect === true) {
      weightedCorrect = 1;
    } else if (result.isCorrect === false) {
      weightedCorrect = 0;
    } else if (result.aiScore !== undefined) {
      weightedCorrect = result.aiScore / 100;
    } else {
      continue; // 未评分的简答题，跳过不参与计分
    }

    for (const tag of question.tags) {
      if (!tagMap.has(tag)) tagMap.set(tag, { total: 0, correct: 0 });
      const entry = tagMap.get(tag)!;
      entry.total++;
      entry.correct += weightedCorrect;
    }
  }

  return Array.from(tagMap.entries()).map(([tag, data]) => ({
    tag,
    totalAnswered: data.total,
    correctCount: data.correct,
    score: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
  }));
}

// ==================== 更新画像 ====================
export function updateProfileByTagScores(tagScores: TagScore[]) {
  if (tagScores.length === 0) return;

  const savedProfile = localStorage.getItem(userKey('studentProfile'));
  const profile = savedProfile ? JSON.parse(savedProfile) : { ...initialProfile };

  const dimensionScores: Record<string, { scores: number[]; count: number }> = {};

  for (const ts of tagScores) {
    const dimension = TAG_TO_DIMENSION[ts.tag] || ts.tag;
    if (!dimensionScores[dimension]) dimensionScores[dimension] = { scores: [], count: 0 };
    if (ts.totalAnswered > 0) {
      dimensionScores[dimension].scores.push(ts.score);
      dimensionScores[dimension].count++;
    }
  }

  const dimensionKeys = [
    'knowledgeBase', 'cognitiveStyle', 'errorProne',
    'learningPace', 'interestDirection', 'studyHabit',
  ];

  dimensionKeys.forEach(dimKey => {
    const entry = dimensionScores[dimKey];
    const dimIndex = profile.dimensions.findIndex((d: { key: string }) => d.key === dimKey);
    if (!entry || dimIndex === -1) return;

    const avgScore = entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length;

    let level: '高' | '中' | '低' = '中';
    if (avgScore >= 80) level = '高';
    else if (avgScore < 50) level = '低';

    profile.dimensions[dimIndex] = {
      ...profile.dimensions[dimIndex],
      level,
      value: `通过练习测评，综合得分 ${Math.round(avgScore)}%，${level === '高' ? '掌握扎实' : level === '中' ? '有一定基础，需继续加强' : '基础薄弱，建议重点复习'}`,
    };
  });

  const syncedProfile = syncLearningProfileFromPractice(profile, tagScores);
  syncedProfile.dimensions = profile.dimensions;
  syncedProfile.updatedAt = new Date().toISOString();
  saveProfileAndNotify(syncedProfile);
  return syncedProfile;
}

// ==================== 持久化练习状态 ====================
export function loadPracticeState(): PracticeState | null {
  const saved = localStorage.getItem(userKey('practiceState'));
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function savePracticeState(state: PracticeState): void {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(userKey('practiceState'), JSON.stringify(state));
}

export function getOrCreatePracticeState(): PracticeState {
  const existing = loadPracticeState();
  if (existing) return existing;

  const activeQuestions = getActiveQuestions();
  const bank = getBank(getActiveBank());
  const modules = bank?.modules || [];

  const state: PracticeState = {
    planId: getActiveBank(),
    results: [],
    moduleProgress: modules.map(m => calculateModuleProgress(m.id, [], activeQuestions, m.name)),
    tagScores: [],
    updatedAt: new Date().toISOString(),
  };
  savePracticeState(state);
  return state;
}

// ==================== 提交答题结果 ====================
export function submitAnswer(
  questionId: string,
  userAnswer: string,
  isCorrect: boolean | null,
  aiScore?: number
): PracticeState {
  const state = getOrCreatePracticeState();
  const previousProfile = localStorage.getItem(userKey('studentProfile'));

  const existingIdx = state.results.findIndex(r => r.questionId === questionId);
  const question = allQuestions.find(q => q.id === questionId);
  const moduleId = question?.moduleId || '';

  const result: PracticeResult = {
    questionId,
    moduleId,
    userAnswer,
    isCorrect,
    aiScore,
    submittedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    state.results[existingIdx] = result;
  } else {
    state.results.push(result);
  }

  // 重新计算所有模块的进度
  const bank = getBank(getActiveBank());
  state.moduleProgress = (bank?.modules || []).map(m =>
    calculateModuleProgress(m.id, state.results, allQuestions, m.name)
  );

  state.tagScores = calculateTagScores(state.results, allQuestions);

  const updatedProfile = updateProfileByTagScores(state.tagScores);
  if (updatedProfile?.learningProfile) {
    const question = questions.find(item => item.id === questionId);
    const moduleMeta = learningPlan.modules.find(module => module.id === (question?.moduleId ?? ''));
    if (moduleMeta) {
      const stage = {
        stageId: moduleMeta.id,
        stageName: moduleMeta.name,
        stageGoal: moduleMeta.description,
        coreKnowledgePoints: [...moduleMeta.tags],
        estimatedHours: Math.max(4, moduleMeta.questionCount),
        unlockCondition: {
          previousStageMasteryRate: 70,
        },
      };
      const evaluationReport = buildLearningEvaluationReport(
        updatedProfile.learningProfile,
        stage,
        state,
      );

      state.lastEvaluationReport = evaluationReport;
      state.cycleLogs = appendLearningCycleLog(state.cycleLogs, {
        source: '练习',
        before: {
          profile: previousProfile ? JSON.parse(previousProfile).learningProfile ?? null : null,
        },
        after: {
          profile: updatedProfile.learningProfile,
          evaluation: evaluationReport,
        },
        notes: evaluationReport.profileUpdateInstructions,
      });
    }
  }

  savePracticeState(state);
  broadcastEvent(SYSTEM_EVENTS.PRACTICE_UPDATED, { state });
  return state;
}

// ==================== 重置练习状态 ====================
export function resetPracticeState(): PracticeState {
  const allQuestions = getAllQuestions();
  const bank = getBank(getActiveBank());
  const modules = bank?.modules || [];

  const state: PracticeState = {
    planId: getActiveBank(),
    results: [],
    moduleProgress: modules.map(m => calculateModuleProgress(m.id, [], allQuestions, m.name)),
    tagScores: [],
    updatedAt: new Date().toISOString(),
  };
  savePracticeState(state);
  return state;
}
