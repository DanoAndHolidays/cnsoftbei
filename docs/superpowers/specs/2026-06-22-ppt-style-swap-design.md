# 学习智能体系统 · 汇报 PPT 风格替换设计文档

**日期**: 2026-06-22
**状态**: 待用户审阅
**项目**: 第十五届中国软件杯 A3 赛题 / 学习智能体系统
**范围**: 仅替换视觉风格层；保留全部 21 页内容与结构
**交付物**: 替换后的 `ppt/output/学习智能体系统_汇报PPT.pptx`

---

## 1. 背景与目标

项目已有完整 21 页 PPT（莫兰迪暖色极简版，2026-06-15 设计），现已获得一份新模板（`ppt/assets/模板1.pptx`，5 页，政务风），希望按新模板的视觉语言**重制全部 21 页内容**。

**成功标准**:
- 21 页内容全部保留（封面 / 目录 / 章节分隔 / 内页 / 致谢），仅视觉风格层替换
- 视觉风格：商务现代（深蓝 #002060 / #2D4470 + 金黄 #D3A518 + 深红 #C00000，OPPO Sans / 魏碑 字体）
- 每页右上角固定校徽图（`assets/图片1.jpg`，461×132 横幅校徽）
- 每页左上角固定章节信息（金色编号 + 章节名）
- 页面布局紧凑，减少边缘留白
- 装饰元素自由发挥（不要求 1:1 复刻模板1的每条装饰线）
- `python generate.py` 一条命令生成 21 页，支持 `--only` / `--start` / `--end` 选择性生成

**不包含**:
- 新增 / 删除 / 合并页面
- 修改 21 页的叙事内容、文字、备注（`generate.py` 中的 `NOTES` 不动）
- 切换生成技术栈（继续用 `python-pptx`）
- 模板1原模板的图标 / 图片素材抠取复用（仅复用校徽 1 张图）
- 颜色 + 字体之外的几何装饰 1:1 复刻

---

## 2. 风格系统（3 层 token）

### 2.1 颜色映射

| 角色 token | 旧（莫兰迪） | 新（风格 C） | 用途 |
|---|---|---|---|
| `BG` 主背景 | `#F5F1E8` 米白 | `#FFFFFF` 白 | 所有页底色 |
| `BG_CARD` 卡片底 | `#FBF8F1` 纸白 | `#F4F1EA` 淡米色 | 关键数据条 / 引用区 |
| `PRIMARY` 主色 | `#C18C5A` 陶土橙 | `#2D4470` 深蓝 | 章节标题、深色装饰 |
| `PRIMARY_DEEP` 深主色 | — 新增 | `#002060` 海军蓝 | 顶部条主色、底部条 |
| `ACCENT` 强调色 | — 新增 | `#D3A518` 金黄 | 章节编号、强调分割线、页码 |
| `ACCENT2` 次强调 | — 新增 | `#C00000` 深红 | 备用，少量使用 |
| `TEXT` 主文字 | `#2E2A26` | `#1A1A1A` | 更正式近黑 |
| `TEXT_MUTED` 副文字 | `#6B5F54` | `#444444` | 中灰 |
| `TEXT_SUBTLE` 弱化 | `#968879` | `#999999` | 浅灰 |
| `WHITE_ON_DARK` | — 新增 | `#FFFFFF` | 深底白字 |
| `TEXT_FOOTER_WEAK` | — 新增 | rgba 白 60% | 底部条项目名 |

### 2.2 字体 fallback 链

模板1首选字体在 Windows 大概率未装。策略：python-pptx 写入首选字体名，PowerPoint 打开时自动 fallback 到系统字体。

```python
FONT_HEADING = "OPPO Sans B"          # 标题首选
FONT_SERIF   = "Weibei SC"            # 衬线首选
FONT_BODY    = "OPPO Sans"            # 正文首选
FONT_FALLBACK_HEADING = "Microsoft YaHei"
FONT_FALLBACK_SERIF   = "SimSun"
FONT_FALLBACK_BODY    = "Microsoft YaHei"
FONT_MONO = "JetBrains Mono"
```

**实现细节**: `run.font.name` 仅影响拉丁字符；中文必须走 `<a:ea>` 东亚字体通道。`set_run_font(run, role)` 工具函数双通道都设置。

### 2.3 装饰常量

```python
HEADER_BAR_HEIGHT = Pt(28)             # 顶部条高度
FOOTER_BAR_HEIGHT = Pt(18)             # 底部条高度
HEADER_BAR_COLOR = "#002060"           # 顶部条纯色（python-pptx 限制：实际无渐变；mockup 中渐变效果由半透明叠加近似）
FOOTER_BAR_COLOR = "#002060"           # 底部条纯色

# 校徽（图片1.jpg 461×132，比例 3.49）
CREST_WIDTH  = Pt(84)
CREST_HEIGHT = Pt(24)                  # 84 / 3.49 ≈ 24
CREST_MARGIN_R = Pt(14)                # 右边距
CREST_MARGIN_T = Pt(2)                 # 顶部条内边距

# 章节信息（左上）
HEADER_CHAPTER_FONT_SIZE = 8.5
HEADER_CHAPTER_NUM_COLOR = ACCENT     # 金色编号
HEADER_CHAPTER_TEXT_COLOR = WHITE     # 白色章节名

# 边距（缩小版）
MARGIN_LR = Pt(24)                     # 原 80pt
MARGIN_TB = Pt(28)                     # 顶部条以下
```

### 2.4 字号微调（风格 C 是厚重大字号）

```python
FONT_SIZES = {
    "cover_title":    52,    # 封面大标题（原 42）
    "page_title":     30,    # 内页标题（原 26）
    "subtitle":       14,    # 副标题（原 13）
    "section":        16,    # 小节标题（原 13）
    "body":           13,    # 正文（原 12）
    "small":          11,
    "tiny":           9,
    "code":           11,
    "data_huge":      44,    # 关键数据（原 36）
    "data_big":       28,
}
```

### 2.5 AGENT_COLORS 重映射（智能体小色标）

```python
AGENT_COLORS = {
    "profile":    "#002060",  # 深蓝画像
    "resource":   "#D3A518",  # 金黄资源
    "path":       "#2D4470",  # 深蓝路径
    "tutor":      "#C00000",  # 深红辅导
    "assessment": "#002060",  # 深蓝评估
}
```

---

## 3. 组件改造（layout.py）

### 3.1 新增 `apply_chrome_v2()` — 替换原 `apply_chrome()`

**职责**：在所有内容页统一施加顶部条（章节信息 + 校徽）+ 底部条（项目名 + 页码）。

**签名**：
```python
def apply_chrome_v2(slide, chapter_idx: int, page_num: int):
    """chapter_idx: 1~5; page_num: 1~21"""
```

**实现步骤**：
1. 绘制顶部 28pt 深蓝矩形条
2. 顶部条左侧：双 run textbox（金色编号 + 白色章节名，8.5pt）
3. 顶部条右侧：调用 `add_crest(slide)` 贴校徽
4. 绘制底部 18pt 深蓝矩形条
5. 底部条左侧：项目名（7pt 弱化白）
6. 底部条右侧：页码（金色 8.5pt 粗体，格式 `{page_num} / 21`）

### 3.2 新增 `add_crest(slide)` — 校徽贴图 + 容错

**职责**：在顶部条右侧贴校徽图。图片缺失时降级为白底矩形 + "校徽"文字。

**实现**：
```python
def add_crest(slide):
    try:
        crest_path = PPT_ROOT / "assets" / "图片1.jpg"
        if not crest_path.exists():
            raise FileNotFoundError
        slide.shapes.add_picture(
            str(crest_path),
            left=theme.SLIDE_WIDTH - theme.CREST_MARGIN_R - theme.CREST_WIDTH,
            top=theme.CREST_MARGIN_T,
            width=theme.CREST_WIDTH,
            height=theme.CREST_HEIGHT,
        )
    except Exception:
        # 降级方案：白色矩形 + 「校徽」文字
        add_rect(slide,
                 left=theme.SLIDE_WIDTH - theme.CREST_MARGIN_R - theme.CREST_WIDTH,
                 top=theme.CREST_MARGIN_T,
                 width=theme.CREST_WIDTH, height=theme.CREST_HEIGHT,
                 fill=theme.WHITE)
        add_textbox(slide,
                    left=theme.SLIDE_WIDTH - theme.CREST_MARGIN_R - theme.CREST_WIDTH,
                    top=theme.CREST_MARGIN_T + Pt(4),
                    width=theme.CREST_WIDTH, height=Pt(16),
                    text="校徽", font_size=9, color=theme.PRIMARY_DEEP,
                    align=PP_ALIGN.CENTER, bold=True)
```

### 3.3 新增 `set_run_font(run, role)` — 字体 fallback 工具

**职责**：根据 role ∈ {heading, serif, body, mono} 设置字体。latin + ea 双通道。

**关键实现**：
```python
def set_run_font(run, role: str):
    PRIMARY = {
        "heading": ("OPPO Sans B", theme.FONT_FALLBACK_HEADING),
        "serif":   ("Weibei SC",   theme.FONT_FALLBACK_SERIF),
        "body":    ("OPPO Sans",   theme.FONT_FALLBACK_BODY),
        "mono":    ("JetBrains Mono", "Consolas"),
    }
    primary, fallback = PRIMARY[role]
    run.font.name = primary  # 拉丁字符
    # 中文走东亚字体通道
    rPr = run.font._rPr
    ea = rPr.find('{http://schemas.openxmlformats.org/drawingml/2006/main}ea')
    if ea is None:
        ea = OxmlElement('a:ea')
        rPr.append(ea)
    ea.set('typeface', primary)
```

### 3.4 函数改造清单

| 函数 | 状态 | 说明 |
|---|---|---|
| `add_textbox()` | **改造** | 默认用 v2 颜色集；新增可选参数 `font_role` 调用 `set_run_font()` |
| `add_rect()` | **保留** | API 不变 |
| `add_page_title()` | **改造** | 标题色 `#2D4470`，上方金色短横线 `60pt × 2pt` 保留 |
| `build_section_divider()` | **重写** | 顶部条 + 校徽照搬；巨数字"01"用浅灰 `#E8E4DA`；白底 |
| `apply_chrome()` 旧版 | **删除** | 全部替换为 `apply_chrome_v2()` |

---

## 4. 21 页重写策略

### 4.1 按页型分组

| 组 | 页 | 数量 | 策略 | 工作量 |
|---|---|---|---|---|
| **A. 封面 / 致谢** | s01, s21 | 2 | 完全重写：顶部条 + 校徽 + 渐变背景 + 装饰区 | 1h |
| **B. 章节分隔** | s03, s06, s09, s15 | 4 | 重写 `build_section_divider()` 一处，4 页共用 | 0.5h |
| **C. 目录** | s02 | 1 | 重写：顶部条 + 校徽 + 4 章节卡片 | 0.5h |
| **D. 通用内页** | s04, s05, s07, s08, s10, s11, s12, s13, s16, s17, s18 | 11 | 结构沿用，样式刷新（颜色 + 字号常量替换） | 3h |
| **E. 特殊内页** | s14（雷达）, s19（评估）, s20（创新总结） | 3 | 组件层重写：`radar_chart.py` 配色更新；新增关键数据条 | 1.5h |
| **合计** | | **21** | | **≈ 6.5h** |

### 4.2 重写操作模式（D 组 11 页通用）

```python
# 旧（莫兰迪）：
add_textbox(slide, left=..., top=..., text="...",
            font_size=12, color=theme.TEXT,
            font_name=theme.FONT_FAMILY)

# 新（风格 C）：
add_textbox(slide, left=..., top=..., text="...",
            font_size=13, color=theme.TEXT,
            font_name=theme.FONT_HEADING)
# ↑ 颜色和字号替换；位置 / 内容不动
```

D 组改动主要是**机械替换常量名**，可批量 sed 或 IDE 重构。例外：装饰元素的添加（每页右下角加金色短横线、"本页关键"色块等）需逐页决策。

### 4.3 内容区 y 坐标迁移

旧版假设：`apply_chrome()` 不占用顶部条，内容区从 `Pt(70)` 开始。
新版：`HEADER_BAR_HEIGHT = Pt(28)` + 顶部条下 Pt(14 间距 → 内容区从 `Pt(42)` 开始。

`add_page_title()` 自动接管这个偏移（D 组 11 页几乎不用改位置）。

### 4.4 雷达图组件（s14）特殊处理

`radar_chart.py` 用 matplotlib 生成 PNG，硬编码 4 处配色需更新：

| 元素 | 旧色 | 新色 |
|---|---|---|
| 雷达线 | 莫兰迪蓝 | `#2D4470` |
| 雷达填充 | 莫兰迪蓝透明 | `#2D4470` alpha=0.25 |
| 标题 | 莫兰迪暖黑 | `#1A1A1A` |
| 背景 | 米白 | `#FFFFFF` |

### 4.5 顶部条 / 底部条 / 校徽 — 全 21 页统一

| 元素 | 位置 | 尺寸 | 内容 |
|---|---|---|---|
| 顶部条 | y=0 | 全宽 × 28pt | 深蓝纯色 `#002060` |
| 章节信息 | top=Pt(6), left=Pt(14) | 800pt × 16pt | `{num}    {title}`（双 run） |
| 校徽 | top=Pt(2), right=Pt(14) | 84pt × 24pt | `assets/图片1.jpg` |
| 底部条 | y=SLIDE_HEIGHT - 18pt | 全宽 × 18pt | 深蓝纯色 |
| 项目名 | bottom=Pt(2), left=Pt(14) | 400pt × 14pt | 学习智能体系统 · Multi-Agent Learning Platform |
| 页码 | bottom=Pt(1), right=Pt(60) | 46pt × 16pt | `{n} / 21` |

封面页和章节分隔页仍调用 `apply_chrome_v2()`，装饰区视觉上与内容页区分（封面用渐变背景，章节分隔用浅色巨数字）。

---

## 5. 风险与验证

### 5.1 风险清单

| # | 风险 | 概率 | 影响 | 应对 |
|---|---|---|---|---|
| 1 | OPPO Sans / Weibei SC 未装，PPT 自动 fallback | 高 | 中 | §2.2 已用 `set_run_font()` 双通道设置；fallback 到 Microsoft YaHei / SimSun 视觉差异可接受 |
| 2 | 校徽图片路径错误 | 低 | 高 | 用 `PPT_ROOT / "assets" / "图片1.jpg"` 绝对路径；缺失时降级为白底+「校徽」文字 |
| 3 | D 组 11 页位置错位 | 中 | 中 | 改造后先跑 `--only s04` 单页验证，逐页滚动修正 |
| 4 | 雷达图配色残留莫兰迪 | 中 | 低 | §4.4 已列 4 处硬编码色；手动替换 |
| 5 | 顶部条遮挡原有顶部装饰 | 中 | 中 | 原 slide 顶部 0~70pt 可能有装饰；新增约束：内容区从 `Pt(42)` 开始；逐页审 |
| 6 | python-pptx 字体 `<a:ea>` 标签写入失败 | 低 | 高 | `set_run_font()` 已封装；如异常回退到仅 latin 通道 |
| 7 | PPT 文件体积膨胀 | 低 | 低 | 仅多校徽 1 张 18KB 图，总体积影响 < 50KB |
| 8 | 现有 `--only` / `--start` / `--end` 命令失效 | 极低 | 低 | `generate.py` 主流程不动，commands 保留 |
| 9 | D 组装饰元素位置不统一（每页乱跳） | 中 | 中 | 在 §4.5 表格中定义统一位置；装饰元素只允许在指定区域出现 |

### 5.2 验证步骤

1. **生成全 21 页**：`cd ppt && python generate.py`
2. **逐页快速目视检查**：每页顶部条 + 校徽 + 底部条是否到位；校徽图是否清晰可辨
3. **PowerPoint 打开测试**：确认字体 fallback 后视觉无异常（中文字体显示正常）
4. **导出 PDF 对比**：用 LibreOffice 命令行 `libreoffice --headless --convert-to pdf output/*.pptx`，确保所有页面渲染一致
5. **逐章节回归**：跑一次完整答辩流程（21 页 + 演讲者备注），检查 page_num 正确
6. **逐个验证 `--only` 命令**：s01 / s04 / s07 / s10 / s14 / s21 单页生成是否正常

### 5.3 回滚方案

如果新版视觉不达预期，可通过 git 回滚到 2026-06-15 设计：

```bash
git log --oneline docs/superpowers/specs/  # 找到旧设计 commit
git checkout <old-commit> -- ppt/components/ ppt/slides/
python generate.py
```

---

## 6. 实施步骤（高层级）

1. **改造 `theme.py`**：替换颜色常量、字体常量、新增装饰常量（§2）
2. **改造 `layout.py`**：新增 `apply_chrome_v2()` / `add_crest()` / `set_run_font()`，删除旧 `apply_chrome()`（§3）
3. **重写 `slides/s01_cover.py` 和 `s21_closing.py`**（A 组）
4. **重写 `layout.py` 中的 `build_section_divider()`**（B 组 4 页共用）
5. **重写 `slides/s02_toc.py`**（C 组）
6. **批量替换 D 组 11 页的颜色 / 字号常量**（机械替换为主）
7. **重写 `radar_chart.py` 配色**（E 组 s14）
8. **重写 `s19_evaluation.py` 和 `s20_innovation_summary.py`**（E 组，新增关键数据条）
9. **生成全 21 页验证**（§5.2）
10. **更新 `ppt/README.md` 中的"视觉规范"链接**

---

## 7. 文件改动清单

| 文件 | 改动类型 |
|---|---|
| `ppt/components/theme.py` | 重写颜色 / 字体 / 装饰常量 |
| `ppt/components/layout.py` | 新增 `apply_chrome_v2()` / `add_crest()` / `set_run_font()`，改造 `add_textbox()` / `add_page_title()`，重写 `build_section_divider()`，删除旧 `apply_chrome()` |
| `ppt/components/radar_chart.py` | matplotlib 配色硬编码 4 处替换 |
| `ppt/slides/s01_cover.py` | 完全重写 |
| `ppt/slides/s02_toc.py` | 重写 |
| `ppt/slides/s03_chapter01_div.py` | 仅调 `build_section_divider()`（自动） |
| `ppt/slides/s04_background.py` | D 组常量替换 |
| `ppt/slides/s05_requirements.py` | D 组常量替换 |
| `ppt/slides/s06_chapter02_div.py` | 仅调 `build_section_divider()`（自动） |
| `ppt/slides/s07_architecture.py` | D 组常量替换 |
| `ppt/slides/s08_tech_stack.py` | D 组常量替换 |
| `ppt/slides/s09_chapter03_div.py` | 仅调 `build_section_divider()`（自动） |
| `ppt/slides/s10_agent_profile.py` | D 组常量替换 |
| `ppt/slides/s11_agent_resource.py` | D 组常量替换 |
| `ppt/slides/s12_agent_path.py` | D 组常量替换 |
| `ppt/slides/s13_agent_tutor.py` | D 组常量替换 |
| `ppt/slides/s14_agent_assessment.py` | E 组：雷达图配色 + 关键数据条 |
| `ppt/slides/s15_chapter04_div.py` | 仅调 `build_section_divider()`（自动） |
| `ppt/slides/s16_tech_multi_agent.py` | D 组常量替换 |
| `ppt/slides/s17_tech_streaming.py` | D 组常量替换 |
| `ppt/slides/s18_tech_sync.py` | D 组常量替换 |
| `ppt/slides/s19_evaluation.py` | E 组：关键数据条 + 评估卡 |
| `ppt/slides/s20_innovation_summary.py` | E 组：创新点列表 + 总结卡 |
| `ppt/slides/s21_closing.py` | 完全重写 |
| `ppt/README.md` | 更新视觉规范链接指向新设计文档 |

---

## 8. 已确认决策（来自 brainstorming 阶段）

| 维度 | 决策 |
|---|---|
| 复刻范围 | 提取风格重制 21 页（保留全部内容，仅换视觉） |
| 实现路线 | 风格提取 + 代码重绘（沿用现有 `python-pptx` 路径） |
| 风格精度 | 颜色 + 字体级（装饰元素自由发挥，不要求 1:1 复刻） |
| 装饰风格 | 风格 C 商务现代（深蓝渐变 + 金黄 + 几何装饰） |
| 校徽位置 | 右上角（顶部条右对齐） |
| 章节信息位置 | 左上角（顶部条左对齐，金色编号 + 白色章节名） |
| 页面密度 | 边距缩小 80→24pt，内容区填满 |