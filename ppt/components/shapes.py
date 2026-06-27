"""
PPT 几何装饰：卡片、色块、分隔线 · 学术商务版。
"""

from pptx.util import Pt, Emu
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

from . import theme
from .layout import hex_to_rgb, add_textbox, add_rect


def add_color_block(slide, left, top, width, height, color: str):
    """纯色块装饰。"""
    return add_rect(slide, left, top, width, height, fill=color)


def add_card(slide, left, top, width, height, *,
             fill=theme.WHITE, border=None,
             border_width=0.75, radius=0.03):
    """圆角卡片。"""
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
