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
