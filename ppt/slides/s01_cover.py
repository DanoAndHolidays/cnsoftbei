"""
第 1 页 · 封面。

模板：左侧 6px 渐变竖条 + 紧靠竖条的红色小字眉头 + 大标题（深蓝）+
     副标题 + 底部参赛信息。

不调用 apply_chrome() —— 封面无页眉页脚。
"""

from pptx.util import Pt, Inches
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

from components import theme
from components.layout import hex_to_rgb, add_textbox, add_rect
from components.shapes import add_color_block


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)

    # ---- 左侧 6px 主蓝渐变竖条（用纯色 + 底部深蓝小三角作伪渐变）
    add_rect(slide, left=Pt(0), top=Pt(0), width=Pt(6), height=theme.SLIDE_HEIGHT, fill=theme.PRIMARY)
    add_rect(slide, left=Pt(6), top=Pt(0), width=Pt(4), height=theme.SLIDE_HEIGHT, fill=theme.PRIMARY_DARK)

    # ---- 红色小字眉头
    add_textbox(
        slide, left=Pt(40), top=Pt(80), width=Pt(800), height=Pt(28),
        text="2026 中国软件杯 · A3 赛题参赛作品",
        font_size=14, bold=True, color="#FF4D4F",
    )

    # ---- 大标题（深蓝）
    add_textbox(
        slide, left=Pt(40), top=Pt(140), width=Pt(1100), height=Pt(90),
        text="学习智能体系统",
        font_size=44, bold=True, color=theme.PRIMARY_DARK,
    )

    # ---- 副标题（深灰）
    add_textbox(
        slide, left=Pt(40), top=Pt(240), width=Pt(1100), height=Pt(50),
        text="多智能体协同驱动的个性化学习平台",
        font_size=24, color=theme.TEXT_MUTED,
    )

    # ---- 分隔线
    add_rect(slide, left=Pt(40), top=Pt(330), width=Pt(80), height=Pt(3), fill=theme.PRIMARY)

    # ---- 英文小副标题
    add_textbox(
        slide, left=Pt(40), top=Pt(350), width=Pt(1100), height=Pt(40),
        text="Multi-Agent Driven Personalized Learning Platform",
        font_size=14, color=theme.TEXT_SUBTLE,
    )

    # ---- 底部参赛信息卡片（左下角）
    info_top = theme.SLIDE_HEIGHT - Pt(200)
    info_items = [
        ("队伍", theme.COVER_INFO["team_name"]),
        ("学校", theme.COVER_INFO["school"]),
        ("汇报人", theme.COVER_INFO["presenter"]),
        ("指导老师", theme.COVER_INFO["advisor"]),
        ("日期", theme.COVER_INFO["date"]),
    ]
    for i, (label, value) in enumerate(info_items):
        y = info_top + i * Pt(28)
        add_textbox(slide, left=Pt(40), top=y, width=Pt(80), height=Pt(24),
                    text=label, font_size=12, bold=True, color=theme.PRIMARY)
        add_textbox(slide, left=Pt(120), top=y, width=Pt(400), height=Pt(24),
                    text=value, font_size=12, color=theme.TEXT)

    # ---- 右下角项目 logo 占位（深蓝大圆 + 文字）
    logo_size = Pt(120)
    logo_left = theme.SLIDE_WIDTH - Pt(160)
    logo_top = theme.SLIDE_HEIGHT - Pt(160)
    add_rect(slide, left=logo_left, top=logo_top, width=logo_size, height=logo_size, fill=theme.PRIMARY)
    add_textbox(
        slide, left=logo_left, top=logo_top + Pt(30), width=logo_size, height=Pt(60),
        text="Learning\nAgent", font_size=20, bold=True, color=theme.WHITE,
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
    )