# 学习智能体系统 · 汇报 PPT 生成器

用 `python-pptx` 自动生成 19 页汇报 PPT。

## 安装

```bash
cd ppt
pip install -r requirements.txt
```

需要 Python ≥ 3.10。

## 生成

```bash
# 完整生成
python generate.py
# → output/学习智能体系统_汇报PPT.pptx

# 只生成某张
python generate.py --only s10

# 批量生成区间
python generate.py --from s08 --to s12
```

## 修改后重新生成

直接 `python generate.py` 即可；已存在的 `output/` 文件会被覆盖。

## 目录结构

- `slides/s01-s19_*.py` — 19 张幻灯片
- `components/` — 视觉组件库
- `output/` — 最终 .pptx 产物
- `assets/` — 临时资源（matplotlib 雷达图 PNG 等）

## 占位字段

封面、致谢页的队伍 / 学校 / 汇报人 / 日期等占位符在 `components/theme.py` 的 `COVER_INFO` 字典里。改完跑 `python generate.py` 自动更新。

## 视觉规范

配色、字体、模板：见 `docs/superpowers/specs/2026-06-22-ppt-style-swap-design.md` §2-3。

> 历史版本（莫兰迪暖色极简版）：`docs/superpowers/specs/2026-06-15-ppt-design.md`
