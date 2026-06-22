"""
第 16 页 · 系统评估与测试。

4 个数据卡 + 4 项测试结论。
"""

from pptx.util import Pt

from components import theme
from components.layout import add_textbox, add_page_title, apply_chrome_v2
from components.shapes import add_card, add_color_block


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    apply_chrome_v2(slide, chapter_idx=4, page_num=19)

    add_page_title(
        slide,
        "系统评估与核心性能指标",
        subtitle="576 题库 + 92% 判分一致率 + <2s 首字延迟 + 0 严重缺陷",
        accent_color=theme.PRIMARY_DEEP,
    )

    # 上半：4 个数据卡
    add_textbox(slide, Pt(24), Pt(180), Pt(1200), Pt(24),
                text="关键指标",
                font_size=18, bold=True, color=theme.PRIMARY,
                font_name=theme.FONT_SERIF)

    metrics = [
        ("576", "题库总题数", "12 库 × 48 题", theme.PRIMARY),
        ("92%", "AI 简答判分一致性", "与人工判分比对", theme.ACCENT),
        ("<2s", "路径生成响应时间", "流式首字延迟", theme.PRIMARY_DEEP),
        ("0", "已知严重缺陷", "npm run build 通过", theme.ACCENT_RED),
    ]
    card_w = Pt(255)
    card_h = Pt(120)
    card_top = Pt(210)

    for i, (num, label, sub, color) in enumerate(metrics):
        x = Pt(80) + i * (card_w + Pt(20))
        add_card(slide, x, card_top, card_w, card_h,
                 fill=theme.ACCENT_BG, border=color, border_width=1.5)
        add_color_block(slide, x, card_top, card_w, Pt(6), color)
        add_textbox(slide, x + Pt(16), card_top + Pt(22), card_w - Pt(32), Pt(44),
                    text=num, font_size=34, bold=True, color=color,
                    font_name=theme.FONT_TITLE)
        add_textbox(slide, x + Pt(16), card_top + Pt(66), card_w - Pt(32), Pt(22),
                    text=label, font_size=15, bold=True, color=theme.PRIMARY_DARK)
        add_textbox(slide, x + Pt(16), card_top + Pt(90), card_w - Pt(32), Pt(22),
                    text=sub, font_size=12, color=theme.TEXT_MUTED)

    # 下半：4 项测试结论
    add_textbox(slide, Pt(24), Pt(370), Pt(1200), Pt(24),
                text="4 项测试结论",
                font_size=18, bold=True, color=theme.PRIMARY,
                font_name=theme.FONT_SERIF)

    tests = [
        ("题库覆盖度",
         "12 个题库覆盖 Python 基础、Web、数据结构、计算机网络、操作系统等；题型 6:3:1（判断:选择:简答）",
         theme.PRIMARY),
        ("AI 简答判分一致性",
         "随机抽 30 道简答，对比 AI 判分与人工判分；一致率 92%；不一致多为开放性题目",
         theme.ACCENT),
        ("跨页面同步验证",
         "Practice  Assessment 实时同步；路径采用 Practice 模块过滤；缓存命中 = 100%",
         theme.PRIMARY_DEEP),
        ("性能指标",
         "首屏 < 1.5s；流式首字 < 2s；多智能体协作 6 worker 并发完成 < 8s",
         theme.ACCENT_RED),
    ]
    test_h = Pt(65)
    test_top = Pt(400)

    for i, (title, desc, color) in enumerate(tests):
        y = test_top + i * (test_h + Pt(8))
        add_card(slide, Pt(80), y, Pt(1120), test_h,
                 fill=theme.WHITE, border=color, border_width=0.75)
        add_color_block(slide, Pt(80), y, Pt(8), test_h, color)
        add_textbox(slide, Pt(100), y + Pt(10), Pt(180), Pt(24),
                    text=title, font_size=15, bold=True, color=color,
                    font_name=theme.FONT_TITLE)
        add_textbox(slide, Pt(290), y + Pt(12), Pt(880), Pt(48),
                    text=desc, font_size=12, color=theme.TEXT)