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

from pptx.oxml.ns import qn
from lxml import etree

from pathlib import Path
PPT_ROOT = Path(__file__).resolve().parent.parent


def set_run_font(run, role: str = "body"):
    """
    设置 run 字体（latin + 东亚双通道）。
    role: heading | serif | body | mono
    """
    FONTS = {
        "heading": (theme.FONT_HEADING, theme.FONT_FALLBACK_HEADING),
        "serif":   (theme.FONT_SERIF,   theme.FONT_FALLBACK_SERIF),
        "body":    (theme.FONT_BODY,    theme.FONT_FALLBACK_BODY),
        "mono":    (theme.FONT_MONO,    theme.FONT_FALLBACK_MONO),
    }
    primary, fallback = FONTS.get(role, FONTS["body"])
    run.font.name = primary  # 拉丁字符
    # 中文走东亚字体通道
    rPr = run._r.get_or_add_rPr()
    # 移除现有 ea 标签
    for ea in rPr.findall(qn('a:ea')):
        rPr.remove(ea)
    ea = etree.SubElement(rPr, qn('a:ea'))
    ea.set('typeface', primary)


def add_crest(slide):
    """
    在顶部条右侧贴校徽图（图片1.jpg）。
    图片缺失时降级为白底矩形 + "校徽"文字。
    """
    try:
        crest_path = PPT_ROOT / "assets" / "图片1.jpg"
        if not crest_path.exists():
            raise FileNotFoundError(f"crest image not found: {crest_path}")
        slide.shapes.add_picture(
            str(crest_path),
            left=theme.SLIDE_WIDTH - theme.CREST_MARGIN_R - theme.CREST_WIDTH,
            top=theme.CREST_MARGIN_T,
            width=theme.CREST_WIDTH,
            height=theme.CREST_HEIGHT,
        )
    except Exception:
        # 降级方案
        add_rect(
            slide,
            left=theme.SLIDE_WIDTH - theme.CREST_MARGIN_R - theme.CREST_WIDTH,
            top=theme.CREST_MARGIN_T,
            width=theme.CREST_WIDTH, height=theme.CREST_HEIGHT,
            fill=theme.WHITE,
        )
        add_textbox(
            slide,
            left=theme.SLIDE_WIDTH - theme.CREST_MARGIN_R - theme.CREST_WIDTH,
            top=theme.CREST_MARGIN_T + Pt(4),
            width=theme.CREST_WIDTH, height=Pt(16),
            text="校徽", font_size=9, color=theme.PRIMARY_DEEP,
            align=PP_ALIGN.CENTER, bold=True,
        )


def apply_chrome_v2(slide, chapter_idx: int, page_num: int):
    """
    在内容页加顶部条（章节信息 + 校徽）+ 底部条（项目名 + 页码）。
    替换原 apply_chrome()。chapter_idx: 1~5; page_num: 1~21。
    """
    chapter = theme.CHAPTERS[chapter_idx - 1]

    # ─── 顶部条：深蓝纯色 ───
    add_rect(
        slide,
        left=0, top=0,
        width=theme.SLIDE_WIDTH, height=theme.HEADER_BAR_HEIGHT,
        fill=theme.HEADER_BAR_COLOR,
    )

    # ─── 左上角章节信息（双 run：金色编号 + 白色章节名） ───
    tb = slide.shapes.add_textbox(
        left=Pt(14), top=Pt(6),
        width=Pt(800), height=Pt(16),
    )
    tf = tb.text_frame
    tf.margin_left = tf.margin_right = Pt(0)
    tf.margin_top = tf.margin_bottom = Pt(0)
    p = tf.paragraphs[0]
    run1 = p.add_run()
    run1.text = chapter["num"] + "    "
    run1.font.size = Pt(theme.HEADER_CHAPTER_FONT_SIZE)
    run1.font.bold = True
    run1.font.color.rgb = hex_to_rgb(theme.ACCENT)
    set_run_font(run1, "body")
    run2 = p.add_run()
    run2.text = chapter["title"]
    run2.font.size = Pt(theme.HEADER_CHAPTER_FONT_SIZE)
    run2.font.color.rgb = hex_to_rgb(theme.WHITE)
    set_run_font(run2, "body")

    # ─── 右上角校徽 ───
    add_crest(slide)

    # ─── 底部条：深蓝纯色 ───
    add_rect(
        slide,
        left=0, top=theme.SLIDE_HEIGHT - theme.FOOTER_BAR_HEIGHT,
        width=theme.SLIDE_WIDTH, height=theme.FOOTER_BAR_HEIGHT,
        fill=theme.FOOTER_BAR_COLOR,
    )

    # ─── 底部左侧：项目名 ───
    add_textbox(
        slide,
        left=Pt(14),
        top=theme.SLIDE_HEIGHT - theme.FOOTER_BAR_HEIGHT + Pt(2),
        width=Pt(600), height=Pt(14),
        text="学习智能体系统 · Multi-Agent Learning Platform",
        font_size=7, color=theme.TEXT_FOOTER_WEAK,
    )

    # ─── 底部右侧：页码（金色粗体） ───
    add_textbox(
        slide,
        left=theme.SLIDE_WIDTH - Pt(70),
        top=theme.SLIDE_HEIGHT - theme.FOOTER_BAR_HEIGHT + Pt(1),
        width=Pt(56), height=Pt(16),
        text=f"{page_num} / {theme.TOTAL_PAGES}",
        font_size=8.5, color=theme.ACCENT, bold=True,
        align=PP_ALIGN.RIGHT,
    )


def hex_to_rgb(hex_str: str) -> RGBColor:
    """'#1890FF' -> RGBColor(0x18, 0x90, 0xFF)"""
    hex_str = hex_str.lstrip("#")
    return RGBColor(int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16))


def add_textbox(slide, left, top, width, height, text, *,
                font_size=14, bold=False, color=theme.TEXT,
                font_name=theme.FONT_FAMILY, align=PP_ALIGN.LEFT,
                anchor=MSO_ANCHOR.TOP, fill=None):
    """通用文本框：文字 + 字号 + 颜色 + 可选底色。
    默认正文用黑体；标题字号 ≥ 24 时自动切衬线（思源宋体）。"""
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
    # 大字号自动切衬线字体（标题感）
    if font_name == theme.FONT_FAMILY and font_size >= 24:
        run.font.name = theme.FONT_TITLE
    else:
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

    # ---- 左上角页眉：第 X 章 · 章节名（极简：仅章节序号 + 名，无前缀）
    add_textbox(
        slide,
        left=theme.MARGIN_LR, top=Pt(24),
        width=Pt(360), height=theme.HEADER_HEIGHT,
        text=f"0{chapter_idx}  {chapter['title']}",
        font_size=theme.FONT_SIZES["tiny"],
        color=theme.TEXT_SUBTLE,
    )

    # ---- 右上角页眉：项目小标识（极简）
    add_textbox(
        slide,
        left=theme.SLIDE_WIDTH - theme.MARGIN_LR - Pt(280), top=Pt(24),
        width=Pt(280), height=theme.HEADER_HEIGHT,
        text=theme.COVER_INFO["contest"],
        font_size=theme.FONT_SIZES["tiny"],
        color=theme.TEXT_SUBTLE,
        align=PP_ALIGN.RIGHT,
    )

    # ---- 左侧 2px 极细装饰竖条（章节色，极简）
    add_rect(
        slide,
        left=0, top=Pt(50),
        width=Pt(2), height=theme.SLIDE_HEIGHT - Pt(100),
        fill=chapter_color,
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
    生成章节首页（极简莫兰迪版：纯米白底 + 巨大衬线数字 + 章节名 + 细线）。
    返回该页的页码（用于后续 apply_chrome 调用）。
    """
    chapter = theme.CHAPTERS[chapter_idx - 1]

    blank_layout = prs.slide_layouts[6]   # 空白版式
    slide = prs.slides.add_slide(blank_layout)

    # ---- 米白主背景
    add_rect(
        slide,
        left=0, top=0,
        width=theme.SLIDE_WIDTH, height=theme.SLIDE_HEIGHT,
        fill=theme.BG_CREAM,
    )

    # ---- 巨大衬线数字（淡米色，几乎透明）
    # TODO(Task 6): 替换为专用常量 theme.BG_DIVIDER_NUMBER = "#E8E4DA"（见设计稿章节分隔页）
    add_textbox(
        slide,
        left=Pt(120), top=Pt(150),
        width=Pt(900), height=Pt(420),
        text=chapter["num"],
        font_size=320,
        bold=True,
        font_name=theme.FONT_TITLE,
        color=theme.BG_CREAM,
    )

    # ---- 章节中文名（衬线大标题）
    add_textbox(
        slide,
        left=Pt(220), top=Pt(300),
        width=Pt(900), height=Pt(80),
        text=chapter["title"],
        font_size=32,
        bold=True,
        font_name=theme.FONT_TITLE,
        color=theme.TEXT,
    )

    # ---- 60pt 陶土橙细分割线（替代原 4px 橙条）
    add_rect(
        slide,
        left=Pt(220), top=Pt(390),
        width=Pt(60), height=Pt(2),
        fill=theme.TERRACOTTA,
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
        left=Pt(220), top=Pt(415),
        width=Pt(800), height=Pt(36),
        text=en_titles[chapter["num"]],
        font_size=13,
        color=theme.TEXT_MUTED,
    )

    # ---- 页码范围（极弱化）
    add_textbox(
        slide,
        left=Pt(220), top=Pt(460),
        width=Pt(800), height=Pt(30),
        text=f"第 {chapter['pages']} 页",
        font_size=11,
        color=theme.TEXT_SUBTLE,
    )

    return len(prs.slides)


def add_page_title(slide, title: str, subtitle: str = None,
                   top: int = Pt(70), *,
                   accent_color=theme.TERRACOTTA, icon: str = ""):
    """
    内容页的标准标题（莫兰迪极简版）：
    - 衬线大标题（思源宋体）
    - 60pt 极细陶土橙横线分隔
    - 副标题用弱化灰
    返回正文起始 top。
    """
    # 60pt 极细横线（章节色，替代原 4px 高条）
    add_rect(
        slide,
        left=theme.MARGIN_LR, top=top - Pt(2),
        width=Pt(60), height=Pt(1.5),
        fill=accent_color,
    )

    title_text = f"{icon}  {title}" if icon else title
    add_textbox(
        slide,
        left=theme.MARGIN_LR, top=top + Pt(8),
        width=theme.SLIDE_WIDTH - 2 * theme.MARGIN_LR, height=Pt(46),
        text=title_text,
        font_size=theme.FONT_SIZES["page_title"],
        bold=True,
        font_name=theme.FONT_TITLE,
        color=theme.TEXT,
    )
    if subtitle:
        add_textbox(
            slide,
            left=theme.MARGIN_LR, top=top + Pt(58),
            width=theme.SLIDE_WIDTH - 2 * theme.MARGIN_LR, height=Pt(24),
            text=subtitle,
            font_size=theme.FONT_SIZES["subtitle"],
            color=theme.TEXT_MUTED,
        )
        return top + Pt(92)
    return top + Pt(70)