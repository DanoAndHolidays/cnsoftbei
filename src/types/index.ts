// 学习画像维度
export interface StudentProfile {
  id: string;
  name: string;
  major: string;
  grade: string;
  dimensions: ProfileDimension[];
  updatedAt: string;
  learningProfile?: LearningProfileSnapshot;
}

export interface ProfileDimension {
  key: string;
  label: string;
  value: string;
  level: '高' | '中' | '低';
}

export type LearningSource = '对话' | '练习' | '评估';
export type MasteryLevel = '未接触' | '薄弱' | '一般' | '扎实';
export type CognitiveStyleLabel = '视觉型' | '文字型' | '实践型' | '逻辑型';
export type LearningPaceLabel = '快速接受' | '中等接受' | '慢接受';
export type StudyHabitLabel = '边做边学' | '理论优先' | '刷题驱动';

export interface LearningKnowledgeItem {
  tag: string;
  mastery: MasteryLevel;
  score: number;
  source: LearningSource;
}

export interface LearningErrorProneItem {
  tag: string;
  count: number;
  source: LearningSource;
}

export interface LearningProfileSnapshot {
  user: {
    id: string;
    name: string;
    major: string;
    grade: string;
  };
  knowledgeBase: LearningKnowledgeItem[];
  cognitiveStyle: {
    label: CognitiveStyleLabel;
    source: LearningSource;
  };
  errorProne: LearningErrorProneItem[];
  learningPace: {
    label: LearningPaceLabel;
    estimatedStudyHours: number;
    source: LearningSource;
  };
  interestDirection: {
    labels: string[];
    source: LearningSource;
  };
  studyHabit: {
    label: StudyHabitLabel;
    source: LearningSource;
  };
  updatedAt: string;
  source: LearningSource;
}

export type DifficultyBand = '入门' | '基础' | '进阶' | '挑战';

export interface LearningPathStage {
  stageId: string;
  stageName: string;
  stageGoal: string;
  coreKnowledgePoints: string[];
  estimatedHours: number;
  unlockCondition: {
    previousStageMasteryRate: number;
  };
}

export interface LearningPathPlan {
  pathId: string;
  goal: string;
  stages: LearningPathStage[];
  totalEstimatedHours: number;
  updatedAt: string;
  source: LearningSource;
}

export interface PracticeSelectionItem {
  questionId: string;
  knowledgePoint: string;
  difficultyBand: DifficultyBand;
  repeated: boolean;
  reason: string;
}

export interface PracticeSelectionReport {
  stageId: string;
  stageName: string;
  targetQuestionCount: number;
  selectedQuestionIds: string[];
  missingKnowledgePoints: string[];
  fallbackKnowledgePoints: string[];
  repeatedQuestionIds: string[];
  difficultyDistribution: Record<DifficultyBand, number>;
  shortageReport?: string;
  generatedAt: string;
  source: LearningSource;
}

export interface KnowledgeMasteryReportItem {
  tag: string;
  masteryRate: number;
  correctCount: number;
  questionCount: number;
  status: '薄弱' | '正常' | '扎实';
}

export interface LearningEvaluationReport {
  stageId: string;
  stageName: string;
  masteryItems: KnowledgeMasteryReportItem[];
  weakKnowledgePoints: string[];
  profileUpdateInstructions: string[];
  pathOptimizationInstructions: string[];
  practiceOptimizationInstructions: string[];
  generatedAt: string;
  source: LearningSource;
}

export interface LearningCycleLog {
  cycleId: string;
  source: LearningSource;
  before: {
    profile?: LearningProfileSnapshot | null;
    path?: LearningPathPlan | null;
  };
  after: {
    profile?: LearningProfileSnapshot | null;
    path?: LearningPathPlan | null;
    practice?: PracticeSelectionReport | null;
    evaluation?: LearningEvaluationReport | null;
  };
  notes: string[];
  createdAt: string;
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

// ============ 练习中心 ============

export type QuestionType = 'choice' | 'truefalse' | 'short';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PracticeQuestion {
  id: string;
  moduleId: string;
  type: QuestionType;
  difficulty: Difficulty;
  category: 'core' | 'extension';  // 核心基础 vs 扩展挑战
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
  lastEvaluationReport?: LearningEvaluationReport | null;
  cycleLogs?: LearningCycleLog[];
}
