# Redesign Handoff

## Goal

Rebuild the SARS-CoV-2 molecular evolution presentation from zero while
preserving its valuable scientific content, interactions, and source assets.
The v2 visual system and code structure may be redesigned completely.

The original implementation remains available under `legacy-reference/`.
Treat it as read-only reference material.

## Presentation Scope

The current presentation contains 22 slides:

| Slides | Chapter | Notes |
|---|---|---|
| 1-7 | Point Mutation | Existing content must remain complete. |
| 8-15 | Recombination | Existing content must remain complete. |
| 16-22 | Insertion and Deletion (Indel) | Integrated from the provided source outline. |

The single runtime content source is:

```text
data/content.json
```

The source documents remain available under:

```text
source-materials/docs/
source-materials/img/
```

`source-materials/legacy-content.json` is historical reference only.

## Existing Slide Map

| Slide | Title | Priority |
|---:|---|---|
| 01 | 什么是点突变？ | Must keep |
| 02 | 点突变的两大核心功能 | Must keep |
| 03 | N501Y：趋同进化的典型证据 | Must keep |
| 04 | Omicron：从更强结合转向更强逃逸 | Must keep |
| 05 | 免疫缺陷宿主：体内进化工厂 | Nice to keep |
| 06 | 上位性效应：突变不是单打独斗 | Must keep |
| 07 | 总结：点突变的核心地位 | Safe to redesign |
| 08 | 什么是病毒重组 | Must keep |
| 09 | 与真核生物不同 | Nice to keep |
| 10 | 与原核生物不同 | Must keep |
| 11 | 对比总结 | Nice to keep |
| 12 | 机制：为什么模板切换高效发生 | Must keep |
| 13 | Omicron 例子：XBB | Must keep |
| 14 | 为什么重组频繁出现 | Must keep |
| 15 | 重组对于病毒进化的重要性 | Safe to redesign |

## Must Keep

- The complete 22-slide narrative and all currently used images.
- A modular structure that keeps each chapter independently maintainable.
- 16:9 projector-friendly rendering.
- Images must not stretch or crop important scientific content.
- Prev / Next buttons.
- Keyboard navigation: Arrow keys, PageUp, PageDown, and Space.
- URL hash deep links such as `#slide-10`.
- Loading failure states for JSON, images, and the protein viewer.
- `prefers-reduced-motion` support.

## Slide 10: Transformation, Conjugation, and Transduction

Slide 10 is the most important interactive teaching slide.

Scientific meaning:

- Transformation: extracellular DNA is taken up by a recipient bacterium.
- Conjugation: a donor cell transfers a plasmid to a recipient cell.
- Transduction: a bacteriophage approaches a recipient cell and injects
  genetic material.

Required behavior:

- Clicking external DNA animates it along an arrow into the recipient cell.
- Clicking the plasmid animates it from the donor cell into the recipient cell.
- Clicking the bacteriophage moves it toward the recipient cell surface.
- The bacteriophage must retain a classic form: head, sheath, tail, and tail
  fibers should be readable.
- The bacteriophage starts with visible distance from cells.
- The bacteriophage translates without rotating or becoming distorted.
- Injection appears only after the bacteriophage reaches the recipient surface.
- All three animations must be replayable.
- The three paths should remain visually distinct.
- The figure is a teaching simplification, not a scale-accurate model.

Legacy reference:

```text
legacy-reference/js/main.js
legacy-reference/js/effects.js
legacy-reference/css/slides.css
legacy-reference/css/animations.css
```

Legacy trigger classes and keyframes:

```text
is-transforming       -> transformDnaIntoCell
is-conjugating        -> conjugatePlasmidIntoCell
is-transducing        -> transducePhageApproach, injectPhageDna
```

## Slide 12: RdRp Template Switching

The mechanism must communicate:

```text
pause / detach -> re-pair with a similar template -> resume replication
```

Do not imply that RdRp deliberately chooses a template. The facilitating
factors should not look like the arrow destination.

## Slide 13: XBB.1 Spike Viewer

Required capability:

- Interactive rotation and zoom.
- Stable viewer height.
- Pink Spike trimer body.
- Green overlays only for source-figure mutation sites with modeled coordinates.
- A note disclosing source-figure mutation sites omitted from 3D because their
  coordinates are unresolved in the experimental structure.
- Graceful failure state if network loading fails.
- WebGL disposal when leaving the slide.

The current implementation uses local, pinned assets:

```text
public/vendor/ngl.js
public/vendor/8IOS.pdb
PDB ID: 8IOS
```

`8IOS` is the closed-1 state experimental structure of the SARS-CoV-2 XBB.1
Spike glycoprotein. The local NGL 0.10.4 runtime reads the PDB export for
browser compatibility. Earlier `8V0R` files are retained as historical
reference only.

Scientific caution:

- Keep the 3D overlays tied to author residue numbering in `8IOS.pdb`.
- `H146Q`, `Q183E`, and `G252V` appear in the source figure but are not rendered
  as 3D hotspots because their coordinates are unresolved in `8IOS`.

## Scientific Claims to Verify

- N501Y affinity increase of approximately `2.1-3.5x`.
- Immunocompromised hosts as a possible window for accelerated evolution.
- Q493E and N501Y / Beta background epistasis claims.
- XBB breakpoint and immune escape interpretation.
- The `589` recombination events and `2.7%` statistic.
- Indel examples: `Delta H69/V70`, SGTF, `ins214EPE`, VIPERA, and the 521-day
  longitudinal case.

## Safe to Redesign

- Arctic Frost colors and blue grid background.
- Existing ZJU placeholder mark.
- Typography, cards, borders, shadows, header, footer, and buttons.
- Left/right column assumptions.
- SVG drawing style and animation timing.
- Summary-slide composition.
- Viewer frame styling and initial camera angle.

Keep the academic presentation restrained, readable, and scientifically honest.
Animation should clarify process rather than decorate the screen.

## Source Assets

| File | Use |
|---|---|
| `public/img/1-1.png` | Slide 1, point mutation concept |
| `public/img/1-2.png` | Slide 2, ACE2 binding and immune escape |
| `public/img/1-3.png` | Slide 3, N501Y convergence |
| `public/img/1-4.png` | Slide 4, Omicron mutations |
| `public/img/1-5.png` | Slide 6, epistasis |
| `public/img/2-1.png` | Slide 13, XBB origin and mutations |
| `public/img/2-2.png` | Slide 14, recombination breakpoint distribution |
| `public/img/3.png` | Slides 19 and 20, Indel chapter |

## Acceptance Checklist

- [ ] Slides 1-22 render in order.
- [ ] All mapped images render without distortion.
- [ ] Prev / Next and keyboard navigation work.
- [ ] `#slide-10` deep-links correctly.
- [ ] Slide 10 has three replayable and scientifically correct interactions.
- [ ] Slide 12 communicates template switching without misleading agency.
- [ ] Slide 13 viewer rotates, zooms, disposes resources, and degrades cleanly.
- [ ] Viewer loads pinned NGL and `8IOS.pdb`.
- [ ] Layout is readable at 1920x1080 and 1366x768.
- [ ] A smaller viewport does not overlap critical content.
- [ ] Reduced-motion behavior is usable.
- [ ] Slides 19 and 20 do not render protein viewers.
