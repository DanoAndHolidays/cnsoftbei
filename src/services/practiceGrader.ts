import { streamChatCompletion } from './api';
import type {
  PracticeQuestion,
  PracticeResult,
  ModuleProgress,
  TagScore,
  PracticeState,
} from '../types';
import pythonBank from '../data/pythonBasics.json';
import jsBank from '../data/javascriptWeb.json';
import dsBank from '../data/dataStructures.json';
import sqlBank from '../data/sqlDatabase.json';
import javaBank from '../data/javaBasics.json';
import goBank from '../data/goBasics.json';
import csharpBank from '../data/csharpBasics.json';
import rustBank from '../data/rustBasics.json';
import devopsBank from '../data/devopsBasics.json';
import networksBank from '../data/computerNetworks.json';
import linuxBank from '../data/linuxFundamentals.json';
import mlBank from '../data/machineLearning.json';
import { initialProfile } from '../data/mockData';

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
};

// ==================== 存储键名 ====================
const PRACTICE_STATE_KEY = 'practiceState';

// ==================== 客观题判分 ====================
export function checkAnswer(question: PracticeQuestion, userAnswer: string): boolean {
  if (question.type === 'choice') {
    return userAnswer === question.correctAnswer;
  }
  if (question.type === 'truefalse') {
    const expected = question.trueFalseAnswer ? 'true' : 'false';
    return userAnswer === expected;
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

    const scoreMatch = fullResponse.match(/\d+/);
    if (scoreMatch) {
      return Math.min(100, Math.max(0, parseInt(scoreMatch[0], 10)));
    }
    return 0;
  }
  return 0;
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

  const objectiveScore = totalQuestions > 0
    ? (correctCount / moduleQuestions.filter(q => q.type !== 'short').length) * 50
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
    if (result.isCorrect === null) continue;
    const question = allQuestions.find(q => q.id === result.questionId);
    if (!question) continue;

    for (const tag of question.tags) {
      if (!tagMap.has(tag)) tagMap.set(tag, { total: 0, correct: 0 });
      const entry = tagMap.get(tag)!;
      entry.total++;
      if (result.isCorrect) entry.correct++;
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

  const savedProfile = localStorage.getItem('studentProfile');
  let profile = savedProfile ? JSON.parse(savedProfile) : { ...initialProfile };

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

  profile.updatedAt = new Date().toISOString();
  localStorage.setItem('studentProfile', JSON.stringify(profile));
  return profile;
}

// ==================== 持久化练习状态 ====================
export function loadPracticeState(): PracticeState | null {
  const saved = localStorage.getItem(PRACTICE_STATE_KEY);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

export function savePracticeState(state: PracticeState): void {
  state.updatedAt = new Date().toISOString();
  localStorage.setItem(PRACTICE_STATE_KEY, JSON.stringify(state));
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
  const allQuestions = getAllQuestions();

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

  savePracticeState(state);
  window.dispatchEvent(new CustomEvent('practiceStateUpdated'));
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
