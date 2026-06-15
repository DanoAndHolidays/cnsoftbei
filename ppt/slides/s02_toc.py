"""
第 2 页 · 目录。

5 部分 19 页导航；每部分用对应章节色块 + 页码范围。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect
from components.shapes import add_color_block, add_capsule


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=1, page_num=2)

    # 标题
    from components.layout import add_page_title
    add_page_title(slide, "目  录", subtitle="Table of Contents")

    # 5 个章节
    sections = [
        ("01", "项目导入",       "背景 · 赛题对标 · 设计目标",          "1 - 5",  theme.PRIMARY),
        ("02", "系统设计",       "4 层架构 · 技术选型",                  "6 - 7",  theme.PRIMARY),
        ("03", "五大智能体",     "画像 · 资源 · 路径 · 辅导 · 评估",    "8 - 12", "#FA8C16"),
        ("04", "关键技术深挖",   "多智能体 · 流式 · 双向同步",          "13 - 15", "#722ED1"),
        ("05", "总结与展望",     "评估 · 创新点 · 未来方向",            "16 - 19", "#13C2C2"),
    ]
    row_h = Pt(80)
    row_top_start = Pt(180)
    for i, (num, title, desc, pages, color) in enumerate(sections):
        y = row_top_start + i * (row_h + Pt(10))
        # 左侧大号数字
        add_textbox(slide, left=Pt(80), top=y, width=Pt(100), height=row_h,
                    text=num, font_size=42, bold=True, color=color)
        # 章节色竖条
        add_rect(slide, left=Pt(190), top=y + Pt(10), width=Pt(3), height=row_h - Pt(20), fill=color)
        # 章节名
        add_textbox(slide, left=Pt(210), top=y + Pt(10), width=Pt(400), height=Pt(36),
                    text=title, font_size=20, bold=True, color=theme.PRIMARY_DARK)
        # 描述
        add_textbox(slide, left=Pt(210), top=y + Pt(46), width=Pt(600), height=Pt(24),
                    text=desc, font_size=12, color=theme.TEXT_MUTED)
        # 页码范围
        add_textbox(slide, left=Pt(1000), top=y + Pt(28), width=Pt(180), height=Pt(24),
                    text=f"P. {pages}", font_size=14, color=color, align=PP_ALIGN.RIGHT, bold=True)