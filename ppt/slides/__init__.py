"""
PPT slide 列表。

每张 slide 是个模块文件，导出 build(prs, theme) 函数。
新增/删除 slide 时只需要改本文件里的 SLIDES 列表。
"""

# 21 张 slide 按顺序排列（参考 assets/ 学习智能体系统：多智能体协同驱动的个性化学习平台.pptx）
SLIDES = [
    "s01_cover",                  # 封面
    "s02_toc",                    # 目录
    "s03_chapter01_div",          # 第一章分隔：项目导入与需求对标
    "s04_background",             # 项目背景与差异化定位
    "s05_requirements",           # A3 赛题需求精准对标
    "s06_chapter02_div",          # 第二章分隔：系统架构与技术选型
    "s07_architecture",           # 四层轻量化总体架构
    "s08_tech_stack",             # 前沿与稳健并重的技术选型
    "s09_chapter03_div",          # 第三章分隔：五大核心智能体设计
    "s10_agent_profile",          # 画像构建智能体
    "s11_agent_resource",         # 资源生成智能体
    "s12_agent_path",             # 路径规划智能体
    "s13_agent_tutor",            # 辅导答疑智能体
    "s14_agent_assessment",       # 效果评估智能体
    "s15_chapter04_div",          # 第四章分隔：关键技术深挖与总结展望
    "s16_tech_multi_agent",       # 多智能体协同框架与事件总线
    "s17_tech_streaming",         # 流式交互与思考过程可视化
    "s18_tech_sync",              # 路径与练习双向同步闭环
    "s19_evaluation",             # 系统评估与核心性能指标
    "s20_innovation_summary",     # 创新价值沉淀与未来演进方向
    "s21_closing",                # 致谢 / Q&A
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