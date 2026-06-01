const fs = require('fs');

const questions = JSON.parse(fs.readFileSync('temp_processed.json', 'utf-8'));

// Group by module for organized output
const groups = { 'module-1': [], 'module-2': [], 'module-3': [], 'module-4': [] };
questions.forEach(q => groups[q.moduleId].push(q));

function formatQuestion(q) {
  let parts = [];
  parts.push(`  { id: '${q.id}', moduleId: '${q.moduleId}', type: '${q.type}', difficulty: '${q.difficulty}', category: '${q.category}', tags: [${q.tags.map(t => `'${t}'`).join(', ')}], question: ${JSON.stringify(q.question)}`);
  if (q.options && q.options.length > 0) {
    parts.push(`, options: [${q.options.map(o => JSON.stringify(o)).join(', ')}]`);
    parts.push(`, correctAnswer: ${JSON.stringify(q.correctAnswer || '')}`);
  }
  if (q.sampleAnswer) {
    parts.push(`, sampleAnswer: ${JSON.stringify(q.sampleAnswer)}`);
  }
  if (q.explanation) {
    parts.push(`, explanation: ${JSON.stringify(q.explanation)}`);
  }
  parts.push(' }');
  return parts.join('');
}

// Sub-group by tag within each module for readability
const tagOrder = {
  'module-1': ['syntax', 'data-types', 'operators', 'control-flow'],
  'module-2': ['functions', 'scope', 'errorProne'],
  'module-3': ['OOP', 'classes', 'inheritance', 'polymorphism', 'interfaces', 'errorProne'],
  'module-4': ['exceptions', 'io', 'collections', 'generics', 'multithreading', 'lambda', 'annotations', 'errorProne', 'studyHabit'],
};

const moduleNames = {
  'module-1': 'Java 基础语法',
  'module-2': '方法与作用域',
  'module-3': '面向对象编程',
  'module-4': '进阶与实战',
};

const tagLabels = {
  'module-1': { syntax: '语法基础', 'data-types': '数据类型', operators: '运算符', 'control-flow': '流程控制' },
  'module-2': { functions: '方法', scope: '作用域', errorProne: '易错点' },
  'module-3': { OOP: '面向对象基础', classes: '类进阶', inheritance: '继承', polymorphism: '多态', interfaces: '接口与抽象类', errorProne: '易错点' },
  'module-4': { exceptions: '异常处理', io: 'I/O流', collections: '集合框架', generics: '泛型', multithreading: '多线程', lambda: 'Lambda与Stream', annotations: '注解', errorProne: '易错点', studyHabit: '学习习惯' },
};

let output = `/**
 * Java 题库 — 统一题目仓库 (${questions.length} 题)
 *
 * 架构约定：
 * - 所有题目统一归一化标签，标签即知识点的唯一标识
 * - 外部模块按标签搜索 → 按用户完成状态过滤 → 输出题目
 * - category: 'core' 为基础必学内容，'extension' 为扩展挑战
 * - Tag → questionId[] 倒排索引，O(1) 加速 AI 选题
 * - 错题集按学习阶段分组，支持关键词搜索
 */

import type { PracticeQuestion, PracticeState, TagScore } from '../types';
import type { CurrentPathStage } from '../services/learningOrchestrator';

// ==================== 标签规范 ====================
// syntax         — 语法基础（main方法、标识符、关键字、注释、包、导入）
// data-types     — 数据类型（基本类型、引用类型、数组、包装类、字符串池）
// operators      — 运算符（算术、比较、逻辑、赋值、三元、instanceof、位运算）
// control-flow   — 流程控制（if/else、switch、for/while/do-while、break/continue/label）
// functions      — 方法（定义、重载、可变参数、递归、静态导入、协变返回）
// scope          — 作用域（局部变量、成员变量、静态变量、默认值）
// OOP            — 面向对象基础（类/对象、构造方法、this、封装、GC）
// classes        — 类进阶（访问修饰符、static、final、内部类）
// inheritance    — 继承（extends、super、Object、final类/方法、抽象类）
// polymorphism   — 多态（重写、向上/向下转型、动态绑定、instanceof）
// interfaces     — 接口与抽象类（interface、implements、default方法、函数式接口）
// exceptions     — 异常处理（try/catch/finally、throw/throws、自定义异常、Error）
// collections    — 集合框架（List/Set/Map/Queue、ArrayList/HashMap、Comparable、Iterator）
// generics       — 泛型（类型参数、通配符、类型擦除、菱形运算符）
// io             — I/O流（字节流/字符流、BufferedReader、NIO、Path、序列化）
// multithreading — 多线程（Thread/Runnable、sleep/join、volatile、synchronized、start）
// lambda         — Lambda与Stream（Lambda表达式、方法引用、函数式接口、Stream操作）
// annotations    — 注解（@Override、@Deprecated、@Retention、@Target）
// errorProne     — 易错点（空指针、数组越界、类型转换、装箱拆箱）
// studyHabit     — 学习习惯（命名规范、编码风格、调试技巧）

// ==================== 学习计划 ====================

export interface ModuleMeta {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

export interface LearningPlanMeta {
  id: string;
  name: string;
  description: string;
  modules: ModuleMeta[];
}

export const learningPlan: LearningPlanMeta = {
  id: 'java-basics',
  name: 'Java 编程基础',
  description: '系统学习 Java 编程，从语法基础到多线程与函数式编程',
  modules: [
    {
      id: 'module-1',
      name: 'Java 基础语法',
      description: '数据类型、运算符、流程控制',
      tags: ['syntax', 'data-types', 'operators', 'control-flow'],
    },
    {
      id: 'module-2',
      name: '方法与作用域',
      description: '方法定义、重载、参数传递、变量作用域',
      tags: ['functions', 'scope', 'errorProne'],
    },
    {
      id: 'module-3',
      name: '面向对象编程',
      description: '类与对象、继承与多态、接口与抽象类',
      tags: ['OOP', 'classes', 'inheritance', 'polymorphism', 'interfaces', 'errorProne'],
    },
    {
      id: 'module-4',
      name: '进阶与实战',
      description: '异常处理、集合框架、I/O流、多线程、Lambda与注解',
      tags: ['exceptions', 'collections', 'generics', 'io', 'multithreading', 'lambda', 'annotations', 'errorProne', 'studyHabit'],
    },
  ],
};

// ==================== 全部题目 ====================

export const questions: PracticeQuestion[] = [
`;

// Output each module
for (const modId of ['module-1', 'module-2', 'module-3', 'module-4']) {
  const modQs = groups[modId];
  output += `\n  // ═══════════════════ ${moduleNames[modId]} ═══════════════════\n\n`;

  // Group by tag
  for (const tag of tagOrder[modId]) {
    const tagQs = modQs.filter(q => q.tags.includes(tag) && (q.tags[0] === tag || tag === 'errorProne' || tag === 'studyHabit'));
    // Actually, let's just group by primary tag (first tag that matches the order)
    const primaryQs = modQs.filter(q => {
      const firstKnownTag = q.tags.find(t => Object.keys(tagLabels[modId]).includes(t));
      return firstKnownTag === tag;
    });
    if (primaryQs.length > 0) {
      output += `  // ----- ${tagLabels[modId][tag] || tag} (${tag}) -----\n`;
      primaryQs.forEach(q => {
        output += formatQuestion(q) + '\n';
      });
      output += '\n';
    }
  }
}

output += `];

// ==================== Tag → Question ID 倒排索引 ====================

function buildTagIndex(): Record<string, string[]> {
  const index: Record<string, string[]> = {};
  for (const q of questions) {
    for (const tag of q.tags) {
      if (!index[tag]) index[tag] = [];
      if (!index[tag].includes(q.id)) index[tag].push(q.id);
    }
  }
  return index;
}

export const tagIndex: Record<string, string[]> = buildTagIndex();

// ==================== 分类统计 ====================

export function getCoreQuestions(): PracticeQuestion[] {
  return questions.filter(q => q.category === 'core');
}

export function getExtensionQuestions(): PracticeQuestion[] {
  return questions.filter(q => q.category === 'extension');
}

export function getCategoryCounts(): { core: number; extension: number } {
  return {
    core: questions.filter(q => q.category === 'core').length,
    extension: questions.filter(q => q.category === 'extension').length,
  };
}

// ==================== 标签搜索框架 ====================

export interface QuestionSearchOptions {
  query?: string;
  tags?: string[];
  difficulty?: PracticeQuestion['difficulty'];
  category?: PracticeQuestion['category'];
  moduleId?: string;
  excludeIds?: string[];
  type?: PracticeQuestion['type'];
}

export function searchQuestions(options: QuestionSearchOptions = {}): PracticeQuestion[] {
  let result = [...questions];

  if (options.query) {
    const q = options.query.toLowerCase();
    result = result.filter(item =>
      item.question.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q)) ||
      (item.explanation || '').toLowerCase().includes(q)
    );
  }

  if (options.tags && options.tags.length > 0) {
    result = result.filter(item => item.tags.some(t => options.tags!.includes(t)));
  }

  if (options.difficulty) {
    result = result.filter(item => item.difficulty === options.difficulty);
  }

  if (options.category) {
    result = result.filter(item => item.category === options.category);
  }

  if (options.moduleId) {
    result = result.filter(item => item.moduleId === options.moduleId);
  }

  if (options.type) {
    result = result.filter(item => item.type === options.type);
  }

  if (options.excludeIds && options.excludeIds.length > 0) {
    const excludeSet = new Set(options.excludeIds);
    result = result.filter(item => !excludeSet.has(item.id));
  }

  return result;
}

// ==================== 按学习路径阶段筛选 ====================

export function filterByStage(stage: CurrentPathStage | null): PracticeQuestion[] {
  if (!stage || !stage.coreKnowledgePoints.length) return questions;

  const matched = questions.filter(q =>
    q.tags.some(t => stage.coreKnowledgePoints.includes(t))
  );

  if (matched.length < 5) {
    const expandedTags = new Set(stage.coreKnowledgePoints);
    for (const tag of stage.coreKnowledgePoints) {
      const related = tagIndex[tag] || [];
      for (const id of related) {
        const q = questions.find(item => item.id === id);
        if (q) q.tags.forEach(t => expandedTags.add(t));
      }
    }
    return questions.filter(q => q.tags.some(t => expandedTags.has(t)));
  }

  return matched;
}

export function getStageQuestionSplit(stage: CurrentPathStage | null): {
  core: PracticeQuestion[];
  extension: PracticeQuestion[];
} {
  const stageQuestions = filterByStage(stage);
  return {
    core: stageQuestions.filter(q => q.category === 'core'),
    extension: stageQuestions.filter(q => q.category === 'extension'),
  };
}

// ==================== 按学习进度排序 ====================

export function sortByProgress(
  qs: PracticeQuestion[],
  tagScores: TagScore[],
): PracticeQuestion[] {
  const weakTags = new Set(tagScores.filter(ts => ts.score < 60).map(ts => ts.tag));
  const d = { easy: 0, medium: 1, hard: 2 };

  return [...qs].sort((a, b) => {
    const aWeak = a.tags.some(t => weakTags.has(t)) ? 1 : 0;
    const bWeak = b.tags.some(t => weakTags.has(t)) ? 1 : 0;
    if (aWeak !== bWeak) return bWeak - aWeak;
    return (d[a.difficulty] || 0) - (d[b.difficulty] || 0);
  });
}

// ==================== 错题集 ====================

export function getWrongAnswerQuestions(practiceState: PracticeState | null): PracticeQuestion[] {
  if (!practiceState || !practiceState.results.length) return [];

  const wrongIds = practiceState.results
    .filter(r => r.isSubmitted && (r.isCorrect === false || (r.aiScore ?? 100) < 60))
    .map(r => r.questionId);

  return questions.filter(q => wrongIds.includes(q.id));
}

export function categorizeWrongByModule(
  wrongQuestions: PracticeQuestion[],
): { moduleId: string; moduleName: string; questions: PracticeQuestion[] }[] {
  const groups = new Map<string, PracticeQuestion[]>();

  for (const q of wrongQuestions) {
    const list = groups.get(q.moduleId) || [];
    list.push(q);
    groups.set(q.moduleId, list);
  }

  return learningPlan.modules.map(m => ({
    moduleId: m.id,
    moduleName: m.name,
    questions: groups.get(m.id) || [],
  })).filter(g => g.questions.length > 0);
}

export function categorizeWrongByTag(
  wrongQuestions: PracticeQuestion[],
): { tag: string; label: string; questions: PracticeQuestion[] }[] {
  const groups = new Map<string, PracticeQuestion[]>();

  for (const q of wrongQuestions) {
    for (const tag of q.tags) {
      const list = groups.get(tag) || [];
      if (!list.includes(q)) list.push(q);
      groups.set(tag, list);
    }
  }

  return Array.from(groups.entries())
    .map(([tag, qs]) => ({ tag, label: tagToChinese(tag), questions: qs }))
    .sort((a, b) => b.questions.length - a.questions.length);
}

// ==================== 进度驱动选题 ====================

export function selectQuestionsByProgress(
  tagScores: TagScore[],
  stageTags: string[],
  count: number,
): string[] {
  const weakTags = tagScores
    .filter(ts => ts.score < 60 && stageTags.includes(ts.tag))
    .sort((a, b) => a.score - b.score);

  const normalTags = stageTags.filter(
    t => !weakTags.some(w => w.tag === t),
  );

  const selected = new Set<string>();
  const result: string[] = [];

  for (const wt of weakTags) {
    const ids = tagIndex[wt.tag] || [];
    const sorted = ids
      .filter(id => !selected.has(id))
      .map(id => questions.find(q => q.id === id)!)
      .filter(Boolean)
      .sort((a, b) => ({ easy: 0, medium: 1, hard: 2 })[a.difficulty] - ({ easy: 0, medium: 1, hard: 2 })[b.difficulty]);
    for (const q of sorted) {
      if (result.length >= count) break;
      selected.add(q.id);
      result.push(q.id);
    }
  }

  for (const tag of normalTags) {
    if (result.length >= count) break;
    const ids = tagIndex[tag] || [];
    for (const id of ids) {
      if (result.length >= count) break;
      if (!selected.has(id)) {
        selected.add(id);
        result.push(id);
      }
    }
  }

  if (result.length < count) {
    for (const q of questions) {
      if (result.length >= count) break;
      if (!selected.has(q.id)) {
        selected.add(q.id);
        result.push(q.id);
      }
    }
  }

  return result.slice(0, count);
}

export function getModuleQuestionIds(moduleId: string): string[] {
  return questions.filter(q => q.moduleId === moduleId).map(q => q.id);
}

export function filterByDifficulty(
  ids: string[],
  difficulty: PracticeQuestion['difficulty'],
): string[] {
  return ids.filter(id => questions.find(q => q.id === id)?.difficulty === difficulty);
}

// ==================== 工具函数 ====================

export function tagToChinese(tag: string): string {
  const map: Record<string, string> = {
    syntax: '语法基础',
    'data-types': '数据类型',
    operators: '运算符',
    'control-flow': '流程控制',
    functions: '方法',
    scope: '作用域',
    OOP: '面向对象',
    classes: '类与修饰符',
    inheritance: '继承',
    polymorphism: '多态',
    interfaces: '接口与抽象类',
    exceptions: '异常处理',
    collections: '集合框架',
    generics: '泛型',
    io: 'I/O流',
    multithreading: '多线程',
    lambda: 'Lambda与Stream',
    annotations: '注解',
    errorProne: '易错点',
    studyHabit: '学习习惯',
  };
  return map[tag] || tag;
}

export function getAllTags(): string[] {
  return Object.keys(tagIndex);
}
`;

fs.writeFileSync('src/data/javaQuestionBank.ts', output);
console.log('Generated javaQuestionBank.ts successfully');
console.log('Total questions:', questions.length);
