"""
第 9 页 · 资源生成智能体（Resource Agent）。
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
    apply_chrome_v2(slide, chapter_idx=3, page_num=11)

    color = theme.AGENT_COLORS["resource"]
    name = theme.AGENT_NAMES_CN["resource"]
    en = theme.AGENT_NAMES_EN["resource"]
    emoji = theme.AGENT_EMOJI["resource"]

    # 标题区
    add_color_block(slide, Pt(80), Pt(70), Pt(10), Pt(28), color)
    add_textbox(slide, left=Pt(100), top=Pt(70), width=Pt(900), height=Pt(38),
                text=f"{name} ({en})", font_size=24, bold=True,
                font_name=theme.FONT_TITLE, color=theme.PRIMARY)
    add_textbox(slide, left=Pt(100), top=Pt(110), width=Pt(600), height=Pt(20),
                text=f"{emoji} 基于画像的 6 类定制资源 · 多智能体流水线",
                font_size=13, color=theme.TEXT_MUTED)

    # 左侧截图
    _screenshot(slide, theme.SCREENSHOTS["resource1"], Pt(80), Pt(160), Pt(540), Pt(440))

    # 右侧三段式
    right_x = Pt(680)
    right_w = Pt(540)

    # 角色定位
    add_card(slide, right_x, Pt(160), right_w, Pt(100), fill=theme.BG_PAPER, border=None)
    add_textbox(slide, right_x + Pt(16), Pt(170), right_w - Pt(32), Pt(24),
                text="角色定位", font_size=14, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(196), right_w - Pt(32), Pt(56),
                text="基于画像为每个学习主题生成 6 类定制资源，多智能体协作流水线。",
                font_size=12, color=theme.TEXT)

    # 6 种资源类型（2×3 网格）
    types_card_h = Pt(200)
    add_card(slide, right_x, Pt(275), right_w, types_card_h, fill=theme.BG_PAPER, border=None)
    add_textbox(slide, right_x + Pt(16), Pt(285), right_w - Pt(32), Pt(24),
                text="6 种资源类型", font_size=14, bold=True, color=color)

    types = [
        ("document", "文档"),
        ("mindmap",  "思维导图"),
        ("quiz",     "测验"),
        ("reading",  "阅读"),
        ("video",    "视频脚本"),
        ("codeCase", "代码案例"),
    ]

    col_w_inner = Pt(248)
    row_h = Pt(40)
    grid_top = Pt(320)

    for i, (en_t, cn_t) in enumerate(types):
        col = i % 2
        row = i // 2
        x = right_x + Pt(16) + col * col_w_inner
        y = grid_top + row * row_h
        # 左侧色块
        add_rect(slide, x, y + Pt(8), Pt(6), Pt(18), fill=color)
        add_textbox(slide, x + Pt(14), y, Pt(220), Pt(20),
                    text=cn_t, font_size=13, bold=True, color=theme.PRIMARY)
        add_textbox(slide, x + Pt(14), y + Pt(20), Pt(220), Pt(16),
                    text=en_t, font_size=10, color=theme.TEXT_MUTED)

    # 多智能体协作
    add_card(slide, right_x, Pt(490), right_w, Pt(160),
             fill=theme.BG_PAPER, border=None)
    add_textbox(slide, right_x + Pt(16), Pt(500), right_w - Pt(32), Pt(24),
                text="多智能体协作（实时状态）", font_size=14, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(528), right_w - Pt(32), Pt(120),
                text="· planner 拆任务，5 类 worker 并行\n"
                     "· SSE 流式回传各 worker 状态（pending/running/done）\n"
                     "· 失败自动重试，最多 3 次\n"
                     "· 全部完成前允许用户中断（AbortSignal）",
                font_size=11, color=theme.TEXT)