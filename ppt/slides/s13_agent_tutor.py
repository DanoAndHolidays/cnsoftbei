"""
第 11 页 · 辅导答疑智能体（Tutor Agent）。
"""

import os
from pptx.util import Pt

from components import theme
from components.layout import add_textbox, add_rect, add_page_title, apply_chrome, apply_chrome_v2
from components.shapes import add_card, add_color_block
from slides.s10_agent_profile import _screenshot


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    apply_chrome_v2(slide, chapter_idx=3, page_num=13)

    color = theme.AGENT_COLORS["tutor"]
    name = theme.AGENT_NAMES_CN["tutor"]
    en = theme.AGENT_NAMES_EN["tutor"]
    emoji = theme.AGENT_EMOJI["tutor"]

    # 标题区
    add_color_block(slide, Pt(80), Pt(70), Pt(10), Pt(28), color)
    add_textbox(slide, left=Pt(100), top=Pt(70), width=Pt(900), height=Pt(38),
                text=f"{name} ({en})", font_size=24, bold=True,
                font_name=theme.FONT_TITLE, color=theme.PRIMARY)
    add_textbox(slide, left=Pt(100), top=Pt(110), width=Pt(600), height=Pt(20),
                text=f"{emoji} 4 种解答模式 · 追问链 · 画像驱动 · 流式中断",
                font_size=13, color=theme.TEXT_MUTED)

    # 左侧截图
    _screenshot(slide, theme.SCREENSHOTS["tutor"], Pt(80), Pt(160), Pt(540), Pt(440))

    # 右侧三段式
    right_x = Pt(680)
    right_w = Pt(540)

    # 角色定位
    add_card(slide, right_x, Pt(160), right_w, Pt(100), fill=theme.BG_PAPER, border=None)
    add_textbox(slide, right_x + Pt(16), Pt(170), right_w - Pt(32), Pt(24),
                text="角色定位", font_size=14, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(196), right_w - Pt(32), Pt(56),
                text="一对一智能辅导，根据画像调整回答风格和深度；支持追问链。",
                font_size=12, color=theme.TEXT)

    # 4 种解答模式（2×2 网格）
    add_card(slide, right_x, Pt(275), right_w, Pt(180), fill=theme.BG_PAPER, border=None)
    add_textbox(slide, right_x + Pt(16), Pt(285), right_w - Pt(32), Pt(24),
                text="4 种解答模式", font_size=14, bold=True, color=color)

    modes = [
        ("文字", "Markdown 渲染"),
        ("图解", "Mermaid/ASCII 流程"),
        ("视频", "脚本 + 时间戳"),
        ("代码", "可执行片段 + 注释"),
    ]

    col_w_inner = Pt(248)
    row_h = Pt(56)
    grid_top = Pt(320)

    for i, (cn_t, desc) in enumerate(modes):
        col = i % 2
        row = i // 2
        x = right_x + Pt(16) + col * col_w_inner
        y = grid_top + row * row_h
        # 左侧色块
        add_rect(slide, x, y + Pt(8), Pt(6), Pt(28), fill=color)
        add_textbox(slide, x + Pt(14), y, Pt(220), Pt(22),
                    text=cn_t, font_size=14, bold=True, color=color,
                    font_name=theme.FONT_TITLE)
        add_textbox(slide, x + Pt(14), y + Pt(26), Pt(220), Pt(20),
                    text=desc, font_size=11, color=theme.TEXT_MUTED)

    # 工程优化
    add_card(slide, right_x, Pt(470), right_w, Pt(180),
             fill=theme.BG_PAPER, border=None)
    add_textbox(slide, right_x + Pt(16), Pt(480), right_w - Pt(32), Pt(24),
                text="工程优化（5 项）", font_size=14, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(508), right_w - Pt(32), Pt(140),
                text="· 画像注入 system prompt\n"
                     "· 缓存去重（问题 + 模式双键）\n"
                     "· 追问链 parentId / followUpIds\n"
                     "· 点踩重新生成（含原因分析）\n"
                     "· AbortSignal 取消未完成请求",
                font_size=11, color=theme.TEXT)