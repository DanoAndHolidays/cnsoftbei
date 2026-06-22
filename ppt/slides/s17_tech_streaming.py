"""
第 14 页 · 关键技术 2：流式输出与思考过程可视化。

布局：双列等宽（各 540pt）
- 左：核心函数签名（6 行）+ SSE 打字机时序图
- 右：流式截图 + 3 个特性卡
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.text import MSO_ANCHOR

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from components.mini_diagram import render_ascii_block
from slides.s10_agent_profile import _screenshot


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome, apply_chrome_v2
    apply_chrome_v2(slide, chapter_idx=4, page_num=17)

    add_page_title(
    slide, "流式交互与思考过程可视化",
    subtitle="SSE + ReadableStream 打字机效果，思考过程可折叠，AbortSignal 中断",
    accent_color=theme.ACCENT_RED,
    )

    LEFT_X, LEFT_W = Pt(60), Pt(540)
    RIGHT_X, RIGHT_W = Pt(640), Pt(540)

 # ---- 左上：核心函数签名
    add_textbox(slide, LEFT_X, Pt(170), LEFT_W, Pt(24),
    text="streamChatCompletion 核心函数", font_size=16, bold=True, color=theme.ACCENT_RED)
    code = """async function* streamChatCompletion(
    messages, onChunk, signal // AbortSignal 取消
) {
    const res = await fetch('/anthropic', {
    stream: true, signal
    })
    for await (const chunk of res.body) {
    const { text, thinking } = parseSSE(chunk)
    onChunk({ text, thinking }) // 打字机回调
    }
}"""
    render_ascii_block(slide, LEFT_X, Pt(200), LEFT_W, Pt(180), code,
    title="TypeScript", title_color=theme.ACCENT_RED,
    font_size=12, border_color=theme.ACCENT_RED, fill=theme.BG_PAPER)

 # ---- 左下：SSE 打字机时序图
    add_textbox(slide, LEFT_X, Pt(400), LEFT_W, Pt(24),
    text="SSE 打字机时序图", font_size=16, bold=True, color=theme.ACCENT_RED)
    diagram = """用户输入 ── POST /anthropic (stream: true)

SSE chunk 1 ── onChunk("你") ── 显示 "你"
SSE chunk 2 ── onChunk("好") ── 显示 "好"
SSE chunk 3 ── onChunk("世") ── 显示 "世"
... (直到 stop_reason)
done event ── onComplete() ── 显示 完成

取消：signal.abort() ── fetch 中断 ── 显示 "已取消\""""
    render_ascii_block(slide, LEFT_X, Pt(430), LEFT_W, Pt(220), diagram,
    title="", font_size=11, border_color=theme.ACCENT_RED, fill=theme.WHITE)

 # ---- 右上：流式截图
    add_textbox(slide, RIGHT_X, Pt(170), RIGHT_W, Pt(24),
    text="实际流式效果截图", font_size=16, bold=True, color=theme.ACCENT_RED)
    _screenshot(slide, theme.SCREENSHOTS["path2"], RIGHT_X, Pt(200), RIGHT_W, Pt(180))

 # ---- 右下：3 个特性卡
    cards = [
    ("打字机效果", "逐 chunk 调用 setState，每帧渲染新字符\n视觉上像 ChatGPT 一样逐字出现。", theme.PRIMARY),
    ("思考过程可折叠", "AI 输出的 <thinking> 块折叠在 \"思考过程\" 标签下\n默认折叠，用户点击展开看推理细节。", "#FA8C16"),
    ("AbortSignal 取消","流式中点击取消 触发 controller.abort()\nfetch 立即中断，UI 显示 \"已取消\" 状态。", "#722ED1"),
    ]
    card_h = Pt(80)
    for i, (title, body, color) in enumerate(cards):
        y = Pt(400) + i * (card_h + Pt(10))
    add_card(slide, RIGHT_X, y, RIGHT_W, card_h, fill=theme.WHITE, border=color, border_width=1.5)
    add_color_block(slide, RIGHT_X, y, Pt(6), card_h, color)
    add_textbox(slide, RIGHT_X + Pt(16), y + Pt(12), RIGHT_W - Pt(32), Pt(28),
    text=title, font_size=15, bold=True, color=color)
    add_textbox(slide, RIGHT_X + Pt(16), y + Pt(42), RIGHT_W - Pt(32), card_h - Pt(46),
    text=body, font_size=12, color=theme.TEXT)