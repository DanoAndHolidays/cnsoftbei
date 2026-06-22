"""
PPT 视觉常量与占位信息 · 莫兰迪暖色极简版。

所有颜色、字体、尺寸常量集中在此；所有 slide 和组件都从这里导入，
改主题只需要改这一个文件。
"""

from pptx.util import Pt, Emu


# ============ 尺寸（EMU，1 inch = 914400 EMU，1 pt = 12700 EMU）============

# 标准 16:9 幻灯片尺寸（17.78"×10" 自定义宽屏，容纳原设计坐标）
SLIDE_WIDTH = Emu(16256000)   # 1280 pt = 17.78 inch
SLIDE_HEIGHT = Emu(9144000)   # 720 pt = 10 inch

# 页眉/页脚高度
HEADER_HEIGHT = Pt(20)
FOOTER_HEIGHT = Pt(18)

# 内容区
CONTENT_TOP = Pt(80)
CONTENT_BOTTOM = Pt(720)


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


# ============ 智能体配色（莫兰迪 2 色为主，辅助色点缀）============

AGENT_COLORS = {
    "profile":    PRIMARY_DEEP,
    "resource":   ACCENT,
    "path":       PRIMARY,
    "tutor":      ACCENT2,
    "assessment": PRIMARY_DEEP,
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

# 极简风格不再用 emoji 装饰，但保留字段避免引用错误
AGENT_EMOJI = {
    "profile":    "",
    "resource":   "",
    "path":       "",
    "tutor":      "",
    "assessment": "",
}


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


# ============ 字号（整体小一档，显克制）============

FONT_SIZES = {
    "cover_title":   52,
    "page_title":    30,
    "subtitle":      14,
    "section":       16,
    "body":          13,
    "small":         11,
    "tiny":          9,
    "code":          11,
    "data_huge":     44,
    "data_big":      28,
}


# ============ 章节信息（统一陶土橙，不再 5 色）============

CHAPTERS = [
    {"num": "01", "title": "项目导入与需求对标",      "color": ACCENT,  "pages": "3 - 5"},
    {"num": "02", "title": "系统架构与技术选型",      "color": ACCENT,  "pages": "6 - 8"},
    {"num": "03", "title": "五大核心智能体设计",      "color": ACCENT,  "pages": "9 - 14"},
    {"num": "04", "title": "关键技术深挖与总结展望",  "color": ACCENT,  "pages": "15 - 20"},
    {"num": "05", "title": "致谢",                   "color": ACCENT,  "pages": "21"},
]


# ============ 顶部/底部条 + 校徽装饰常量 ============

HEADER_BAR_HEIGHT = Pt(28)
FOOTER_BAR_HEIGHT = Pt(18)
HEADER_BAR_COLOR = "#002060"
FOOTER_BAR_COLOR = "#002060"

CREST_WIDTH  = Pt(84)
CREST_HEIGHT = Pt(24)
CREST_MARGIN_R = Pt(14)
CREST_MARGIN_T = Pt(2)

HEADER_CHAPTER_FONT_SIZE = 8.5

MARGIN_LR = Pt(24)
MARGIN_TB = Pt(28)


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

SCREENSHOT_DIR = "../assets/screenshot"


# ============ 辅助函数 ============

def emu_to_inch(emu_val) -> float:
    """EMU 转 inch（便于 print 调试）"""
    return emu_val / 914400.0