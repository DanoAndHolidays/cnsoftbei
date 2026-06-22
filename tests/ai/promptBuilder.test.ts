import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadProfile,
  buildProfileContext,
  getModePrompt,
  buildTutorSystemPrompt,
  buildFollowUpSystemPrompt,
  buildFollowUpUserPrompt,
  buildRegenerateSystemPrompt,
  buildRegenerateUserPrompt,
  buildRelevanceCheckPrompt,
  buildProfileAnalysisPrompt,
  buildProfileReplyPrompt,
  buildQuizAnalysisPrompt,
  buildGradeByAIMessages,
} from '../../src/services/promptBuilder'
import type { StudentProfile, QAItem } from '../../src/types'

// ==================== 测试数据 ====================

function makeProfile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    id: 'student-1',
    name: '张三',
    major: '计算机科学',
    grade: '大三',
    updatedAt: '',
    dimensions: [
      { key: 'knowledgeBase', label: '知识基础', value: 'Python 基础扎实', level: '中' },
      { key: 'cognitiveStyle', label: '认知风格', value: '视觉型学习者', level: '高' },
      { key: 'errorProne', label: '易错点', value: '递归算法', level: '低' },
      { key: 'learningPace', label: '学习节奏', value: '接受较快', level: '高' },
      { key: 'interestDirection', label: '兴趣方向', value: '人工智能', level: '高' },
      { key: 'studyHabit', label: '学习习惯', value: '边做边学', level: '中' },
    ],
    ...overrides,
  }
}

function makeQAItem(overrides: Partial<QAItem> = {}): QAItem {
  return {
    id: 'qa-1',
    question: 'Python 的 for 循环怎么用？',
    answer: 'for 循环用于遍历可迭代对象...',
    type: 'text',
    helpful: true,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

// ==================== loadProfile ====================

describe('loadProfile', () => {
  beforeEach(() => localStorage.clear())

  it('有数据时返回画像', () => {
    const profile = makeProfile()
    localStorage.setItem('studentProfile', JSON.stringify(profile))
    const loaded = loadProfile()
    expect(loaded?.id).toBe('student-1')
  })

  it('无数据时返回 null', () => {
    expect(loadProfile()).toBeNull()
  })

  it('JSON 损坏时返回 null', () => {
    localStorage.setItem('studentProfile', 'bad-json')
    expect(loadProfile()).toBeNull()
  })
})

// ==================== buildProfileContext ====================

describe('buildProfileContext', () => {
  it('正常画像 — 包含所有维度', () => {
    const ctx = buildProfileContext(makeProfile())
    expect(ctx).toContain('张三')
    expect(ctx).toContain('计算机科学')
    expect(ctx).toContain('大三')
    expect(ctx).toContain('Python 基础扎实')
    expect(ctx).toContain('视觉型学习者')
    expect(ctx).toContain('递归算法')
    expect(ctx).toContain('接受较快')
    expect(ctx).toContain('人工智能')
    expect(ctx).toContain('边做边学')
  })

  it('包含画像标记', () => {
    const ctx = buildProfileContext(makeProfile())
    expect(ctx).toContain('【当前学生画像】')
  })

  it('包含调整指令', () => {
    const ctx = buildProfileContext(makeProfile())
    expect(ctx).toContain('请根据以上画像调整回答风格和深度')
  })

  it('null 画像 — 返回空字符串', () => {
    expect(buildProfileContext(null)).toBe('')
  })

  it('空 dimensions — 返回空字符串', () => {
    expect(buildProfileContext(makeProfile({ dimensions: [] }))).toBe('')
  })

  it('维度值缺失 — 显示 "未知"', () => {
    const profile = makeProfile({
      dimensions: [
        { key: 'knowledgeBase', label: '知识基础', value: '', level: '中' },
        { key: 'cognitiveStyle', label: '认知风格', value: '', level: '中' },
        { key: 'errorProne', label: '易错点', value: '', level: '低' },
        { key: 'learningPace', label: '学习节奏', value: '', level: '中' },
        { key: 'interestDirection', label: '兴趣方向', value: '', level: '中' },
        { key: 'studyHabit', label: '学习习惯', value: '', level: '中' },
      ],
    })
    const ctx = buildProfileContext(profile)
    // 空字符串 || '未知' = '未知'
    expect(ctx).toContain('知识基础：')
    expect(ctx).toContain('认知风格：')
  })

  it('6 个维度都有对应标签', () => {
    const ctx = buildProfileContext(makeProfile())
    expect(ctx).toContain('知识基础：')
    expect(ctx).toContain('认知风格：')
    expect(ctx).toContain('易错点：')
    expect(ctx).toContain('学习节奏：')
    expect(ctx).toContain('兴趣方向：')
    expect(ctx).toContain('学习习惯：')
  })
})

// ==================== getModePrompt ====================

describe('getModePrompt', () => {
  it('text 模式 — 包含 "AI辅导老师" 和 "详细解答"', () => {
    const prompt = getModePrompt('text')
    expect(prompt).toContain('AI辅导老师')
    expect(prompt).toContain('详细解答')
  })

  it('image 模式 — 包含 "图解" 和 "ASCII"', () => {
    const prompt = getModePrompt('image')
    expect(prompt).toContain('图解')
    expect(prompt).toContain('ASCII')
  })

  it('video 模式 — 包含 "视频讲解脚本"', () => {
    const prompt = getModePrompt('video')
    expect(prompt).toContain('视频讲解脚本')
  })

  it('code 模式 — 包含 "编程老师" 和 "代码示例"', () => {
    const prompt = getModePrompt('code')
    expect(prompt).toContain('编程老师')
    expect(prompt).toContain('代码示例')
  })

  it('未知模式 — 回退到 text', () => {
    const prompt = getModePrompt('unknown')
    expect(prompt).toBe(getModePrompt('text'))
  })

  it('空字符串 — 回退到 text', () => {
    const prompt = getModePrompt('')
    expect(prompt).toBe(getModePrompt('text'))
  })
})

// ==================== buildTutorSystemPrompt ====================

describe('buildTutorSystemPrompt', () => {
  it('包含模式 prompt', () => {
    const prompt = buildTutorSystemPrompt('text', null)
    expect(prompt).toContain('AI辅导老师')
  })

  it('包含画像信息', () => {
    const prompt = buildTutorSystemPrompt('text', makeProfile())
    expect(prompt).toContain('张三')
    expect(prompt).toContain('【当前学生画像】')
  })

  it('null 画像 — 不包含画像块', () => {
    const prompt = buildTutorSystemPrompt('text', null)
    expect(prompt).not.toContain('【当前学生画像】')
  })

  it('不同模式使用不同 base prompt', () => {
    const textPrompt = buildTutorSystemPrompt('text', null)
    const codePrompt = buildTutorSystemPrompt('code', null)
    expect(textPrompt).toContain('详细解答')
    expect(codePrompt).toContain('代码示例')
  })
})

// ==================== buildFollowUpSystemPrompt ====================

describe('buildFollowUpSystemPrompt', () => {
  it('包含追问指令', () => {
    const prompt = buildFollowUpSystemPrompt(null)
    expect(prompt).toContain('追问')
  })

  it('包含相关性判断指令', () => {
    const prompt = buildFollowUpSystemPrompt(null)
    expect(prompt).toContain('相关')
    expect(prompt).toContain('无关')
  })

  it('包含画像信息', () => {
    const prompt = buildFollowUpSystemPrompt(makeProfile())
    expect(prompt).toContain('张三')
  })

  it('包含不要显式输出判断的指令', () => {
    const prompt = buildFollowUpSystemPrompt(null)
    expect(prompt).toContain('不要显式输出你的判断过程')
  })
})

// ==================== buildFollowUpUserPrompt ====================

describe('buildFollowUpUserPrompt', () => {
  it('包含父问题', () => {
    const qa = makeQAItem()
    const prompt = buildFollowUpUserPrompt(qa, '能详细说说吗？')
    expect(prompt).toContain('Python 的 for 循环怎么用？')
  })

  it('包含父回答', () => {
    const qa = makeQAItem()
    const prompt = buildFollowUpUserPrompt(qa, '能详细说说吗？')
    expect(prompt).toContain('for 循环用于遍历可迭代对象')
  })

  it('包含新问题', () => {
    const qa = makeQAItem()
    const prompt = buildFollowUpUserPrompt(qa, '能详细说说吗？')
    expect(prompt).toContain('能详细说说吗？')
  })

  it('长回答被截断到 2000 字符', () => {
    const longAnswer = 'x'.repeat(5000)
    const qa = makeQAItem({ answer: longAnswer })
    const prompt = buildFollowUpUserPrompt(qa, '追问')
    // 截断后的回答长度
    expect(prompt).toContain('x'.repeat(2000))
    expect(prompt).not.toContain('x'.repeat(2001))
  })
})

// ==================== buildRegenerateSystemPrompt ====================

describe('buildRegenerateSystemPrompt', () => {
  it('包含点踩标识', () => {
    const prompt = buildRegenerateSystemPrompt(null)
    expect(prompt).toContain('点了"踩"')
  })

  it('包含原因分析指令', () => {
    const prompt = buildRegenerateSystemPrompt(null)
    expect(prompt).toContain('原因分析')
  })

  it('包含重新解答指令', () => {
    const prompt = buildRegenerateSystemPrompt(null)
    expect(prompt).toContain('重新解答')
  })

  it('包含画像信息', () => {
    const prompt = buildRegenerateSystemPrompt(makeProfile())
    expect(prompt).toContain('张三')
  })

  it('包含格式要求', () => {
    const prompt = buildRegenerateSystemPrompt(null)
    expect(prompt).toContain('## 📊 原因分析')
    expect(prompt).toContain('## ✅ 重新解答')
  })
})

// ==================== buildRegenerateUserPrompt ====================

describe('buildRegenerateUserPrompt', () => {
  it('包含原始问题', () => {
    const prompt = buildRegenerateUserPrompt('什么是装饰器？', '旧回答')
    expect(prompt).toContain('什么是装饰器？')
  })

  it('包含旧回答', () => {
    const prompt = buildRegenerateUserPrompt('问题', '这是旧回答内容')
    expect(prompt).toContain('这是旧回答内容')
  })

  it('长旧回答被截断到 1500 字符', () => {
    const longAnswer = 'y'.repeat(3000)
    const prompt = buildRegenerateUserPrompt('问题', longAnswer)
    expect(prompt).toContain('y'.repeat(1500))
    expect(prompt).not.toContain('y'.repeat(1501))
  })
})

// ==================== buildRelevanceCheckPrompt ====================

describe('buildRelevanceCheckPrompt', () => {
  it('包含角色定义', () => {
    const prompt = buildRelevanceCheckPrompt()
    expect(prompt).toContain('相关性判断助手')
  })

  it('包含输出约束', () => {
    const prompt = buildRelevanceCheckPrompt()
    expect(prompt).toContain('仅回复"相关"或"无关"')
  })
})

// ==================== buildProfileAnalysisPrompt ====================

describe('buildProfileAnalysisPrompt', () => {
  it('system prompt 包含画像构建智能体', () => {
    const { system } = buildProfileAnalysisPrompt(makeProfile(), '你好')
    expect(system).toContain('画像构建智能体')
  })

  it('system prompt 包含 6 维度分析指令', () => {
    const { system } = buildProfileAnalysisPrompt(makeProfile(), '你好')
    expect(system).toContain('知识基础')
    expect(system).toContain('认知风格')
    expect(system).toContain('易错点偏好')
    expect(system).toContain('学习节奏')
    expect(system).toContain('兴趣方向')
    expect(system).toContain('学习习惯')
  })

  it('system prompt 包含用户画像', () => {
    const { system } = buildProfileAnalysisPrompt(makeProfile(), '你好')
    expect(system).toContain('张三')
    expect(system).toContain('计算机科学')
  })

  it('system prompt 包含 JSON 格式要求', () => {
    const { system } = buildProfileAnalysisPrompt(makeProfile(), '你好')
    expect(system).toContain('JSON')
    expect(system).toContain('knowledgeBase')
  })

  it('user prompt 是用户消息', () => {
    const { user } = buildProfileAnalysisPrompt(makeProfile(), '我在学 Python')
    expect(user).toBe('我在学 Python')
  })
})

// ==================== buildProfileReplyPrompt ====================

describe('buildProfileReplyPrompt', () => {
  it('包含画像构建智能体角色', () => {
    const prompt = buildProfileReplyPrompt('你好')
    expect(prompt).toContain('画像构建智能体')
  })

  it('包含字数限制', () => {
    const prompt = buildProfileReplyPrompt('你好')
    expect(prompt).toContain('50字以内')
  })

  it('包含用户输入', () => {
    const prompt = buildProfileReplyPrompt('我在学 Python')
    expect(prompt).toContain('我在学 Python')
  })
})

// ==================== buildQuizAnalysisPrompt ====================

describe('buildQuizAnalysisPrompt', () => {
  it('包含画像构建智能体角色', () => {
    const prompt = buildQuizAnalysisPrompt()
    expect(prompt).toContain('画像构建智能体')
  })

  it('包含 6 维度', () => {
    const prompt = buildQuizAnalysisPrompt()
    expect(prompt).toContain('知识基础')
    expect(prompt).toContain('认知风格')
    expect(prompt).toContain('易错点偏好')
    expect(prompt).toContain('学习节奏')
    expect(prompt).toContain('兴趣方向')
    expect(prompt).toContain('学习习惯')
  })

  it('包含 JSON 格式要求', () => {
    const prompt = buildQuizAnalysisPrompt()
    expect(prompt).toContain('JSON')
  })

  it('包含质量约束', () => {
    const prompt = buildQuizAnalysisPrompt()
    expect(prompt).toContain('不少于10个字')
    expect(prompt).toContain('不要简单复述选项文字')
  })
})

// ==================== buildGradeByAIMessages ====================

describe('buildGradeByAIMessages', () => {
  it('system prompt 包含评分标准', () => {
    const { system } = buildGradeByAIMessages('题目', '参考答案', '用户答案')
    expect(system).toContain('0-100')
    expect(system).toContain('90-100')
    expect(system).toContain('70-89')
    expect(system).toContain('50-69')
    expect(system).toContain('20-49')
    expect(system).toContain('0-19')
  })

  it('system prompt 包含角色定义', () => {
    const { system } = buildGradeByAIMessages('题目', '参考答案', '用户答案')
    expect(system).toContain('编程教育评估专家')
  })

  it('user prompt 包含题目', () => {
    const { user } = buildGradeByAIMessages('什么是装饰器？', '参考', '用户答')
    expect(user).toContain('什么是装饰器？')
  })

  it('user prompt 包含参考答案', () => {
    const { user } = buildGradeByAIMessages('题目', '装饰器是 Python 的语法糖', '用户答')
    expect(user).toContain('装饰器是 Python 的语法糖')
  })

  it('user prompt 包含用户答案', () => {
    const { user } = buildGradeByAIMessages('题目', '参考', '我的回答内容')
    expect(user).toContain('我的回答内容')
  })

  it('user prompt 包含输出约束', () => {
    const { user } = buildGradeByAIMessages('题目', '参考', '答案')
    expect(user).toContain('只输出一个0-100的整数分数')
  })
})
