"""
PPT 视觉常量 · 学术商务版。

配色：蓝色主导 + 深红仅作关键词强调
字体：微软雅黑统一
画幅：标准 16:9 = 960×540 Pt
"""

from pptx.util import Pt, Emu


# ============ 标准 16:9 幻灯片 ============

SLIDE_WIDTH = Emu(12192000)   # 960 Pt = 13.33"
SLIDE_HEIGHT = Emu(6858000)   # 540 Pt = 7.5"


# ============ 调色板 ============

# 蓝色系（主色）
NAVY = "#0C24C4"              # 深蓝 — 背景/顶栏/标题
BLUE_MID = "#4868B0"          # 中蓝 — 装饰/辅助
BLUE_LIGHT = "#7DB6D9"        # 浅蓝 — 点缀

# 红色系（仅用于关键词强调 + 错误状态）
RED = "#D6001C"               # 深红强调
RED_LIGHT = "#FF4444"         # 亮红

# 中性色
WHITE = "#FFFFFF"
LIGHT_GRAY = "#F5F5F5"
MID_GRAY = "#BBBBBB"
DARK_TEXT = "#1A1A1A"
MUTED_TEXT = "#555555"
SUBTLE_TEXT = "#999999"

# ============ 语义别名 ============

PRIMARY = NAVY                 # 主色 = 蓝色
PRIMARY_DEEP = NAVY
PRIMARY_DARK = DARK_TEXT
PRIMARY_LIGHT = LIGHT_GRAY
ACCENT = RED                   # 强调 = 红色（仅关键词）
ACCENT_BG = LIGHT_GRAY
TEXT = DARK_TEXT
TEXT_MUTED = MUTED_TEXT
TEXT_SUBTLE = SUBTLE_TEXT
BG_PAPER = LIGHT_GRAY
BG_CREAM = WHITE
BORDER = "#D0D0D0"
DIVIDER = "#D0D0D0"
SUCCESS = BLUE_MID
WARNING = RED
ERROR = RED

# 旧兼容
TERRACOTTA = RED
SAGE = NAVY
SAND = LIGHT_GRAY
ROSE = RED
SLATE = DARK_TEXT
WHITE_ON_DARK = WHITE
BG = WHITE

# ============ 顶栏/底栏 ============

HEADER_BAR_HEIGHT = Pt(44)
FOOTER_BAR_HEIGHT = Pt(46)
HEADER_BAR_COLOR = NAVY
FOOTER_BAR_COLOR = NAVY
HEADER_CHAPTER_FONT_SIZE = 11
TEXT_FOOTER_WEAK = "#AAAAAA"

# ============ 边距 ============

MARGIN_LR = Pt(40)
MARGIN_TB = Pt(32)

# ============ 字体（微软雅黑统一） ============

FONT_HEADING = "Microsoft YaHei"
FONT_SERIF = "Microsoft YaHei"
FONT_BODY = "Microsoft YaHei"
FONT_MONO = "JetBrains Mono"

FONT_FALLBACK_HEADING = "SimHei"
FONT_FALLBACK_SERIF = "SimHei"
FONT_FALLBACK_BODY = "SimHei"
FONT_FALLBACK_MONO = "Consolas"

FONT_FAMILY = FONT_BODY
FONT_TITLE = FONT_HEADING

# ============ 字号 ============

FONT_SIZES = {
    "cover_title":   52,
    "page_title":    32,
    "subtitle":      16,
    "section":       18,
    "body":          14,
    "small":         12,
    "tiny":          10,
    "code":          12,
    "data_huge":     48,
    "data_big":      30,
    "bottom_bar":    18,
}

# ============ 智能体配色（统一蓝色系）============

AGENT_COLORS = {
    "profile":    NAVY,
    "resource":   NAVY,
    "path":       NAVY,
    "tutor":      NAVY,
    "assessment": NAVY,
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
    "profile":    "",
    "resource":   "",
    "path":       "",
    "tutor":      "",
    "assessment": "",
}

# ============ 章节信息 ============

CHAPTERS = [
    {"num": "01", "title": "项目导入与需求对标",      "color": NAVY,  "pages": "3 - 5"},
    {"num": "02", "title": "系统架构与技术选型",      "color": NAVY,  "pages": "6 - 8"},
    {"num": "03", "title": "五大核心智能体设计",      "color": NAVY,  "pages": "9 - 14"},
    {"num": "04", "title": "关键技术深挖与总结展望",  "color": NAVY,  "pages": "15 - 20"},
    {"num": "05", "title": "致谢",                   "color": NAVY,  "pages": "21"},
]

# ============ 占位信息 ============

COVER_INFO = {
    "team_name":   "[队伍名称]",
    "school":      "[学校名称]",
    "presenter":   "[汇报人姓名]",
    "advisor":     "[指导老师姓名]",
    "date":        "2026.07",
    "contest":     "第十五届中国软件杯 · A3 赛题",
    "contact":     "[邮箱 / GitHub]",
}

TOTAL_PAGES = 21

# ============ 校徽 ============

CREST_WIDTH  = Pt(74)
CREST_HEIGHT = Pt(22)
CREST_MARGIN_R = Pt(12)
CREST_MARGIN_T = Pt(2)

# ============ 截图 ============

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

SCREENSHOT_DIR = "../assets/screenshot"


def emu_to_inch(emu_val) -> float:
    return emu_val / 914400.0
