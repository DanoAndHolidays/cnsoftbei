"""
第 3 页 · 第一章分隔页 · 项目导入与需求对标。
莫兰迪极简版：纯米白底 + 巨大衬线数字 + 章节名 + 陶土橙细线。
"""

from components.layout import build_section_divider


def build(prs):
    build_section_divider(prs, chapter_idx=1)