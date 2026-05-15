# SARS-CoV-2 分子进化交互式演示

这是一个 16:9 大屏放映网页项目，用于替代传统 PPT 展示。当前版本展示“重组”部分，共 8 页，严格对应 `docx/重组.pdf` 中的 Slide1-Slide8。

## 启动方式

页面通过 `fetch()` 读取 `data/content.json`，请使用本地服务器访问：

```powershell
cd E:\Microbiology\presentation
python -m http.server 5173
```

浏览器打开：

```text
http://127.0.0.1:5173/
```

## 当前结构

```text
presentation/
  index.html
  css/
    main.css
    slides.css
    animations.css
  js/
    main.js
    effects.js
  img/
    2-1.png
    2-2.png
  data/
    content.json
  docx/
    重组.pdf
    重组.docx
```

## 设计与实现

- 主题基于 Arctic Frost，并将 `Ice Blue`、`Steel Blue`、`Silver` 整体加深；`#FAFAFA` 保持不变。
- 每页通过 `diagram` 字段绑定动态 SVG 机制图。
- Slide 6 接入 NGL Viewer，加载 RCSB `8V0R` 作为 XBB.1.5 Spike 三聚体结构窗口；粉色表示 Spike 表面，绿色表示映射的 XBB 关键突变位点，其中 V213E 在结构中按 UniProt 213 对应区域高亮。
- Slide 7 使用 `img/2-2.png` 展示重组断点分布，并配合动态图示突出 Spike 区域峰值。

## 资料依据

- `docx/重组.pdf`：本期逐字稿与 Slide1-Slide8 展示文案来源。
- RCSB PDB `8V0R`：SARS-CoV-2 Omicron XBB.1.5 Spike trimer 结构，用于蛋白质可视化窗口。
- Nature Communications 2023 XBB 研究：XBB 来源于 BJ.1 与 BM.1.1.1 重组，断点位于 Spike RBD 区域。
- Nature 2022 pandemic-scale recombination landscape：160 万样本中识别 589 个重组事件，约 2.7% 序列具有可检测重组祖先。
