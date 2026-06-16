# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

A single-page interactive academic presentation (26 slides) on SARS-CoV-2 molecular evolution, covering three chapters: Point Mutation, Recombination, and Indel (Insertion/Deletion). Vanilla HTML/CSS/JS — no frameworks, no build tools.

## Key Files

- `index.html` — Minimal shell (header, footer, slide stage, nav buttons)
- `style.css` (~2790 lines) — CSS custom properties design system + "Science Documentary" visual direction
- `script.js` (~2005 lines) — IIFE: fetches `data/content.json`, renders slides via innerHTML templates, SVG inline diagrams, navigation, animations
- `data/content.json` — Single runtime content source for all 26 slides
- `tests/verify-deck.js` — Node.js test: validates slide count, titles, references, image existence

## Commands

```bash
# Serve locally (required — fetch() needs HTTP)
python -m http.server 8092
# Open http://127.0.0.1:8092/

# Run deck integrity tests
node tests/verify-deck.js
```

## Architecture

- **No build step** — edit HTML/CSS/JS directly, refresh browser
- **Content/rendering split** — `data/content.json` has all text; `script.js` has all rendering logic
- **26 slides, 12+ layouts**: cover, agenda, image-focus, split-visual, visual-left, image-led, diagram-stage, hero-mechanism, protein-focus, wide-diagram, center-summary, references, closing
- **SVG diagrams** defined inline in `script.js` as template strings (~30 diagrams in `diagrams` object)
- **Slide 10** — 3 replayable SVG animations (transformation, conjugation, transduction) using CSS classes + JS state toggle
- **Slide 12** — RdRp template-switching step-through with JS timer chain
- **Slide 13** — NGL WebGL protein viewer (local `public/vendor/ngl.js` + `8IOS.pdb`); only 3D viewer in deck
- **Navigation**: Prev/Next buttons, Arrow keys/PageUp/PageDown/Space, URL hash (`#slide-10`)
- **Module placeholders** in `src/` (diagrams, interactions, slides, styles, viewers) — all empty, marked with `.gitkeep`

## Critical Constraints

- `data/content.json` is the **sole runtime content source** — never embed slide content in HTML/JS
- **Slide 10** animations must be scientifically correct: transformation (extracellular DNA → recipient), conjugation (plasmid donor → recipient), transduction (phage → recipient surface → injection); all replayable
- **Slide 13** NGL viewer: must dispose WebGL resources on slide leave; green hotspots only for residues with resolved coordinates in `8IOS.pdb`; graceful error fallback
- **Slides 19-20** must NOT render protein viewers — use source images + SVG
- `prefers-reduced-motion` must be supported throughout
- 16:9 projection-friendly layout, readable at 1920×1080 and 1366×768
- No push to the `origin` remote (points to old repo `MicroPre.git`)
- `legacy-reference/` is read-only — never modify
