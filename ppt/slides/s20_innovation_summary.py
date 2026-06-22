"""
第 20 页 · 创新价值沉淀与未来演进方向。

布局：上 5 项核心创新 + 下 3 大未来方向。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

from components import theme
from components.layout import add_textbox, add_rect, add_page_title, apply_chrome_v2
from components.shapes import add_card, add_color_block


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    apply_chrome_v2(slide, chapter_idx=4, page_num=20)

    add_page_title(
        slide,
        "创新价值沉淀与未来演进方向",
        subtitle="架构 / 数据 / 交互 / 工程 4 维度 5 项创新 + 3 大未来方向",
        accent_color=theme.PRIMARY_DEEP,
    )

    # ---- 上半：5 项核心创新（横排 5 列）
    add_textbox(slide, Pt(60), Pt(170), Pt(1080), Pt(28),
                text="5 项核心创新沉淀",
                font_size=17, bold=True, color=theme.PRIMARY_DARK,
                font_name=theme.FONT_TITLE)

    innovations = [
        ("01", "5 智能体协同框架",
         "MultiAgentScheduler 统一调度\n事件总线解耦通信\n6 worker 并行生成",
         theme.PRIMARY_DEEP),
        ("02", "6 维动态画像",
         "对话式构建 + 做题反馈回流\n随学随新、跨页面共享\n下游智能体 prompt 注入",
         theme.PRIMARY),
        ("03", "结构化路径节点",
         "StructuredLearningNode 绑定题库\n80% 阈值自动标记\n12 预定义 + AI 自由生成",
         theme.ACCENT),
        ("04", "流式思考可视化",
         "SSE + ReadableStream\n<thinking> 块可折叠\nAbortSignal 中途取消",
         theme.PRIMARY_DEEP),
        ("05", "Tutor 5 项工程优化",
         "画像注入 + 缓存去重\n追问链 + 点踩重生\nAbortSignal 取消",
         theme.ACCENT),
    ]

    cap_w = Pt(220)
    cap_h = Pt(155)
    cap_top = Pt(210)
    cap_gap = Pt(8)

    for i, (num, title, body, color) in enumerate(innovations):
        x = Pt(60) + i * (cap_w + cap_gap)
        add_card(slide, x, cap_top, cap_w, cap_h,
                 fill=theme.WHITE, border=color, border_width=1.5)
        add_color_block(slide, x, cap_top, cap_w, Pt(8), color)
        add_textbox(slide, x + Pt(12), cap_top + Pt(16), cap_w - Pt(24), Pt(28),
                    text=num, font_size=18, bold=True, color=color,
                    font_name=theme.FONT_TITLE)
        add_textbox(slide, x + Pt(12), cap_top + Pt(48), cap_w - Pt(24), Pt(28),
                    text=title, font_size=14, bold=True, color=theme.PRIMARY_DARK)
        add_textbox(slide, x + Pt(12), cap_top + Pt(78), cap_w - Pt(24),
                    cap_h - Pt(82),
                    text=body, font_size=11, color=theme.TEXT)

    # ---- 下半：3 大未来方向
    add_textbox(slide, Pt(60), Pt(390), Pt(1080), Pt(28),
                text="3 大未来演进方向",
                font_size=17, bold=True, color=theme.PRIMARY,
                font_name=theme.FONT_TITLE)

    futures = [
        ("01", "多模态扩展",
         "接入图像与语音识别大模型，支持拍照搜题、语音问答等更自然的交互形态",
         theme.ACCENT),
        ("02", "知识图谱构建",
         "引入学科底层知识图谱，使路径推荐从「标签匹配」升级为「逻辑推理」",
         theme.PRIMARY),
        ("03", "跨用户协作网络",
         "开发学习小组、同伴互评与错题共享功能，从个体学习向社交化协同学习延伸",
         theme.PRIMARY_DEEP),
    ]

    card_w = Pt(360)
    card_h = Pt(170)
    card_top = Pt(430)

    for i, (num, title, body, color) in enumerate(futures):
        x = Pt(60) + i * (card_w + Pt(20))
        add_card(slide, x, card_top, card_w, card_h,
                 fill=theme.ACCENT_BG, border=color, border_width=1.5)
        add_color_block(slide, x, card_top, Pt(8), card_h, color)
        add_textbox(slide, x + Pt(20), card_top + Pt(15), card_w - Pt(40), Pt(28),
                    text=num, font_size=18, bold=True, color=color,
                    font_name=theme.FONT_TITLE)
        add_textbox(slide, x + Pt(20), card_top + Pt(45), card_w - Pt(40), Pt(32),
                    text=title, font_size=16, bold=True, color=theme.PRIMARY_DARK)
        add_textbox(slide, x + Pt(20), card_top + Pt(82), card_w - Pt(40),
                    card_h - Pt(92),
                    text=body, font_size=12, color=theme.TEXT)

    # 底部 slogan
    add_rect(slide, Pt(24), Pt(630), Pt(1192), Pt(40), fill=theme.PRIMARY_DEEP)
    add_textbox(slide, Pt(24), Pt(630), Pt(1192), Pt(40),
                text="我们相信：AI + 教育 = 每个学生都拥有专属的学习智能体",
                font_size=17, bold=True, color=theme.WHITE,
                align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)