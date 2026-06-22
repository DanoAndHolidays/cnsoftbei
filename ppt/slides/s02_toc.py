"""
第 2 页 · 目录 · 风格 C 商务现代版。

顶部条 + 校徽 + 5 个章节卡片（深蓝编号 + 金色短竖条 + 章节名 + 描述 + 页码）。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, apply_chrome_v2


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)

    # 顶部条 + 校徽 + 章节信息
    apply_chrome_v2(slide, chapter_idx=1, page_num=2)

    # 标题
    add_rect(slide, left=Pt(24), top=Pt(50), width=Pt(60), height=Pt(1.5),
                fill=theme.ACCENT)
    add_textbox(slide, left=Pt(24), top=Pt(60), width=Pt(1100), height=Pt(46),
                text="目  录", font_size=30, bold=True,
                font_name=theme.FONT_SERIF, color=theme.PRIMARY)
    add_textbox(slide, left=Pt(24), top=Pt(110), width=Pt(1100), height=Pt(24),
                text="Table of Contents · 21 页 / 5 章节",
                font_size=14, color=theme.TEXT_MUTED)

    # 5 个章节卡片
    sections = [
        ("01", "项目导入与需求对标",      "背景 · 赛题对标",              "P. 3 - 5"),
        ("02", "系统架构与技术选型",      "四层架构 · 技术栈",            "P. 6 - 8"),
        ("03", "五大核心智能体设计",      "画像 · 资源 · 路径 · 辅导 · 评估", "P. 9 - 14"),
        ("04", "关键技术深挖与总结展望",  "多智能体 · 流式 · 同步 · 评估 · 创新", "P. 15 - 20"),
        ("05", "致谢",                    "Q & A",                       "P. 21"),
    ]

    row_top_start = Pt(170)
    row_h = Pt(95)
    row_gap = Pt(8)

    for i, (num, title, desc, pages) in enumerate(sections):
        y = row_top_start + i * (row_h + row_gap)

        # 左侧大号衬线数字（深蓝）
        add_textbox(slide, left=Pt(24), top=y + Pt(4), width=Pt(110), height=row_h,
                    text=num, font_size=44, bold=True,
                    font_name=theme.FONT_SERIF, color=theme.PRIMARY)

        # 金色细竖条
        add_rect(slide, left=Pt(150), top=y + Pt(20), width=Pt(2), height=row_h - Pt(40),
                    fill=theme.ACCENT)

        # 章节名（衬线）
        add_textbox(slide, left=Pt(170), top=y + Pt(14), width=Pt(560), height=Pt(34),
                    text=title, font_size=20, bold=True,
                    font_name=theme.FONT_SERIF, color=theme.TEXT)

        # 描述
        add_textbox(slide, left=Pt(170), top=y + Pt(50), width=Pt(700), height=Pt(22),
                    text=desc, font_size=13, color=theme.TEXT_MUTED)

        # 页码范围（右对齐）
        add_textbox(slide, left=Pt(900), top=y + Pt(34), width=Pt(340), height=Pt(24),
                    text=pages, font_size=14, color=theme.PRIMARY,
                    align=PP_ALIGN.RIGHT, bold=True)
