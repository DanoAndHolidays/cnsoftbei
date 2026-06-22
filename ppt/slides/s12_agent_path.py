"""
第 10 页 · 路径规划智能体（Path Agent）
"""

import os
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.text import MSO_ANCHOR

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from slides.s10_agent_profile import _screenshot


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome, apply_chrome_v2
    apply_chrome_v2(slide, chapter_idx=3, page_num=12)

    color = theme.AGENT_COLORS["path"]
    name = theme.AGENT_NAMES_CN["path"]
    en = theme.AGENT_NAMES_EN["path"]
    emoji = theme.AGENT_EMOJI["path"]

    add_color_block(slide, Pt(80), Pt(70), Pt(10), Pt(28), color)
    add_textbox(slide, left=Pt(100), top=Pt(70), width=Pt(900), height=Pt(38),
    text=f"{name} ({en})", font_size=26, bold=True, color=theme.PRIMARY)
    add_textbox(slide, left=Pt(100), top=Pt(110), width=Pt(600), height=Pt(20),
    text=f"{emoji} AI 自由生成 + 12 条预定义结构化路径 · 80% 完成度阈值", font_size=14, color=theme.TEXT_SUBTLE)

    _screenshot(slide, theme.SCREENSHOTS["path1"], Pt(80), Pt(160), Pt(560), Pt(440))

    right_x = Pt(680)
    right_w = Pt(540)

    add_card(slide, right_x, Pt(160), right_w, Pt(110), fill=theme.BG_PAPER, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(170), right_w - Pt(32), Pt(24),
    text="▶ 角色定位", font_size=15, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(196), right_w - Pt(32), Pt(70),
    text="根据画像生成结构化学习路径，将知识点对应到题库的具体模块。",
    font_size=14, color=theme.TEXT)

    add_card(slide, right_x, Pt(280), right_w, Pt(160), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(290), right_w - Pt(32), Pt(24),
    text="▶ 双轨模式", font_size=15, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(320), right_w - Pt(32), Pt(120),
    text="• AI 自由生成：流式输出节点列表\n"
    "• 12 条预定义结构化路径：一键采用\n"
    "• StructuredLearningNode：每节点绑定 questionBankId + moduleId\n"
    "• 80% 阈值：模块完成度达 80% 自动标记",
    font_size=14, color=theme.TEXT)

    add_card(slide, right_x, Pt(450), right_w, Pt(150), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(460), right_w - Pt(32), Pt(24),
    text="▶ 双向同步（路径 练习）", font_size=15, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(488), right_w - Pt(32), Pt(110),
    text="• Practice 页按 activeStructuredPath 过滤模块\n"
    "• 路径 banner 提示当前激活路径\n"
    "• 自定义事件 moduleProgressUpdated 实时同步",
    font_size=14, color=theme.TEXT)
