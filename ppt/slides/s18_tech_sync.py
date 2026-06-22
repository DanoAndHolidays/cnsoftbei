"""
第 15 页 · 关键技术 3：路径 练习双向同步。

布局：上半数据流图 + 下半双列
- 下半左：核心接口 + DAG 节点依赖
- 下半右：3 个关键事实卡
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_page_title, apply_chrome, apply_chrome_v2
from components.shapes import add_card, add_color_block
from components.mini_diagram import render_ascii_block
from components.flow_diagram import build_node, build_arrow


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    apply_chrome_v2(slide, chapter_idx=4, page_num=18)

    add_page_title(
        slide,
        "路径与练习双向同步闭环",
        subtitle="StructuredLearningNode + localStorage + 80% 完成度阈值，杜绝 AI 幻觉",
        accent_color=theme.ACCENT_RED,
    )

    LEFT_X, LEFT_W = Pt(60), Pt(540)
    RIGHT_X, RIGHT_W = Pt(640), Pt(540)

    # ---- 上半：数据流图（4 节点横排）
    add_textbox(slide, Pt(60), Pt(170), Pt(1080), Pt(24),
                text="数据流图：Path  localStorage  Practice  Assessment 闭环",
                font_size=15, bold=True, color=theme.ACCENT_RED,
                font_name=theme.FONT_TITLE)

    nodes_y = Pt(220)
    node_h = Pt(60)
    node_w = Pt(200)
    positions = [
        (Pt(60), "Path 页", theme.PRIMARY, "写入 activeStructuredPath"),
        (Pt(320), "localStorage", theme.ACCENT, "单一数据源"),
        (Pt(580), "Practice 页", theme.SUCCESS, "读取 + 过滤模块"),
        (Pt(840), "Assessment 页", theme.ACCENT_RED, "读取 + 进度展示"),
    ]

    y_arrow = nodes_y + node_h // 2
    for i, (x, text, color, _) in enumerate(positions):
        build_node(slide, x, nodes_y, node_w, node_h, text,
                   fill=color, font_size=14)
        if i < len(positions) - 1:
            x1 = x + node_w
            x2 = positions[i + 1][0]
            build_arrow(slide, x1, y_arrow, x2, y_arrow,
                        color=theme.ACCENT_RED, width_pt=2.0)

    for x, _, _, desc in positions:
        add_textbox(slide, x, nodes_y + node_h + Pt(8), node_w, Pt(22),
                    text=desc, font_size=12, color=theme.TEXT_MUTED,
                    align=PP_ALIGN.CENTER)

    # 循环回流说明
    add_textbox(slide, Pt(280), Pt(320), Pt(640), Pt(22),
                text="做题结果回流  画像更新  推荐新路径",
                font_size=12, bold=True, color=theme.PRIMARY_DEEP,
                align=PP_ALIGN.CENTER)

    # ---- 下半左：核心接口 + DAG
    add_textbox(slide, LEFT_X, Pt(360), LEFT_W, Pt(24),
                text="StructuredLearningNode 核心接口",
                font_size=15, bold=True, color=theme.ACCENT_RED,
                font_name=theme.FONT_TITLE)

    code = """interface StructuredLearningNode {
  id: string
  type: 'concept' | 'quiz' | 'practice'
  questionBankId: string // 关联题库（关键）
  moduleId: string // 关联模块（关键）
  score?: number // 完成度 0-1
}
const THRESHOLD = 0.8 // 80% 完成度阈值"""
    render_ascii_block(slide, LEFT_X, Pt(390), LEFT_W, Pt(160), code,
                       title="TypeScript", title_color=theme.ACCENT_RED,
                       font_size=11, border_color=theme.ACCENT_RED,
                       fill=theme.BG_PAPER)

    # DAG 节点依赖
    add_textbox(slide, LEFT_X, Pt(570), LEFT_W, Pt(24),
                text="学习节点依赖 DAG（Python 模块为例）",
                font_size=14, bold=True, color=theme.ACCENT_RED,
                font_name=theme.FONT_TITLE)
    dag = """[基础语法] -> [控制流] -> [函数] -> [装饰器]
    |         |         |
[数据类型] [异常处理] [闭包]"""
    render_ascii_block(slide, LEFT_X, Pt(600), LEFT_W, Pt(90), dag,
                       title="", font_size=11, border_color=theme.ACCENT_RED,
                       fill=theme.WHITE)

    # ---- 下半右：3 个关键事实卡
    facts = [
        ("12 题库 × 48 题", "576 道题全预写，AI 只判分不生成", theme.PRIMARY),
        ("80% 阈值", "模块完成度达 80% 自动标记为 done", theme.ACCENT),
        ("customEvent", "解耦通信，跨页面 / 跨组件零依赖", theme.ACCENT_RED),
    ]
    card_h = Pt(95)
    for i, (title, desc, color) in enumerate(facts):
        y = Pt(390) + i * (card_h + Pt(15))
        add_card(slide, RIGHT_X, y, RIGHT_W, card_h,
                 fill=theme.BG_PAPER, border=color, border_width=1.0)
        add_color_block(slide, RIGHT_X, y, Pt(6), card_h, color)
        add_textbox(slide, RIGHT_X + Pt(16), y + Pt(12), RIGHT_W - Pt(32), Pt(28),
                    text=title, font_size=15, bold=True, color=color)
        add_textbox(slide, RIGHT_X + Pt(16), y + Pt(44), RIGHT_W - Pt(32), Pt(45),
                    text=desc, font_size=12, color=theme.TEXT)