"""
PPT 雷达图：matplotlib 绘制 → 保存为 PNG → 插入 PPT。

避免在 python-pptx 里手算多边形顶点，10x 提速。
"""

import os
import math
import matplotlib
matplotlib.use("Agg")   # 非 GUI 后端
import matplotlib.pyplot as plt
import numpy as np
from pathlib import Path

from . import theme


def render_radar(
    out_path: str,
    labels: list[str],
    values: list[float],
    *,
    title: str = "",
    color: str = theme.PRIMARY,
    max_value: float = 100.0,
) -> str:
    """
    绘制雷达图并保存为 PNG。

    labels: 维度名（顺时针顺序）
    values: 各维度得分（0 ~ max_value）
    out_path: 输出 PNG 完整路径

    返回 out_path。
    """
    if len(labels) != len(values):
        raise ValueError("labels 与 values 长度必须相同")

    n = len(labels)
    angles = [n_ / float(n) * 2 * math.pi for n_ in range(n)]
    values_closed = values + values[:1]
    angles_closed = angles + angles[:1]

    fig, ax = plt.subplots(figsize=(5, 4.2), subplot_kw=dict(polar=True))
    fig.patch.set_facecolor("white")

    # 描点
    ax.plot(angles_closed, values_closed, color=color, linewidth=2, linestyle="solid")
    ax.fill(angles_closed, values_closed, color=color, alpha=0.25)

    # 维度标签
    ax.set_xticks(angles)
    ax.set_xticklabels(labels, fontsize=10, color=theme.PRIMARY_DARK)

    # 刻度
    ax.set_ylim(0, max_value)
    ax.set_yticks([max_value * 0.25, max_value * 0.5, max_value * 0.75, max_value])
    ax.set_yticklabels(["25", "50", "75", "100"], fontsize=8, color=theme.TEXT_SUBTLE)
    ax.set_rlabel_position(90)

    # 网格
    ax.grid(color="#E0E0E0", linewidth=0.5)
    ax.spines["polar"].set_color("#E0E0E0")

    if title:
        plt.title(title, fontsize=13, color=theme.PRIMARY_DARK, pad=20)

    plt.tight_layout()
    Path(os.path.dirname(out_path)).mkdir(parents=True, exist_ok=True)
    plt.savefig(out_path, dpi=150, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    return out_path