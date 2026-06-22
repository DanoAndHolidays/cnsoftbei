"""
PPT ASCII 流程图：把等宽字符串渲染为带框线的 textbox。

适合"代码瘦身"后用 ASCII 表达时序图、流水线、DAG。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

from . import theme
from .layout import add_textbox
from .shapes import add_card


def render_ascii_block(slide, left, top, width, height, content: str, *,
                       title="", title_color=theme.PRIMARY,
                       font_size=11, line_height_factor=1.25,
                       border_color=theme.PRIMARY, fill=theme.ACCENT_BG):
    """
    在指定区域渲染一段 ASCII 流程图/时序图/DAG。

    content 字符串按 \\n 拆分；每行用 Consolas 等宽渲染，对齐到框内左上方。
    """
    # 卡片外框
    add_card(slide, left, top, width, height, fill=fill, border=border_color, border_width=1.0)

    inner_left = left + Pt(12)
    inner_top = top + Pt(8)
    inner_w = width - Pt(24)
    inner_h = height - Pt(16)

    if title:
        add_textbox(
            slide, inner_left, inner_top, inner_w, Pt(24),
            text=f"▶ {title}", font_size=font_size + 1, bold=True, color=title_color,
        )
        inner_top = inner_top + Pt(26)
        inner_h = inner_h - Pt(26)

    # 渲染 ASCII 内容
    add_textbox(
        slide, inner_left, inner_top, inner_w, inner_h,
        text=content,
        font_size=font_size,
        color=theme.TEXT,
        font_name=theme.FONT_MONO,   # Consolas 等宽
        align=PP_ALIGN.LEFT,
        anchor=MSO_ANCHOR.TOP,
    )
