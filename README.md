# 点突变交互式学术演示

这是一个 16:9 大屏放映网页项目，用于替代传统 PPT 展示《点突部分.pdf》的内容。当前版本已完成 7 页成品幻灯片、浙江大学蓝风格视觉、Next 翻页机制，以及关键机制 SVG 可视化。

## 目录结构

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
    1-1.png
    1-2.png
    1-3.png
    1-4.png
    1-5.png
  data/
    content.json
  docx/
    点突部分.pdf
    1-蓝色浙江大学模板.pdf
```

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

## 内容维护

展示内容集中维护在 `data/content.json`：

- `title`：大屏展示标题
- `subtitle`：一行过渡说明
- `points`：上屏要点，保持短句
- `image`：本地图片路径，例如 `img/1-1.png`
- `diagram`：SVG 机制图类型
- `layout`：支持 `image-focus`、`split-visual`、`diagram-focus`、`summary`

图片映射按 PDF 位置确定：`1-1` 对 PPT1，`1-2` 对 PPT2，`1-3` 对 PPT3，`1-4` 对 PPT4，`1-5` 对 PPT6。PPT5 与 PPT7 使用自绘 SVG 机制图。
