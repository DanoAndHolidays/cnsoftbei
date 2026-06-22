"""
第 13 页 · 关键技术 1：多智能体协同框架。

布局：双列等宽（各 540pt）
- 左：核心类签名（6 行）+ 状态机 & 关键设计 callout
- 右：5 智能体事件总线协作流程 + 协作矩阵
底部：单行 callout 总结
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.text import MSO_ANCHOR

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from components.mini_diagram import render_ascii_block


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome, apply_chrome_v2
    apply_chrome_v2(slide, chapter_idx=4, page_num=16)

    add_page_title(
    slide, "多智能体协同框架与事件总线",
    subtitle="MultiAgentScheduler + EventEmitter 完全解耦，代码精简 40%",
    accent_color=theme.ACCENT_RED,
    )

 # 双列等宽布局：左 60-600 (W=540)，右 640-1180 (W=540)，中间 40pt 间隔
    LEFT_X, LEFT_W = Pt(60), Pt(540)
    RIGHT_X, RIGHT_W = Pt(640), Pt(540)

 # ---- 左上：核心类签名
    add_textbox(slide, LEFT_X, Pt(170), LEFT_W, Pt(24),
    text="MultiAgentScheduler 核心类", font_size=16, bold=True, color=theme.ACCENT_RED)
    code = """class MultiAgentScheduler {
    agents: Map<Role, Agent> // 角色 智能体
    eventBus: EventEmitter // 事件总线
    registerAgent(role, agent) // 注册智能体
    dispatch(role, task): Promise // 单智能体执行
    runPipeline(tasks): Result[] // 流水线式协作
}"""
    render_ascii_block(slide, LEFT_X, Pt(200), LEFT_W, Pt(170), code,
    title="TypeScript", title_color=theme.ACCENT_RED,
    font_size=12, border_color=theme.ACCENT_RED, fill=theme.BG_PAPER)

 # ---- 左下：状态机 & 关键设计
    add_textbox(slide, LEFT_X, Pt(390), LEFT_W, Pt(24),
    text="状态机 & 关键设计", font_size=16, bold=True, color=theme.ACCENT_RED)
    add_card(slide, LEFT_X, Pt(420), LEFT_W, Pt(230),
    fill=theme.BG_PAPER, border="#722ED1", border_width=1.0)
    add_color_block(slide, LEFT_X, Pt(420), Pt(6), Pt(230), "#722ED1")
    add_textbox(
    slide, LEFT_X + Pt(20), Pt(435), LEFT_W - Pt(32), Pt(205),
    text="planner 拆任务 派发给 6 个 worker 并行\n\n"
    "worker 状态：pending running done / failed\n\n"
    "失败自动重试 3 次（指数退避）\n\n"
    "事件总线广播进度 UI 实时更新 5 worker 状态\n\n"
    "解耦通信：仅通过 eventBus，新增智能体只需 registerAgent()",
    font_size=13, color=theme.TEXT,
    )

 # ---- 右上：5 智能体事件总线协作（精简 ASCII 流程）
    add_textbox(slide, RIGHT_X, Pt(170), RIGHT_W, Pt(24),
    text="5 智能体事件总线协作", font_size=16, bold=True, color=theme.ACCENT_RED)
    diagram = """Profile Agent ── Resource Agent ── Path Agent
    │ profile:updated │ resource:done │ path:scheduled

Assessment ───────────── Tutor Agent ──────┘
    │ │ tutor:answered
    │ 
    └───── 答题反馈回流 ──── 推荐新路径

事件总线 EventEmitter：解耦通信，5 智能体共享进度"""
    render_ascii_block(slide, RIGHT_X, Pt(200), RIGHT_W, Pt(220), diagram,
    title="", font_size=11, border_color=theme.ACCENT_RED, fill=theme.WHITE)

 # ---- 右下：5 智能体协作矩阵
    add_textbox(slide, RIGHT_X, Pt(440), RIGHT_W, Pt(24),
    text="5 智能体协作矩阵", font_size=16, bold=True, color=theme.ACCENT_RED)
    table = ("角色 输入 输出 触发事件\n"
    "─────────────────────────────────────────────────────\n"
    "Profile 对话/题答 6 维画像更新 profile:updated\n"
    "Resource 学习目标 6 类资源 resource:generated\n"
    "Path 画像+目标 结构化路径 path:scheduled\n"
    "Tutor 问题+上下文 答案+思考 tutor:answered\n"
    "Assessment 模块进度 评估报告 assessment:done")
    render_ascii_block(slide, RIGHT_X, Pt(470), RIGHT_W, Pt(180), table,
    title="", font_size=11, border_color=theme.ACCENT_RED, fill=theme.BG_PAPER)

 # ---- 底部 callout
    add_card(slide, Pt(60), Pt(660), Pt(1160), Pt(40),
    fill=theme.PRIMARY_LIGHT, border="#722ED1", border_width=1.0)
    add_color_block(slide, Pt(60), Pt(660), Pt(6), Pt(40), "#722ED1")
    add_textbox(slide, Pt(80), Pt(668), Pt(1120), Pt(24),
    text="关键设计：智能体之间解耦（仅通过事件总线通信）· ResourceGenerator 在 Scheduler 之上封装，代码减少 40%",
    font_size=13, bold=True, color=theme.PRIMARY, anchor=MSO_ANCHOR.MIDDLE)