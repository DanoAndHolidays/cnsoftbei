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
