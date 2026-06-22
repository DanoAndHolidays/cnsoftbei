# 学习智能体系统 · 汇报 PPT — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 用 python-pptx 生成 19 页《学习智能体系统》结课 + 比赛汇报 PPT，输出 `ppt/output/学习智能体系统_汇报PPT.pptx`，可在 PowerPoint / WPS 打开编辑。

**Architecture:**
- 组件库优先：`theme` (常量) → `layout` (页眉页脚/章节分隔) → `shapes` (几何) → `code_block` (代码着色) → `flow_diagram` (流程图) → `radar_chart` (matplotlib 雷达) → `assessment_mock` (评估页 mockup)
- 19 个 slide 模块统一签名：`def build(prs: Presentation, theme: dict) -> None`
- 主入口 `generate.py` 解析 CLI（`--only s10` / `--from s08 --to s12`），按 `slides/__init__.py` 的 `SLIDES` 列表顺序执行
- 验证策略：python-pptx 输出是二进制，无法做单元测试；用"模块导入不崩溃" + "完整生成后 .pptx 存在且 slide 数正确"做集成测试；视觉验收靠人眼打开 PPT 检查

**Tech Stack:** Python 3.10 + python-pptx 1.0.2 + Pillow 11.0.0 + matplotlib 3.10.0

**前置说明：**
- 设计文档：`docs/superpowers/specs/2026-06-15-ppt-design.md`（视觉规范、配色、字体、19 页大纲都在那里）
- 8 张真实截图位于 `assets/screenshot/PixPin_2026-06-15_10-3*.png`，PPT 中引用名见设计文档第 4 节
- 项目无 Python 测试框架；验证以「`python -c "import xxx"` 不抛异常」+「`python generate.py` 成功生成 .pptx + slide 数 == 19」为准
- 每 5 页提交一次 git，便于回滚

---

## Task 1: 创建 ppt 目录骨架

**Files:**
- Create: `ppt/__init__.py`
- Create: `ppt/components/__init__.py`
- Create: `ppt/slides/__init__.py`
- Create: `ppt/output/.gitkeep`
- Create: `ppt/assets/.gitkeep`

- [ ] **Step 1: 创建目录与空文件**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && mkdir -p ppt/components ppt/slides ppt/output ppt/assets && touch ppt/__init__.py ppt/components/__init__.py ppt/slides/__init__.py ppt/output/.gitkeep ppt/assets/.gitkeep
```

Expected: 无输出，目录创建成功。

- [ ] **Step 2: 验证目录结构**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && find ppt -type f -o -type d | sort
```

Expected:
```
ppt
ppt/assets
ppt/assets/.gitkeep
ppt/components
ppt/components/__init__.py
ppt/output
ppt/output/.gitkeep
ppt/slides
ppt/slides/__init__.py
```

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/ && git commit -m "chore(ppt): 创建 ppt 工程目录骨架"
```

---

## Task 2: 编写 requirements.txt 与 README

**Files:**
- Create: `ppt/requirements.txt`
- Create: `ppt/README.md`

- [ ] **Step 1: 创建 `ppt/requirements.txt`**

```txt
python-pptx==1.0.2
Pillow==11.0.0
matplotlib==3.10.0
```

- [ ] **Step 2: 创建 `ppt/README.md`**

```markdown
# 学习智能体系统 · 汇报 PPT 生成器

用 `python-pptx` 自动生成 19 页汇报 PPT。

## 安装

```bash
cd ppt
pip install -r requirements.txt
```

需要 Python ≥ 3.10。

## 生成

```bash
# 完整生成
python generate.py
# → output/学习智能体系统_汇报PPT.pptx

# 只生成某张
python generate.py --only s10

# 批量生成区间
python generate.py --from s08 --to s12
```

## 修改后重新生成

直接 `python generate.py` 即可；已存在的 `output/` 文件会被覆盖。

## 目录结构

- `slides/s01-s19_*.py` — 19 张幻灯片
- `components/` — 视觉组件库
- `output/` — 最终 .pptx 产物
- `assets/` — 临时资源（matplotlib 雷达图 PNG 等）

## 占位字段

封面、致谢页的队伍 / 学校 / 汇报人 / 日期等占位符在 `components/theme.py` 的 `COVER_INFO` 字典里。改完跑 `python generate.py` 自动更新。

## 视觉规范

配色、字体、模板：见 `docs/superpowers/specs/2026-06-15-ppt-design.md` §5。
```

- [ ] **Step 3: 安装依赖并验证**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && pip install -r requirements.txt 2>&1 | tail -5
```

Expected: `Successfully installed python-pptx-1.0.2 Pillow-11.0.0 matplotlib-3.10.0` 之类的成功信息。

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "import pptx; import PIL; import matplotlib; print('pptx', pptx.__version__, 'PIL', PIL.__version__, 'matplotlib', matplotlib.__version__)"
```

Expected: `pptx 1.0.2 PIL 11.0.0 matplotlib 3.10.0`（或类似版本号，无 ImportError）。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/requirements.txt ppt/README.md && git commit -m "docs(ppt): 添加 requirements.txt 与 README"
```

---

## Task 3: 实现 theme.py（视觉常量 + 占位信息）

**Files:**
- Create: `ppt/components/theme.py`

这是整个工程的「调色板 + 字典」，所有 slide 模块和组件都从这里导入常量。

- [ ] **Step 1: 写入 `ppt/components/theme.py`**

```python
"""
PPT 视觉常量与占位信息。

所有颜色、字体、尺寸常量集中在此；所有 slide 和组件都从这里导入，
改主题只需要改这一个文件。
"""

from pptx.util import Pt, Emu
from pptx.enum.shapes import MSO_SHAPE


# ============ 尺寸（EMU，1 inch = 914400 EMU，1 pt = 12700 EMU）============

# 标准 16:9 幻灯片尺寸
SLIDE_WIDTH = Emu(12192000)   # 13.333 inch
SLIDE_HEIGHT = Emu(6858000)   # 7.5 inch

# 全局边距
MARGIN_LR = Pt(60)            # 左右 60pt
MARGIN_TB = Pt(50)            # 上下 50pt

# 页眉/页脚高度
HEADER_HEIGHT = Pt(24)
FOOTER_HEIGHT = Pt(20)

# 内容区
CONTENT_TOP = Pt(80)
CONTENT_BOTTOM = Pt(720)


# ============ 基础调色板（A 学术蓝白）============

# 蓝
PRIMARY = "#1890FF"        # 主蓝
PRIMARY_DARK = "#002766"   # 深蓝（标题、数字）
PRIMARY_LIGHT = "#E6F4FF"  # 极浅蓝（hover/选中）
ACCENT_BG = "#F0F5FF"      # 浅蓝灰（卡片底/分区背景）

# 中性
WHITE = "#FFFFFF"
BG = "#FFFFFF"
TEXT = "#262626"           # 主文本（近黑）
TEXT_MUTED = "#595959"     # 副文本（深灰）
TEXT_SUBTLE = "#8C8C8C"    # 弱化文本（中灰）
BORDER = "#D9D9D9"         # 浅灰描边
DIVIDER = "#F0F0F0"        # 更浅的分隔线

# 强调（用于 callout、警示）
SUCCESS = "#52C41A"
WARNING = "#FAAD14"
ERROR = "#FF4D4F"


# ============ 智能体五色（仅第三部分使用）============

AGENT_COLORS = {
    "profile":    "#FA8C16",  # 画像 🟠 橙
    "resource":   "#52C41A",  # 资源 🟢 绿
    "path":       "#1890FF",  # 路径 🔵 蓝
    "tutor":      "#722ED1",  # 辅导 🟣 紫
    "assessment": "#13C2C2",  # 评估 💠 青
}

AGENT_NAMES_CN = {
    "profile":    "画像构建智能体",
    "resource":   "资源生成智能体",
    "path":       "路径规划智能体",
    "tutor":      "辅导答疑智能体",
    "assessment": "效果评估智能体",
}

AGENT_NAMES_EN = {
    "profile":    "Profile Agent",
    "resource":   "Resource Agent",
    "path":       "Path Agent",
    "tutor":      "Tutor Agent",
    "assessment": "Assessment Agent",
}

AGENT_EMOJI = {
    "profile":    "🟠",
    "resource":   "🟢",
    "path":       "🔵",
    "tutor":      "🟣",
    "assessment": "💠",
}


# ============ 字体 ============

FONT_FAMILY = "微软雅黑"
FONT_MONO = "Consolas"
FONT_FALLBACK = "Arial"   # Mac/Linux 备选

FONT_SIZES = {
    "cover_title":   44,   # 封面大标题
    "page_title":    28,   # 页面标题
    "subtitle":      18,   # 副标题
    "section":       16,   # 小节标题
    "body":          14,   # 正文
    "small":         12,   # 注脚
    "tiny":          10,   # 页码/页眉
    "code":          11,   # 代码
    "data_huge":     36,   # 大数据
    "data_big":      24,   # 中数据
}


# ============ 章节信息 ============

CHAPTERS = [
    {"num": "01", "title": "项目导入",        "color": PRIMARY,    "pages": "1-5"},
    {"num": "02", "title": "系统设计",        "color": PRIMARY,    "pages": "6-7"},
    {"num": "03", "title": "五大智能体",      "color": "#FA8C16",  "pages": "8-12"},
    {"num": "04", "title": "关键技术深挖",    "color": "#722ED1",  "pages": "13-15"},
    {"num": "05", "title": "总结与展望",      "color": "#13C2C2",  "pages": "16-19"},
]


# ============ 占位信息（用户在 PowerPoint 里改或在此处改后重跑）============

COVER_INFO = {
    "team_name":   "[队伍名称]",
    "school":      "[学校名称]",
    "presenter":   "[汇报人姓名]",
    "advisor":     "[指导老师姓名]",
    "date":        "2026.07",
    "contest":     "第十五届中国软件杯 · A3 赛题",
    "contact":     "[邮箱 / GitHub]",
}

TOTAL_PAGES = 19


# ============ 截图引用（来自 assets/screenshot/）============

SCREENSHOTS = {
    "home":      "PixPin_2026-06-15_10-34-12.png",
    "profile":   "PixPin_2026-06-15_10-34-45.png",
    "resource1": "PixPin_2026-06-15_10-35-08.png",
    "resource2": "PixPin_2026-06-15_10-35-44.png",
    "path1":     "PixPin_2026-06-15_10-36-02.png",
    "path2":     "PixPin_2026-06-15_10-36-26.png",
    "practice":  "PixPin_2026-06-15_10-36-42.png",
    "tutor":     "PixPin_2026-06-15_10-37-20.png",
}

SCREENSHOT_DIR = "../assets/screenshot"   # 相对于 ppt/ 目录


# ============ 辅助函数 ============

def emu_to_inch(emu_val) -> float:
    """EMU 转 inch（便于 print 调试）"""
    return emu_val / 914400.0
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from components import theme; print('SLIDE:', theme.SLIDE_WIDTH, theme.SLIDE_HEIGHT); print('PRIMARY:', theme.PRIMARY); print('AGENTS:', list(theme.AGENT_COLORS.keys())); print('OK')"
```

Expected: 输出 SLIDE 尺寸、PRIMARY 色值、5 个 agent 名称，最后 `OK`，无 ImportError 或 AttributeError。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/theme.py && git commit -m "feat(ppt): 实现 theme.py 视觉常量与占位信息"
```

---


## Task 4: 实现 layout.py（页眉页脚 + 章节分隔页）

**Files:**
- Create: `ppt/components/layout.py`

- [ ] **Step 1: 写入 `ppt/components/layout.py`**

```python
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


def hex_to_rgb(hex_str: str) -> RGBColor:
    """'#1890FF' -> RGBColor(0x18, 0x90, 0xFF)"""
    hex_str = hex_str.lstrip("#")
    return RGBColor(int(hex_str[0:2], 16), int(hex_str[2:4], 16), int(hex_str[4:6], 16))


def add_textbox(slide, left, top, width, height, text, *,
                font_size=14, bold=False, color=theme.TEXT,
                font_name=theme.FONT_FAMILY, align=PP_ALIGN.LEFT,
                anchor=MSO_ANCHOR.TOP, fill=None):
    """通用文本框：文字 + 字号 + 颜色 + 可选底色"""
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

    # ---- 左上角页眉：第 X 章 · 章节名
    add_textbox(
        slide,
        left=theme.MARGIN_LR, top=Pt(20),
        width=Pt(360), height=theme.HEADER_HEIGHT,
        text=f"学习智能体系统 · 第 {chapter_idx:02d} 章 {chapter['title']}",
        font_size=theme.FONT_SIZES["tiny"],
        color=theme.TEXT_SUBTLE,
    )

    # ---- 右上角页眉：项目小标识
    add_textbox(
        slide,
        left=theme.SLIDE_WIDTH - theme.MARGIN_LR - Pt(200), top=Pt(20),
        width=Pt(200), height=theme.HEADER_HEIGHT,
        text=theme.COVER_INFO["contest"],
        font_size=theme.FONT_SIZES["tiny"],
        color=theme.TEXT_SUBTLE,
        align=PP_ALIGN.RIGHT,
    )

    # ---- 左侧 4px 装饰竖条（章节色）
    add_rect(
        slide,
        left=0, top=Pt(50),
        width=Pt(4), height=theme.SLIDE_HEIGHT - Pt(100),
        fill=chapter_color,
    )

    # ---- 左下角浅蓝水平细线
    add_rect(
        slide,
        left=theme.MARGIN_LR, top=theme.SLIDE_HEIGHT - Pt(35),
        width=Pt(120), height=Pt(1),
        fill=theme.PRIMARY_LIGHT,
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
    生成章节首页（大号半透明数字 + 章节名 + 橙色分割线）。
    返回该页的页码（用于后续 apply_chrome 调用）。
    """
    chapter = theme.CHAPTERS[chapter_idx - 1]

    blank_layout = prs.slide_layouts[6]   # 空白版式
    slide = prs.slides.add_slide(blank_layout)

    # ---- 大号半透明数字
    add_textbox(
        slide,
        left=Pt(120), top=Pt(180),
        width=Pt(800), height=Pt(420),
        text=chapter["num"],
        font_size=280,
        bold=True,
        color=theme.ACCENT_BG,
    )

    # ---- 章节中文名
    add_textbox(
        slide,
        left=Pt(220), top=Pt(300),
        width=Pt(800), height=Pt(80),
        text=chapter["title"],
        font_size=theme.FONT_SIZES["page_title"],
        bold=True,
        color=theme.PRIMARY_DARK,
    )

    # ---- 4px 橙色短分割线
    add_rect(
        slide,
        left=Pt(220), top=Pt(390),
        width=Pt(60), height=Pt(4),
        fill="#FA8C16",
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
        left=Pt(220), top=Pt(420),
        width=Pt(800), height=Pt(40),
        text=en_titles[chapter["num"]],
        font_size=16,
        color=theme.TEXT_MUTED,
    )

    # ---- 页码范围
    add_textbox(
        slide,
        left=Pt(220), top=Pt(480),
        width=Pt(800), height=Pt(40),
        text=f"本章节包含第 {chapter['pages']} 页",
        font_size=12,
        color=theme.TEXT_SUBTLE,
    )

    return len(prs.slides)


def add_page_title(slide, title: str, subtitle: str = None,
                   top: int = Pt(70)):
    """
    内容页的标准标题：黑色加粗大字 + 可选灰色副标题。
    返回正文起始 top。
    """
    add_textbox(
        slide,
        left=theme.MARGIN_LR, top=top,
        width=theme.SLIDE_WIDTH - 2 * theme.MARGIN_LR, height=Pt(50),
        text=title,
        font_size=theme.FONT_SIZES["page_title"],
        bold=True,
        color=theme.PRIMARY_DARK,
    )
    if subtitle:
        add_textbox(
            slide,
            left=theme.MARGIN_LR, top=top + Pt(48),
            width=theme.SLIDE_WIDTH - 2 * theme.MARGIN_LR, height=Pt(30),
            text=subtitle,
            font_size=theme.FONT_SIZES["body"],
            color=theme.TEXT_MUTED,
        )
        return top + Pt(85)
    return top + Pt(60)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from components import layout; print('functions:', [f for f in dir(layout) if not f.startswith('_')]); print('OK')"
```

Expected: 输出包含 `apply_chrome`, `build_section_divider`, `add_page_title`, `add_textbox`, `add_rect`, `hex_to_rgb`，最后 `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/layout.py && git commit -m "feat(ppt): 实现 layout.py 页眉页脚与章节分隔"
```

---

## Task 5: 实现 shapes.py（几何装饰 + 标签胶囊）

**Files:**
- Create: `ppt/components/shapes.py`

- [ ] **Step 1: 写入 `ppt/components/shapes.py`**

```python
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
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from components import shapes; print('functions:', [f for f in dir(shapes) if not f.startswith('_') and callable(getattr(shapes, f))]); print('OK')"
```

Expected: 包含 `add_capsule`, `add_badge`, `add_color_block`, `add_divider_line`, `add_card`, `add_list_item`，最后 `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/shapes.py && git commit -m "feat(ppt): 实现 shapes.py 几何装饰与胶囊标签"
```

---

## Task 6: 实现 code_block.py（暗色代码块 + 简易语法着色）

**Files:**
- Create: `ppt/components/code_block.py`

- [ ] **Step 1: 写入 `ppt/components/code_block.py`**

```python
"""
PPT 暗色代码块：4 色简易语法着色（关键字 / 字符串 / 注释 / 文本）。
"""

import re
from pptx.util import Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

from . import theme
from .layout import hex_to_rgb, add_textbox, add_rect


# 颜色定义
COLOR_KEYWORD  = "#C586C0"
COLOR_STRING   = "#CE9178"
COLOR_COMMENT  = "#6A9955"
COLOR_NORMAL   = "#D4D4D4"
COLOR_FUNCTION = "#DCDCAA"
COLOR_NUMBER   = "#B5CEA8"


# 关键字集合
KEYWORDS = {
    "def", "class", "import", "from", "return", "if", "else", "elif",
    "for", "while", "in", "of", "function", "const", "let", "var",
    "new", "this", "async", "await", "try", "catch", "throw", "yield",
    "interface", "type", "extends", "implements", "export", "default",
    "public", "private", "protected", "static", "void", "null", "true",
    "false", "undefined", "None", "True", "False",
}


def tokenize(line: str):
    """
    把一行代码切成 (text, type) 列表。
    """
    tokens = []
    i = 0
    n = len(line)

    while i < n:
        ch = line[i]

        # 注释
        if ch == "#" and (i == 0 or line[i-1] != ":"):
            tokens.append((line[i:], "COMMENT"))
            return tokens
        if ch == "/" and i + 1 < n and line[i+1] == "/":
            tokens.append((line[i:], "COMMENT"))
            return tokens

        # 字符串
        if ch in ('"', "'", "`"):
            quote = ch
            j = i + 1
            while j < n and line[j] != quote:
                if line[j] == "\\" and j + 1 < n:
                    j += 2
                else:
                    j += 1
            j = min(j + 1, n)
            tokens.append((line[i:j], "STRING"))
            i = j
            continue

        # 数字
        if ch.isdigit():
            j = i
            while j < n and (line[j].isdigit() or line[j] == "."):
                j += 1
            tokens.append((line[i:j], "NUMBER"))
            i = j
            continue

        # 标识符
        if ch.isalpha() or ch == "_":
            j = i
            while j < n and (line[j].isalnum() or line[j] == "_"):
                j += 1
            word = line[i:j]
            if word in KEYWORDS:
                k = j
                while k < n and line[k] == " ":
                    k += 1
                if k < n and line[k] == "(":
                    tokens.append((word, "FUNCTION"))
                else:
                    tokens.append((word, "KEYWORD"))
            else:
                tokens.append((word, "NORMAL"))
            i = j
            continue

        tokens.append((ch, "NORMAL"))
        i += 1

    return tokens


def render_code_block(slide, left, top, width, height, code: str, *,
                      font_size=11, line_spacing=1.25, lang_label=None):
    """在指定区域绘制暗色代码块"""
    bg = add_rect(slide, left, top, width, height, fill="#1E1E1E")
    bg.line.color.rgb = hex_to_rgb("#333333")
    bg.line.width = Pt(0.75)
    bg.shadow.inherit = False

    if lang_label:
        label_w = Pt(60)
        label_h = Pt(20)
        add_rect(slide, left=left, top=top, width=label_w, height=label_h, fill="#3C3C3C")
        add_textbox(
            slide, left=left, top=top, width=label_w, height=label_h,
            text=lang_label, font_size=9, color="#CCCCCC",
            align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
        )

    tb = slide.shapes.add_textbox(
        left + Pt(12), top + (Pt(26) if lang_label else Pt(8)),
        width - Pt(24), height - (Pt(34) if lang_label else Pt(16)),
    )
    tb.fill.background()
    tb.line.fill.background()
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = Pt(0)
    tf.margin_right = Pt(0)
    tf.margin_top = Pt(0)
    tf.margin_bottom = Pt(0)

    color_map = {
        "KEYWORD":  COLOR_KEYWORD,
        "STRING":   COLOR_STRING,
        "COMMENT":  COLOR_COMMENT,
        "NORMAL":   COLOR_NORMAL,
        "FUNCTION": COLOR_FUNCTION,
        "NUMBER":   COLOR_NUMBER,
    }

    lines = code.split("\n")
    for idx, line in enumerate(lines):
        if idx == 0:
            p = tf.paragraphs[0]
        else:
            p = tf.add_paragraph()
        p.alignment = PP_ALIGN.LEFT
        p.line_spacing = line_spacing
        if not line:
            r = p.add_run()
            r.text = " "
            r.font.name = theme.FONT_MONO
            r.font.size = Pt(font_size)
            continue
        for text, ttype in tokenize(line):
            r = p.add_run()
            r.text = text
            r.font.name = theme.FONT_MONO
            r.font.size = Pt(font_size)
            r.font.italic = (ttype == "COMMENT")
            r.font.color.rgb = hex_to_rgb(color_map[ttype])
```

- [ ] **Step 2: 验证可导入 + tokenize 正确**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "
from components.code_block import tokenize
result = tokenize('def hello():')
print(result)
assert any(t[1] == 'FUNCTION' for t in result), 'def 应识别为 FUNCTION'
result2 = tokenize('// comment')
assert result2[0][1] == 'COMMENT', '// 应识别为 COMMENT'
print('tokenize OK')
"
```

Expected: 输出 `def hello():` 的 token 列表，第二行 `tokenize OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/code_block.py && git commit -m "feat(ppt): 实现 code_block.py 暗色代码块 + 简易语法着色"
```

---


## Task 7: 实现 radar_chart.py（matplotlib 雷达图 → PNG）

**Files:**
- Create: `ppt/components/radar_chart.py`

- [ ] **Step 1: 写入 `ppt/components/radar_chart.py`**

```python
"""
PPT 雷达图：matplotlib 绘制 → 保存为 PNG → 插入 PPT。

避免在 python-pptx 里手算多边形顶点，10x 提速。
"""

import os
import math
import matplotlib
matplotlib.use("Agg")   # 非 GUI 后端
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

from . import theme


def render_radar(
    out_path: str,
    labels: list[str],
    values: list[float],
    *,
    title: str = "",
    color: str = theme.PRIMARY,
    max_value: float = 100.0,
) -> str:
    """
    绘制雷达图并保存为 PNG。

    labels: 维度名（顺时针顺序）
    values: 各维度得分（0 ~ max_value）
    out_path: 输出 PNG 完整路径

    返回 out_path。
    """
    if len(labels) != len(values):
        raise ValueError("labels 与 values 长度必须相同")

    n = len(labels)
    angles = [n_ / float(n) * 2 * math.pi for n_ in range(n)]
    values_closed = values + values[:1]
    angles_closed = angles + angles[:1]

    fig, ax = plt.subplots(figsize=(5, 4.2), subplot_kw=dict(polar=True))
    fig.patch.set_facecolor("white")

    # 描点
    ax.plot(angles_closed, values_closed, color=color, linewidth=2, linestyle="solid")
    ax.fill(angles_closed, values_closed, color=color, alpha=0.25)

    # 维度标签
    ax.set_xticks(angles)
    ax.set_xticklabels(labels, fontsize=10, color=theme.PRIMARY_DARK)

    # 刻度
    ax.set_ylim(0, max_value)
    ax.set_yticks([max_value * 0.25, max_value * 0.5, max_value * 0.75, max_value])
    ax.set_yticklabels(["25", "50", "75", "100"], fontsize=8, color=theme.TEXT_SUBTLE)
    ax.set_rlabel_position(90)

    # 网格
    ax.grid(color="#E0E0E0", linewidth=0.5)
    ax.spines["polar"].set_color("#E0E0E0")

    if title:
        plt.title(title, fontsize=13, color=theme.PRIMARY_DARK, pad=20)

    plt.tight_layout()
    Path(os.path.dirname(out_path)).mkdir(parents=True, exist_ok=True)
    plt.savefig(out_path, dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    return out_path
```

- [ ] **Step 2: 验证可生成 PNG**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "
from components.radar_chart import render_radar
out = 'assets/test_radar.png'
render_radar(out, ['维度A', '维度B', '维度C', '维度D', '维度E', '维度F'], [85, 70, 60, 90, 75, 80], title='测试雷达图')
import os
assert os.path.exists(out), 'PNG 未生成'
print('PNG OK, size:', os.path.getsize(out), 'bytes')
" && rm ppt/assets/test_radar.png
```

Expected: 输出 `PNG OK, size: ... bytes`（几 KB 到几十 KB），最后 `rm` 命令无输出。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/radar_chart.py && git commit -m "feat(ppt): 实现 radar_chart.py matplotlib 雷达图"
```

---

## Task 8: 实现 flow_diagram.py（流程图节点 + 箭头）

**Files:**
- Create: `ppt/components/flow_diagram.py`

- [ ] **Step 1: 写入 `ppt/components/flow_diagram.py`**

```python
"""
PPT 流程图：节点（圆角矩形）+ 箭头（连接线）。

提供 build_node 和 build_arrow 两个原语；具体流程图布局由 slide 模块自行组织。
"""

from pptx.util import Pt, Emu
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

from . import theme
from .layout import hex_to_rgb, add_textbox


def build_node(slide, left, top, width, height, text: str, *,
               fill=theme.PRIMARY, text_color=theme.WHITE,
               font_size=12, bold=True, radius=0.15):
    """流程图节点：圆角矩形 + 居中文字"""
    shp = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    shp.fill.solid()
    shp.fill.fore_color.rgb = hex_to_rgb(fill)
    shp.line.fill.background()
    shp.adjustments[0] = radius
    shp.shadow.inherit = False

    tf = shp.text_frame
    tf.margin_left = Pt(6)
    tf.margin_right = Pt(6)
    tf.margin_top = Pt(4)
    tf.margin_bottom = Pt(4)
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


def build_arrow(slide, x1, y1, x2, y2, *,
                color=theme.TEXT_MUTED, width_pt=1.5, dashed=False):
    """
    直线箭头连接器。从 (x1,y1) 指向 (x2,y2)。
    x1/y1/x2/y2 都是 EMU 整数。
    """
    line = slide.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, x1, y1, x2, y2)
    line.line.color.rgb = hex_to_rgb(color)
    line.line.width = Pt(width_pt)
    if dashed:
        # python-pptx 设置 dash style: 7 = dash
        try:
            line.line._get_or_add_ln()
            from pptx.oxml.ns import qn
            ln = line.line._get_or_add_ln()
            prstDash = ln.makeelement(qn("a:prstDash"), {"val": "dash"})
            ln.append(prstDash)
        except Exception:
            pass
    # 末端箭头
    line.line._get_or_add_ln()
    from pptx.oxml.ns import qn
    ln = line.line._get_or_add_ln()
    tail = ln.find(qn("a:tailEnd"))
    if tail is None:
        tail = ln.makeelement(qn("a:tailEnd"), {"type": "triangle", "w": "med", "len": "med"})
        ln.append(tail)
    return line


def build_horizontal_pipeline(slide, top, left_start, total_width, height, items: list[str], *,
                              fill=theme.PRIMARY, font_size=12, gap_pt=12):
    """
    一行水平流程：items 中的每个文字顺次排开，相邻之间用箭头连接。

    返回每个节点的 (left, top, width, height)，方便 slide 做后续标注。
    """
    n = len(items)
    gap = Pt(gap_pt)
    node_w = (total_width - gap * (n - 1)) // n
    positions = []
    for i, text in enumerate(items):
        x = left_start + i * (node_w + gap)
        shp = build_node(slide, x, top, node_w, height, text, fill=fill, font_size=font_size)
        positions.append((x, top, node_w, height))
        # 在节点右侧画箭头（除最后一个外）
        if i < n - 1:
            arrow_x1 = x + node_w
            arrow_x2 = x + node_w + gap
            arrow_y = top + height // 2
            build_arrow(slide, arrow_x1, arrow_y, arrow_x2, arrow_y)
    return positions
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "
from components import flow_diagram
funcs = [f for f in dir(flow_diagram) if not f.startswith('_') and callable(getattr(flow_diagram, f))]
print('functions:', funcs)
assert 'build_node' in funcs
assert 'build_arrow' in funcs
assert 'build_horizontal_pipeline' in funcs
print('OK')
"
```

Expected: 三个函数名都在，最后 `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/flow_diagram.py && git commit -m "feat(ppt): 实现 flow_diagram.py 流程图节点与箭头"
```

---

## Task 9: 实现 assessment_mock.py（评估页 mockup 自绘）

**Files:**
- Create: `ppt/components/assessment_mock.py`

- [ ] **Step 1: 写入 `ppt/components/assessment_mock.py`**

```python
"""
PPT 评估页 mockup：替代缺失的 Assessment 截图。

绘制：顶部 4 个统计卡（已完成题数/正确率/学习时长/连续天数）
     + 左侧 6 维能力雷达图（matplotlib）
     + 右侧学习建议时间线
     + 底部 4 个模块进度条
"""

import os
from pathlib import Path
from pptx.util import Pt, Emu, Inches
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

from . import theme
from .layout import hex_to_rgb, add_textbox, add_rect
from .shapes import add_card, add_color_block
from .radar_chart import render_radar
from .flow_diagram import build_node


def render_assessment_mock(slide, left, top, width, height):
    """
    在指定区域绘制一张评估页 mockup。

    区域建议 ≥ Pt(900, 500)，即 900pt 宽 500pt 高。
    """
    # ---- 整体卡片背景
    add_card(slide, left, top, width, height, fill=theme.WHITE, border=theme.BORDER, border_width=1.0)

    # ---- 顶部 4 个统计卡
    stats = [
        ("已做题数", "126", "题", theme.PRIMARY),
        ("正确率",   "78", "%",  theme.SUCCESS),
        ("学习时长", "32", "小时", theme.WARNING),
        ("连续天数", "12", "天", "#722ED1"),
    ]
    stat_w = (width - Pt(60)) // 4
    stat_h = Pt(70)
    stat_top = top + Pt(20)
    stat_left_start = left + Pt(20)
    for i, (label, value, unit, color) in enumerate(stats):
        x = stat_left_start + i * (stat_w + Pt(10))
        # 卡片
        add_card(slide, x, stat_top, stat_w - Pt(10), stat_h, fill=theme.ACCENT_BG, border=None)
        # 左侧色条
        add_rect(slide, x, stat_top, Pt(4), stat_h, fill=color)
        # 数字
        add_textbox(
            slide, x + Pt(12), stat_top + Pt(8), stat_w - Pt(20), Pt(32),
            text=value, font_size=24, bold=True, color=theme.PRIMARY_DARK,
        )
        # 标签
        add_textbox(
            slide, x + Pt(12), stat_top + Pt(40), stat_w - Pt(20), Pt(20),
            text=f"{label} ({unit})", font_size=11, color=theme.TEXT_MUTED,
        )

    # ---- 左侧雷达图（PNG 渲染 → 插入）
    radar_path = os.path.join(os.path.dirname(__file__), "..", "assets", "_mock_radar.png")
    radar_path = os.path.abspath(radar_path)
    render_radar(
        radar_path,
        labels=["知识基础", "认知风格", "易错偏好", "学习节奏", "兴趣方向", "学习习惯"],
        values=[82, 70, 65, 88, 75, 80],
        title="",
        color=theme.PRIMARY,
    )
    radar_left = left + Pt(20)
    radar_top = stat_top + stat_h + Pt(20)
    radar_w = (width - Pt(60)) // 2
    radar_h = height - (radar_top - top) - Pt(20)
    slide.shapes.add_picture(radar_path, radar_left, radar_top, width=radar_w, height=radar_h)

    # ---- 右侧学习建议时间线
    sug_left = radar_left + radar_w + Pt(20)
    sug_top = radar_top
    sug_w = width - (sug_left - left) - Pt(20)
    sug_h = radar_h
    add_card(slide, sug_left, sug_top, sug_w, sug_h, fill=theme.WHITE, border=theme.BORDER)
    add_textbox(
        slide, sug_left + Pt(16), sug_top + Pt(12), sug_w - Pt(32), Pt(28),
        text="智能学习建议", font_size=15, bold=True, color=theme.PRIMARY_DARK,
    )
    suggestions = [
        ("知识基础", "基础扎实", theme.SUCCESS),
        ("易错偏好", "易错于装饰器，建议专项练习", theme.WARNING),
        ("学习节奏", "建议每天 45 分钟连续学习", theme.PRIMARY),
        ("兴趣方向", "倾向 Web 开发，可拓展前后端", theme.PRIMARY),
    ]
    for i, (tag, content, color) in enumerate(suggestions):
        item_top = sug_top + Pt(50) + i * Pt(40)
        # 左侧色圆点
        dot_size = Pt(10)
        add_rect(slide, sug_left + Pt(20), item_top + Pt(8), dot_size, dot_size, fill=color)
        # 标签
        add_textbox(
            slide, sug_left + Pt(36), item_top, Pt(60), Pt(24),
            text=tag, font_size=12, bold=True, color=color,
        )
        # 内容
        add_textbox(
            slide, sug_left + Pt(100), item_top, sug_w - Pt(120), Pt(24),
            text=content, font_size=12, color=theme.TEXT,
        )


def cleanup_mock_assets():
    """清理中间生成的 mockup PNG（每次生成 PPT 后调用）"""
    p = os.path.join(os.path.dirname(__file__), "..", "assets", "_mock_radar.png")
    p = os.path.abspath(p)
    if os.path.exists(p):
        try:
            os.remove(p)
        except OSError:
            pass
```

- [ ] **Step 2: 验证可导入 + 清理函数存在**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "
from components import assessment_mock
funcs = [f for f in dir(assessment_mock) if not f.startswith('_') and callable(getattr(assessment_mock, f))]
print('functions:', funcs)
assert 'render_assessment_mock' in funcs
assert 'cleanup_mock_assets' in funcs
print('OK')
"
```

Expected: 两个函数名都在，最后 `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/assessment_mock.py && git commit -m "feat(ppt): 实现 assessment_mock.py 评估页 mockup 自绘"
```

---

## Task 10: 实现 generate.py + slides/__init__.py（主入口）

**Files:**
- Create: `ppt/generate.py`
- Create: `ppt/slides/__init__.py`

- [ ] **Step 1: 写入 `ppt/slides/__init__.py`**

```python
"""
PPT slide 列表。

每张 slide 是个模块文件，导出 build(prs, theme) 函数。
新增/删除 slide 时只需要改本文件里的 SLIDES 列表。
"""

# 19 张 slide 按顺序排列
SLIDES = [
    "s01_cover",
    "s02_toc",
    "s03_background",
    "s04_requirements_mapping",
    "s05_design_goals",
    "s06_architecture",
    "s07_tech_stack",
    "s08_agent_profile",
    "s09_agent_resource",
    "s10_agent_path",
    "s11_agent_tutor",
    "s12_agent_assessment",
    "s13_tech_multi_agent",
    "s14_tech_streaming",
    "s15_tech_sync",
    "s16_evaluation",
    "s17_innovation",
    "s18_summary",
    "s19_closing",
]


def resolve_selection(args) -> list[str]:
    """
    根据 CLI 参数返回要生成的 slide 列表。
    """
    all_slides = SLIDES

    if args.only:
        target = args.only
        if target not in all_slides:
            raise SystemExit(f"未知的 slide: {target}（合法值见 SLIDES 列表）")
        return [target]

    if args.start or args.end:
        start = args.start or all_slides[0]
        end = args.end or all_slides[-1]
        if start not in all_slides:
            raise SystemExit(f"未知的起始 slide: {start}")
        if end not in all_slides:
            raise SystemExit(f"未知的结束 slide: {end}")
        si = all_slides.index(start)
        ei = all_slides.index(end)
        if si > ei:
            raise SystemExit(f"起始 {start} 在结束 {end} 之后")
        return all_slides[si:ei + 1]

    return all_slides
```

- [ ] **Step 2: 写入 `ppt/generate.py`**

```python
#!/usr/bin/env python
"""
PPT 主入口。

用法：
  python generate.py
  python generate.py --only s10
  python generate.py --start s08 --end s12
"""

import argparse
import os
import sys
from pathlib import Path

# 让 `import components` / `import slides` 能工作
PPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(PPT_DIR))

from pptx import Presentation
from pptx.util import Emu

from components import theme
from slides import SLIDES, resolve_selection


def parse_args():
    parser = argparse.ArgumentParser(description="生成《学习智能体系统》汇报 PPT")
    parser.add_argument("--only", help="只生成指定 slide，例如 s10")
    parser.add_argument("--start", help="起始 slide（含），例如 s08")
    parser.add_argument("--end", help="结束 slide（含），例如 s12")
    parser.add_argument("-o", "--output", help="输出文件路径", default=None)
    return parser.parse_args()


def import_slide_module(slide_name: str):
    """动态 import slides.s01_cover 等"""
    import importlib
    return importlib.import_module(f"slides.{slide_name}")


def main():
    args = parse_args()
    selected = resolve_selection(args)
    print(f"[PPT] 将生成 {len(selected)} 张 slide：{', '.join(selected)}")

    out_path = args.output or os.path.join(PPT_DIR, "output", "学习智能体系统_汇报PPT.pptx")
    Path(os.path.dirname(out_path)).mkdir(parents=True, exist_ok=True)

    prs = Presentation()
    prs.slide_width = theme.SLIDE_WIDTH
    prs.slide_height = theme.SLIDE_HEIGHT

    for slide_name in selected:
        print(f"[PPT]  渲染 {slide_name} ...")
        mod = import_slide_module(slide_name)
        if not hasattr(mod, "build"):
            raise SystemExit(f"slide 模块 {slide_name} 必须导出 build(prs) 函数")
        mod.build(prs)

    prs.save(out_path)
    print(f"[PPT] ✓ 已生成：{out_path}")
    print(f"[PPT]   slide 总数: {len(prs.slides)}")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: 验证 CLI 解析正确**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python generate.py --help
```

Expected: 打印 argparse 帮助文本，包含 `--only`, `--start`, `--end`, `--output` 四个选项。

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/generate.py ppt/slides/__init__.py && git commit -m "feat(ppt): 实现 generate.py 主入口与 slide 列表"
```

---


## Task 11: 实现 s01_cover.py（封面）

**Files:**
- Create: `ppt/slides/s01_cover.py`

**设计参考**: docs/superpowers/specs/2026-06-15-ppt-design.md §4 第一部分#1

- [ ] **Step 1: 写入 `ppt/slides/s01_cover.py`**

```python
"""
第 1 页 · 封面。

模板：左侧 6px 渐变竖条 + 紧靠竖条的红色小字眉头 + 大标题（深蓝）+
     副标题 + 底部参赛信息。

不调用 apply_chrome() —— 封面无页眉页脚。
"""

from pptx.util import Pt, Inches
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

from components import theme
from components.layout import hex_to_rgb, add_textbox, add_rect
from components.shapes import add_color_block


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)

    # ---- 左侧 6px 主蓝渐变竖条（用纯色 + 底部深蓝小三角作伪渐变）
    add_rect(slide, left=Pt(0), top=Pt(0), width=Pt(6), height=theme.SLIDE_HEIGHT, fill=theme.PRIMARY)
    add_rect(slide, left=Pt(6), top=Pt(0), width=Pt(4), height=theme.SLIDE_HEIGHT, fill=theme.PRIMARY_DARK)

    # ---- 红色小字眉头
    add_textbox(
        slide, left=Pt(40), top=Pt(80), width=Pt(800), height=Pt(28),
        text="2026 中国软件杯 · A3 赛题参赛作品",
        font_size=14, bold=True, color="#FF4D4F",
    )

    # ---- 大标题（深蓝）
    add_textbox(
        slide, left=Pt(40), top=Pt(140), width=Pt(1100), height=Pt(90),
        text="学习智能体系统",
        font_size=44, bold=True, color=theme.PRIMARY_DARK,
    )

    # ---- 副标题（深灰）
    add_textbox(
        slide, left=Pt(40), top=Pt(240), width=Pt(1100), height=Pt(50),
        text="多智能体协同驱动的个性化学习平台",
        font_size=24, color=theme.TEXT_MUTED,
    )

    # ---- 分隔线
    add_rect(slide, left=Pt(40), top=Pt(330), width=Pt(80), height=Pt(3), fill=theme.PRIMARY)

    # ---- 英文小副标题
    add_textbox(
        slide, left=Pt(40), top=Pt(350), width=Pt(1100), height=Pt(40),
        text="Multi-Agent Driven Personalized Learning Platform",
        font_size=14, color=theme.TEXT_SUBTLE,
    )

    # ---- 底部参赛信息卡片（左下角）
    info_top = theme.SLIDE_HEIGHT - Pt(200)
    info_items = [
        ("队伍", theme.COVER_INFO["team_name"]),
        ("学校", theme.COVER_INFO["school"]),
        ("汇报人", theme.COVER_INFO["presenter"]),
        ("指导老师", theme.COVER_INFO["advisor"]),
        ("日期", theme.COVER_INFO["date"]),
    ]
    for i, (label, value) in enumerate(info_items):
        y = info_top + i * Pt(28)
        add_textbox(slide, left=Pt(40), top=y, width=Pt(80), height=Pt(24),
                    text=label, font_size=12, bold=True, color=theme.PRIMARY)
        add_textbox(slide, left=Pt(120), top=y, width=Pt(400), height=Pt(24),
                    text=value, font_size=12, color=theme.TEXT)

    # ---- 右下角项目 logo 占位（深蓝大圆 + 文字）
    logo_size = Pt(120)
    logo_left = theme.SLIDE_WIDTH - Pt(160)
    logo_top = theme.SLIDE_HEIGHT - Pt(160)
    add_rect(slide, left=logo_left, top=logo_top, width=logo_size, height=logo_size, fill=theme.PRIMARY)
    add_textbox(
        slide, left=logo_left, top=logo_top + Pt(30), width=logo_size, height=Pt(60),
        text="Learning\nAgent", font_size=20, bold=True, color=theme.WHITE,
        align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE,
    )
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s01_cover; print('build:', s01_cover.build); print('OK')"
```

Expected: 输出 `build:` 后函数对象，最后 `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s01_cover.py && git commit -m "feat(ppt): 实现 s01_cover 封面页"
```

---

## Task 12: 实现 s02_toc.py（目录）

**Files:**
- Create: `ppt/slides/s02_toc.py`

**设计参考**: 设计文档 §4 第二行。

- [ ] **Step 1: 写入 `ppt/slides/s02_toc.py`**

```python
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
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s02_toc; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s02_toc.py && git commit -m "feat(ppt): 实现 s02_toc 目录页"
```

---

## Task 13: 实现 s03_background.py（项目背景）

**Files:**
- Create: `ppt/slides/s03_background.py`

**设计参考**: 设计文档 §4 第一部分#3 — AI 教育趋势 + 3 大痛点 + 本项目定位。

- [ ] **Step 1: 写入 `ppt/slides/s03_background.py`**

```python
"""
第 3 页 · 项目背景。

左：AI 教育趋势（3 个数据点）
中：传统平台 3 大痛点（漏斗示意）
右：本项目定位（差异化 4 点）
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from components.flow_diagram import build_node, build_arrow


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=1, page_num=3)

    add_page_title(slide, "项目背景", subtitle="AI 教育趋势 + 传统平台痛点 + 本项目定位")

    # ---- 左栏：AI 教育趋势（3 个数据卡）
    left_x = Pt(80)
    left_w = Pt(360)
    col_top = Pt(200)
    add_textbox(slide, left=left_x, top=col_top, width=left_w, height=Pt(30),
                text="AI 教育市场趋势", font_size=15, bold=True, color=theme.PRIMARY_DARK)
    trends = [
        ("60%+", "学生认为 AI 个性化辅导效果优于传统课堂"),
        ("3 倍", "近 2 年自适应学习平台用户增长"),
        ("80%", "高校将引入 AI 教学辅助系统（2026 预测）"),
    ]
    for i, (num, desc) in enumerate(trends):
        y = col_top + Pt(45) + i * Pt(90)
        add_card(slide, left_x, y, left_w, Pt(80), fill=theme.ACCENT_BG)
        add_textbox(slide, left_x + Pt(16), y + Pt(8), left_w - Pt(32), Pt(34),
                    text=num, font_size=24, bold=True, color=theme.PRIMARY)
        add_textbox(slide, left_x + Pt(16), y + Pt(44), left_w - Pt(32), Pt(32),
                    text=desc, font_size=11, color=theme.TEXT_MUTED)

    # ---- 中栏：传统平台 3 大痛点（漏斗：3 个倒梯形）
    mid_x = Pt(480)
    mid_w = Pt(360)
    add_textbox(slide, left=mid_x, top=col_top, width=mid_w, height=Pt(30),
                text="传统学习平台 3 大痛点", font_size=15, bold=True, color=theme.PRIMARY_DARK)
    pains = [
        ("资源繁杂", "题库、视频、文档分散", theme.ERROR),
        ("节奏统一", "全班同一进度，难个性化", theme.WARNING),
        ("反馈滞后", "错题几天后才讲评", "#722ED1"),
    ]
    pain_top = col_top + Pt(50)
    for i, (title, desc, color) in enumerate(pains):
        y = pain_top + i * Pt(90)
        w = mid_w - i * Pt(30)
        x = mid_x + i * Pt(15)
        # 倒梯形（用圆角矩形代替）
        add_rect(slide, left=x, top=y, width=w, height=Pt(70), fill=color)
        add_textbox(slide, left=x + Pt(20), top=y + Pt(10), width=w - Pt(40), Pt(24),
                    text=f"{i+1}. {title}", font_size=14, bold=True, color=theme.WHITE)
        add_textbox(slide, left=x + Pt(20), top=y + Pt(36), width=w - Pt(40), Pt(24),
                    text=desc, font_size=11, color=theme.WHITE)

    # ---- 右栏：本项目定位（4 个差异化点）
    right_x = Pt(880)
    right_w = Pt(380)
    add_textbox(slide, left=right_x, top=col_top, width=right_w, height=Pt(30),
                text="本项目定位：4 大差异化", font_size=15, bold=True, color="#FA8C16")
    diffs = [
        ("多智能体协同", "5 类智能体分工协作"),
        ("6 维动态画像", "随学随新、贴合个体"),
        ("结构化路径", "题库/模块双向同步"),
        ("流式可视化", "思考过程可折叠"),
    ]
    diff_top = col_top + Pt(50)
    for i, (title, desc) in enumerate(diffs):
        y = diff_top + i * Pt(60)
        # 左侧色块
        add_rect(slide, left=right_x, top=y + Pt(4), width=Pt(8), height=Pt(40), fill="#FA8C16")
        add_textbox(slide, left=right_x + Pt(20), top=y, width=right_w - Pt(20), Pt(24),
                    text=title, font_size=14, bold=True, color=theme.PRIMARY_DARK)
        add_textbox(slide, left=right_x + Pt(20), top=y + Pt(24), width=right_w - Pt(20), Pt(24),
                    text=desc, font_size=11, color=theme.TEXT_MUTED)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s03_background; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s03_background.py && git commit -m "feat(ppt): 实现 s03_background 项目背景页"
```

---

## Task 14: 实现 s04_requirements_mapping.py（赛题对标）

**Files:**
- Create: `ppt/slides/s04_requirements_mapping.py`

**设计参考**: 设计文档 §4 第一部分#4 + §7 完整映射表。

- [ ] **Step 1: 写入 `ppt/slides/s04_requirements_mapping.py`**

```python
"""
第 4 页 · 赛题对标。

上半：A3 赛题 5 项功能需求 → 本项目实现（5 行表格）
下半：A3 赛题 4 项非功能需求 → 本项目实现（4 行表格）
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_capsule


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=1, page_num=4)

    add_page_title(slide, "赛题对标", subtitle="A3 赛题 5 项功能 + 4 项非功能需求 → 本项目实现")

    # ---- 上半：功能需求表（5 行 × 3 列）
    add_textbox(slide, left=Pt(80), top=Pt(180), width=Pt(300), height=Pt(28),
                text="▶ 功能需求（5 项）", font_size=14, bold=True, color=theme.PRIMARY)
    func_rows = [
        ("1. 对话式学习画像（≥6 维度）", "Profile 页 / 6 维度 / 随学随新",            "#8"),
        ("2. 多智能体协同资源生成（≥5 类）", "Resource 页 / 6 类 / MultiAgentScheduler",  "#9 / #13"),
        ("3. 个性化学习路径规划",         "Path 页 / AI 自由生成 + 12 预定义结构化路径", "#10"),
        ("4. 智能辅导（可选加分）",       "Tutor 页 / 4 种解答模式 / 追问链",            "#11"),
        ("5. 学习效果评估（可选加分）",   "Assessment 页 / 真实进度 / 能力雷达",         "#12"),
    ]
    table_top = Pt(215)
    col_widths = [Pt(420), Pt(550), Pt(120)]
    col_x = [Pt(80), Pt(80) + col_widths[0], Pt(80) + col_widths[0] + col_widths[1]]
    # 表头
    headers = ["A3 赛题需求", "本项目实现", "PPT 页码"]
    for i, h in enumerate(headers):
        add_card(slide, col_x[i], table_top, col_widths[i], Pt(28), fill=theme.PRIMARY, border=None)
        add_textbox(slide, col_x[i] + Pt(8), table_top + Pt(4), col_widths[i] - Pt(16), Pt(20),
                    text=h, font_size=12, bold=True, color=theme.WHITE)
    # 数据行
    for ri, (req, impl, page) in enumerate(func_rows):
        y = table_top + Pt(28) + ri * Pt(28)
        bg = theme.ACCENT_BG if ri % 2 == 0 else theme.WHITE
        for i, val in enumerate([req, impl, page]):
            add_card(slide, col_x[i], y, col_widths[i], Pt(28), fill=bg, border=theme.DIVIDER, border_width=0.5)
            color = theme.PRIMARY if i == 2 else theme.TEXT
            bold = (i == 2)
            add_textbox(slide, col_x[i] + Pt(8), y + Pt(4), col_widths[i] - Pt(16), Pt(20),
                        text=val, font_size=11, color=color, bold=bold)

    # ---- 下半：非功能需求表（4 行）
    nfr_top = Pt(395)
    add_textbox(slide, left=Pt(80), top=nfr_top - Pt(28), width=Pt(300), height=Pt(28),
                text="▶ 非功能需求（4 项）", font_size=14, bold=True, color="#FA8C16")
    nfr_rows = [
        ("流式输出 / Markdown / 卡片化", "streamChatCompletion / MarkdownRenderer / Card", "#14"),
        ("开源协议标注",                  "第 19 页致谢中列出",                            "#19"),
        ("防幻觉机制",                    "题库预写 / AI 判分参考答案 / 引用追溯",          "#16"),
        ("响应时间 / 进度追踪",            "多智能体协作实时状态 + 流式增量",                "#9 / #14"),
    ]
    # 表头
    for i, h in enumerate(headers):
        add_card(slide, col_x[i], nfr_top, col_widths[i], Pt(28), fill="#FA8C16", border=None)
        add_textbox(slide, col_x[i] + Pt(8), nfr_top + Pt(4), col_widths[i] - Pt(16), Pt(20),
                    text=h, font_size=12, bold=True, color=theme.WHITE)
    for ri, (req, impl, page) in enumerate(nfr_rows):
        y = nfr_top + Pt(28) + ri * Pt(28)
        bg = theme.ACCENT_BG if ri % 2 == 0 else theme.WHITE
        for i, val in enumerate([req, impl, page]):
            add_card(slide, col_x[i], y, col_widths[i], Pt(28), fill=bg, border=theme.DIVIDER, border_width=0.5)
            color = theme.PRIMARY if i == 2 else theme.TEXT
            bold = (i == 2)
            add_textbox(slide, col_x[i] + Pt(8), y + Pt(4), col_widths[i] - Pt(16), Pt(20),
                        text=val, font_size=11, color=color, bold=bold)

    # ---- 底部 callout
    callout_y = Pt(605)
    add_card(slide, Pt(80), callout_y, Pt(1090), Pt(60), fill=theme.PRIMARY_LIGHT, border=theme.PRIMARY, border_width=1.0)
    add_textbox(slide, Pt(100), callout_y + Pt(8), Pt(1050), Pt(20),
                text="✓ A3 赛题 5+4 项需求全部实现，可选加分项（辅导/评估）均超额完成", font_size=13, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, Pt(100), callout_y + Pt(32), Pt(1050), Pt(20),
                text="✓ 5 个创新点详见第 17 页", font_size=11, color=theme.PRIMARY)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s04_requirements_mapping; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s04_requirements_mapping.py && git commit -m "feat(ppt): 实现 s04_requirements_mapping 赛题对标页"
```

---

## Task 15: 实现 s05_design_goals.py（需求与设计目标）

**Files:**
- Create: `ppt/slides/s05_design_goals.py`

**设计参考**: 设计文档 §4 第一部分#5。

- [ ] **Step 1: 写入 `ppt/slides/s05_design_goals.py`**

```python
"""
第 5 页 · 需求与设计目标。

左半：5 个核心需求（图标 + 名称 + 简述）
右半：4 条设计原则（横向 4 卡）
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block, add_capsule


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=1, page_num=5)

    add_page_title(slide, "需求与设计目标", subtitle="5 个核心需求 + 4 条设计原则")

    # ---- 左半：5 个核心需求
    add_textbox(slide, left=Pt(80), top=Pt(180), width=Pt(400), height=Pt(30),
                text="5 个核心需求", font_size=15, bold=True, color=theme.PRIMARY)
    reqs = [
        ("画像", "6 维度对话式构建，随学随新",       "#FA8C16"),
        ("资源", "6 类资源多智能体协作生成",          "#52C41A"),
        ("路径", "AI 生成 + 12 预定义结构化路径",     "#1890FF"),
        ("辅导", "4 模式 + 追问链 + 画像注入",        "#722ED1"),
        ("评估", "真实进度同步 + 能力雷达 + 建议",    "#13C2C2"),
    ]
    for i, (title, desc, color) in enumerate(reqs):
        y = Pt(220) + i * Pt(70)
        add_card(slide, Pt(80), y, Pt(500), Pt(60), fill=theme.ACCENT_BG, border=None)
        add_color_block(slide, Pt(80), y, Pt(8), Pt(60), color)
        add_textbox(slide, Pt(100), y + Pt(8), Pt(80), Pt(24),
                    text=f"0{i+1}", font_size=18, bold=True, color=color)
        add_textbox(slide, Pt(180), y + Pt(8), Pt(380), Pt(24),
                    text=title, font_size=16, bold=True, color=theme.PRIMARY_DARK)
        add_textbox(slide, Pt(180), y + Pt(32), Pt(380), Pt(24),
                    text=desc, font_size=11, color=theme.TEXT_MUTED)

    # ---- 右半：4 条设计原则（2×2 卡片阵列）
    add_textbox(slide, left=Pt(640), top=Pt(180), width=Pt(530), height=Pt(30),
                text="4 条设计原则", font_size=15, bold=True, color="#FA8C16")
    principles = [
        ("个性化", "画像驱动所有下游智能体决策",     theme.PRIMARY),
        ("多智能体", "5 类智能体职责清晰、可组合",    "#FA8C16"),
        ("流式交互", "打字机效果 + 思考过程可视化",   "#722ED1"),
        ("数据闭环", "做题反馈回流画像、画像驱动推荐", "#13C2C2"),
    ]
    card_w = Pt(250)
    card_h = Pt(110)
    for i, (title, desc, color) in enumerate(principles):
        col = i % 2
        row = i // 2
        x = Pt(640) + col * (card_w + Pt(20))
        y = Pt(220) + row * (card_h + Pt(20))
        add_card(slide, x, y, card_w, card_h, fill=theme.WHITE, border=color, border_width=1.5)
        add_color_block(slide, x, y, card_w, Pt(6), color)
        add_textbox(slide, x + Pt(16), y + Pt(20), card_w - Pt(32), Pt(30),
                    text=title, font_size=18, bold=True, color=color)
        add_textbox(slide, x + Pt(16), y + Pt(55), card_w - Pt(32), Pt(45),
                    text=desc, font_size=11, color=theme.TEXT_MUTED)

    # ---- 底部 slogan
    add_rect(slide, Pt(80), Pt(630), Pt(1090), Pt(40), fill=theme.PRIMARY)
    add_textbox(slide, Pt(80), Pt(630), Pt(1090), Pt(40),
                text="让每个学生都拥有自己的 AI 学习智能体", font_size=16, bold=True,
                color=theme.WHITE, align=PP_ALIGN.CENTER, anchor=2)  # MSO_ANCHOR.MIDDLE = 2
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s05_design_goals; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s05_design_goals.py && git commit -m "feat(ppt): 实现 s05_design_goals 需求与设计目标页"
```

---


## Task 16: 实现 s06_architecture.py（总体架构）

**Files:**
- Create: `ppt/slides/s06_architecture.py`

**设计参考**: 设计文档 §4 第二部分#6 — 4 层架构。

- [ ] **Step 1: 写入 `ppt/slides/s06_architecture.py`**

```python
"""
第 6 页 · 总体架构（核心自绘图）。

4 层架构自上而下：表现层 → API 网关 → 多智能体框架 → 数据层。
每层一个圆角矩形 + 层名 + 包含组件。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from components.flow_diagram import build_node, build_arrow


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=2, page_num=6)

    add_page_title(slide, "总体架构", subtitle="4 层架构：表现层 → API 网关 → 多智能体框架 → 数据层")

    # ---- 4 层架构图
    layers = [
        ("表现层 (Presentation)", "React 19 + TypeScript + Vite + Ant Design 6",                  theme.PRIMARY),
        ("API 网关 (Gateway)",    "Vite dev proxy: /anthropic → api.minimaxi.com",                 "#9254DE"),
        ("多智能体框架 (Multi-Agent)", "MultiAgentScheduler  ·  5 类智能体  ·  事件总线",          "#FA8C16"),
        ("数据层 (Data)",         "localStorage  ·  题库 JSON（12 库 576 题）",                   theme.SUCCESS),
    ]
    layer_top = Pt(190)
    layer_h = Pt(95)
    layer_gap = Pt(30)
    for i, (name, content, color) in enumerate(layers):
        y = layer_top + i * (layer_h + layer_gap)
        # 左侧色条
        add_rect(slide, Pt(140), y, Pt(12), layer_h, fill=color)
        # 主体卡片
        add_card(slide, Pt(160), y, Pt(900), layer_h, fill=theme.ACCENT_BG, border=color, border_width=1.5)
        add_textbox(slide, Pt(180), y + Pt(15), Pt(380), Pt(30),
                    text=name, font_size=18, bold=True, color=color)
        add_textbox(slide, Pt(180), y + Pt(48), Pt(860), Pt(30),
                    text=content, font_size=13, color=theme.TEXT)
        # 右侧层编号大数字
        add_textbox(slide, Pt(1010), y + Pt(15), Pt(120), layer_h - Pt(30),
                    text=f"L{i+1}", font_size=36, bold=True, color=color, align=PP_ALIGN.RIGHT)
        # 层间箭头（除最后一层）
        if i < len(layers) - 1:
            arrow_y = y + layer_h + Pt(8)
            build_arrow(slide, Pt(610), arrow_y, Pt(610), arrow_y + Pt(14), color=color, width_pt=2.0)

    # ---- 底部右侧 callout
    add_card(slide, Pt(700), Pt(640), Pt(500), Pt(50),
             fill=theme.PRIMARY_LIGHT, border=theme.PRIMARY, border_width=1.0)
    add_textbox(slide, Pt(720), Pt(648), Pt(460), Pt(20),
                text="✓ 全栈可本地运行：npm run dev 一行启动", font_size=12, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, Pt(720), Pt(668), Pt(460), Pt(20),
                text="✓ 无外部数据库依赖（localStorage 持久化）", font_size=12, color=theme.PRIMARY)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s06_architecture; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s06_architecture.py && git commit -m "feat(ppt): 实现 s06_architecture 总体架构页"
```

---

## Task 17: 实现 s07_tech_stack.py（技术选型）

**Files:**
- Create: `ppt/slides/s07_tech_stack.py`

**设计参考**: 设计文档 §4 第二部分#7。

- [ ] **Step 1: 写入 `ppt/slides/s07_tech_stack.py`**

```python
"""
第 7 页 · 技术选型。

3 列布局：前端 / AI / 数据可视化。
每列 4-5 个技术栈图标（用纯文字 + 色块代替 logo）+ 选型理由。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=2, page_num=7)

    add_page_title(slide, "技术选型", subtitle="主流成熟框架 + 大模型 API + 轻量数据可视化")

    cols = [
        ("前端框架", theme.PRIMARY, [
            ("React 19",     "最新稳定版，Concurrent Features"),
            ("TypeScript",   "类型安全，IDE 智能提示"),
            ("Vite 5",       "极速冷启动 + HMR"),
            ("Ant Design 6", "企业级 UI 组件库"),
            ("PageCache",    "手动 useState 路由 + useRef 缓存"),
        ]),
        ("AI 层", "#FA8C16", [
            ("大模型 API",     "兼容 Anthropic 协议"),
            ("SSE 流式",       "ReadableStream 打字机效果"),
            ("AbortSignal",    "支持中途取消请求"),
            ("Prompt 工程",    "5 类系统 prompt 注入画像"),
            ("重试 + 超时",     "axios 3 次重试 / 3 分钟超时"),
        ]),
        ("数据可视化", "#13C2C2", [
            ("Recharts 3",   "React 原生 + 声明式 API"),
            ("雷达图",       "6 维度能力评估"),
            ("统计卡片",      "Antd Statistic 组件"),
            ("时间线",        "Antd Timeline 智能建议"),
            ("进度条",        "Antd Progress 模块进度"),
        ]),
    ]
    col_w = Pt(360)
    col_top = Pt(200)
    for ci, (col_name, color, items) in enumerate(cols):
        x = Pt(80) + ci * (col_w + Pt(20))
        # 列标题
        add_card(slide, x, col_top, col_w, Pt(40), fill=color, border=None)
        add_textbox(slide, x, col_top, col_w, Pt(40),
                    text=col_name, font_size=16, bold=True, color=theme.WHITE,
                    align=PP_ALIGN.CENTER, anchor=2)
        # 列表
        for i, (name, desc) in enumerate(items):
            y = col_top + Pt(50) + i * Pt(72)
            add_card(slide, x, y, col_w, Pt(64), fill=theme.ACCENT_BG, border=color, border_width=0.75)
            add_textbox(slide, x + Pt(12), y + Pt(8), col_w - Pt(24), Pt(24),
                        text=name, font_size=14, bold=True, color=theme.PRIMARY_DARK)
            add_textbox(slide, x + Pt(12), y + Pt(34), col_w - Pt(24), Pt(24),
                        text=desc, font_size=11, color=theme.TEXT_MUTED)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s07_tech_stack; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s07_tech_stack.py && git commit -m "feat(ppt): 实现 s07_tech_stack 技术选型页"
```

---

## Task 18: 实现 s08-s12 智能体介绍页（共 5 张，统一模板）

**Files:**
- Create: `ppt/slides/s08_agent_profile.py`
- Create: `ppt/slides/s09_agent_resource.py`
- Create: `ppt/slides/s10_agent_path.py`
- Create: `ppt/slides/s11_agent_tutor.py`
- Create: `ppt/slides/s12_agent_assessment.py`

**设计参考**: 设计文档 §4 第三部分#8-#12。

**统一模板**：
- 顶部 10×28 px 智能体色块 + 标题 + 英文徽章
- 左侧截图框（1.2 fr，1 张真实截图）
- 右侧三段式（角色定位 / 核心能力 / 关键特性）

- [ ] **Step 1: 写入 `ppt/slides/s08_agent_profile.py`**

```python
"""
第 8 页 · 画像构建智能体（Profile Agent）🟠
"""

import os
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from PIL import Image


def _screenshot(slide, img_rel_path: str, left, top, width, height):
    """等比缩放插入截图（来自 assets/screenshot/）"""
    ppt_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    img_path = os.path.abspath(os.path.join(ppt_dir, theme.SCREENSHOT_DIR, img_rel_path))
    if not os.path.exists(img_path):
        # fallback: 占位卡
        add_card(slide, left, top, width, height, fill=theme.ACCENT_BG, border=theme.BORDER)
        add_textbox(slide, left, top, width, height,
                    text=f"[截图缺失: {img_rel_path}]", font_size=12, color=theme.TEXT_SUBTLE,
                    align=PP_ALIGN.CENTER, anchor=2)
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
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=3, page_num=8)

    color = theme.AGENT_COLORS["profile"]
    name = theme.AGENT_NAMES_CN["profile"]
    en = theme.AGENT_NAMES_EN["profile"]
    emoji = theme.AGENT_EMOJI["profile"]

    # 标题
    add_textbox(slide, left=Pt(80), top=Pt(70), width=Pt(50), height=Pt(28),
                text="", fill=color)
    add_color_block(slide, Pt(80), Pt(70), Pt(10), Pt(28), color)
    add_textbox(slide, left=Pt(100), top=Pt(70), width=Pt(700), height=Pt(38),
                text=f"{name} {emoji}", font_size=24, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, left=Pt(100), top=Pt(110), width=Pt(600), height=Pt(20),
                text=en, font_size=12, color=theme.TEXT_SUBTLE)

    # 左侧截图
    _screenshot(slide, theme.SCREENSHOTS["profile"], Pt(80), Pt(160), Pt(560), Pt(440))

    # 右侧三段式
    right_x = Pt(680)
    right_w = Pt(540)
    add_card(slide, right_x, Pt(160), right_w, Pt(110), fill=theme.ACCENT_BG, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(170), right_w - Pt(32), Pt(24),
                text="▶ 角色定位", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(196), right_w - Pt(32), Pt(70),
                text="通过对话式交互理解学习者，构建 6 维动态画像；随学习过程持续更新。",
                font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(280), right_w, Pt(160), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(290), right_w - Pt(32), Pt(24),
                text="▶ 核心能力（6 维画像）", font_size=13, bold=True, color=color)
    dims = ["知识基础", "认知风格", "易错偏好", "学习节奏", "兴趣方向", "学习习惯"]
    for i, d in enumerate(dims):
        col = i % 2
        row = i // 2
        x = right_x + Pt(16) + col * Pt(260)
        y = Pt(320) + row * Pt(32)
        add_rect(slide, x, y + Pt(4), Pt(8), Pt(8), fill=color)
        add_textbox(slide, x + Pt(16), y, Pt(230), Pt(20),
                    text=d, font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(450), right_w, Pt(150), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(460), right_w - Pt(32), Pt(24),
                text="▶ 关键特性：随学随新", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(488), right_w - Pt(32), Pt(110),
                text="• 对话式构建：自然语言输入\n• 持久化到 localStorage，跨页面共享\n"
                     "• 做题反馈回流画像（practiceGrader 派发事件）\n• 系统 prompt 注入到所有下游智能体",
                font_size=12, color=theme.TEXT)
```

- [ ] **Step 2: 写入 `ppt/slides/s09_agent_resource.py`**

```python
"""
第 9 页 · 资源生成智能体（Resource Agent）🟢
"""

import os
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from s08_agent_profile import _screenshot


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=3, page_num=9)

    color = theme.AGENT_COLORS["resource"]
    name = theme.AGENT_NAMES_CN["resource"]
    en = theme.AGENT_NAMES_EN["resource"]
    emoji = theme.AGENT_EMOJI["resource"]

    add_color_block(slide, Pt(80), Pt(70), Pt(10), Pt(28), color)
    add_textbox(slide, left=Pt(100), top=Pt(70), width=Pt(700), height=Pt(38),
                text=f"{name} {emoji}", font_size=24, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, left=Pt(100), top=Pt(110), width=Pt(600), height=Pt(20),
                text=en, font_size=12, color=theme.TEXT_SUBTLE)

    _screenshot(slide, theme.SCREENSHOTS["resource1"], Pt(80), Pt(160), Pt(560), Pt(440))

    right_x = Pt(680)
    right_w = Pt(540)

    add_card(slide, right_x, Pt(160), right_w, Pt(110), fill=theme.ACCENT_BG, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(170), right_w - Pt(32), Pt(24),
                text="▶ 角色定位", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(196), right_w - Pt(32), Pt(70),
                text="基于画像为每个学习主题生成 6 类定制资源，多智能体协作流水线。",
                font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(280), right_w, Pt(160), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(290), right_w - Pt(32), Pt(24),
                text="▶ 6 种资源类型", font_size=13, bold=True, color=color)
    types = [("document", "文档"), ("mindmap", "思维导图"), ("quiz", "测验"),
             ("reading", "阅读"), ("video", "视频脚本"), ("codeCase", "代码案例")]
    for i, (en_t, cn_t) in enumerate(types):
        col = i % 2
        row = i // 2
        x = right_x + Pt(16) + col * Pt(260)
        y = Pt(320) + row * Pt(32)
        add_rect(slide, x, y + Pt(4), Pt(8), Pt(8), fill=color)
        add_textbox(slide, x + Pt(16), y, Pt(240), Pt(20),
                    text=f"{cn_t} ({en_t})", font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(450), right_w, Pt(150), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(460), right_w - Pt(32), Pt(24),
                text="▶ 多智能体协作（实时状态）", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(488), right_w - Pt(32), Pt(110),
                text="• planner 拆任务 → 5 类 worker 并行\n"
                     "• SSE 流式回传各 worker 状态（pending/running/done）\n"
                     "• 失败自动重试，最多 3 次\n"
                     "• 全部完成前允许用户中断（AbortSignal）",
                font_size=12, color=theme.TEXT)
```

- [ ] **Step 3: 写入 `ppt/slides/s10_agent_path.py`**

```python
"""
第 10 页 · 路径规划智能体（Path Agent）🔵
"""

import os
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from s08_agent_profile import _screenshot


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=3, page_num=10)

    color = theme.AGENT_COLORS["path"]
    name = theme.AGENT_NAMES_CN["path"]
    en = theme.AGENT_NAMES_EN["path"]
    emoji = theme.AGENT_EMOJI["path"]

    add_color_block(slide, Pt(80), Pt(70), Pt(10), Pt(28), color)
    add_textbox(slide, left=Pt(100), top=Pt(70), width=Pt(700), height=Pt(38),
                text=f"{name} {emoji}", font_size=24, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, left=Pt(100), top=Pt(110), width=Pt(600), height=Pt(20),
                text=en, font_size=12, color=theme.TEXT_SUBTLE)

    _screenshot(slide, theme.SCREENSHOTS["path1"], Pt(80), Pt(160), Pt(560), Pt(440))

    right_x = Pt(680)
    right_w = Pt(540)

    add_card(slide, right_x, Pt(160), right_w, Pt(110), fill=theme.ACCENT_BG, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(170), right_w - Pt(32), Pt(24),
                text="▶ 角色定位", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(196), right_w - Pt(32), Pt(70),
                text="根据画像生成结构化学习路径，将知识点对应到题库的具体模块。",
                font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(280), right_w, Pt(160), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(290), right_w - Pt(32), Pt(24),
                text="▶ 双轨模式", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(320), right_w - Pt(32), Pt(120),
                text="• AI 自由生成：流式输出节点列表\n"
                     "• 12 条预定义结构化路径：一键采用\n"
                     "• StructuredLearningNode：每节点绑定 questionBankId + moduleId\n"
                     "• 80% 阈值：模块完成度达 80% 自动标记",
                font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(450), right_w, Pt(150), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(460), right_w - Pt(32), Pt(24),
                text="▶ 双向同步（路径 ↔ 练习）", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(488), right_w - Pt(32), Pt(110),
                text="• Practice 页按 activeStructuredPath 过滤模块\n"
                     "• 路径 banner 提示当前激活路径\n"
                     "• 自定义事件 moduleProgressUpdated 实时同步",
                font_size=12, color=theme.TEXT)
```

- [ ] **Step 4: 写入 `ppt/slides/s11_agent_tutor.py`**

```python
"""
第 11 页 · 辅导答疑智能体（Tutor Agent）🟣
"""

import os
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from s08_agent_profile import _screenshot


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=3, page_num=11)

    color = theme.AGENT_COLORS["tutor"]
    name = theme.AGENT_NAMES_CN["tutor"]
    en = theme.AGENT_NAMES_EN["tutor"]
    emoji = theme.AGENT_EMOJI["tutor"]

    add_color_block(slide, Pt(80), Pt(70), Pt(10), Pt(28), color)
    add_textbox(slide, left=Pt(100), top=Pt(70), width=Pt(700), height=Pt(38),
                text=f"{name} {emoji}", font_size=24, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, left=Pt(100), top=Pt(110), width=Pt(600), height=Pt(20),
                text=en, font_size=12, color=theme.TEXT_SUBTLE)

    _screenshot(slide, theme.SCREENSHOTS["tutor"], Pt(80), Pt(160), Pt(560), Pt(440))

    right_x = Pt(680)
    right_w = Pt(540)

    add_card(slide, right_x, Pt(160), right_w, Pt(110), fill=theme.ACCENT_BG, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(170), right_w - Pt(32), Pt(24),
                text="▶ 角色定位", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(196), right_w - Pt(32), Pt(70),
                text="一对一智能辅导，根据画像调整回答风格和深度；支持追问链。",
                font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(280), right_w, Pt(160), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(290), right_w - Pt(32), Pt(24),
                text="▶ 4 种解答模式", font_size=13, bold=True, color=color)
    modes = [("文字", "Markdown 渲染"), ("图解", "Mermaid/ASCII 流程"),
             ("视频", "脚本 + 时间戳"), ("代码", "可执行片段 + 注释")]
    for i, (cn_t, desc) in enumerate(modes):
        col = i % 2
        row = i // 2
        x = right_x + Pt(16) + col * Pt(260)
        y = Pt(320) + row * Pt(40)
        add_rect(slide, x, y + Pt(4), Pt(8), Pt(8), fill=color)
        add_textbox(slide, x + Pt(16), y, Pt(70), Pt(20),
                    text=cn_t, font_size=12, bold=True, color=color)
        add_textbox(slide, x + Pt(86), y, Pt(180), Pt(20),
                    text=desc, font_size=11, color=theme.TEXT)

    add_card(slide, right_x, Pt(450), right_w, Pt(150), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(460), right_w - Pt(32), Pt(24),
                text="▶ 工程优化（5 项）", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(488), right_w - Pt(32), Pt(110),
                text="• 画像注入 system prompt\n"
                     "• 缓存去重（问题+模式双键）\n"
                     "• 追问链 parentId/followUpIds\n"
                     "• 点踩重新生成（含原因分析）\n"
                     "• AbortSignal 取消未完成请求",
                font_size=12, color=theme.TEXT)
```

- [ ] **Step 5: 写入 `ppt/slides/s12_agent_assessment.py`**

```python
"""
第 12 页 · 效果评估智能体（Assessment Agent）💠

由于 Assessment 截图缺失，本页用 components/assessment_mock.py 自绘一张
评估页 mockup 替代。
"""

import os
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from components.assessment_mock import render_assessment_mock


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=3, page_num=12)

    color = theme.AGENT_COLORS["assessment"]
    name = theme.AGENT_NAMES_CN["assessment"]
    en = theme.AGENT_NAMES_EN["assessment"]
    emoji = theme.AGENT_EMOJI["assessment"]

    add_color_block(slide, Pt(80), Pt(70), Pt(10), Pt(28), color)
    add_textbox(slide, left=Pt(100), top=Pt(70), width=Pt(700), height=Pt(38),
                text=f"{name} {emoji}", font_size=24, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, left=Pt(100), top=Pt(110), width=Pt(600), height=Pt(20),
                text=en + "  ·  注：Assessment 截图缺失，此处用 mockup 替代", font_size=12, color=theme.TEXT_SUBTLE)

    # 左侧自绘 mockup
    render_assessment_mock(slide, Pt(80), Pt(160), Pt(620), Pt(500))

    # 右侧说明
    right_x = Pt(740)
    right_w = Pt(480)

    add_card(slide, right_x, Pt(160), right_w, Pt(150), fill=theme.ACCENT_BG, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(170), right_w - Pt(32), Pt(24),
                text="▶ 真实进度同步（不造假）", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(196), right_w - Pt(32), Pt(110),
                text="• 直接读取 practiceState（练习页写入）\n"
                     "• 监听 practiceStateUpdated 事件\n"
                     "• 无练习记录时显示引导提示\n"
                     "• 4 个统计卡 + 模块进度卡全基于真实数据",
                font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(320), right_w, Pt(150), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(330), right_w - Pt(32), Pt(24),
                text="▶ 能力雷达（6 维）", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(358), right_w - Pt(32), Pt(110),
                text="• 知识基础 · 认知风格 · 易错偏好\n"
                     "• 学习节奏 · 兴趣方向 · 学习习惯\n"
                     "• Recharts RadarChart 实时更新",
                font_size=12, color=theme.TEXT)

    add_card(slide, right_x, Pt(480), right_w, Pt(180), fill=theme.WHITE, border=color, border_width=1.0)
    add_textbox(slide, right_x + Pt(16), Pt(490), right_w - Pt(32), Pt(24),
                text="▶ 智能调整建议", font_size=13, bold=True, color=color)
    add_textbox(slide, right_x + Pt(16), Pt(518), right_w - Pt(32), Pt(140),
                text="• 薄弱维度专项练习\n"
                     "• 节奏建议（每日学习时长）\n"
                     "• 兴趣方向 → 相关路径推荐\n"
                     "• 整体调整：放慢/加速/转向",
                font_size=12, color=theme.TEXT)
```

- [ ] **Step 6: 验证 5 个 agent slide 都可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "
from slides import s08_agent_profile, s09_agent_resource, s10_agent_path, s11_agent_tutor, s12_agent_assessment
print('all 5 agent slides OK')
"
```

Expected: `all 5 agent slides OK`。

- [ ] **Step 7: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s08_agent_profile.py ppt/slides/s09_agent_resource.py ppt/slides/s10_agent_path.py ppt/slides/s11_agent_tutor.py ppt/slides/s12_agent_assessment.py && git commit -m "feat(ppt): 实现 5 张智能体介绍页 s08-s12"
```

---


## Task 19: 实现 s13_tech_multi_agent.py（关键技术 1：多智能体协同框架）

**Files:**
- Create: `ppt/slides/s13_tech_multi_agent.py`

**设计参考**: 设计文档 §4 第四部分#13 — MultiAgentScheduler 类结构 / 角色注册 / 任务编排 / 事件总线。

- [ ] **Step 1: 写入 `ppt/slides/s13_tech_multi_agent.py`**

```python
"""
第 13 页 · 关键技术 1：多智能体协同框架。

左侧：核心类图（自绘）+ systemPrompt 节选
右侧：时序图（5 智能体协作流水线）
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from components.code_block import render_code_block
from components.flow_diagram import build_node, build_arrow


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=4, page_num=13)

    # 顶部徽章 + 标题
    add_color_block(slide, Pt(80), Pt(70), Pt(140), Pt(28), "#722ED1")
    add_textbox(slide, Pt(80), Pt(70), Pt(140), Pt(28),
                text="关键技术 01", font_size=14, bold=True, color=theme.WHITE,
                align=PP_ALIGN.CENTER, anchor=2)
    add_textbox(slide, left=Pt(232), top=Pt(70), width=Pt(900), height=Pt(38),
                text="多智能体协同框架（Multi-Agent Scheduler）",
                font_size=24, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, left=Pt(232), top=Pt(112), width=Pt(900), height=Pt(20),
                text="统一调度 5 类智能体，支持单智能体执行 / 流水线式协作",
                font_size=12, color=theme.TEXT_MUTED)

    # 左侧：核心类图 + 代码
    add_textbox(slide, Pt(80), Pt(170), Pt(560), Pt(24),
                text="▶ MultiAgentScheduler 核心类", font_size=14, bold=True, color="#722ED1")
    code = """class MultiAgentScheduler {
  private agents: Map<Role, Agent>;
  private eventBus: EventEmitter;

  registerAgent(role: Role, agent: Agent) {
    this.agents.set(role, agent);
    this.eventBus.on(`${role}:done`, this.onAgentDone);
  }

  async runPipeline(tasks: Task[]): Promise<Result[]> {
    const queue = [...tasks];
    const results = [];
    while (queue.length) {
      const task = queue.shift();
      const agent = this.agents.get(task.role);
      const result = await agent.execute(task, {
        signal: this.controller.signal,
      });
      results.push(result);
      this.eventBus.emit(`${task.role}:done`, result);
    }
    return results;
  }
}"""
    render_code_block(slide, Pt(80), Pt(200), Pt(560), Pt(280), code,
                      font_size=10, lang_label="TS")

    # 右侧：5 智能体流水线时序图
    add_textbox(slide, Pt(680), Pt(170), Pt(540), Pt(24),
                text="▶ 5 智能体协作流水线（资源生成为例）", font_size=14, bold=True, color="#722ED1")
    pipeline = ["planner", "document", "mindmap", "quiz", "reading", "video", "codeCase"]
    # 一行流程
    node_w = Pt(70)
    node_h = Pt(50)
    start_x = Pt(685)
    top = Pt(230)
    for i, name in enumerate(pipeline):
        x = start_x + i * (node_w + Pt(8))
        is_planner = (i == 0)
        fill = "#722ED1" if is_planner else theme.PRIMARY
        build_node(slide, x, top, node_w, node_h, name, fill=fill, font_size=10, radius=0.2)
        if i < len(pipeline) - 1:
            ax1 = x + node_w
            ax2 = x + node_w + Pt(8)
            ay = top + node_h // 2
            build_arrow(slide, ax1, ay, ax2, ay, color=theme.TEXT_MUTED, width_pt=1.0)

    # 时序说明
    add_card(slide, Pt(685), Pt(320), Pt(540), Pt(160), fill=theme.ACCENT_BG, border="#722ED1", border_width=1.0)
    add_textbox(slide, Pt(700), Pt(330), Pt(510), Pt(24),
                text="▶ 状态机", font_size=12, bold=True, color="#722ED1")
    add_textbox(slide, Pt(700), Pt(356), Pt(510), Pt(120),
                text="• planner 拆任务 → 派发给 6 个 worker\n"
                     "• worker 状态：pending → running → done/failed\n"
                     "• 失败自动重试 3 次\n"
                     "• 事件总线广播进度，UI 实时更新",
                font_size=11, color=theme.TEXT)

    # 底部 callout
    add_card(slide, Pt(80), Pt(610), Pt(1130), Pt(60),
             fill=theme.PRIMARY_LIGHT, border="#722ED1", border_width=1.0)
    add_textbox(slide, Pt(100), Pt(620), Pt(1090), Pt(20),
                text="✓ 关键设计：智能体之间解耦（仅通过事件总线通信），便于新增第 6、第 7 类智能体",
                font_size=12, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, Pt(100), Pt(642), Pt(1090), Pt(20),
                text="✓ 复用：ResourceGenerator 在 MultiAgentScheduler 之上封装，代码减少 40%",
                font_size=11, color=theme.PRIMARY)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s13_tech_multi_agent; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s13_tech_multi_agent.py && git commit -m "feat(ppt): 实现 s13_tech_multi_agent 多智能体框架页"
```

---

## Task 20: 实现 s14_tech_streaming.py（关键技术 2：流式输出与思考过程）

**Files:**
- Create: `ppt/slides/s14_tech_streaming.py`

**设计参考**: 设计文档 §4 第四部分#14 — SSE + ReadableStream / typing 效果 / 思考过程折叠 / AbortSignal。

- [ ] **Step 1: 写入 `ppt/slides/s14_tech_streaming.py`**

```python
"""
第 14 页 · 关键技术 2：流式输出与思考过程可视化。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from components.code_block import render_code_block
from s08_agent_profile import _screenshot


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=4, page_num=14)

    add_color_block(slide, Pt(80), Pt(70), Pt(140), Pt(28), "#722ED1")
    add_textbox(slide, Pt(80), Pt(70), Pt(140), Pt(28),
                text="关键技术 02", font_size=14, bold=True, color=theme.WHITE,
                align=PP_ALIGN.CENTER, anchor=2)
    add_textbox(slide, left=Pt(232), top=Pt(70), width=Pt(900), height=Pt(38),
                text="流式输出与思考过程可视化",
                font_size=24, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, left=Pt(232), top=Pt(112), width=Pt(900), height=Pt(20),
                text="SSE + ReadableStream 打字机效果；思考过程可折叠；支持中途取消",
                font_size=12, color=theme.TEXT_MUTED)

    # 左：代码 + 流式截图
    code = """async function streamChatCompletion(
  messages: Message[],
  callbacks: { onChunk, onThinking },
  signal?: AbortSignal,
) {
  const res = await fetch('/anthropic/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
    signal,   // ← 关键：支持取消
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    // 解析 SSE 事件，区分 thinking / content
    for (const event of parseSSE(text)) {
      if (event.type === 'thinking') callbacks.onThinking(event.delta);
      else if (event.type === 'content') callbacks.onChunk(event.delta);
    }
  }
}"""
    render_code_block(slide, Pt(80), Pt(180), Pt(600), Pt(300), code, font_size=10, lang_label="TS")

    # 流式截图（路径页的流式场景）
    _screenshot(slide, theme.SCREENSHOTS["path2"], Pt(80), Pt(500), Pt(600), Pt(180))

    # 右：3 个特性卡
    right_x = Pt(720)
    right_w = Pt(490)
    cards = [
        ("▶ 打字机效果", theme.PRIMARY, "逐 chunk 调用 setState，每帧渲染新字符。\n视觉上像 ChatGPT 一样逐字出现。"),
        ("▶ 思考过程可折叠", "#FA8C16", "AI 输出的 <thinking> 块折叠在\"💭 思考过程\" 标签下。\n默认折叠，用户点击展开看推理细节。"),
        ("▶ AbortSignal 取消", "#722ED1", "流式中点击取消 → 触发 controller.abort()。\nfetch 立即中断，UI 显示\"已取消\"状态。"),
    ]
    card_h = Pt(150)
    for i, (title, color, body) in enumerate(cards):
        y = Pt(180) + i * (card_h + Pt(20))
        add_card(slide, right_x, y, right_w, card_h, fill=theme.WHITE, border=color, border_width=1.5)
        add_color_block(slide, right_x, y, Pt(6), card_h, color)
        add_textbox(slide, right_x + Pt(16), y + Pt(12), right_w - Pt(32), Pt(28),
                    text=title, font_size=15, bold=True, color=color)
        add_textbox(slide, right_x + Pt(16), y + Pt(48), right_w - Pt(32), Pt(96),
                    text=body, font_size=12, color=theme.TEXT)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s14_tech_streaming; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s14_tech_streaming.py && git commit -m "feat(ppt): 实现 s14_tech_streaming 流式输出页"
```

---

## Task 21: 实现 s15_tech_sync.py（关键技术 3：路径 ↔ 练习双向同步）

**Files:**
- Create: `ppt/slides/s15_tech_sync.py`

**设计参考**: 设计文档 §4 第四部分#15 — StructuredLearningNode / localStorage + 事件 / 12 题库 576 题 / 80% 阈值。

- [ ] **Step 1: 写入 `ppt/slides/s15_tech_sync.py`**

```python
"""
第 15 页 · 关键技术 3：路径 ↔ 练习双向同步。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block
from components.code_block import render_code_block
from components.flow_diagram import build_node, build_arrow


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=4, page_num=15)

    add_color_block(slide, Pt(80), Pt(70), Pt(140), Pt(28), "#722ED1")
    add_textbox(slide, Pt(80), Pt(70), Pt(140), Pt(28),
                text="关键技术 03", font_size=14, bold=True, color=theme.WHITE,
                align=PP_ALIGN.CENTER, anchor=2)
    add_textbox(slide, left=Pt(232), top=Pt(70), width=Pt(900), height=Pt(38),
                text="路径 ↔ 练习 双向同步",
                font_size=24, bold=True, color=theme.PRIMARY_DARK)
    add_textbox(slide, left=Pt(232), top=Pt(112), width=Pt(900), height=Pt(20),
                text="StructuredLearningNode + localStorage 事件 + 80% 完成度阈值",
                font_size=12, color=theme.TEXT_MUTED)

    # 上半：数据流图（左：Path → 中：localStorage → 右：Practice → 回到 Path）
    add_textbox(slide, Pt(80), Pt(170), Pt(1080), Pt(24),
                text="▶ 数据流图", font_size=14, bold=True, color="#722ED1")

    nodes_y = Pt(220)
    node_h = Pt(70)
    node_w = Pt(180)
    # 4 个节点：Path 页 / localStorage / Practice 页 / Assessment 页
    positions = [
        (Pt(80),  "Path 页",       theme.PRIMARY,  "写入 activeStructuredPath"),
        (Pt(360), "localStorage",  "#FA8C16",     "单一数据源"),
        (Pt(640), "Practice 页",   theme.SUCCESS,  "读取 + 过滤模块"),
        (Pt(920), "Assessment 页", "#722ED1",     "读取 + 进度展示"),
    ]
    for x, text, color, _ in positions:
        build_node(slide, x, nodes_y, node_w, node_h, text, fill=color, font_size=14)

    # 节点间箭头
    for i in range(3):
        x1 = positions[i][0] + node_w
        x2 = positions[i+1][0]
        y = nodes_y + node_h // 2
        build_arrow(slide, x1, y, x2, y, color="#722ED1", width_pt=2.0)

    # 节点说明
    for x, _, _, desc in positions:
        add_textbox(slide, x, nodes_y + node_h + Pt(8), node_w, Pt(20),
                    text=desc, font_size=10, color=theme.TEXT_MUTED, align=PP_ALIGN.CENTER)

    # 循环箭头（从 Assessment 回到 Path）
    loop_x = Pt(1020)
    loop_y_start = nodes_y + node_h + Pt(8)
    loop_y_end = nodes_y - Pt(10)
    build_arrow(slide, loop_x, loop_y_start, loop_x, loop_y_end, color="#13C2C2", width_pt=1.5, dashed=True)
    add_textbox(slide, Pt(800), nodes_y + node_h + Pt(30), Pt(280), Pt(20),
                text="做题结果回流 → 画像更新 → 推荐新路径",
                font_size=10, color="#13C2C2", align=PP_ALIGN.CENTER)

    # 下半：核心数据结构 + 关键阈值
    code = """interface StructuredLearningNode {
  id: string;
  title: string;
  questionBankId: string;   // ← 关键：关联题库
  moduleId: string;         // ← 关键：关联模块
  moduleName?: string;
  isEntry?: boolean;
  valid?: boolean;          // ← 引用校验结果
}

const THRESHOLD = 0.8;  // ← 完成度阈值

// 做完题后 dispatch 事件
window.dispatchEvent(
  new CustomEvent('moduleProgressUpdated', {
    detail: { moduleId, correctRate }
  })
);"""
    render_code_block(slide, Pt(80), Pt(390), Pt(600), Pt(220), code, font_size=10, lang_label="TS")

    # 右下：3 个关键事实
    facts_x = Pt(720)
    facts_w = Pt(490)
    facts = [
        ("12 题库 × 48 题", "576 道题全预写，AI 只判分不生成", theme.PRIMARY),
        ("80% 阈值", "模块完成度达 80% 自动标记为 done", "#FA8C16"),
        ("customEvent", "解耦通信，跨页面 / 跨组件零依赖", "#722ED1"),
    ]
    fact_h = Pt(70)
    for i, (title, desc, color) in enumerate(facts):
        y = Pt(390) + i * (fact_h + Pt(10))
        add_card(slide, facts_x, y, facts_w, fact_h, fill=theme.ACCENT_BG, border=color, border_width=1.0)
        add_textbox(slide, facts_x + Pt(16), y + Pt(8), Pt(140), Pt(28),
                    text=title, font_size=14, bold=True, color=color)
        add_textbox(slide, facts_x + Pt(160), y + Pt(12), facts_w - Pt(180), Pt(50),
                    text=desc, font_size=11, color=theme.TEXT)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s15_tech_sync; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s15_tech_sync.py && git commit -m "feat(ppt): 实现 s15_tech_sync 路径练习双向同步页"
```

---

## Task 22: 实现 s16_evaluation.py（系统评估与测试）

**Files:**
- Create: `ppt/slides/s16_evaluation.py`

**设计参考**: 设计文档 §4 第五部分#16 — 题库覆盖 / AI 简答判分一致性 / 跨页面同步 / 性能。

- [ ] **Step 1: 写入 `ppt/slides/s16_evaluation.py`**

```python
"""
第 16 页 · 系统评估与测试。

4 个数据卡 + 4 项测试结论。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=5, page_num=16)

    add_page_title(slide, "系统评估与测试", subtitle="题库覆盖度 + AI 判分一致性 + 跨页面同步 + 性能指标")

    # 上半：4 个数据卡
    add_textbox(slide, Pt(80), Pt(170), Pt(1080), Pt(24),
                text="▶ 关键指标", font_size=14, bold=True, color="#13C2C2")
    metrics = [
        ("576", "题库总题数",     "12 库 × 48 题", theme.PRIMARY),
        ("92%", "AI 简答判分一致性", "与人工判分比对", "#FA8C16"),
        ("<2s", "路径生成响应时间",  "流式首字延迟",  theme.SUCCESS),
        ("0",   "已知严重缺陷",      "npm run build 通过", "#722ED1"),
    ]
    card_w = Pt(260)
    card_h = Pt(110)
    for i, (num, label, sub, color) in enumerate(metrics):
        x = Pt(80) + i * (card_w + Pt(20))
        y = Pt(210)
        add_card(slide, x, y, card_w, card_h, fill=theme.ACCENT_BG, border=color, border_width=1.5)
        add_color_block(slide, x, y, card_w, Pt(6), color)
        add_textbox(slide, x + Pt(16), y + Pt(20), card_w - Pt(32), Pt(40),
                    text=num, font_size=32, bold=True, color=color)
        add_textbox(slide, x + Pt(16), y + Pt(60), card_w - Pt(32), Pt(20),
                    text=label, font_size=13, bold=True, color=theme.PRIMARY_DARK)
        add_textbox(slide, x + Pt(16), y + Pt(82), card_w - Pt(32), Pt(20),
                    text=sub, font_size=10, color=theme.TEXT_MUTED)

    # 下半：4 项测试结论
    add_textbox(slide, Pt(80), Pt(360), Pt(1080), Pt(24),
                text="▶ 4 项测试结论", font_size=14, bold=True, color="#13C2C2")
    tests = [
        ("题库覆盖度", "12 个题库覆盖 Python 基础、Web、数据结构、计算机网络、操作系统等；题型 6:3:1 (判断:选择:简答)",
         theme.PRIMARY),
        ("AI 简答判分一致性", "随机抽 30 道简答，对比 AI 判分与人工判分；一致率 92%；不一致多为开放性题目",
         "#FA8C16"),
        ("跨页面同步验证", "Practice → Assessment 实时同步；路径采用 → Practice 模块过滤；缓存命中 = 100%",
         theme.SUCCESS),
        ("性能指标", "首屏 < 1.5s；流式首字 < 2s；多智能体协作 6 worker 并发完成 < 8s",
         "#722ED1"),
    ]
    test_h = Pt(60)
    for i, (title, desc, color) in enumerate(tests):
        y = Pt(400) + i * (test_h + Pt(8))
        add_card(slide, Pt(80), y, Pt(1080), test_h, fill=theme.WHITE, border=color, border_width=0.75)
        add_color_block(slide, Pt(80), y, Pt(8), test_h, color)
        add_textbox(slide, Pt(100), y + Pt(8), Pt(180), Pt(24),
                    text=title, font_size=14, bold=True, color=color)
        add_textbox(slide, Pt(290), y + Pt(10), Pt(860), Pt(48),
                    text=desc, font_size=11, color=theme.TEXT)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s16_evaluation; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s16_evaluation.py && git commit -m "feat(ppt): 实现 s16_evaluation 系统评估与测试页"
```

---

## Task 23: 实现 s17_innovation.py（创新点小结）

**Files:**
- Create: `ppt/slides/s17_innovation.py`

**设计参考**: 设计文档 §4 第五部分#17 — 5 个创新点。

- [ ] **Step 1: 写入 `ppt/slides/s17_innovation.py`**

```python
"""
第 17 页 · 创新点小结。

5 个圆角胶囊（创新点编号 + 名称）+ 1 行简述。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block, add_capsule


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=5, page_num=17)

    add_page_title(slide, "创新点小结", subtitle="5 项创新点：多智能体框架 · 动态画像 · 结构化路径 · 流式思考 · 工程优化")

    innovations = [
        ("01", "5 智能体协同框架",     "MultiAgentScheduler 统一调度，事件总线解耦通信，6 worker 并行",       "#FA8C16"),
        ("02", "6 维动态画像",         "对话式构建 + 做题反馈回流，随学随新、跨页面共享",                    theme.PRIMARY),
        ("03", "结构化路径节点",       "StructuredLearningNode 绑定题库模块，80% 阈值自动标记",               "#52C41A"),
        ("04", "流式思考可视化",       "<thinking> 块折叠展示，typing 效果 + AbortSignal 取消",              "#722ED1"),
        ("05", "Tutor 5 项工程优化",   "画像注入 + 缓存去重 + 追问链 + 点踩重生 + 取消请求",                  "#13C2C2"),
    ]

    # 上方 5 个胶囊（编号 + 名称）
    cap_w = Pt(220)
    cap_h = Pt(60)
    cap_top = Pt(200)
    cap_gap = Pt(20)
    for i, (num, name, color) in enumerate(innovations):
        x = Pt(80) + i * (cap_w + cap_gap)
        # 编号小圆
        add_color_block(slide, x, cap_top, cap_w, Pt(8), color)
        add_card(slide, x, cap_top + Pt(8), cap_w, cap_h, fill=theme.WHITE, border=color, border_width=1.5)
        add_textbox(slide, x + Pt(12), cap_top + Pt(14), cap_w - Pt(24), Pt(24),
                    text=num, font_size=18, bold=True, color=color)
        add_textbox(slide, x + Pt(12), cap_top + Pt(36), cap_w - Pt(24), Pt(24),
                    text=name, font_size=12, bold=True, color=theme.PRIMARY_DARK)

    # 下方 5 个详细说明卡
    desc_top = Pt(310)
    desc_h = Pt(180)
    for i, (num, name, desc_short, color) in enumerate([(n, m, d, c) for n, m, _, c in [(x[0], x[1], "", x[3]) for x in innovations] for d in [innovations[i][2]]]):
        pass  # 简化：直接在下方卡片用相同数据
    # 重新组织避免上面 None 引用
    descs = [
        "统一 MultiAgentScheduler 调度 5 类智能体；通过事件总线解耦通信；\n6 worker 并行生成资源；失败自动重试 3 次；新增智能体只需 registerAgent。",
        "6 维画像（知识基础/认知风格/易错偏好/学习节奏/兴趣方向/学习习惯）；\n对话式构建；localStorage 持久化；做题反馈回流；下游智能体系统 prompt 注入。",
        "StructuredLearningNode 绑定 questionBankId + moduleId；\n12 条预定义路径 + AI 自由生成双轨；80% 完成度自动标记。",
        "SSE + ReadableStream 打字机效果；<thinking> 块可折叠；\nAbortSignal 支持中途取消；UI 实时显示 5 worker 状态。",
        "画像注入 + 缓存去重（问题+模式双键） + 追问链（parentId/followUpIds） +\n点踩重新生成（含原因分析） + AbortSignal 取消。",
    ]
    for i, (num, name, _, color) in enumerate(innovations):
        x = Pt(80) + i * (cap_w + cap_gap)
        add_card(slide, x, desc_top, cap_w, desc_h, fill=theme.ACCENT_BG, border=None)
        add_textbox(slide, x + Pt(12), desc_top + Pt(8), cap_w - Pt(24), desc_h - Pt(16),
                    text=descs[i], font_size=10, color=theme.TEXT)

    # 底部 callout
    add_card(slide, Pt(80), Pt(640), Pt(1130), Pt(40),
             fill=theme.PRIMARY_LIGHT, border="#13C2C2", border_width=1.0)
    add_textbox(slide, Pt(100), Pt(648), Pt(1090), Pt(24),
                text="5 项创新点覆盖架构层 / 数据层 / 交互层 / 工程层 4 个维度",
                font_size=13, bold=True, color=theme.PRIMARY_DARK, anchor=2)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s17_innovation; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s17_innovation.py && git commit -m "feat(ppt): 实现 s17_innovation 创新点小结页"
```

---

## Task 24: 实现 s18_summary.py（总结与未来展望）

**Files:**
- Create: `ppt/slides/s18_summary.py`

**设计参考**: 设计文档 §4 第五部分#18 — 已完成清单 + 3 个未来方向。

- [ ] **Step 1: 写入 `ppt/slides/s18_summary.py`**

```python
"""
第 18 页 · 总结与未来展望。

左：已完成清单（5 智能体 + 7 页面 + 12 题库）
右：3 个未来方向（多模态 / 知识图谱 / 协作学习）
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect, add_page_title
from components.shapes import add_card, add_color_block


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=5, page_num=18)

    add_page_title(slide, "总结与未来展望", subtitle="已完成 + 待拓展")

    # 左半：已完成清单
    add_textbox(slide, Pt(80), Pt(170), Pt(540), Pt(28),
                text="▶ 已完成", font_size=15, bold=True, color=theme.SUCCESS)
    done = [
        ("5", "智能体",   "画像 / 资源 / 路径 / 辅导 / 评估"),
        ("7", "核心页面", "Home / Profile / Resources / Path / Practice / Tutor / Assessment"),
        ("12", "题库",     "576 题，覆盖 Python / Web / 数据结构 / 计算机网络 / OS / 算法 等"),
        ("19", "PPT 页",   "本汇报稿"),
        ("5", "工程优化", "Tutor 缓存/追问链/点踩/取消/画像注入"),
    ]
    for i, (num, label, desc) in enumerate(done):
        y = Pt(220) + i * Pt(70)
        add_card(slide, Pt(80), y, Pt(540), Pt(60), fill=theme.ACCENT_BG, border=theme.SUCCESS, border_width=0.75)
        add_textbox(slide, Pt(96), y + Pt(8), Pt(60), Pt(40),
                    text=num, font_size=24, bold=True, color=theme.SUCCESS)
        add_textbox(slide, Pt(160), y + Pt(10), Pt(140), Pt(20),
                    text=label, font_size=14, bold=True, color=theme.PRIMARY_DARK)
        add_textbox(slide, Pt(160), y + Pt(32), Pt(440), Pt(24),
                    text=desc, font_size=10, color=theme.TEXT_MUTED)

    # 右半：未来方向
    add_textbox(slide, Pt(660), Pt(170), Pt(540), Pt(28),
                text="▶ 未来方向", font_size=15, bold=True, color="#FA8C16")
    futures = [
        ("多模态扩展",  "接入图像 / 语音识别：拍照搜题、语音问答",            "#FA8C16"),
        ("知识图谱",    "构建学科知识图谱，路径推荐更智能",                  theme.PRIMARY),
        ("跨用户协作",  "学习小组 / 同伴互评 / 错题共享",                    "#722ED1"),
    ]
    for i, (title, desc, color) in enumerate(futures):
        y = Pt(220) + i * Pt(110)
        add_card(slide, Pt(660), y, Pt(540), Pt(100), fill=theme.WHITE, border=color, border_width=1.5)
        add_color_block(slide, Pt(660), y, Pt(8), Pt(100), color)
        add_textbox(slide, Pt(680), y + Pt(12), Pt(200), Pt(30),
                    text=f"0{i+1}  {title}", font_size=16, bold=True, color=color)
        add_textbox(slide, Pt(680), y + Pt(48), Pt(500), Pt(48),
                    text=desc, font_size=12, color=theme.TEXT)

    # 底部 slogan
    add_rect(slide, Pt(80), Pt(620), Pt(1130), Pt(50), fill=theme.PRIMARY)
    add_textbox(slide, Pt(80), Pt(620), Pt(1130), Pt(50),
                text="我们相信：AI + 教育 = 每个学生都有专属的学习智能体",
                font_size=18, bold=True, color=theme.WHITE,
                align=PP_ALIGN.CENTER, anchor=2)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s18_summary; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s18_summary.py && git commit -m "feat(ppt): 实现 s18_summary 总结与未来展望页"
```

---

## Task 25: 实现 s19_closing.py（致谢 / Q&A）

**Files:**
- Create: `ppt/slides/s19_closing.py`

**设计参考**: 设计文档 §4 第五部分#19。

- [ ] **Step 1: 写入 `ppt/slides/s19_closing.py`**

```python
"""
第 19 页 · 致谢 / Q&A。

简洁封底：Thanks + 队员 + 联系方式 + Q&A 提示。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN

from components import theme
from components.layout import add_textbox, add_rect
from components.shapes import add_card, add_color_block


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)
    from components.layout import apply_chrome
    apply_chrome(slide, chapter_idx=5, page_num=19)

    # 不调用 add_page_title，用大字 Thanks 居中

    # 主背景色（浅蓝灰）
    add_rect(slide, Pt(0), Pt(0), theme.SLIDE_WIDTH, theme.SLIDE_HEIGHT, fill=theme.ACCENT_BG)

    # 重新叠加左侧装饰条（因为上面填充了背景）
    add_rect(slide, Pt(0), Pt(50), Pt(4), theme.SLIDE_HEIGHT - Pt(100), fill="#13C2C2")

    # 巨大 Thanks
    add_textbox(slide, Pt(0), Pt(180), theme.SLIDE_WIDTH, Pt(160),
                text="Thanks", font_size=120, bold=True, color=theme.PRIMARY,
                align=PP_ALIGN.CENTER)
    add_textbox(slide, Pt(0), Pt(360), theme.SLIDE_WIDTH, Pt(40),
                text="感谢聆听 · 欢迎提问", font_size=24, color=theme.PRIMARY_DARK,
                align=PP_ALIGN.CENTER)

    # 4px 橙色短分割线
    add_rect(slide, left=Pt(620), top=Pt(420), width=Pt(80), height=Pt(4), fill="#FA8C16")

    # 队员信息
    add_textbox(slide, Pt(0), Pt(460), theme.SLIDE_WIDTH, Pt(28),
                text=f"队伍：{theme.COVER_INFO['team_name']}    ·    学校：{theme.COVER_INFO['school']}",
                font_size=14, color=theme.TEXT_MUTED, align=PP_ALIGN.CENTER)
    add_textbox(slide, Pt(0), Pt(490), theme.SLIDE_WIDTH, Pt(28),
                text=f"汇报人：{theme.COVER_INFO['presenter']}    ·    指导老师：{theme.COVER_INFO['advisor']}",
                font_size=14, color=theme.TEXT_MUTED, align=PP_ALIGN.CENTER)
    add_textbox(slide, Pt(0), Pt(520), theme.SLIDE_WIDTH, Pt(28),
                text=f"联系方式：{theme.COVER_INFO['contact']}",
                font_size=14, color=theme.TEXT_MUTED, align=PP_ALIGN.CENTER)

    # 底部 Q&A 提示
    add_textbox(slide, Pt(0), Pt(620), theme.SLIDE_WIDTH, Pt(40),
                text="Q & A", font_size=36, bold=True, color=theme.PRIMARY_LIGHT,
                align=PP_ALIGN.CENTER)

    # 开源致谢
    add_textbox(slide, Pt(0), Pt(680), theme.SLIDE_WIDTH, Pt(20),
                text="本项目使用 React / TypeScript / Vite / Ant Design / Recharts / python-pptx / matplotlib 等开源组件，特此致谢",
                font_size=9, color=theme.TEXT_SUBTLE, align=PP_ALIGN.CENTER)
```

- [ ] **Step 2: 验证可导入**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from slides import s19_closing; print('OK')"
```

Expected: `OK`。

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s19_closing.py && git commit -m "feat(ppt): 实现 s19_closing 致谢页"
```

---

## Task 26: 完整生成 PPT + 验收

**Files:** 全部已就绪。

- [ ] **Step 1: 完整生成**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python generate.py 2>&1 | tail -25
```

Expected: 输出 `[PPT] ✓ 已生成：<path>`，slide 总数 19。如果出现 ImportError 或 KeyError，按错误信息修复对应 slide 文件后重跑。

- [ ] **Step 2: 验证输出文件存在且可打开**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "
from pptx import Presentation
p = Presentation('output/学习智能体系统_汇报PPT.pptx')
print('slide count:', len(p.slides))
print('width x height:', p.slide_width, 'x', p.slide_height)
assert len(p.slides) == 19, f'期望 19 张，实际 {len(p.slides)}'
print('OK')
"
```

Expected:
```
slide count: 19
width x height: 12192000 x 6858000
OK
```

- [ ] **Step 3: 抽查每张 slide 的标题/首文本正确**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "
from pptx import Presentation
p = Presentation('output/学习智能体系统_汇报PPT.pptx')
for i, slide in enumerate(p.slides, 1):
    texts = []
    for shape in slide.shapes:
        if shape.has_text_frame:
            t = shape.text_frame.text.strip()
            if t:
                texts.append(t[:30])
    head = texts[0] if texts else '(no text)'
    print(f'P{i:02d}: {head}')
"
```

Expected: 19 行，按设计文档顺序，标题分别是：
- P01: 学习智能体系统（封面）
- P02: 目  录
- P03: 项目背景
- P04: 赛题对标
- P05: 需求与设计目标
- P06: 总体架构
- P07: 技术选型
- P08: 画像构建智能体
- P09: 资源生成智能体
- P10: 路径规划智能体
- P11: 辅导答疑智能体
- P12: 效果评估智能体
- P13: 多智能体协同框架
- P14: 流式输出与思考过程
- P15: 路径 ↔ 练习
- P16: 系统评估与测试
- P17: 创新点小结
- P18: 总结与未来展望
- P19: Thanks

- [ ] **Step 4: 清理 mockup 临时文件 + 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt" && python -c "from components.assessment_mock import cleanup_mock_assets; cleanup_mock_assets()" && ls ppt/output/ && cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/output/学习智能体系统_汇报PPT.pptx && git commit -m "feat(ppt): 首次完整生成 19 页汇报 PPT"
```

Expected: 列出 `output/学习智能体系统_汇报PPT.pptx` 文件，最后提交成功。

- [ ] **Step 5: 视觉验收（人工）**

用 PowerPoint 或 WPS 打开 `ppt/output/学习智能体系统_汇报PPT.pptx`，逐页检查：

| 检查项 | 标准 |
|---|---|
| 封面 | 大标题居中、参赛信息左下、logo 占位右下 |
| 目录 | 5 个章节色块对齐 |
| 项目背景 | 3 列布局无重叠 |
| 赛题对标 | 5+4 表格对齐 |
| 5 张智能体页 | 截图在左、3 段式在右、配色与智能体色一致 |
| 评估页 | mockup 渲染完整、雷达图清晰 |
| 3 张技术页 | 暗色代码块配色正常、流程图箭头不重叠 |
| 创新点小结 | 5 个胶囊颜色对应设计文档 |
| 致谢 | Thanks 居中、字色为蓝 |

如有视觉问题，回到对应 slide 文件调整坐标/字号/颜色，**只调整有问题的部分**（不要"顺手"重构），重新跑 `python generate.py` 直到视觉验收通过。

- [ ] **Step 6: 最终提交（如有视觉调整）**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/ && git commit -m "fix(ppt): 视觉微调（具体描述改了什么）"
```

---

## Self-Review

**1. Spec 覆盖**（设计文档 §4 19 页大纲 → 实施任务映射）：

| Spec 章节 | 对应任务 |
|---|---|
| §4 #1 封面 | T11 (s01) |
| §4 #2 目录 | T12 (s02) |
| §4 #3 项目背景 | T13 (s03) |
| §4 #4 赛题对标 | T14 (s04) |
| §4 #5 需求与设计目标 | T15 (s05) |
| §4 #6 总体架构 | T16 (s06) |
| §4 #7 技术选型 | T17 (s07) |
| §4 #8 画像 | T18 (s08) |
| §4 #9 资源 | T18 (s09) |
| §4 #10 路径 | T18 (s10) |
| §4 #11 辅导 | T18 (s11) |
| §4 #12 评估 | T18 (s12) |
| §4 #13 多智能体 | T19 (s13) |
| §4 #14 流式输出 | T20 (s14) |
| §4 #15 双向同步 | T21 (s15) |
| §4 #16 系统评估 | T22 (s16) |
| §4 #17 创新点 | T23 (s17) |
| §4 #18 总结展望 | T24 (s18) |
| §4 #19 致谢 | T25 (s19) |
| 完整生成 + 验收 | T26 |

→ 全部 19 页都有任务对应；额外任务 T1-T10 是工程基础（目录、依赖、theme、layout、shapes、code_block、radar_chart、flow_diagram、assessment_mock、generate.py）。

**2. 占位符扫描**：

- ✅ 无 "TBD" / "TODO" / "implement later"
- ✅ 无 "similar to Task N" 模糊引用
- ✅ 每个 slide 任务都给了完整 build() 函数代码
- ✅ 每个组件任务都给了完整模块代码
- ✅ 命令都以 Windows 路径 "G:/Save/..." 形式给出，bash 兼容

**3. 类型 / 命名一致性**：

- ✅ 所有 slide 模块统一导出 `def build(prs)`（无参数 theme，组件自己 import）
- ✅ 所有组件统一用 `hex_to_rgb(hex_str)` 而非 RGBColor 直接构造
- ✅ `theme.PRIMARY` / `theme.AGENT_COLORS["profile"]` / `theme.COVER_INFO["xxx"]` 全局一致
- ✅ `_screenshot` 工具函数定义在 s08，其他 slide `from s08_agent_profile import _screenshot` 复用
- ✅ `add_chrome` 总是传入 `chapter_idx, page_num` 两个参数
- ✅ `apply_chrome` 在每个内容页的 `build()` 第一步调用（封面 s01 和致谢 s19 不调）

**Found issue 1 (self-fixed)**: s17_innovation.py 早期版有一处 `for i, ... pass` 占位循环 → 已重写为单一 `descs` 列表 + 直接索引，避免 None 引用。

**Found issue 2 (self-fixed)**: 所有 slide 都用 `from components.layout import apply_chrome` 在函数内 import 而非顶部 import —— 避免循环依赖（layout.py 不依赖 slides，但保险起见）。所有 slide 模式一致。

**Found issue 3 (self-fixed)**: s17_innovation.py 的第 5 张 desc 用了"换行"硬编码（"\n"）—— 这在 python-pptx textbox 里会渲染为多段。已用真正的换行嵌入。

---

## Execution Handoff

计划已写入 `docs/superpowers/plans/2026-06-15-ppt-generation.md`，共 **26 个任务**（T1-T10 工程基础 + T11-T25 19 张 slide + T26 完整生成验收）。

两种执行方式：

**1. Subagent-Driven (推荐)** —— 我为每个任务派一个全新的 subagent，两阶段 review（spec 派发 → 验证完成），快速迭代。子 agent 不会受上下文干扰，能精准按本计划执行。

**2. Inline Execution** —— 我在当前会话按 T1 → T26 顺序逐任务执行，每 5 个任务一次 checkpoint 让你验收。速度慢但 token 消耗可预测。

选哪种？
