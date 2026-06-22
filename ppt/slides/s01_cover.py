"""
第 1 页 · 封面 · 风格 C 商务现代版。

深蓝渐变背景 + 金色装饰条 + 衬线大字 + 顶部条 + 校徽 + 底部条。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

from components import theme
from components.layout import add_textbox, add_rect, apply_chrome_v2, hex_to_rgb


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)

    # ─── 深蓝渐变背景（用纯色近似） ───
    add_rect(
        slide, left=Pt(0), top=Pt(0),
        width=theme.SLIDE_WIDTH, height=theme.SLIDE_HEIGHT,
        fill=theme.PRIMARY_DEEP,
    )

    # ─── 顶部条 + 校徽 + 章节信息（封面页用项目名占位章节信息） ───
    apply_chrome_v2(slide, chapter_idx=1, page_num=1)

    # ─── 半透明装饰色块（左上） ───
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(-60), Pt(40), Pt(280), Pt(280))
    shp.fill.solid()
    shp.fill.fore_color.rgb = hex_to_rgb(theme.HEADER_BAR_COLOR)  # 占位
    shp.fill.fore_color.rgb = hex_to_rgb(theme.ACCENT)
    shp.fill.transparency = 0.82
    shp.line.fill.background()

    # ─── 半透明装饰色块（右下） ───
    shp2 = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(1100), Pt(540), Pt(320), Pt(320))
    shp2.fill.solid()
    shp2.fill.fore_color.rgb = hex_to_rgb(theme.WHITE)
    shp2.fill.transparency = 0.92
    shp2.line.fill.background()

    # ─── 金色短横线（标题上方装饰） ───
    add_rect(
        slide, left=Pt(80), top=Pt(180),
        width=Pt(60), height=Pt(2),
        fill=theme.ACCENT,
    )

    # ─── 小字眉头 ───
    add_textbox(
        slide, left=Pt(80), top=Pt(110), width=Pt(800), height=Pt(28),
        text=theme.COVER_INFO["contest"],
        font_size=14, color="#CCCCCC",
    )

    # ─── 大标题（衬线大字） ───
    add_textbox(
        slide, left=Pt(80), top=Pt(210), width=Pt(1100), height=Pt(140),
        text="学习智能体系统",
        font_size=64, bold=True,
        font_name=theme.FONT_SERIF,
        color=theme.WHITE,
    )

    # ─── 副标题（衬线小字） ───
    add_textbox(
        slide, left=Pt(80), top=Pt(360), width=Pt(1100), height=Pt(40),
        text="多智能体协同驱动的个性化学习平台",
        font_size=22,
        font_name=theme.FONT_SERIF,
        color=theme.WHITE,
    )

    # ─── 英文小副标题 ───
    add_textbox(
        slide, left=Pt(80), top=Pt(410), width=Pt(1100), height=Pt(30),
        text="Multi-Agent Driven Personalized Learning Platform",
        font_size=12, color="#AAAAAA",
    )

    # ─── 底部参赛信息（5 行，金色标签 + 白色值） ───
    info_top = Pt(530)
    info_items = [
        ("队伍",      theme.COVER_INFO["team_name"]),
        ("学校",      theme.COVER_INFO["school"]),
        ("汇报人",    theme.COVER_INFO["presenter"]),
        ("指导老师",  theme.COVER_INFO["advisor"]),
        ("日期",      theme.COVER_INFO["date"]),
    ]
    for i, (label, value) in enumerate(info_items):
        y = info_top + i * Pt(30)
        add_textbox(slide, left=Pt(80), top=y, width=Pt(80), height=Pt(24),
                    text=label, font_size=12, bold=True, color=theme.ACCENT)
        add_textbox(slide, left=Pt(180), top=y, width=Pt(400), height=Pt(24),
                    text=value, font_size=12, color=theme.WHITE)

    # ─── 右下角极简标识 ───
    add_rect(slide, left=theme.SLIDE_WIDTH - Pt(160), top=theme.SLIDE_HEIGHT - Pt(160),
                width=Pt(60), height=Pt(2), fill=theme.ACCENT)
    add_textbox(
        slide, left=theme.SLIDE_WIDTH - Pt(160), top=theme.SLIDE_HEIGHT - Pt(150),
        width=Pt(120), height=Pt(20),
        text="Learning Agent",
        font_size=11, bold=True, color=theme.ACCENT,
    )
    add_textbox(
        slide, left=theme.SLIDE_WIDTH - Pt(160), top=theme.SLIDE_HEIGHT - Pt(125),
        width=Pt(120), height=Pt(20),
        text="2026  ·  A3",
        font_size=10, color="#CCCCCC",
    )
