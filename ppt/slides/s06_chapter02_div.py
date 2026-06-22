"""
第 6 页 · 第二章分隔页 · 系统架构与技术选型。
莫兰迪极简版：纯米白底 + 巨大衬线数字 + 章节名 + 陶土橙细线。
"""

from components.layout import build_section_divider


def build(prs):
    build_section_divider(prs, chapter_idx=2)