"""
第 10 页 · 画像构建智能体 (Profile Agent) · 莫兰迪极简版。
"""

import os
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

from components import theme
from components.layout import add_textbox, add_rect
from components.shapes import add_card, add_color_block
from PIL import Image


def _screenshot(slide, img_rel_path: str, left, top, width, height):
    """等比缩放插入截图（来自 assets/screenshot/）"""
    ppt_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    img_path = os.path.abspath(os.path.join(ppt_dir, theme.SCREENSHOT_DIR, img_rel_path))
    if not os.path.exists(img_path):
        # fallback: 占位卡
        add_card(slide, left, top, width, height, fill=theme.BG_PAPER)
        add_textbox(slide, left, top, width, height,
                    text=f"[截图缺失: {img_rel_path}]", font_size=12, color=theme.TEXT_SUBTLE,
                    align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
        return
    # 等比缩放
    img = Image.open(img_path)
    iw, ih = img.size
    ratio = min(width / iw, height / ih)
    w = int(iw * ratio)
    h = int(ih * ratio)
    x = left + (width - w) // 2
    y = top + (height - h) // 2
    slide.shapes.add_picture(img_path, x, y, width=w, height=h)


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome, apply_chrome_v2
    apply_chrome_v2(slide, chapter_idx=3, page_num=10)

    color = theme.AGENT_COLORS["profile"]
    name = theme.AGENT_NAMES_CN["profile"]
    en = theme.AGENT_NAMES_EN["profile"]

    # 标题区
    add_color_block(slide, Pt(80), Pt(70), Pt(40), Pt(2), color)
    add_textbox(slide, left=Pt(80), top=Pt(80), width=Pt(900), height=Pt(40),
                text=f"{name} ({en})", font_size=24, bold=True,
                font_name=theme.FONT_TITLE, color=theme.TEXT)
    add_textbox(slide, left=Pt(80), top=Pt(118), width=Pt(700), height=Pt(20),
                text="对话式 6 维画像构建 · 持久化跨页共享", font_size=12, color=theme.TEXT_MUTED)

    # 左侧截图
    _screenshot(slide, theme.SCREENSHOTS["profile"], Pt(80), Pt(170), Pt(540), Pt(440))

    # 右侧三段式
    right_x = Pt(680)
    right_w = Pt(520)
    add_card(slide, right_x, Pt(170), right_w, Pt(110), fill=theme.BG_PAPER)
    add_textbox(slide, right_x + Pt(16), Pt(180), right_w - Pt(32), Pt(24),
                text="角色定位", font_size=14, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(206), right_w - Pt(32), Pt(70),
                text="通过对话式交互理解学习者，构建 6 维动态画像；随学习过程持续更新。",
                font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(295), right_w, Pt(160), fill=theme.BG_PAPER)
    add_textbox(slide, right_x + Pt(16), Pt(305), right_w - Pt(32), Pt(24),
                text="核心能力（6 维画像）", font_size=14, bold=True, color=color)
    dims = ["知识基础", "认知风格", "易错偏好", "学习节奏", "兴趣方向", "学习习惯"]
    for i, d in enumerate(dims):
        col = i % 2
        row = i // 2
        x = right_x + Pt(16) + col * Pt(250)
        y = Pt(335) + row * Pt(36)
        add_rect(slide, x, y + Pt(8), Pt(2), Pt(8), fill=color)
        add_textbox(slide, x + Pt(10), y, Pt(230), Pt(22),
                    text=d, font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(470), right_w, Pt(140), fill=theme.BG_PAPER)
    add_textbox(slide, right_x + Pt(16), Pt(480), right_w - Pt(32), Pt(24),
                text="关键特性：随学随新", font_size=14, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(506), right_w - Pt(32), Pt(100),
                text="· 对话式构建：自然语言输入\n"
                     "· 持久化到 localStorage，跨页面共享\n"
                     "· 做题反馈回流画像（practiceGrader 派发事件）\n"
                     "· 系统 prompt 注入到所有下游智能体",
                font_size=11, color=theme.TEXT)