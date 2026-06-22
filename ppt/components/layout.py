"""
PPT 页面框架：页眉、页脚、章节分隔页。

所有内容页都通过 `apply_chrome(slide, chapter_idx, page_num)` 统一加页眉页脚；
章节首页用 `build_section_divider(prs, chapter_idx)` 生成。
"""

from pptx.util import Pt, Inches, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image

from . import theme


def hex_to_rgb(hex_str: str) -> RGBColor:
    """'#1890FF' -> RGBColor(0x18, 0x90, 0xFF)"""
    hex_str = hex_str.lstrip("#")
    return RGBColor(int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16))


def add_textbox(slide, left, top, width, height, text, *,
                font_size=14, bold=False, color=theme.TEXT,
                font_name=theme.FONT_FAMILY, align=PP_ALIGN.LEFT,
                anchor=MSO_ANCHOR.TOP, fill=None):
    """通用文本框：文字 + 字号 + 颜色 + 可选底色"""
    tb = slide.shapes.add_textbox(left, top, width, height)
    if fill is not None:
        tb.fill.solid()
        tb.fill.fore_color.rgb = hex_to_rgb(fill)
        tb.line.fill.background()
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = Pt(8)
    tf.margin_right = Pt(8)
    tf.margin_top = Pt(4)
    tf.margin_bottom = Pt(4)
    tf.vertical_anchor = anchor
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.color.rgb = hex_to_rgb(color)
    return tb


def add_rect(slide, left, top, width, height, *,
             fill=theme.PRIMARY, line=None, line_width=0):
    """通用矩形：底色 + 可选描边"""
    shp = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, height)
    shp.fill.solid()
    shp.fill.fore_color.rgb = hex_to_rgb(fill)
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = hex_to_rgb(line)
        shp.line.width = Pt(line_width)
    shp.shadow.inherit = False
    return shp


def apply_chrome(slide, chapter_idx: int, page_num: int):
    """
    在内容页加页眉、页脚、左侧装饰条。

    chapter_idx: 1~5（对应 CHAPTERS 数组索引 +1）
    page_num: 当前页码（1~19）
    """
    chapter = theme.CHAPTERS[chapter_idx - 1]
    chapter_color = chapter["color"]

    # ---- 左上角页眉：第 X 章 · 章节名
    add_textbox(
        slide,
        left=theme.MARGIN_LR, top=Pt(20),
        width=Pt(360), height=theme.HEADER_HEIGHT,
        text=f"学习智能体系统 · 第 {chapter_idx:02d} 章 {chapter['title']}",
        font_size=theme.FONT_SIZES["tiny"],
        color=theme.TEXT_SUBTLE,
    )

    # ---- 右上角页眉：项目小标识
    add_textbox(
        slide,
        left=theme.SLIDE_WIDTH - theme.MARGIN_LR - Pt(200), top=Pt(20),
        width=Pt(200), height=theme.HEADER_HEIGHT,
        text=theme.COVER_INFO["contest"],
        font_size=theme.FONT_SIZES["tiny"],
        color=theme.TEXT_SUBTLE,
        align=PP_ALIGN.RIGHT,
    )

    # ---- 左侧 4px 装饰竖条（章节色）
    add_rect(
        slide,
        left=0, top=Pt(50),
        width=Pt(4), height=theme.SLIDE_HEIGHT - Pt(100),
        fill=chapter_color,
    )

    # ---- 左下角浅蓝水平细线
    add_rect(
        slide,
        left=theme.MARGIN_LR, top=theme.SLIDE_HEIGHT - Pt(35),
        width=Pt(120), height=Pt(1),
        fill=theme.PRIMARY_LIGHT,
    )

    # ---- 右下角页码
    add_textbox(
        slide,
        left=theme.SLIDE_WIDTH - theme.MARGIN_LR - Pt(80), top=theme.SLIDE_HEIGHT - Pt(30),
        width=Pt(80), height=theme.FOOTER_HEIGHT,
        text=f"{page_num} / {theme.TOTAL_PAGES}",
        font_size=theme.FONT_SIZES["tiny"],
        color=theme.TEXT_SUBTLE,
        align=PP_ALIGN.RIGHT,
    )


def build_section_divider(prs, chapter_idx: int) -> int:
    """
    生成章节首页（大号半透明数字 + 章节名 + 橙色分割线）。
    返回该页的页码（用于后续 apply_chrome 调用）。
    """
    chapter = theme.CHAPTERS[chapter_idx - 1]

    blank_layout = prs.slide_layouts[6]   # 空白版式
    slide = prs.slides.add_slide(blank_layout)

    # ---- 大号半透明数字
    add_textbox(
        slide,
        left=Pt(120), top=Pt(180),
        width=Pt(800), height=Pt(420),
        text=chapter["num"],
        font_size=280,
        bold=True,
        color=theme.ACCENT_BG,
    )

    # ---- 章节中文名
    add_textbox(
        slide,
        left=Pt(220), top=Pt(300),
        width=Pt(800), height=Pt(80),
        text=chapter["title"],
        font_size=theme.FONT_SIZES["page_title"],
        bold=True,
        color=theme.PRIMARY_DARK,
    )

    # ---- 4px 橙色短分割线
    add_rect(
        slide,
        left=Pt(220), top=Pt(390),
        width=Pt(60), height=Pt(4),
        fill="#FA8C16",
    )

    # ---- 章节英文小字
    en_titles = {
        "01": "Introduction",
        "02": "System Design",
        "03": "Five Intelligent Agents",
        "04": "Key Technologies",
        "05": "Summary & Outlook",
    }
    add_textbox(
        slide,
        left=Pt(220), top=Pt(420),
        width=Pt(800), height=Pt(40),
        text=en_titles[chapter["num"]],
        font_size=16,
        color=theme.TEXT_MUTED,
    )

    # ---- 页码范围
    add_textbox(
        slide,
        left=Pt(220), top=Pt(480),
        width=Pt(800), height=Pt(40),
        text=f"本章节包含第 {chapter['pages']} 页",
        font_size=12,
        color=theme.TEXT_SUBTLE,
    )

    return len(prs.slides)


def add_page_title(slide, title: str, subtitle: str = None,
                   top: int = Pt(70)):
    """
    内容页的标准标题：黑色加粗大字 + 可选灰色副标题。
    返回正文起始 top。
    """
    add_textbox(
        slide,
        left=theme.MARGIN_LR, top=top,
        width=theme.SLIDE_WIDTH - 2 * theme.MARGIN_LR, height=Pt(50),
        text=title,
        font_size=theme.FONT_SIZES["page_title"],
        bold=True,
        color=theme.PRIMARY_DARK,
    )
    if subtitle:
        add_textbox(
            slide,
            left=theme.MARGIN_LR, top=top + Pt(48),
            width=theme.SLIDE_WIDTH - 2 * theme.MARGIN_LR, height=Pt(30),
            text=subtitle,
            font_size=theme.FONT_SIZES["body"],
            color=theme.TEXT_MUTED,
        )
        return top + Pt(85)
    return top + Pt(60)