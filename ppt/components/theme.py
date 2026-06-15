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