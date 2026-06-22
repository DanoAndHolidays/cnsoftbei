"""
第 3 页 · 项目背景。

左：AI 教育趋势（3 个数据点）
中：传统平台 3 大痛点
右：本项目定位（差异化 4 点）
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title, apply_chrome, apply_chrome_v2
from components.shapes import add_card


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    apply_chrome_v2(slide, chapter_idx=1, page_num=4)

    add_page_title(
        slide,
        "项目背景与差异化定位",
        subtitle="AI 教育市场趋势 · 传统平台痛点 · 本项目差异化定位",
    )

    # ---- 左栏：AI 教育趋势（3 个数据卡）
    left_x = Pt(80)
    left_w = Pt(340)
    col_top = Pt(200)

    add_textbox(slide, left_x, col_top, left_w, Pt(30),
                text="AI 教育市场趋势",
                font_size=16, bold=True, color=theme.PRIMARY,
                font_name=theme.FONT_TITLE)

    trends = [
        ("60%+", "学生认为 AI 个性化辅导效果优于传统课堂"),
        ("3 倍", "近 2 年自适应学习平台用户增长"),
        ("80%", "高校将引入 AI 教学辅助系统（2026 预测）"),
    ]
    for i, (num, desc) in enumerate(trends):
        y = col_top + Pt(50) + i * Pt(95)
        add_card(slide, left_x, y, left_w, Pt(82), fill=theme.BG_PAPER)
        add_textbox(slide, left_x + Pt(16), y + Pt(10), left_w - Pt(32), Pt(34),
                    text=num, font_size=26, bold=True, color=theme.PRIMARY,
                    font_name=theme.FONT_TITLE)
        add_textbox(slide, left_x + Pt(16), y + Pt(48), left_w - Pt(32), Pt(28),
                    text=desc, font_size=12, color=theme.TEXT_MUTED)

    # ---- 中栏：传统平台 3 大痛点（漏斗：3 个倒梯形）
    mid_x = Pt(460)
    mid_w = Pt(360)

    add_textbox(slide, mid_x, col_top, mid_w, Pt(30),
                text="传统学习平台 3 大痛点",
                font_size=16, bold=True, color=theme.PRIMARY,
                font_name=theme.FONT_TITLE)

    pains = [
        ("资源繁杂", "题库、视频、文档分散", theme.ERROR),
        ("节奏统一", "全班同一进度，难个性化", theme.WARNING),
        ("反馈滞后", "错题几天后才讲评", theme.ACCENT_RED),
    ]
    pain_top = col_top + Pt(50)
    for i, (title, desc, color) in enumerate(pains):
        y = pain_top + i * Pt(95)
        w = mid_w - i * Pt(30)
        x = mid_x + i * Pt(15)
        add_card(slide, x, y, w, Pt(72), fill=color, border=None)
        add_textbox(slide, x + Pt(20), y + Pt(10), w - Pt(40), Pt(26),
                    text=f"{i + 1}. {title}",
                    font_size=15, bold=True, color=theme.WHITE)
        add_textbox(slide, x + Pt(20), y + Pt(38), w - Pt(40), Pt(26),
                    text=desc, font_size=12, color=theme.WHITE)

    # ---- 右栏：本项目定位（4 个差异化点）
    right_x = Pt(880)
    right_w = Pt(340)

    add_textbox(slide, right_x, col_top, right_w, Pt(30),
                text="本项目定位：4 大差异化",
                font_size=16, bold=True, color=theme.ACCENT,
                font_name=theme.FONT_TITLE)

    diffs = [
        ("多智能体协同", "5 类智能体分工协作"),
        ("6 维动态画像", "随学随新、贴合个体"),
        ("结构化路径", "题库/模块双向同步"),
        ("流式可视化", "思考过程可折叠"),
    ]
    diff_top = col_top + Pt(50)
    for i, (title, desc) in enumerate(diffs):
        y = diff_top + i * Pt(70)
        # 左侧色块
        add_rect(slide, right_x, y + Pt(4), Pt(8), Pt(48), fill=theme.ACCENT)
        add_textbox(slide, right_x + Pt(20), y, right_w - Pt(20), Pt(26),
                    text=title, font_size=15, bold=True,
                    color=theme.PRIMARY)
        add_textbox(slide, right_x + Pt(20), y + Pt(28), right_w - Pt(20), Pt(24),
                    text=desc, font_size=12, color=theme.TEXT_MUTED)