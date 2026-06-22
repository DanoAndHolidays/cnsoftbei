# PPT 风格替换实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目现有 21 页 PPT（莫兰迪暖色极简版）替换为风格 C 商务现代版（深蓝 + 金黄 + 衬线宋体 + 校徽 + 章节信息），保留全部内容与结构。

**Architecture:** 三层 token 架构。`theme.py` 定义颜色/字体/装饰常量；`layout.py` 提供 `apply_chrome_v2()` 统一施加顶部条+底部条+校徽，`build_section_divider()` 重写用于 4 页章节分隔；21 个 `slides/s*.py` 通过常量替换 + 局部调整完成风格切换。沿用 `python-pptx` 全代码重绘路径。

**Tech Stack:** Python 3.10+, python-pptx, matplotlib (雷达图), Pillow (图片处理), LibreOffice (PDF 验证, 可选)

**Spec:** `docs/superpowers/specs/2026-06-22-ppt-style-swap-design.md`

---

## 项目文件结构

**修改文件（24 个）：**
- `ppt/components/theme.py` — 颜色/字体/装饰常量
- `ppt/components/layout.py` — `apply_chrome_v2()` / `add_crest()` / `set_run_font()` / `build_section_divider()`
- `ppt/components/radar_chart.py` — matplotlib 配色 4 处
- `ppt/slides/s01_cover.py` — A 组
- `ppt/slides/s02_toc.py` — C 组
- `ppt/slides/s03_chapter01_div.py` — 调 `build_section_divider()`（自动）
- `ppt/slides/s04_background.py` — D 组
- `ppt/slides/s05_requirements.py` — D 组
- `ppt/slides/s06_chapter02_div.py` — 自动
- `ppt/slides/s07_architecture.py` — D 组
- `ppt/slides/s08_tech_stack.py` — D 组
- `ppt/slides/s09_chapter03_div.py` — 自动
- `ppt/slides/s10_agent_profile.py` — D 组
- `ppt/slides/s11_agent_resource.py` — D 组
- `ppt/slides/s12_agent_path.py` — D 组
- `ppt/slides/s13_agent_tutor.py` — D 组
- `ppt/slides/s14_agent_assessment.py` — E 组
- `ppt/slides/s15_chapter04_div.py` — 自动
- `ppt/slides/s16_tech_multi_agent.py` — D 组
- `ppt/slides/s17_tech_streaming.py` — D 组
- `ppt/slides/s18_tech_sync.py` — D 组
- `ppt/slides/s19_evaluation.py` — E 组
- `ppt/slides/s20_innovation_summary.py` — E 组
- `ppt/slides/s21_closing.py` — A 组
- `ppt/README.md` — 视觉规范链接更新

**不修改文件：** `ppt/generate.py`（主流程不变）, `ppt/requirements.txt`

---

## Task 1: 改造 `theme.py` 颜色 + 字体常量

**Files:**
- Modify: `ppt/components/theme.py`

- [ ] **Step 1: 替换颜色常量**

打开 `ppt/components/theme.py`，定位到"莫兰迪暖色调色板"段（约第 30-60 行）。整段替换为：

```python
# ============ 商务现代调色板（深蓝 + 金黄 + 深红）============

# 背景
BG_CREAM = "#FFFFFF"           # 主背景（白）
BG_DEEP = "#FFFFFF"            # 兼容旧名
BG_PAPER = "#F4F1EA"           # 卡片底（淡米）

# 文字
TEXT = "#1A1A1A"               # 主文字（近黑）
TEXT_MUTED = "#444444"         # 副文字
TEXT_SUBTLE = "#999999"        # 弱化文字
TEXT_FOOTER_WEAK = "#999999"   # 底部条项目名

# 强调（商务现代 4 色）
PRIMARY_DEEP = "#002060"       # 海军蓝（顶部条主色）
PRIMARY = "#2D4470"            # 深蓝（章节标题）
ACCENT = "#D3A518"             # 金黄（章节编号、强调分割线、页码）
ACCENT2 = "#C00000"            # 深红（备用强调）

# 兼容旧代码用
PRIMARY_DARK = TEXT
PRIMARY_LIGHT = BG_PAPER
ACCENT_BG = BG_PAPER
SUCCESS = PRIMARY
WARNING = ACCENT
ERROR = "#A65D5D"

WHITE = "#FFFFFF"
WHITE_ON_DARK = "#FFFFFF"
BG = BG_CREAM
BORDER = "#E5DDD0"
DIVIDER = "#E5DDD0"
```

- [ ] **Step 2: 替换字体常量**

定位到"字体（衬线 + 黑体 混排）"段（约第 100-105 行）。整段替换为：

```python
# ============ 字体（OPPO Sans 首选 + 系统 fallback）============

FONT_HEADING = "OPPO Sans B"          # 标题首选
FONT_SERIF = "Weibei SC"              # 衬线首选
FONT_BODY = "OPPO Sans"               # 正文首选
FONT_MONO = "JetBrains Mono"          # 代码

FONT_FALLBACK_HEADING = "Microsoft YaHei"
FONT_FALLBACK_SERIF = "SimSun"
FONT_FALLBACK_BODY = "Microsoft YaHei"
FONT_FALLBACK_MONO = "Consolas"

# 兼容旧代码引用
FONT_FAMILY = FONT_BODY
FONT_TITLE = FONT_SERIF
FONT_FALLBACK = FONT_FALLBACK_BODY
```

- [ ] **Step 3: 替换字号常量**

定位到 `FONT_SIZES` 字典（约第 109-120 行）。整段替换为：

```python
FONT_SIZES = {
    "cover_title":   52,   # 封面大标题（原 42）
    "page_title":    30,   # 页面标题（原 26）
    "subtitle":      14,   # 副标题（原 13）
    "section":       16,   # 小节标题（原 13）
    "body":          13,   # 正文（原 12）
    "small":         11,   # 注脚（原 11）
    "tiny":          9,    # 页码/页眉（原 9）
    "code":          11,
    "data_huge":     44,   # 大数据（原 36）
    "data_big":      28,   # 中数据（原 22）
}
```

- [ ] **Step 4: 替换 AGENT_COLORS**

定位到 `AGENT_COLORS` 字典（约第 65-71 行）。整段替换为：

```python
AGENT_COLORS = {
    "profile":    PRIMARY_DEEP,  # 深蓝画像
    "resource":   ACCENT,        # 金黄资源
    "path":       PRIMARY,       # 深蓝路径
    "tutor":      ACCENT2,       # 深红辅导
    "assessment": PRIMARY_DEEP,  # 深蓝评估
}
```

- [ ] **Step 5: 添加装饰常量**

定位到"辅助函数"段之前，插入以下常量（在 `CHAPTERS` 之后、`COVER_INFO` 之前）：

```python
# ============ 顶部/底部条 + 校徽装饰常量 ============

HEADER_BAR_HEIGHT = Pt(28)             # 顶部条高度
FOOTER_BAR_HEIGHT = Pt(18)             # 底部条高度
HEADER_BAR_COLOR = "#002060"           # 顶部条纯色
FOOTER_BAR_COLOR = "#002060"           # 底部条纯色

# 校徽（assets/图片1.jpg 是 461×132，比例 3.49）
CREST_WIDTH  = Pt(84)
CREST_HEIGHT = Pt(24)                  # 84 / 3.49 ≈ 24
CREST_MARGIN_R = Pt(14)
CREST_MARGIN_T = Pt(2)

# 章节信息（左上角）
HEADER_CHAPTER_FONT_SIZE = 8.5

# 内容区（紧凑布局）
MARGIN_LR = Pt(24)                     # 原 80pt
MARGIN_TB = Pt(28)                     # 顶部条以下
```

- [ ] **Step 6: 验证**

```bash
cd ppt && python -c "from components import theme; print(theme.PRIMARY, theme.ACCENT, theme.CREST_WIDTH)"
```

期望输出：`#2D4470 #D3A518 88900`（Pt(84) ≈ 88900 EMU）

- [ ] **Step 7: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/theme.py && git commit -m "feat(ppt): replace theme tokens with style C (deep blue + gold)"
```

---

## Task 2: 在 `layout.py` 新增 `set_run_font()` 字体 fallback 工具

**Files:**
- Modify: `ppt/components/layout.py`（在文件顶部 import 区域后插入新函数）

- [ ] **Step 1: 添加 import**

打开 `ppt/components/layout.py`，在第 12 行 `from . import theme` 之后插入：

```python
from pptx.oxml.ns import qn
from lxml import etree
```

如果 `lxml` 已通过 python-pptx 间接安装，可不引；如果失败改用 `from pptx.oxml import OxmlElement`。

- [ ] **Step 2: 实现 `set_run_font()`**

在文件末尾（import 之后、第一个函数 `hex_to_rgb` 之前）插入：

```python
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
```

- [ ] **Step 3: 验证 import 不报错**

```bash
cd ppt && python -c "from components.layout import set_run_font; print('OK')"
```

期望输出：`OK`

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/layout.py && git commit -m "feat(ppt): add set_run_font() with latin+ea dual-channel font fallback"
```

---

## Task 3: 在 `layout.py` 实现 `add_crest()` 校徽贴图

**Files:**
- Modify: `ppt/components/layout.py`

- [ ] **Step 1: 确认校徽图片存在**

```bash
ls -la ppt/assets/图片1.jpg
```

期望输出：文件存在，约 18KB

- [ ] **Step 2: 实现 `add_crest()`**

在 `set_run_font()` 函数后插入：

```python
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
```

- [ ] **Step 3: 添加 PPT_ROOT 常量**

在 `layout.py` 文件顶部（`from . import theme` 之后）插入：

```python
from pathlib import Path
PPT_ROOT = Path(__file__).resolve().parent.parent
```

- [ ] **Step 4: 验证**

```bash
cd ppt && python -c "from components.layout import add_crest, PPT_ROOT; print(PPT_ROOT, '校徽存在:', (PPT_ROOT / 'assets' / '图片1.jpg').exists())"
```

期望输出：`G:\Save\Grogramming\React\cnsoftbei\learning-agent\ppt True`

- [ ] **Step 5: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/layout.py && git commit -m "feat(ppt): add add_crest() with image fallback"
```

---

## Task 4: 在 `layout.py` 实现 `apply_chrome_v2()` 顶部+底部条+校徽

**Files:**
- Modify: `ppt/components/layout.py`

- [ ] **Step 1: 实现函数**

在 `add_crest()` 函数后插入：

```python
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
```

- [ ] **Step 2: 验证 import 不报错**

```bash
cd ppt && python -c "from components.layout import apply_chrome_v2; print('OK')"
```

期望输出：`OK`

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/layout.py && git commit -m "feat(ppt): add apply_chrome_v2() with header bar + crest + footer bar"
```

---

## Task 5: 改造 `add_textbox()` 和 `add_page_title()` 适配风格 C

**Files:**
- Modify: `ppt/components/layout.py`

- [ ] **Step 1: 在 `add_textbox()` 末尾添加字体 fallback 调用**

定位到 `add_textbox()` 函数末尾（约第 53 行 `return tb` 之前），在 `run.font.color.rgb = hex_to_rgb(color)` 之后插入：

```python
    # 默认 font_role="body"；调用方可通过新增参数覆盖
    if font_size >= 24:
        set_run_font(run, "serif")
    else:
        set_run_font(run, "body")
```

- [ ] **Step 2: 改造 `add_page_title()`**

定位到 `add_page_title()` 函数（约第 202 行起），整段替换为：

```python
def add_page_title(slide, title: str, subtitle: str = None,
                   top: int = Pt(70), *,
                   accent_color=theme.ACCENT, icon: str = ""):
    """
    内容页标准标题（风格 C）：
    - 金色短横线 + 深蓝衬线大标题
    - 副标题用中灰
    返回正文起始 top。
    """
    # 金色短横线
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
        font_name=theme.FONT_SERIF,
        color=theme.PRIMARY,
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
```

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/layout.py && git commit -m "feat(ppt): adapt add_textbox and add_page_title to style C"
```

---

## Task 6: 重写 `build_section_divider()` 用于 4 页章节分隔

**Files:**
- Modify: `ppt/components/layout.py`

- [ ] **Step 1: 替换 `build_section_divider()` 实现**

定位到 `build_section_divider()` 函数（约第 122-200 行），整段替换为：

```python
def build_section_divider(prs, chapter_idx: int) -> int:
    """
    章节首页（风格 C）：顶部条+校徽 + 白底 + 巨大"01"数字 + 章节名 + 金色短分割线 + 底部条。
    返回该页的页码。
    """
    chapter = theme.CHAPTERS[chapter_idx - 1]
    page_num = len(prs.slides) + 1

    blank_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank_layout)

    # 顶部条 + 校徽 + 章节信息
    apply_chrome_v2(slide, chapter_idx, page_num)

    # 左侧巨大数字（深蓝 #2D4470，浅灰显示）
    add_textbox(
        slide,
        left=Pt(24), top=Pt(80),
        width=Pt(540), height=Pt(520),
        text=chapter["num"],
        font_size=320,
        bold=True,
        font_name=theme.FONT_SERIF,
        color="#E8E4DA",  # 浅米色，与白底区分
    )

    # 章节中文名（深蓝衬线大标题）
    add_textbox(
        slide,
        left=Pt(560), top=Pt(220),
        width=Pt(700), height=Pt(80),
        text=chapter["title"],
        font_size=32,
        bold=True,
        font_name=theme.FONT_SERIF,
        color=theme.PRIMARY,
    )

    # 金色短分割线
    add_rect(
        slide,
        left=Pt(560), top=Pt(310),
        width=Pt(60), height=Pt(2),
        fill=theme.ACCENT,
    )

    # 章节英文小字
    en_titles = {
        "01": "Introduction & Requirements",
        "02": "System Design",
        "03": "Five Intelligent Agents",
        "04": "Key Technologies & Outlook",
        "05": "Acknowledgement",
    }
    add_textbox(
        slide,
        left=Pt(560), top=Pt(335),
        width=Pt(700), height=Pt(36),
        text=en_titles[chapter["num"]],
        font_size=14,
        color=theme.TEXT_MUTED,
        font_name=theme.FONT_SERIF,
    )

    # 章节页数范围
    add_textbox(
        slide,
        left=Pt(560), top=Pt(385),
        width=Pt(700), height=Pt(28),
        text=f"本章范围 · P. {chapter['pages']}",
        font_size=11,
        color=theme.TEXT_SUBTLE,
    )

    return page_num
```

- [ ] **Step 2: 验证生成章节分隔页**

```bash
cd ppt && python generate.py --only s03
```

期望：`output/学习智能体系统_汇报PPT.pptx` 重新生成，s03 页有顶部条、校徽、底部条、巨大"01"数字

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/layout.py && git commit -m "feat(ppt): rewrite build_section_divider() for style C"
```

---

## Task 7: 重写 `s01_cover.py` 封面页

**Files:**
- Modify: `ppt/slides/s01_cover.py`

- [ ] **Step 1: 整文件替换**

整个文件覆盖为：

```python
"""
第 1 页 · 封面 · 风格 C 商务现代版。

深蓝渐变背景 + 金色装饰条 + 衬线大字 + 顶部条 + 校徽 + 底部条。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

from components import theme
from components.layout import add_textbox, add_rect, apply_chrome_v2


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)

    # ─── 深蓝渐变背景（用纯色近似） ───
    add_rect(
        slide, left=Pt(0), top=Pt(0),
        width=theme.SLIDE_WIDTH, height=theme.SLIDE_HEIGHT,
        fill=theme.PRIMARY_DEEP,
    )

    # ─── 顶部条 + 校徽 + 章节信息（封面页用项目名占位章节信息） ───
    apply_chrome_v2(slide, chapter_idx=1, page_num=1)

    # ─── 半透明装饰色块（左上） ───
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(-60), Pt(40), Pt(280), Pt(280))
    shp.fill.solid()
    shp.fill.fore_color.rgb = theme.HEADER_BAR_COLOR  # 占位
    from components.layout import hex_to_rgb
    shp.fill.fore_color.rgb = hex_to_rgb(theme.ACCENT)
    shp.fill.transparency = 0.82
    shp.line.fill.background()

    # ─── 半透明装饰色块（右下） ───
    shp2 = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(1100), Pt(540), Pt(320), Pt(320))
    shp2.fill.solid()
    shp2.fill.fore_color.rgb = hex_to_rgb(theme.WHITE)
    shp2.fill.transparency = 0.92
    shp2.line.fill.background()

    # ─── 金色短横线（标题上方装饰） ───
    add_rect(
        slide, left=Pt(80), top=Pt(180),
        width=Pt(60), height=Pt(2),
        fill=theme.ACCENT,
    )

    # ─── 小字眉头 ───
    add_textbox(
        slide, left=Pt(80), top=Pt(110), width=Pt(800), height=Pt(28),
        text=theme.COVER_INFO["contest"],
        font_size=14, color="#CCCCCC",
    )

    # ─── 大标题（衬线大字） ───
    add_textbox(
        slide, left=Pt(80), top=Pt(210), width=Pt(1100), height=Pt(140),
        text="学习智能体系统",
        font_size=64, bold=True,
        font_name=theme.FONT_SERIF,
        color=theme.WHITE,
    )

    # ─── 副标题（衬线小字） ───
    add_textbox(
        slide, left=Pt(80), top=Pt(360), width=Pt(1100), height=Pt(40),
        text="多智能体协同驱动的个性化学习平台",
        font_size=22,
        font_name=theme.FONT_SERIF,
        color=theme.WHITE,
    )

    # ─── 英文小副标题 ───
    add_textbox(
        slide, left=Pt(80), top=Pt(410), width=Pt(1100), height=Pt(30),
        text="Multi-Agent Driven Personalized Learning Platform",
        font_size=12, color="#AAAAAA",
    )

    # ─── 底部参赛信息（5 行，金色标签 + 白色值） ───
    info_top = Pt(530)
    info_items = [
        ("队伍",      theme.COVER_INFO["team_name"]),
        ("学校",      theme.COVER_INFO["school"]),
        ("汇报人",    theme.COVER_INFO["presenter"]),
        ("指导老师",  theme.COVER_INFO["advisor"]),
        ("日期",      theme.COVER_INFO["date"]),
    ]
    for i, (label, value) in enumerate(info_items):
        y = info_top + i * Pt(30)
        add_textbox(slide, left=Pt(80), top=y, width=Pt(80), height=Pt(24),
                    text=label, font_size=12, bold=True, color=theme.ACCENT)
        add_textbox(slide, left=Pt(180), top=y, width=Pt(400), height=Pt(24),
                    text=value, font_size=12, color=theme.WHITE)

    # ─── 右下角极简标识 ───
    add_rect(slide, left=theme.SLIDE_WIDTH - Pt(160), top=theme.SLIDE_HEIGHT - Pt(160),
                width=Pt(60), height=Pt(2), fill=theme.ACCENT)
    add_textbox(
        slide, left=theme.SLIDE_WIDTH - Pt(160), top=theme.SLIDE_HEIGHT - Pt(150),
        width=Pt(120), height=Pt(20),
        text="Learning Agent",
        font_size=11, bold=True, color=theme.ACCENT,
    )
    add_textbox(
        slide, left=theme.SLIDE_WIDTH - Pt(160), top=theme.SLIDE_HEIGHT - Pt(125),
        width=Pt(120), height=Pt(20),
        text="2026  ·  A3",
        font_size=10, color="#CCCCCC",
    )
```

- [ ] **Step 2: 验证**

```bash
cd ppt && python generate.py --only s01
```

期望：s01 页成功生成，顶部条+校徽+底部条均可见

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s01_cover.py && git commit -m "feat(ppt): rewrite s01 cover with style C (deep blue + gold + crest)"
```

---

## Task 8: 重写 `s21_closing.py` 致谢页

**Files:**
- Modify: `ppt/slides/s21_closing.py`

- [ ] **Step 1: 读取当前文件了解结构**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && cat ppt/slides/s21_closing.py
```

- [ ] **Step 2: 整文件替换**

保留页眉 + 致谢内容（来自 NOTES），用风格 C 重写背景和装饰：

```python
"""
第 21 页 · 致谢 · 风格 C 商务现代版。

白底 + 顶部条 + 校徽 + 大字"感谢聆听" + 金色装饰 + Q&A 提示。
"""

from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

from components import theme
from components.layout import add_textbox, add_rect, apply_chrome_v2, hex_to_rgb


def build(prs):
    blank = prs.slide_layouts[6]
    slide = prs.slides.add_slide(blank)

    # 顶部条 + 校徽 + 章节信息
    apply_chrome_v2(slide, chapter_idx=5, page_num=21)

    # ─── 大字"感谢聆听"（深蓝衬线） ───
    add_textbox(
        slide, left=Pt(80), top=Pt(180), width=Pt(1100), height=Pt(140),
        text="感谢聆听",
        font_size=80, bold=True,
        font_name=theme.FONT_SERIF,
        color=theme.PRIMARY,
        align=PP_ALIGN.CENTER,
    )

    # ─── 英文小字 ───
    add_textbox(
        slide, left=Pt(80), top=Pt(330), width=Pt(1100), height=Pt(36),
        text="THANK YOU FOR YOUR ATTENTION",
        font_size=14, color=theme.TEXT_MUTED,
        align=PP_ALIGN.CENTER,
        font_name=theme.FONT_SERIF,
    )

    # ─── 金色短横线（居中） ───
    add_rect(
        slide, left=Pt(620), top=Pt(380),
        width=Pt(60), height=Pt(2),
        fill=theme.ACCENT,
    )

    # ─── Q&A 提示 ───
    add_textbox(
        slide, left=Pt(80), top=Pt(420), width=Pt(1100), height=Pt(40),
        text="欢迎评委老师批评指正 · 提问交流",
        font_size=20, color=theme.TEXT,
        align=PP_ALIGN.CENTER,
    )

    # ─── 底部信息（队伍 + 学校） ───
    add_textbox(
        slide, left=Pt(80), top=Pt(540), width=Pt(1100), height=Pt(28),
        text=f"{theme.COVER_INFO['team_name']}  ·  {theme.COVER_INFO['school']}",
        font_size=14, color=theme.TEXT_MUTED,
        align=PP_ALIGN.CENTER,
    )

    add_textbox(
        slide, left=Pt(80), top=Pt(575), width=Pt(1100), height=Pt(24),
        text=f"{theme.COVER_INFO['date']}  ·  第十五届中国软件杯 · A3 赛题",
        font_size=11, color=theme.TEXT_SUBTLE,
        align=PP_ALIGN.CENTER,
    )

    # ─── 半透明装饰圆（左下角） ───
    shp = slide.shapes.add_shape(MSO_SHAPE.OVAL, Pt(-80), Pt(500), Pt(240), Pt(240))
    shp.fill.solid()
    shp.fill.fore_color.rgb = hex_to_rgb(theme.ACCENT)
    shp.fill.transparency = 0.85
    shp.line.fill.background()
```

- [ ] **Step 3: 验证**

```bash
cd ppt && python generate.py --only s21
```

期望：致谢页成功生成，顶部条+校徽+大字"感谢聆听"

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s21_closing.py && git commit -m "feat(ppt): rewrite s21 closing with style C"
```

---

## Task 9: 重写 `s02_toc.py` 目录页

**Files:**
- Modify: `ppt/slides/s02_toc.py`

- [ ] **Step 1: 整文件替换**

```python
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
```

- [ ] **Step 2: 验证**

```bash
cd ppt && python generate.py --only s02
```

期望：目录页成功生成，5 章节卡片整齐排列

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s02_toc.py && git commit -m "feat(ppt): rewrite s02 toc with style C"
```

---

## Task 10: 改造 `radar_chart.py` matplotlib 配色

**Files:**
- Modify: `ppt/components/radar_chart.py`

- [ ] **Step 1: 替换 matplotlib 配色常量**

定位到 `render_radar()` 函数（约第 22-76 行），做以下替换：

**替换 1**（约第 49 行）— 背景色：
```python
    fig.patch.set_facecolor("white")
```
改为：
```python
    fig.patch.set_facecolor("#FFFFFF")
```

**替换 2**（约第 52-53 行）— 雷达线和填充默认色用 PRIMARY（深蓝）：
无需改动（已用 `theme.PRIMARY`，Theme 已更新为 `#2D4470`）。

**替换 3**（约第 57 行）— 维度标签颜色：
```python
    ax.set_xticklabels(labels, fontsize=10, color=theme.PRIMARY_DARK)
```
改为：
```python
    ax.set_xticklabels(labels, fontsize=10, color=theme.PRIMARY)
```

**替换 4**（约第 66-67 行）— 网格颜色：
```python
    ax.grid(color="#E0E0E0", linewidth=0.5)
    ax.spines["polar"].set_color("#E0E0E0")
```
改为：
```python
    ax.grid(color="#E5DDD0", linewidth=0.5)
    ax.spines["polar"].set_color("#E5DDD0")
```

**替换 5**（约第 70 行）— 标题颜色：
```python
        plt.title(title, fontsize=13, color=theme.PRIMARY_DARK, pad=20)
```
改为：
```python
        plt.title(title, fontsize=13, color=theme.PRIMARY, pad=20)
```

- [ ] **Step 2: 验证生成雷达图 PNG**

```bash
cd ppt && python -c "
from components.radar_chart import render_radar
import os
out = render_radar(
    'assets/test_radar.png',
    labels=['知识', '认知', '易错', '节奏', '兴趣', '习惯'],
    values=[80, 70, 60, 75, 85, 90],
)
print('雷达图生成:', out, os.path.getsize(out), 'bytes')
"
rm -f assets/test_radar.png
```

期望：输出雷达图 PNG 路径和字节数（>5KB）

- [ ] **Step 3: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/components/radar_chart.py && git commit -m "feat(ppt): update radar chart matplotlib colors to style C"
```

---

## Task 11: 重写 `s14_agent_assessment.py` 适配新雷达图配色

**Files:**
- Modify: `ppt/slides/s14_agent_assessment.py`

- [ ] **Step 1: 替换 `apply_chrome` 调用**

定位到 `apply_chrome(slide, chapter_idx=3, page_num=14)` 调用（约第 23 行），改为：

```python
    apply_chrome_v2(slide, chapter_idx=3, page_num=14)
```

并在文件顶部 import 增加：

```python
from components.layout import apply_chrome_v2
```

- [ ] **Step 2: 替换 `add_color_block` 中的色调用**

定位到 `add_color_block(slide, Pt(80), Pt(70), Pt(10), Pt(28), color)`，改为：

```python
    add_color_block(slide, Pt(24), Pt(50), Pt(10), Pt(28), color)
```

- [ ] **Step 3: 替换标题位置和颜色**

定位到标题 add_textbox 调用（约第 31-34 行），改为：

```python
    add_textbox(slide, left=Pt(48), top=Pt(48), width=Pt(1000), height=Pt(38),
    text=f"{name} ({en})", font_size=30, bold=True, color=theme.PRIMARY,
    font_name=theme.FONT_SERIF)
    add_textbox(slide, left=Pt(48), top=Pt(88), width=Pt(900), height=Pt(20),
    text="真实练习数据驱动 · 6 维雷达 · 智能调整建议", font_size=14, color=theme.TEXT_MUTED)
```

- [ ] **Step 4: 替换右侧说明文字颜色常量**

定位到 `add_textbox(... color=theme.PRIMARY_DARK)` 调用（约第 32 行 s10 标题中），改为 `color=theme.PRIMARY`：

```python
    text=f"{name} ({en})", font_size=30, bold=True, color=theme.PRIMARY,
```

- [ ] **Step 5: 替换右侧 3 个卡片颜色**

定位到右侧 3 个 `add_card` 调用（约第 43、53、62 行），将 `fill=theme.ACCENT_BG` 改为 `fill=theme.BG_PAPER`，`fill=theme.WHITE` 保留，将 `color` 变量保持（已更新为深蓝/金黄）。

- [ ] **Step 6: 验证**

```bash
cd ppt && python generate.py --only s14
```

期望：s14 页成功生成，右侧 3 个卡片可见

- [ ] **Step 7: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s14_agent_assessment.py && git commit -m "feat(ppt): adapt s14 assessment to style C"
```

---

## Task 12: 重写 `s19_evaluation.py` 关键数据条

**Files:**
- Modify: `ppt/slides/s19_evaluation.py`

- [ ] **Step 1: 替换 import 和 `apply_chrome`**

定位到文件顶部 import 区域（约第 8-11 行），改为：

```python
from components.layout import add_textbox, add_page_title, apply_chrome_v2
```

定位到 `apply_chrome(slide, chapter_idx=4, page_num=19)`（约第 17 行），改为：

```python
    apply_chrome_v2(slide, chapter_idx=4, page_num=19)
```

- [ ] **Step 2: 替换指标颜色**

定位到 `metrics` 列表（约第 32-37 行），改为：

```python
    metrics = [
        ("576", "题库总题数", "12 库 × 48 题", theme.PRIMARY),
        ("92%", "AI 简答判分一致性", "与人工判分比对", theme.ACCENT),
        ("<2s", "路径生成响应时间", "流式首字延迟", theme.PRIMARY_DEEP),
        ("0", "已知严重缺陷", "npm run build 通过", theme.ACCENT2),
    ]
```

- [ ] **Step 3: 替换"关键指标"标题颜色**

定位到 "关键指标" 标题 add_textbox（约第 27-30 行），改为：

```python
    add_textbox(slide, Pt(24), Pt(180), Pt(1200), Pt(24),
                text="关键指标",
                font_size=18, bold=True, color=theme.PRIMARY,
                font_name=theme.FONT_SERIF)
```

- [ ] **Step 4: 替换"4 项测试结论"标题颜色**

定位到 "4 项测试结论" 标题 add_textbox（约第 56-59 行），改为：

```python
    add_textbox(slide, Pt(24), Pt(370), Pt(1200), Pt(24),
                text="4 项测试结论",
                font_size=18, bold=True, color=theme.PRIMARY,
                font_name=theme.FONT_SERIF)
```

- [ ] **Step 5: 替换测试项颜色**

定位到 `tests` 列表（约第 61-74 行），将每个 color 改为深蓝/金黄：

```python
    tests = [
        ("题库覆盖度",
         "12 个题库覆盖 Python 基础、Web、数据结构、计算机网络、操作系统等；题型 6:3:1（判断:选择:简答）",
         theme.PRIMARY),
        ("AI 简答判分一致性",
         "随机抽 30 道简答，对比 AI 判分与人工判分；一致率 92%；不一致多为开放性题目",
         theme.ACCENT),
        ("跨页面同步验证",
         "Practice ⇄ Assessment 实时同步；路径采用 Practice 模块过滤；缓存命中 = 100%",
         theme.PRIMARY_DEEP),
        ("性能指标",
         "首屏 < 1.5s；流式首字 < 2s；多智能体协作 6 worker 并发完成 < 8s",
         theme.ACCENT2),
    ]
```

- [ ] **Step 6: 验证**

```bash
cd ppt && python generate.py --only s19
```

期望：s19 页成功生成，4 个数据卡 + 4 项测试结论齐全

- [ ] **Step 7: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s19_evaluation.py && git commit -m "feat(ppt): adapt s19 evaluation to style C"
```

---

## Task 13: 重写 `s20_innovation_summary.py` 创新点总结

**Files:**
- Modify: `ppt/slides/s20_innovation_summary.py`

- [ ] **Step 1: 替换 import 和 `apply_chrome`**

定位到文件顶部 import 区域（约第 8-12 行），改为：

```python
from components.layout import add_textbox, add_rect, add_page_title, apply_chrome_v2
```

定位到 `apply_chrome(slide, chapter_idx=4, page_num=20)`（约第 18 行），改为：

```python
    apply_chrome_v2(slide, chapter_idx=4, page_num=20)
```

- [ ] **Step 2: 替换 `innovations` 颜色**

定位到 `innovations` 列表（约第 33-49 行），改为：

```python
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
```

- [ ] **Step 3: 替换"3 大未来方向"颜色**

定位到 `futures` 列表（约第 76-86 行），改为：

```python
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
```

- [ ] **Step 4: 替换底部 slogan 颜色**

定位到底部 slogan 区域（约第 107-110 行），改为：

```python
    add_rect(slide, Pt(24), Pt(630), Pt(1192), Pt(40), fill=theme.PRIMARY_DEEP)
    add_textbox(slide, Pt(24), Pt(630), Pt(1192), Pt(40),
                text="我们相信：AI + 教育 = 每个学生都拥有专属的学习智能体",
                font_size=17, bold=True, color=theme.WHITE,
                align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
```

- [ ] **Step 5: 验证**

```bash
cd ppt && python generate.py --only s20
```

期望：s20 页成功生成，5 项创新 + 3 大未来方向齐全

- [ ] **Step 6: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s20_innovation_summary.py && git commit -m "feat(ppt): adapt s20 innovation summary to style C"
```

---

## Task 14: D 组 11 个内页批量替换颜色和字号常量

**Files:**
- Modify: `ppt/slides/s04_background.py`, `s05_requirements.py`, `s07_architecture.py`, `s08_tech_stack.py`, `s10_agent_profile.py`, `s11_agent_resource.py`, `s12_agent_path.py`, `s13_agent_tutor.py`, `s16_tech_multi_agent.py`, `s17_tech_streaming.py`, `s18_tech_sync.py`

每个文件做以下机械替换（用 IDE 重构或 sed）：

- [ ] **Step 1: 替换 `apply_chrome` 为 `apply_chrome_v2`**

对 11 个文件，每个文件做：
- 替换函数调用：`apply_chrome(` → `apply_chrome_v2(`
- 在 `from components.layout import` 行末尾追加 `apply_chrome_v2`（如果还没有）

注意：因为 `apply_chrome_v2(` 包含子串 `apply_chrome(`，不能直接 `s/apply_chrome(/apply_chrome_v2(/g`。改用临时占位符策略：

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt/slides" && \
for f in s04_background.py s05_requirements.py s07_architecture.py s08_tech_stack.py \
         s10_agent_profile.py s11_agent_resource.py s12_agent_path.py s13_agent_tutor.py \
         s16_tech_multi_agent.py s17_tech_streaming.py s18_tech_sync.py; do
  # 1. 先把 apply_chrome_v2 占位（防误伤）
  sed -i 's/apply_chrome_v2/__APPLY_CHROME_V2__/g' "$f"
  # 2. 再把 apply_chrome( 升级成 v2
  sed -i 's/apply_chrome(/apply_chrome_v2(/g' "$f"
  # 3. 还原占位
  sed -i 's/__APPLY_CHROME_V2__/apply_chrome_v2/g' "$f"
  # 4. 在 import 行追加（如果还没导入 v2）
  if ! grep -q 'apply_chrome_v2' "$f"; then
    sed -i 's/from components\.layout import \(.*\)apply_chrome$/from components.layout import \1apply_chrome apply_chrome_v2/' "$f"
  fi
  echo "$f done"
done
```

- [ ] **Step 2: 替换颜色常量引用**

对 11 个文件，机械替换：

| 旧 | 新 |
|---|---|
| `color=theme.PRIMARY_DARK` | `color=theme.PRIMARY` |
| `color="#13C2C2"` | `color=theme.PRIMARY_DEEP` |
| `color="#FA8C16"` | `color=theme.ACCENT` |
| `color="#52C41A"` | `color=theme.ACCENT` |
| `color="#722ED1"` | `color=theme.ACCENT2` |
| `fill=theme.ACCENT_BG` | `fill=theme.BG_PAPER` |

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent/ppt/slides" && \
for f in s04_background.py s05_requirements.py s07_architecture.py s08_tech_stack.py \
         s10_agent_profile.py s11_agent_resource.py s12_agent_path.py s13_agent_tutor.py \
         s16_tech_multi_agent.py s17_tech_streaming.py s18_tech_sync.py; do
  sed -i 's/color=theme.PRIMARY_DARK/color=theme.PRIMARY/g' "$f"
  sed -i 's/color="#13C2C2"/color=theme.PRIMARY_DEEP/g' "$f"
  sed -i 's/color="#FA8C16"/color=theme.ACCENT/g' "$f"
  sed -i 's/color="#52C41A"/color=theme.ACCENT/g' "$f"
  sed -i 's/color="#722ED1"/color=theme.ACCENT2/g' "$f"
  sed -i 's/fill=theme.ACCENT_BG/fill=theme.BG_PAPER/g' "$f"
done
echo "批量替换完成"
```

- [ ] **Step 3: 验证 5 个抽样页生成**

```bash
cd ppt && python generate.py --start s04 --end s05 && \
python generate.py --only s07 && \
python generate.py --only s10 && \
python generate.py --only s16 && \
python generate.py --only s18
```

期望：所有抽样页都成功生成，无报错

- [ ] **Step 4: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/slides/s04_background.py ppt/slides/s05_requirements.py ppt/slides/s07_architecture.py ppt/slides/s08_tech_stack.py ppt/slides/s10_agent_profile.py ppt/slides/s11_agent_resource.py ppt/slides/s12_agent_path.py ppt/slides/s13_agent_tutor.py ppt/slides/s16_tech_multi_agent.py ppt/slides/s17_tech_streaming.py ppt/slides/s18_tech_sync.py && git commit -m "feat(ppt): batch-replace colors and apply_chrome_v2 in 11 inner slides"
```

---

## Task 15: 全 21 页生成 + 视觉验证

**Files:**
- Modify: 上述已修改文件 + 自动验证

- [ ] **Step 1: 生成全 21 页**

```bash
cd ppt && python generate.py
```

期望：`output/学习智能体系统_汇报PPT.pptx` 生成成功，输出 "slide 总数: 21"

- [ ] **Step 2: 用 LibreOffice 导出 PDF 验证渲染**

```bash
cd ppt && libreoffice --headless --convert-to pdf output/学习智能体系统_汇报PPT.pptx --outdir output/ 2>&1 | tail -5
ls -la output/*.pdf
```

期望：PDF 文件生成成功（>500KB）

- [ ] **Step 3: 人工检查 6 个关键页**

用 PowerPoint / WPS 打开 `output/学习智能体系统_汇报PPT.pptx`，依次检查：

- [ ] s01 封面：深蓝渐变 + 金色装饰 + 顶部条 + 校徽 + 底部条
- [ ] s03 章节分隔：浅米色巨"01" + 深蓝章节名 + 顶部条 + 校徽
- [ ] s07 架构：4 层卡片（金色 + 深蓝装饰）
- [ ] s10 画像：6 维度展示（深蓝主色）
- [ ] s14 评估：3 个右侧说明卡（深蓝/金黄）
- [ ] s21 致谢：大字"感谢聆听" + 顶部条 + 校徽

如有问题，回到对应 task 修复。

- [ ] **Step 4: 提交（如有调整）**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git status
# 如有修改文件：
git add <修改文件> && git commit -m "fix(ppt): adjust style C based on visual review"
```

---

## Task 16: 更新 `README.md` 视觉规范链接

**Files:**
- Modify: `ppt/README.md`

- [ ] **Step 1: 更新视觉规范行**

定位到 `## 视觉规范` 段（约第 43-45 行），改为：

```markdown
## 视觉规范

配色、字体、模板：见 `docs/superpowers/specs/2026-06-22-ppt-style-swap-design.md` §2-3。

> 历史版本（莫兰迪暖色极简版）：`docs/superpowers/specs/2026-06-15-ppt-design.md`
```

- [ ] **Step 2: 提交**

```bash
cd "G:/Save/Grogramming/React/cnsoftbei/learning-agent" && git add ppt/README.md && git commit -m "docs(ppt): update README visual spec link to style C design"
```

---

## 自审清单

**1. Spec coverage 检查**：
- §1 范围 → Task 1（theme）+ Task 2-6（layout）+ Task 7-14（slides）+ Task 16（README）✓
- §2 风格 token → Task 1 ✓
- §3 组件改造 → Task 2-6 ✓
- §4 21 页分组 → Task 7-14 覆盖 ✓
- §5 风险 → Task 15 验证步骤 ✓
- §7 文件改动清单 → 24 个文件全部覆盖 ✓

**2. Placeholder scan**：无 TBD/TODO；所有 step 有具体代码或命令。

**3. Type consistency**：
- `apply_chrome_v2()` 签名 `(slide, chapter_idx, page_num)` 在 Task 4 定义，Task 6/7/8/9/11/12/13/14 一致使用 ✓
- `set_run_font(run, role)` 在 Task 2 定义，Task 4 中调用 ✓
- `add_crest(slide)` 在 Task 3 定义，Task 4 调用 ✓
- `theme.PRIMARY / PRIMARY_DEEP / ACCENT / ACCENT2 / BG_PAPER` 在 Task 1 定义并贯穿后续 ✓