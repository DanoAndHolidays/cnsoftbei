"""
第 21 页 · 致谢 · 风格 C 商务现代版。

白底 + 顶部条 + 校徽 + 大字"感谢聆听" + 金色装饰 + Q&A 提示。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

from components import theme
from components.layout import add_textbox, add_rect, apply_chrome_v2, hex_to_rgb


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)

    # 顶部条 + 校徽 + 章节信息
    apply_chrome_v2(slide, chapter_idx=5, page_num=21)

    # ─── 大字"感谢聆听"（深蓝衬线） ───
    add_textbox(
        slide, left=Pt(80), top=Pt(180), width=Pt(1100), height=Pt(140),
        text="感谢聆听",
        font_size=80, bold=True,
        font_name=theme.FONT_SERIF,
        color=theme.PRIMARY,
        align=PP_ALIGN.CENTER,
    )

    # ─── 英文小字 ───
    add_textbox(
        slide, left=Pt(80), top=Pt(330), width=Pt(1100), height=Pt(36),
        text="THANK YOU FOR YOUR ATTENTION",
        font_size=14, color=theme.TEXT_MUTED,
        align=PP_ALIGN.CENTER,
        font_name=theme.FONT_SERIF,
    )

    # ─── 金色短横线（居中） ───
    add_rect(
        slide, left=Pt(620), top=Pt(380),
        width=Pt(60), height=Pt(2),
        fill=theme.ACCENT,
    )

    # ─── Q&A 提示 ───
    add_textbox(
        slide, left=Pt(80), top=Pt(420), width=Pt(1100), height=Pt(40),
        text="欢迎评委老师批评指正 · 提问交流",
        font_size=20, color=theme.TEXT,
        align=PP_ALIGN.CENTER,
    )

    # ─── 底部信息（队伍 + 学校） ───
    add_textbox(
        slide, left=Pt(80), top=Pt(540), width=Pt(1100), height=Pt(28),
        text=f"{theme.COVER_INFO['team_name']}  ·  {theme.COVER_INFO['school']}",
        font_size=14, color=theme.TEXT_MUTED,
        align=PP_ALIGN.CENTER,
    )

    add_textbox(
        slide, left=Pt(80), top=Pt(575), width=Pt(1100), height=Pt(24),
        text=f"{theme.COVER_INFO['date']}  ·  第十五届中国软件杯 · A3 赛题",
        font_size=11, color=theme.TEXT_SUBTLE,
        align=PP_ALIGN.CENTER,
    )

    # ─── 半透明装饰圆（左下角） ───
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(-80), Pt(500), Pt(240), Pt(240))
    shp.fill.solid()
    shp.fill.fore_color.rgb = hex_to_rgb(theme.ACCENT)
    shp.fill.transparency = 0.85
    shp.line.fill.background()
