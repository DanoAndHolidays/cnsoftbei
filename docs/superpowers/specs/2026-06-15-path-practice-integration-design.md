# 学习路径 × 练习中心 打通 — 设计文档

**日期**: 2026-06-15
**状态**: 待用户审阅
**作者**: 设计协作

## 1. 背景与问题

当前系统存在"学习路径"与"练习中心"两个模块，但二者**未打通**：

- `Path.tsx` 用 AI 自由生成 `LearningPath`，节点只有 `title/description/estimatedHours`，无 `questionBankId/moduleId` 引用
- `Practice.tsx` 硬编码默认题库为 `python-basics`，与路径无关
- 用户从 Path 点击"开始学习"后只切换页面，练习内容不变

同时 `learningPaths.json` 中已有 12 条**预定义结构化路径**，每条节点都正确引用 `questionBankId` + `moduleId`，但 UI 未使用。

## 2. 目标

1. AI 生成的路径节点必须可追溯到具体题库的具体模块
2. 用户生成路径后，练习中心精确展示路径中包含的题库模块
3. 练习进度自动反映到路径节点状态（达成阈值后自动标记完成）
4. 同时支持 12 条预定义结构化路径的一键采用
5. 扩充 3 个热门主题的题库，提升路径生成的主题覆盖

## 3. 范围

**包含**:
- 数据模型扩展（新增 `StructuredLearningNode`、`StructuredLearningPathData`）
- 3 个新题库（计算机网络、Linux 基础、机器学习）
- `Path.tsx` 的 AI prompt 改造与 JSON 解析校验
- `Path.tsx` 新增预定义路径卡片区
- `Practice.tsx` 读 `activeStructuredPath` 过滤模块
- 路径 ↔ 练习进度双向同步（localStorage + 事件）
- localStorage 兼容性处理

**不包含**:
- AI 自动生成新题目（仍依赖预写题库）
- 跨页面的全局状态管理库（沿用现有 PageCacheContext + localStorage）
- 单元测试框架搭建（项目无测试，沿用手动验证清单）
- 题库的可视化编辑界面

## 4. 数据模型

### 4.1 新增类型（`src/types/index.ts`）

```ts
// 路径节点扩展，关联到具体题库模块
export interface StructuredLearningNode extends LearningNode {
  questionBankId: string;   // 题库 ID，如 'python-basics'
  moduleId: string;         // 模块 ID，如 'module-1'
  moduleName?: string;      // 冗余存储，便于 UI 展示
  isEntry?: boolean;        // 是否为路径的入口节点
  valid?: boolean;          // 引用校验结果，false 时 UI 降级显示
}

// 结构化路径（新路径的唯一数据形态）
export interface StructuredLearningPathData {
  id: string;               // 唯一 ID
  title: string;
  description: string;
  source: 'ai-generated' | 'predefined' | 'adopted';
  predefinedId?: string;    // 采用预定义时存原 ID
  nodes: StructuredLearningNode[];
  createdAt: string;        // ISO 时间
}
```

### 4.2 3 个新题库

| 文件 | bankId | 模块划分 |
|---|---|---|
| `src/data/computerNetworks.json` | `computer-networks` | 网络模型与协议、HTTP/HTTPS、TCP/UDP、网络安全 |
| `src/data/linuxFundamentals.json` | `linux-fundamentals` | 文件与目录、用户与权限、Shell 脚本、系统管理 |
| `src/data/machineLearning.json` | `machine-learning` | 监督学习、无监督学习、模型评估、特征工程 |

每个题库 4 模块 × 12 题 = 48 题，三种题型（判断/选择/简答）比例与现有题库一致（~6 判断、~4 选择、~2 简答）。

`practiceGrader.ts` 的 `bankRegistry` 追加这 3 个 import，使 `getAllBankIds()` 返回 12 个题库。

## 5. 路径生成

### 5.1 AI 系统提示词（Path.tsx 新版）

```
你是路径规划智能体。学生会输入学习主题。

可选题库与模块清单（共 12 库 48 模块）：
- python-basics: module-1:Python 基础语法 | module-2:函数与模块 | module-3:面向对象 | module-4:进阶实战
- javascript-web: module-1:JavaScript 基础 | module-2:函数与异步 | module-3:DOM 与事件 | module-4:HTTP 与网络
- data-structures: module-1:基础数据结构 | module-2:树与图 | module-3:排序与二分 | module-4:算法思想
- sql-database: module-1:SQL 基础 | module-2:多表查询 | module-3:数据库设计 | module-4:进阶优化
- java-basics: module-1:Java 基础 | module-2:OOP | module-3:异常与集合 | module-4:并发
- go-basics: module-1:Go 基础 | module-2:并发 | module-3:Web 开发 | module-4:测试
- csharp-basics: module-1:C# 基础 | module-2:OOP | module-3:.NET 进阶 | module-4:异步与 LINQ
- rust-basics: module-1:Rust 基础 | module-2:所有权 | module-3:并发 | module-4:实战
- devops-basics: module-1:Linux 基础 | module-2:Docker | module-3:Kubernetes | module-4:CICD
- computer-networks: module-1:网络模型 | module-2:HTTP/HTTPS | module-3:TCP/UDP | module-4:网络安全
- linux-fundamentals: module-1:文件与目录 | module-2:用户权限 | module-3:Shell 脚本 | module-4:系统管理
- machine-learning: module-1:监督学习 | module-2:无监督学习 | module-3:模型评估 | module-4:特征工程

任务：根据用户主题，从清单中挑选 3-6 个最相关的模块，按学习顺序排列。
（解析器接受 1-N 节点，但 3-6 是建议范围。）
每个节点必须包含合法的 questionBankId 和 moduleId。
节点标题可与模块原名相同或重写以贴合主题。
第一个节点 isEntry = true。

输出严格 JSON（仅 JSON，无其他文字）：
{
  "title": "<路径名>",
  "description": "<路径描述>",
  "nodes": [
    {
      "questionBankId": "<bankId>",
      "moduleId": "<moduleId>",
      "title": "<节点标题>",
      "description": "<节点描述>",
      "estimatedHours": <数字>,
      "isEntry": true
    },
    ...
  ]
}
```

### 5.2 响应解析

新增纯函数 `parseStructuredPathResponse(rawText, validBankIds): ParseResult`，位于 `src/services/pathParser.ts`（新增文件）：

```ts
type ParseResult =
  | { ok: true; path: StructuredLearningPathData }
  | { ok: false; errors: string[] };

export function parseStructuredPathResponse(
  rawText: string,
  validBankIds: string[]
): ParseResult { ... }
```

解析步骤：
1. 提取 JSON（支持 ```json``` 代码块包裹）
2. JSON.parse，失败 → 返回 errors
3. 遍历 nodes，逐项校验 `questionBankId ∈ validBankIds` 且 `moduleId` 存在于该题库
4. 校验失败的节点保留但设 `valid: false`，不阻断整条路径
5. 有效节点数 < 1 → 返回 errors

调用方（Path.tsx）根据 `ok` 决定：成功则写入 localStorage 并展示路径，失败则显示错误并保留流式原文。

## 6. 路径存储

### 6.1 localStorage 键

| 键名 | 内容 | 用途 |
|---|---|---|
| `activeStructuredPath` | `StructuredLearningPathData` | 新键，当前活跃路径的完整数据 |
| `activeLearningPath` | `string`（predefinedId 或 pathId） | 旧键，保留以兼容 `practiceGrader` 的 `getActivePath()/setActivePath()` |

### 6.2 写入时机

- AI 生成成功 → 写入两键
- 用户点击"采用"预定义路径 → 写入两键
- 节点状态变化（来自 Practice 同步）→ 更新 `activeStructuredPath.nodes[*].status/progress`，保留 `activeLearningPath` 不变

### 6.3 校验

`Path.tsx` 和 `Practice.tsx` 启动时调用 `loadActiveStructuredPath()`：

```ts
function loadActiveStructuredPath(): StructuredLearningPathData | null {
  const raw = localStorage.getItem('activeStructuredPath');
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as StructuredLearningPathData;
    // 校验每个节点的题库/模块是否仍存在
    data.nodes = data.nodes.map(n => ({
      ...n,
      valid: isValidModuleRef(n.questionBankId, n.moduleId),
    }));
    return data;
  } catch {
    localStorage.removeItem('activeStructuredPath');
    return null;
  }
}
```

## 7. 路径 ↔ 练习同步

### 7.1 事件

新增 `moduleProgressUpdated` 事件，在 `practiceGrader.submitAnswer()` 末尾派发：

```ts
window.dispatchEvent(new CustomEvent('moduleProgressUpdated', {
  detail: { moduleId, score }
}));
```

`practiceStateUpdated` 仍保留（Assessment 页继续用）。

### 7.2 阈值常量

`src/services/practiceGrader.ts` 顶部定义：

```ts
export const COMPLETION_THRESHOLD = 80;
```

`Practice.tsx` UI 已经在 `score >= 80` 时把模块标绿，沿用。

### 7.3 Path 页同步逻辑

`Path.tsx` 挂载时 `useEffect` 注册监听：

```ts
useEffect(() => {
  const handler = (e: Event) => {
    const { moduleId, score } = (e as CustomEvent).detail;
    setPathData(prev => updateNodeByPractice(prev, moduleId, score));
  };
  window.addEventListener('moduleProgressUpdated', handler);
  return () => window.removeEventListener('moduleProgressUpdated', handler);
}, []);
```

`updateNodeByPractice` 行为：
- 找到 `node.questionBankId + '|' + node.moduleId` 匹配 `moduleId` 的节点
- `score >= COMPLETION_THRESHOLD` → `status: 'completed'`, `progress: 100`
- 否则 `status: 'in-progress'`, `progress: score`
- 节点 `status` 不可回退（completed 不再变 in-progress，避免误操作；用户重置 Practice 后模块得分归零，节点 completed 状态保留直到用户重新进入"更换路径"流程）

## 8. UI 改造

### 8.1 Path 页

**自由生成区**（现有，保留）：
- 输入框、推荐主题、流式生成、JSON 解析、错误展示

**新增"推荐学习路径"卡片区**（位于自由生成区下方，路径概览上方）：
- Grid 布局，列数 3-4（响应式）
- 每张卡片：路径名、描述摘要、模块数、"采用"按钮
- 当前活跃的预定义路径卡片高亮边框（`#1890ff`）

**路径概览/步骤区**（现有，节点信息扩展）：
- 每个节点显示 `moduleName`（来自 `StructuredLearningNode`）
- 无效节点（`valid: false`）灰显 + 标签"暂无可用练习"
- 节点右侧"开始学习"按钮在无效时禁用

### 8.2 Practice 页

**顶部路径 banner**（新增，仅当 `activeStructuredPath` 存在时显示）：
```
┌─────────────────────────────────────────────┐
│ 📍 当前路径：Python 全栈工程师路径           │
│    第 2/5 步：函数与模块    [查看完整路径]    │
└─────────────────────────────────────────────┘
```
"查看完整路径"按钮调用 `onNavigate('path')`。

**左侧模块列表**（改造）：
- 仅有活跃路径时：只展示路径包含的模块，按路径顺序加 "1. 2. 3." 序号
- 多题库时按题库分组（用分组标题 `<Divider>` 区分，简单清晰；不用 Collapse 以避免与右侧做题区视觉冲突）
- 无活跃路径时：保持现状（展示当前默认题库全部模块）+ 顶部引导 banner 提示去 Path 页

**默认选择**：
- 有路径时 `activeModuleId` 默认为路径第一个未完成节点；若全部已完成则默认第一个
- 无路径时保持现状

**重置逻辑**：
- 现有"重置记录"按钮行为不变（清空当前题库答题记录）
- 不主动清除 `activeStructuredPath`

## 9. 错误处理

| 场景 | 处理 |
|---|---|
| AI JSON 解析失败 | 保留流式原文到 `currentPlanText`，`planningResult` 显示"路径解析异常，请查看生成内容" |
| AI 节点引用无效 | 节点标 `valid: false`，UI 灰显，按钮禁用，不影响其他有效节点 |
| 有效节点数 0 | 整条拒绝，提示重试 |
| localStorage 损坏 | 清除该 key，回退到无路径状态 |
| 同一题库模块重复出现在路径中 | 保留（视为不同学习阶段），按路径顺序展示 |
| `activeStructuredPath` 与 `activeLearningPath` 不一致 | 以新键为准，同步调用 `setActiveBank/setActivePath` |
| 节点引用已被删除的题库/模块 | 启动时校验并标 `valid: false` |
| 用户在无路径时进入 Practice | 引导 banner，保持现有题库展示 |

## 10. 文件改动清单

**新增**:
- `src/data/computerNetworks.json`
- `src/data/linuxFundamentals.json`
- `src/data/machineLearning.json`
- `src/services/pathParser.ts`
- `docs/superpowers/specs/2026-06-15-path-practice-integration-design.md`（本文件）

**修改**:
- `src/types/index.ts` — 新增 `StructuredLearningNode`、`StructuredLearningPathData`、`ParseResult`
- `src/services/practiceGrader.ts` — `bankRegistry` 追加 3 import，新增 `COMPLETION_THRESHOLD` 常量，`submitAnswer()` 末尾派发 `moduleProgressUpdated`
- `src/pages/Path.tsx` — 改造 system prompt、调用 `parseStructuredPathResponse`、新增预定义路径卡片区、监听 `moduleProgressUpdated`、写 `activeStructuredPath`
- `src/pages/Practice.tsx` — 组件签名增加 `onNavigate?: (key: string) => void` prop（与 Path 一致）、读 `activeStructuredPath` 过滤模块、添加路径 banner、修改默认选中逻辑
- `src/App.tsx` — 给 `<Practice>` 传入 `onNavigate` 回调（与现有 `<Path>` 一致）
- `src/context/PageCacheContext.tsx` — 路径切换时清理 Practice 缓存（避免旧题库残留）

## 11. 验收清单

1. **数据模型**
   - [ ] `StructuredLearningNode`/`StructuredLearningPathData` 类型定义完整
   - [ ] `getAllBankIds()` 返回 12 个题库
   - [ ] 3 个新题库 JSON 解析无错

2. **AI 生成**
   - [ ] "Python 入门" → 节点全部使用 `python-basics`
   - [ ] "机器学习" → 至少一个节点使用 `machine-learning`
   - [ ] "无关输入" → 至少 1 个有效节点
   - [ ] 故意构造坏 JSON → 不写入 localStorage

3. **预定义路径**
   - [ ] Path 页网格展示 12 条
   - [ ] 点击"采用"立即生效
   - [ ] 当前路径高亮

4. **Practice 联动**
   - [ ] 从 Path 进入 Practice 仅显示路径模块
   - [ ] Banner 显示路径信息
   - [ ] 完成模块后 Path 页节点自动标完成
   - [ ] 节点进度低于 80 保持 `in-progress`

5. **存储**
   - [ ] `activeStructuredPath` 与 `activeLearningPath` 同步
   - [ ] 清除新键后 Practice 回退
   - [ ] 刷新页面路径保留

6. **题目质量**（每库抽样 5 题）
   - [ ] 题意清晰、答案唯一
   - [ ] 解释详尽
   - [ ] 三种题型比例合理
