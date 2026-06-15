"""
PPT 几何装饰：圆角胶囊标签、徽章、装饰线、列表项图标等。
"""

from pptx.util import Pt, Emu
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor

from . import theme
from .layout import hex_to_rgb, add_textbox, add_rect


def add_capsule(slide, left, top, width, height, text: str, *,
                fill=theme.PRIMARY, text_color=theme.WHITE,
                font_size=12, bold=True):
    """
    圆角胶囊标签（用于"创新点"、"关键特性"等小标签）。

    高度 ≤ 28pt 时用椭圆（更圆）；> 28pt 时用圆角矩形。
    """
    if height <= Pt(28):
        shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, left, top, width, height)
    else:
        shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        shp.adjustments[0] = 0.5
    shp.fill.solid()
    shp.fill.fore_color.rgb = hex_to_rgb(fill)
    shp.line.fill.background()
    shp.shadow.inherit = False
    tf = shp.text_frame
    tf.margin_left = Pt(8)
    tf.margin_right = Pt(8)
    tf.margin_top = Pt(2)
    tf.margin_bottom = Pt(2)
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = text
    run.font.name = theme.FONT_FAMILY
    run.font.size = Pt(font_size)
    run.font.bold = bold
    run.font.color.rgb = hex_to_rgb(text_color)
    return shp


def add_badge(slide, left, top, width, height, text: str, *,
              fill=theme.PRIMARY, text_color=theme.WHITE, font_size=14):
    """矩形徽章"""
    shp = add_rect(slide, left, top, width, height, fill=fill)
    tf = shp.text_frame
    tf.margin_left = Pt(6)
    tf.margin_right = Pt(6)
    tf.margin_top = Pt(2)
    tf.margin_bottom = Pt(2)
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = text
    run.font.name = theme.FONT_FAMILY
    run.font.size = Pt(font_size)
    run.font.bold = True
    run.font.color.rgb = hex_to_rgb(text_color)
    return shp


def add_color_block(slide, left, top, width, height, color: str):
    """纯色块（无文字，用于智能体介绍页顶部的色条）"""
    return add_rect(slide, left, top, width, height, fill=color)


def add_divider_line(slide, left, top, width, *, color=theme.DIVIDER, height_pt=1):
    """水平细线分隔"""
    return add_rect(slide, left, top, width, Pt(height_pt), fill=color)


def add_card(slide, left, top, width, height, *,
             fill=theme.ACCENT_BG, border=theme.BORDER,
             border_width=0.75, radius=0.05):
    """浅色卡片背景"""
    shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shp.fill.solid()
    shp.fill.fore_color.rgb = hex_to_rgb(fill)
    if border is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = hex_to_rgb(border)
        shp.line.width = Pt(border_width)
    shp.adjustments[0] = radius
    shp.shadow.inherit = False
    return shp


def add_list_item(slide, left, top, width, height,
                  bullet_text: str, body_text: str, *,
                  bullet_color=theme.PRIMARY, font_size=14):
    """
    一行列表项：左侧色块/数字 + 右侧说明文字。
    """
    bullet_size = Pt(20)
    bullet = add_rect(
        slide, left, top + Pt(2),
        width=bullet_size, height=bullet_size,
        fill=bullet_color,
    )
    tf = bullet.text_frame
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    run = p.add_run()
    run.text = bullet_text
    run.font.name = theme.FONT_FAMILY
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = hex_to_rgb(theme.WHITE)

    add_textbox(
        slide,
        left=left + bullet_size + Pt(10), top=top,
        width=width - bullet_size - Pt(10), height=height,
        text=body_text,
        font_size=font_size,
        color=theme.TEXT,
    )