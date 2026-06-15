// 学习画像维度
export interface StudentProfile {
  id: string;
  name: string;
  major: string;
  grade: string;
  dimensions: ProfileDimension[];
  updatedAt: string;
}

export interface ProfileDimension {
  key: string;
  label: string;
  value: string;
  level: '高' | '中' | '低';
}

// 智能体角色
export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  color: string;
}

// 学习资源类型
export type ResourceType =
  | 'document'      // 专业课程讲解文档
  | 'mindmap'       // 知识点思维导图
  | 'quiz'          // 练习题目
  | 'reading'       // 拓展阅读材料
  | 'video'         // 多模态教学视频/动画
  | 'codeCase';     // 代码类实操案例

export interface LearningResource {
  id: string;
  type: ResourceType;
  title: string;
  description: string;
  generatedBy: string;
  createdAt: string;
  content?: string;
  thumbnail?: string;
}

// 学习路径节点
export interface LearningNode {
  id: string;
  title: string;
  description: string;
  resources?: LearningResource[];
  status: 'locked' | 'in-progress' | 'completed';
  progress: number;
  estimatedHours?: number;
}

// 学习路径
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  nodes: LearningNode[];
  estimatedTime: string;
  currentNodeId: string;
}

// ============ 结构化学习路径（路径-题库打通专用） ============

/** 结构化路径节点：每个节点对应题库中的一个具体模块 */
export interface StructuredLearningNode extends LearningNode {
  questionBankId: string;     // 题库 ID，如 'python-basics'
  moduleId: string;           // 模块 ID，如 'module-1'
  moduleName?: string;        // 题库模块名（冗余存储，便于 UI 展示）
  isEntry?: boolean;          // 是否为路径入口节点
  valid?: boolean;            // 引用校验结果；false 时 UI 降级显示
}

/** 结构化路径数据（新路径的唯一数据形态） */
export interface StructuredLearningPathData {
  id: string;                 // 唯一 ID（AI 生成时用 'ai-' 前缀）
  title: string;
  description: string;
  source: 'ai-generated' | 'predefined' | 'adopted';
  predefinedId?: string;      // 采用预定义时存原 ID
  nodes: StructuredLearningNode[];
  createdAt: string;          // ISO 时间
}

/** AI 响应解析结果 */
export type PathParseResult =
  | { ok: true; path: StructuredLearningPathData }
  | { ok: false; errors: string[] };

// 聊天消息
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// 问答记录
export interface QAItem {
  id: string;
  question: string;
  answer: string;
  type: 'text' | 'image' | 'video' | 'code';
  helpful: boolean;
  createdAt: string;
  parentId?: string;       // 追问所属的父问题 ID
  followUpIds?: string[];  // 该回答下的追问 ID 列表
  cancelled?: boolean;     // 是否已被用户取消生成
}

// 学习效果评估
export interface LearningAssessment {
  dimension: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  feedback: string;
}

// ============ 学习路径 ============

export interface PathModule {
  questionBankId: string;
  moduleId: string;
  name: string;
  isEntry?: boolean;
  estimatedHours?: number;
}

export interface StructuredLearningPath {
  id: string;
  name: string;
  description: string;
  tags: string[];
  profileMatchTags: string[];
  modules: PathModule[];
}

// ============ 练习中心 ============

export type QuestionType = 'choice' | 'truefalse' | 'short';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PracticeQuestion {
  id: string;
  moduleId: string;
  type: QuestionType;
  difficulty: Difficulty;
  tags: string[];
  question: string;
  options?: string[];           // 选择题选项
  correctAnswer?: string;        // 选择题正确答案索引/内容
  trueFalseAnswer?: boolean;     // 判断题答案
  sampleAnswer?: string;          // 简答题参考答案
  explanation?: string;           // 解析
}

export interface LearningModule {
  id: string;
  name: string;
  description: string;
  questionCount: number;
  tags: string[];
}

export interface LearningPlan {
  id: string;
  name: string;
  description: string;
  modules: LearningModule[];
}

export interface PracticeResult {
  questionId: string;
  moduleId: string;
  userAnswer: string;
  isCorrect: boolean | null;
  aiScore?: number;
  submittedAt: string;
}

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  totalQuestions: number;
  completedQuestions: number;
  correctCount: number;
  shortAnswerCount: number;
  shortAnswerGradedCount: number;
  shortAnswerTotalScore: number;
  score: number;
}

export interface TagScore {
  tag: string;
  totalAnswered: number;
  correctCount: number;
  score: number;
}

export interface PracticeState {
  planId: string;
  results: PracticeResult[];
  moduleProgress: ModuleProgress[];
  tagScores: TagScore[];
  updatedAt: string;
}
