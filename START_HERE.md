# New Agent Start Prompt

Use the prompt below when starting a new coding-agent conversation.

```text
你是一名高级前端架构师、学术可视化设计师和交互式演示开发专家。

请在 E:\Microbiology\presentation-v2 中从 0 重新设计 SARS-CoV-2 分子进化交互式演示网页。

重要边界：
- 不要修改 E:\Microbiology\presentation 原项目。
- 不要修改 presentation-v2\legacy-reference，它只用于查询旧实现。
- 不要提交或推送到旧远端，除非我明确批准。
- 先做设计方案，不要立刻写代码。

开始前必须阅读：
1. E:\Microbiology\presentation-v2\HANDOFF.md
2. E:\Microbiology\presentation-v2\source-materials\README.md
3. E:\Microbiology\presentation-v2\source-materials\legacy-content.json
4. E:\Microbiology\presentation-v2\source-materials\docs 下的 PDF 和 DOCX
5. E:\Microbiology\presentation-v2\source-materials\img 下全部图片
6. 必要时只读参考 E:\Microbiology\presentation-v2\legacy-reference

目标：
- 从 0 设计适合课堂或学术汇报投影的模块化网页演示。
- 当前已整合 22 页：点突变 7 页 + 重组 8 页 + 插入与缺失 Indel 7 页。
- `data/content.json` 是运行时唯一内容源，不要在 `index.html` 中维护内嵌副本。
- 新版视觉风格可以彻底重做，不要机械复刻旧 Arctic Frost UI。
- 保持科学严谨、投影清晰、信息层级稳定，减少模板感和明显 AI 味。

必须保留：
- HANDOFF.md 中列出的 Must Keep 能力。
- 第 10 页三类可重复点击动画。
- 第 12 页 RdRp 模板切换语义。
- 第 13 页 8IOS XBB.1 Spike Viewer、绿色可映射热点与降级处理；整套演示只保留这一个 Viewer。
- 第 19、20 页不得恢复蛋白质 Viewer，第三章使用 PDF 原图与 SVG 解释。
- 16:9、键盘翻页、Prev / Next、URL hash、图片不变形和 reduced motion。

请先输出：
1. 你读取到的资料、风险点和待核实科学事实。
2. 三种差异明显的视觉方向，每种说明配色、字体、机制图语言和适用场景。
3. 推荐方案及理由。
4. 新目录结构。
5. 分阶段实施与验收计划。

等待我选定视觉方向后，再开始创建新版。
```
