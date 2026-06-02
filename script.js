/* ═══════════════════════════════════════════════════════════════════
 * SARS-CoV-2 分子进化 — script.js
 *
 * Loads slide content from data/content.json, renders slides with
 * inline SVG mechanism diagrams, manages navigation, and controls
 * interactive features (slide 10 animations, slide 13 NGL viewer).
 * ═══════════════════════════════════════════════════════════════════ */

(function(){
'use strict';

/* ─── State ─────────────────────────────────────────────────── */
const deckState = {
  slides: [],
  currentIndex: 0,
  direction: 'next',
  proteinStage: null,
  proteinResizeHandler: null,
  nglScriptPromise: null
};

/* ─── DOM refs ──────────────────────────────────────────────── */
const stage = document.getElementById('slide-stage');
const counter = document.getElementById('slide-counter');
const deckSection = document.getElementById('deck-section');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

/* ─── Diagram title map ─────────────────────────────────────── */
const diagramTitles = {
  'base-substitution':      '碱基替换到蛋白功能改变',
  'dual-function':          '点突变的受体结合与免疫逃逸双功能',
  'convergence':            'N501Y 趋同进化示意',
  'immune-escape':          'Omicron 免疫逃逸机制',
  'host-factory':           '免疫缺陷宿主体内进化工厂',
  'epistasis':              '突变组合的上位性效应',
  'summary-map':            '点突变核心地位总结图',
  'viral-template-switch':  '病毒 RNA 复制过程中的模板切换',
  'eukaryotic-crossing':    '真核生物同源染色体交换',
  'prokaryotic-transfer':   '原核生物基因流动',
  'three-way-comparison':   '三类重组机制对比',
  'rdRp-switch-engine':     'RdRp 换轨复制机制',
  'xbb-genome':             'XBB 重组基因组示意',
  'frequency-landscape':    '重组频率与断点分布',
  'evolution-accelerator':  '重组作为进化加速器',
  'indel-spectrum':           '点突变 / Indel / 重组三段对比',
  'indel-mechanisms':         'Indel 产生的三种分子机制',
  'ntd-hotspot':              'NTD 超级位点与 loop 柔性示意',
  'deletion-cases':           '趋同缺失位点标注',
  'ins214epe':                'ins214EPE 插入位点上下文',
  'chronic-indel':            '慢性感染中 Indel 的纵向积累'
};

/* ─── SVG diagram definitions ──────────────────────────────── */
const diagrams = {

  /* ── 01 碱基替换 ─────────────────────────────────────── */
  'base-substitution': `
    <svg class="mechanism-svg" viewBox="0 0 720 240" aria-hidden="true">
      <defs>
        <marker id="bs-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a3a4a"/>
        </marker>
      </defs>
      <text class="svg-kicker" x="42" y="32">single nucleotide substitution</text>
      <rect x="48" y="68" width="52" height="40" rx="10" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <rect x="114" y="68" width="52" height="40" rx="10" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <rect class="is-hot" x="180" y="68" width="52" height="40" rx="10" fill="rgba(58,140,111,0.12)" stroke="#3a8c6f" stroke-width="2"/>
      <rect x="246" y="68" width="52" height="40" rx="10" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="74" y="95" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="600" text-anchor="middle">A</text>
      <text x="140" y="95" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="600" text-anchor="middle">U</text>
      <text x="206" y="95" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="600" text-anchor="middle">C</text>
      <text x="272" y="95" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="600" text-anchor="middle">G</text>
      <text x="206" y="136" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">C → U</text>
      <path class="svg-arrow" marker-end="url(#bs-arrow)" d="M 320 90 C 360 90, 390 90, 430 90"/>
      <rect x="450" y="68" width="164" height="42" rx="20" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <circle cx="480" cy="89" r="11" fill="rgba(26,58,74,0.08)" stroke="#e2e6ea" stroke-width="1.5"/>
      <circle class="is-hot" cx="530" cy="89" r="11" fill="rgba(58,140,111,0.15)" stroke="#3a8c6f" stroke-width="2"/>
      <circle cx="580" cy="89" r="11" fill="rgba(26,58,74,0.08)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="530" y="140" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">氨基酸改变</text>
      <path class="effect-line" d="M 204 164 C 276 214, 462 214, 532 164" fill="none" stroke="#3a8c6f" stroke-width="2.5" opacity="0.6"/>
      <text x="370" y="216" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="500" text-anchor="middle">单个碱基变化可能放大为功能差异</text>
    </svg>
  `,

  /* ── 02 双功能 ────────────────────────────────────────── */
  'dual-function': `
    <svg class="mechanism-svg" viewBox="0 0 720 240" aria-hidden="true">
      <defs>
        <marker id="df-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
        </marker>
      </defs>
      <circle class="rbd-core" cx="140" cy="122" r="58" fill="rgba(58,140,111,0.1)" stroke="#3a8c6f" stroke-width="2.5"/>
      <text x="140" y="115" fill="#1a3a4a" font-family="system-ui" font-size="18" font-weight="700" text-anchor="middle">RBD</text>
      <text x="140" y="140" fill="#5a6a7a" font-family="system-ui" font-size="13" text-anchor="middle">点突变</text>
      <path class="svg-arrow" marker-end="url(#df-arrow)" d="M 206 100 C 280 52, 350 54, 428 74" stroke="#3a8c6f" stroke-width="2"/>
      <path class="svg-arrow" marker-end="url(#df-arrow)" d="M 206 144 C 280 192, 350 190, 428 170" stroke="#3a8c6f" stroke-width="2"/>
      <rect x="446" y="36" width="172" height="66" rx="14" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="532" y="68" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">ACE2 结合增强</text>
      <text x="532" y="90" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">入侵效率上升</text>
      <rect x="446" y="138" width="172" height="66" rx="14" fill="rgba(193,127,59,0.08)" stroke="#c17f3b" stroke-width="1.5"/>
      <text x="532" y="168" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">抗体识别下降</text>
      <text x="532" y="190" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">免疫逃逸增强</text>
    </svg>
  `,

  /* ── 03 N501Y 趋同 ────────────────────────────────────── */
  convergence: `
    <svg class="mechanism-svg" viewBox="0 0 720 240" aria-hidden="true">
      <defs>
        <marker id="cv-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a3a4a"/>
        </marker>
      </defs>
      <rect x="56" y="36" width="140" height="40" rx="12" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="126" y="63" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">Alpha</text>
      <rect x="56" y="94" width="140" height="40" rx="12" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="126" y="121" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">Beta</text>
      <rect x="56" y="152" width="140" height="40" rx="12" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="126" y="179" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">Gamma</text>
      <path class="svg-arrow" marker-end="url(#cv-arrow)" d="M 216 58 C 298 62, 354 86, 424 108"/>
      <path class="svg-arrow" marker-end="url(#cv-arrow)" d="M 216 116 H 424"/>
      <path class="svg-arrow" marker-end="url(#cv-arrow)" d="M 216 174 C 298 170, 354 146, 424 132"/>
      <circle class="selection-core" cx="516" cy="120" r="62" fill="rgba(58,140,111,0.12)" stroke="#3a8c6f" stroke-width="2.5"/>
      <text x="516" y="112" fill="#1a3a4a" font-family="system-ui" font-size="20" font-weight="700" text-anchor="middle">N501Y</text>
      <text x="516" y="138" fill="#5a6a7a" font-family="system-ui" font-size="14" text-anchor="middle">趋同选择</text>
    </svg>
  `,

  /* ── 04 Omicron 免疫逃逸 ─────────────────────────────── */
  'immune-escape': `
    <svg class="mechanism-svg" viewBox="0 0 720 240" aria-hidden="true">
      <defs>
        <marker id="ie-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a3a4a"/>
        </marker>
      </defs>
      <path d="M 268 60 C 330 20, 420 42, 446 108 C 472 174, 390 208, 314 180 C 252 156, 222 92, 268 60 Z" fill="rgba(58,140,111,0.08)" stroke="#3a8c6f" stroke-width="2"/>
      <text x="350" y="120" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="600" text-anchor="middle">Omicron RBD</text>
      <text x="250" y="50" fill="#c17f3b" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">K417N</text>
      <text x="450" y="68" fill="#c17f3b" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">E484A</text>
      <text x="434" y="196" fill="#c17f3b" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">Q493R</text>
      <path d="M 86 64 L 140 120 L 86 176 M 140 120 L 186 120" fill="none" stroke="#e2e6ea" stroke-width="8" stroke-linecap="round" opacity="0.6"/>
      <text x="126" y="202" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">抗体识别下降</text>
      <path class="svg-arrow" marker-end="url(#ie-arrow)" d="M 456 120 C 492 120, 516 120, 556 120"/>
      <rect x="564" y="80" width="56" height="80" rx="12" fill="rgba(193,127,59,0.1)" stroke="#c17f3b" stroke-width="2"/>
      <text x="592" y="126" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">ACE2</text>
      <text x="448" y="218" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="500" text-anchor="middle">结合维持，逃逸增强</text>
    </svg>
  `,

  /* ── 05 宿主进化工厂 ─────────────────────────────────── */
  'host-factory': `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 460" aria-hidden="true">
      <defs>
        <marker id="hf-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a3a4a"/>
        </marker>
      </defs>
      <circle cx="140" cy="220" r="68" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="2"/>
      <circle cx="140" cy="118" r="34" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="2"/>
      <text x="140" y="324" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="600" text-anchor="middle">免疫缺陷宿主</text>
      <path class="timeline" marker-end="url(#hf-arrow)" d="M 248 220 H 680" fill="none" stroke="#e2e6ea" stroke-width="2"/>
      <circle cx="320" cy="220" r="18" fill="rgba(58,140,111,0.15)" stroke="#3a8c6f" stroke-width="2"/>
      <text x="320" y="272" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">持续感染</text>
      <circle cx="460" cy="220" r="18" fill="rgba(58,140,111,0.15)" stroke="#3a8c6f" stroke-width="2"/>
      <text x="460" y="272" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">突变积累</text>
      <circle cx="600" cy="220" r="18" fill="rgba(58,140,111,0.15)" stroke="#3a8c6f" stroke-width="2"/>
      <text x="600" y="272" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">适应筛选</text>
      <circle cx="310" cy="148" r="8" fill="rgba(58,140,111,0.2)" stroke="#3a8c6f" stroke-width="1.5"/>
      <circle cx="366" cy="126" r="6" fill="rgba(58,140,111,0.2)" stroke="#3a8c6f" stroke-width="1.5"/>
      <circle cx="428" cy="142" r="10" fill="rgba(58,140,111,0.2)" stroke="#3a8c6f" stroke-width="1.5"/>
      <circle cx="498" cy="120" r="7" fill="rgba(58,140,111,0.2)" stroke="#3a8c6f" stroke-width="1.5"/>
      <circle cx="568" cy="148" r="9" fill="rgba(58,140,111,0.2)" stroke="#3a8c6f" stroke-width="1.5"/>
      <circle cx="640" cy="126" r="6" fill="rgba(58,140,111,0.2)" stroke="#3a8c6f" stroke-width="1.5"/>
      <path class="svg-arrow spread-arrow" marker-end="url(#hf-arrow)" d="M 636 184 C 694 148, 726 114, 762 68" fill="none" stroke="#3a8c6f" stroke-width="2.5"/>
      <text x="648" y="60" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="end">外溢传播</text>
    </svg>
  `,

  /* ── 06 上位性 ─────────────────────────────────────────── */
  epistasis: `
    <svg class="mechanism-svg" viewBox="0 0 720 240" aria-hidden="true">
      <defs>
        <marker id="ep-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
        </marker>
      </defs>
      <rect x="76" y="48" width="152" height="56" rx="14" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="152" y="83" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">背景 A</text>
      <rect x="76" y="136" width="152" height="56" rx="14" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="152" y="171" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">背景 B</text>
      <rect class="epi-hot" x="460" y="76" width="170" height="82" rx="20" fill="rgba(58,140,111,0.12)" stroke="#3a8c6f" stroke-width="2"/>
      <text x="545" y="112" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="700" text-anchor="middle">突变组合</text>
      <text x="545" y="138" fill="#3a8c6f" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">1 + 1 &gt; 2</text>
      <path class="svg-arrow" marker-end="url(#ep-arrow)" d="M 244 78 C 324 74, 372 94, 452 108"/>
      <path class="svg-arrow" marker-end="url(#ep-arrow)" d="M 244 166 C 324 170, 372 146, 452 130"/>
      <text x="348" y="215" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="500" text-anchor="middle">同一突变在不同遗传背景中效果不同</text>
    </svg>
  `,

  /* ── 07 总结图 ────────────────────────────────────────── */
  'summary-map': `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 460" aria-hidden="true">
      <defs>
        <marker id="sm-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
        </marker>
      </defs>
      <circle class="summary-core" cx="430" cy="230" r="70" fill="rgba(58,140,111,0.12)" stroke="#3a8c6f" stroke-width="2.5"/>
      <text x="430" y="220" fill="#1a3a4a" font-family="system-ui" font-size="22" font-weight="700" text-anchor="middle">点突变</text>
      <text x="430" y="248" fill="#5a6a7a" font-family="system-ui" font-size="14" text-anchor="middle">基础引擎</text>
      <rect x="84" y="80" width="174" height="52" rx="16" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="171" y="115" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">RBD 热点</text>
      <rect x="602" y="80" width="174" height="52" rx="16" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="689" y="115" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">ACE2 亲和力</text>
      <rect x="84" y="316" width="174" height="52" rx="16" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="171" y="351" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">免疫逃逸</text>
      <rect x="602" y="316" width="174" height="52" rx="16" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="689" y="351" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">上位性</text>
      <path class="summary-link" marker-end="url(#sm-arrow)" d="M 360 184 C 298 148, 260 130, 258 118"/>
      <path class="summary-link" marker-end="url(#sm-arrow)" d="M 500 184 C 556 150, 594 130, 602 118"/>
      <path class="summary-link" marker-end="url(#sm-arrow)" d="M 360 276 C 298 314, 260 332, 258 342"/>
      <path class="summary-link" marker-end="url(#sm-arrow)" d="M 500 276 C 556 312, 594 330, 602 342"/>
    </svg>
  `,

  /* ── 08 病毒模板切换 ─────────────────────────────────── */
  'viral-template-switch': `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 820 440" aria-hidden="true">
      <defs>
        <marker id="ts-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
        </marker>
      </defs>
      <text class="svg-kicker" x="78" y="48">copy-choice / template switching</text>

      <!-- ═══ Template A (deep blue, straight line) ═══ -->
      <text x="82" y="108" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600">亲本模板 A</text>
      <text x="72" y="140" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="end">5&prime;</text>
      <line x1="80" y1="130" x2="740" y2="130" stroke="#1a3a4a" stroke-width="3.5" stroke-linecap="round"/>
      <g opacity="0.18">
        <line x1="140" y1="122" x2="140" y2="138" stroke="#1a3a4a" stroke-width="1.2"/>
        <line x1="240" y1="122" x2="240" y2="138" stroke="#1a3a4a" stroke-width="1.2"/>
        <line x1="340" y1="122" x2="340" y2="138" stroke="#1a3a4a" stroke-width="1.2"/>
        <line x1="440" y1="122" x2="440" y2="138" stroke="#1a3a4a" stroke-width="1.2"/>
        <line x1="540" y1="122" x2="540" y2="138" stroke="#1a3a4a" stroke-width="1.2"/>
        <line x1="640" y1="122" x2="640" y2="138" stroke="#1a3a4a" stroke-width="1.2"/>
      </g>
      <text x="748" y="140" fill="#5a6a7a" font-family="system-ui" font-size="12">3&prime;</text>

      <!-- ═══ Template B (leaf green, straight line) ═══ -->
      <text x="82" y="228" fill="#3a8c6f" font-family="system-ui" font-size="14" font-weight="600">亲本模板 B</text>
      <text x="72" y="260" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="end">5&prime;</text>
      <line x1="80" y1="250" x2="740" y2="250" stroke="#3a8c6f" stroke-width="3.5" stroke-linecap="round"/>
      <g opacity="0.18">
        <line x1="140" y1="242" x2="140" y2="258" stroke="#3a8c6f" stroke-width="1.2"/>
        <line x1="240" y1="242" x2="240" y2="258" stroke="#3a8c6f" stroke-width="1.2"/>
        <line x1="340" y1="242" x2="340" y2="258" stroke="#3a8c6f" stroke-width="1.2"/>
        <line x1="440" y1="242" x2="440" y2="258" stroke="#3a8c6f" stroke-width="1.2"/>
        <line x1="540" y1="242" x2="540" y2="258" stroke="#3a8c6f" stroke-width="1.2"/>
        <line x1="640" y1="242" x2="640" y2="258" stroke="#3a8c6f" stroke-width="1.2"/>
      </g>
      <text x="748" y="260" fill="#5a6a7a" font-family="system-ui" font-size="12">3&prime;</text>

      <!-- ═══ RdRp (clickable, translates) ═══ -->
      <g class="ts-pol" style="cursor:pointer">
        <circle class="ts-pol-ring" cx="0" cy="0" r="34" fill="rgba(58,140,111,0.12)" stroke="#3a8c6f" stroke-width="2.5"/>
        <text class="ts-pol-name" x="0" y="-3" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="700" text-anchor="middle">RdRp</text>
        <text class="ts-pol-hint" x="0" y="14" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">点击 ▼</text>
      </g>

      <!-- ═══ Dynamic overlay (opacity toggled by step) ═══ -->
      <!-- A-color nascent chain (below template A, steps 2-3) -->
      <path class="ts-chain-a" d="M 520 165 L 680 165" stroke="#1a3a4a" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0"/>
      <!-- Base pairing lines (template A → chain A, steps 2-3) -->
      <g class="ts-pair-a" opacity="0">
        <line x1="400" y1="130" x2="400" y2="164" stroke="#8ab4a8" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="480" y1="130" x2="480" y2="164" stroke="#8ab4a8" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="560" y1="130" x2="560" y2="164" stroke="#8ab4a8" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="640" y1="130" x2="640" y2="164" stroke="#8ab4a8" stroke-width="1" stroke-dasharray="3 3"/>
      </g>
      <!-- Detached nascent chain (lifted above, steps 4-6) -->
      <path class="ts-chain-detach" d="M 360 105 L 680 105" stroke="#1a3a4a" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0"/>
      <!-- Jump arc (steps 5-6) -->
      <path class="ts-jump-arc" d="M 360 105 Q 300 175, 360 230" stroke="#3a8c6f" stroke-width="2.5" stroke-dasharray="8 5" fill="none" opacity="0" marker-end="url(#ts-arrow)"/>
      <!-- B-color nascent chain (above template B, steps 5-6) -->
      <path class="ts-chain-b" d="M 200 230 L 360 230" stroke="#3a8c6f" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0"/>
      <!-- Base pairing lines (chain B → template B, steps 5-6) -->
      <g class="ts-pair-b" opacity="0">
        <line x1="240" y1="230" x2="240" y2="249" stroke="#8ab4a8" stroke-width="1" stroke-dasharray="3 3"/>
        <line x1="300" y1="230" x2="300" y2="249" stroke="#8ab4a8" stroke-width="1" stroke-dasharray="3 3"/>
      </g>
      <!-- Chimeric genome label (step 6) -->
      <g class="ts-chimeric" opacity="0">
        <rect x="270" y="320" width="260" height="30" rx="14" fill="rgba(58,140,111,0.1)" stroke="#3a8c6f" stroke-width="1"/>
        <text x="400" y="340" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">嵌合基因组：A 片段 + B 片段</text>
      </g>

      <!-- ═══ Bottom controls ═══ -->
      <rect x="140" y="365" width="420" height="36" rx="8" fill="rgba(247,248,250,0.95)" stroke="#e2e6ea" stroke-width="1"/>
      <text class="ts-step-text" x="350" y="390" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">点击 RdRp 启动模板切换 ▶</text>
      <g class="ts-reset" transform="translate(576,370)" style="cursor:pointer">
        <rect x="0" y="0" width="64" height="26" rx="6" fill="#e2e6ea" stroke="#d5d5d5" stroke-width="1"/>
        <text x="32" y="18" fill="#42627a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">⟳ 重置</text>
      </g>
    </svg>
  `,

  /* ── 09 真核生物 ──────────────────────────────────────── */
  'eukaryotic-crossing': `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 820 440" aria-hidden="true">
      <text class="svg-kicker" x="78" y="48">meiosis / homologous chromosome pairing</text>
      <path d="M 240 82 C 296 156, 296 264, 240 342" fill="none" stroke="#1a3a4a" stroke-width="7" opacity="0.4" stroke-linecap="round"/>
      <path d="M 292 82 C 236 156, 236 264, 292 342" fill="none" stroke="#1a3a4a" stroke-width="7" opacity="0.4" stroke-linecap="round"/>
      <path d="M 526 82 C 470 156, 470 264, 526 342" fill="none" stroke="#5a6a7a" stroke-width="7" opacity="0.3" stroke-linecap="round"/>
      <path d="M 474 82 C 530 156, 530 264, 474 342" fill="none" stroke="#5a6a7a" stroke-width="7" opacity="0.3" stroke-linecap="round"/>
      <path class="crossover" d="M 270 192 C 340 222, 408 222, 504 192" fill="none" stroke="#3a8c6f" stroke-width="4" opacity="0.7"/>
      <path class="crossover" d="M 504 240 C 418 214, 348 214, 270 240" fill="none" stroke="#3a8c6f" stroke-width="4" opacity="0.7"/>
      <rect x="126" y="370" width="156" height="38" rx="18" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="204" y="395" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">结构化</text>
      <rect x="326" y="370" width="156" height="38" rx="18" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="404" y="395" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">受控</text>
      <rect x="526" y="370" width="156" height="38" rx="18" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="604" y="395" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">染色体交换</text>
    </svg>
  `,

  /* ── 10 原核生物（交互） ─────────────────────────────── */
  'prokaryotic-transfer': `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 820 440" aria-hidden="true">
      <defs>
        <marker id="pk-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a3a4a"/>
        </marker>
        <marker id="pk-accent" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
        </marker>
      </defs>
      <g class="bacterium bacterium-donor">
        <ellipse cx="198" cy="210" rx="100" ry="56" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="2"/>
        <text x="198" y="216" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">供体细胞</text>
        <g class="plasmid-transfer" data-prok-trigger="conjugation" role="button" tabindex="0" aria-label="点击演示质粒经接合进入受体细胞">
          <circle cx="238" cy="178" r="20" fill="none" stroke="#3a8c6f" stroke-width="2.5"/>
          <path d="M 226 178 C 226 164, 250 164, 250 178 S 238 192, 238 178" fill="none" stroke="#3a8c6f" stroke-width="2"/>
        </g>
      </g>
      <g class="bacterium bacterium-recipient">
        <ellipse cx="614" cy="210" rx="114" ry="64" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="2"/>
        <text x="614" y="216" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">受体细胞</text>
      </g>
      <path class="transfer-bridge conjugation-arrow" marker-end="url(#pk-arrow)" d="M 254 178 C 360 160, 460 168, 530 198" fill="none" stroke="#1a3a4a" stroke-width="2" opacity="0.6"/>
      <text x="198" y="30" fill="#3a8c6f" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">转导</text>
      <text x="398" y="148" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">接合</text>
      <text x="354" y="326" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">转化</text>
      <path class="transfer-bridge transformation-arrow" marker-end="url(#pk-arrow)" d="M 334 310 C 416 300, 488 268, 536 228" fill="none" stroke="#5a6a7a" stroke-width="2" stroke-dasharray="8 8" opacity="0.6"/>
      <g class="transformation-dna" data-prok-trigger="transformation" role="button" tabindex="0" aria-label="点击演示外源 DNA 通过转化进入受体细胞">
        <path class="external-dna" d="M 238 310 C 270 290, 306 330, 340 310 S 410 290, 446 310" fill="none" stroke="#3a8c6f" stroke-width="2.5"/>
        <circle cx="238" cy="310" r="7" fill="#3a8c6f" stroke="#fff" stroke-width="1.5"/>
        <circle cx="446" cy="310" r="7" fill="#3a8c6f" stroke="#fff" stroke-width="1.5"/>
      </g>
      <g class="phage-transfer" data-prok-trigger="transduction" role="button" tabindex="0" aria-label="点击演示噬菌体靠近受体细胞并注入遗传物质">
        <polygon points="170,24 194,8 218,24 218,50 194,66 170,50" fill="rgba(26,58,74,0.08)" stroke="#1a3a4a" stroke-width="2.5"/>
        <line x1="194" y1="66" x2="194" y2="74" stroke="#1a3a4a" stroke-width="3" stroke-linecap="round"/>
        <rect x="186" y="74" width="16" height="20" rx="5" fill="rgba(26,58,74,0.08)" stroke="#1a3a4a" stroke-width="2.5"/>
        <line x1="194" y1="94" x2="194" y2="106" stroke="#1a3a4a" stroke-width="3" stroke-linecap="round"/>
        <line x1="194" y1="106" x2="170" y2="118" stroke="#1a3a4a" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="194" y1="106" x2="194" y2="124" stroke="#1a3a4a" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="194" y1="106" x2="218" y2="118" stroke="#1a3a4a" stroke-width="2.5" stroke-linecap="round"/>
      </g>
      <path class="transfer-bridge phage-approach" marker-end="url(#pk-accent)" d="M 238 68 C 368 52, 494 78, 590 128" fill="none" stroke="#3a8c6f" stroke-width="2" stroke-dasharray="8 8" opacity="0.6"/>
      <path class="phage-dna-injection" marker-end="url(#pk-accent)" d="M 614 136 V 206" fill="none" stroke="#3a8c6f" stroke-width="2.5" stroke-dasharray="6 6"/>
      <text x="398" y="386" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">点击 DNA、质粒或噬菌体，分别演示三类原核重组路径</text>
    </svg>
  `,

  /* ── 11 三类对比 ──────────────────────────────────────── */
  'three-way-comparison': `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 900 440" aria-hidden="true">
      <defs>
        <marker id="tw-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a3a4a"/>
        </marker>
      </defs>
      <rect x="36" y="54" width="256" height="300" rx="22" fill="rgba(26,58,74,0.03)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="164" y="96" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">真核生物</text>
      <path d="M 126 134 C 162 186, 162 240, 126 294" fill="none" stroke="#1a3a4a" stroke-width="5" opacity="0.4" stroke-linecap="round"/>
      <path d="M 202 134 C 166 186, 166 240, 202 294" fill="none" stroke="#5a6a7a" stroke-width="5" opacity="0.3" stroke-linecap="round"/>
      <path class="crossover" d="M 166 202 C 200 216, 218 216, 200 202" fill="none" stroke="#3a8c6f" stroke-width="3" opacity="0.7"/>
      <text x="164" y="332" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">染色体片段交换</text>
      <rect x="322" y="54" width="256" height="300" rx="22" fill="rgba(26,58,74,0.03)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="450" y="96" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">原核生物</text>
      <ellipse cx="402" cy="210" rx="56" ry="34" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="2"/>
      <ellipse cx="498" cy="210" rx="56" ry="34" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="2"/>
      <path class="svg-arrow" marker-end="url(#tw-arrow)" d="M 456 210 H 468"/>
      <text x="450" y="332" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">细胞间基因流动</text>
      <rect x="608" y="54" width="256" height="300" rx="22" fill="rgba(58,140,111,0.05)" stroke="#3a8c6f" stroke-width="1.5"/>
      <text x="736" y="96" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">SARS-CoV-2</text>
      <path d="M 660 164 C 706 134, 744 196, 788 164" fill="none" stroke="#1a3a4a" stroke-width="3.5" opacity="0.45"/>
      <path d="M 660 246 C 706 216, 744 278, 788 246" fill="none" stroke="#3a8c6f" stroke-width="3.5" opacity="0.55"/>
      <path class="jump-arc" marker-end="url(#tw-arrow)" d="M 700 176 C 730 198, 736 218, 764 240"/>
      <text x="736" y="332" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">复制瞬间模板跳跃</text>
    </svg>
  `,

  /* ── 12 RdRp 模板切换 ────────────────────────────────── */
  'rdRp-switch-engine': `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 440" aria-hidden="true">
      <defs>
        <marker id="rs-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
        </marker>
        <marker id="rs-small" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
        </marker>
      </defs>
      <text class="svg-kicker" x="72" y="48">co-infection + homologous pairing + polymerase pausing</text>
      <text x="134" y="108" fill="#5a6a7a" font-family="system-ui" font-size="13" font-weight="500" text-anchor="start">当前模板</text>
      <path d="M 80 136 C 144 94, 214 180, 280 136 S 424 136, 488 136" fill="none" stroke="#1a3a4a" stroke-width="3" opacity="0.4"/>
      <text x="146" y="200" fill="#5a6a7a" font-family="system-ui" font-size="13" font-weight="500" text-anchor="start">相似模板</text>
      <path d="M 102 224 C 166 182, 236 268, 302 224 S 446 224, 510 224" fill="none" stroke="#3a8c6f" stroke-width="3" opacity="0.5"/>
      <text x="156" y="280" fill="#5a6a7a" font-family="system-ui" font-size="13" font-weight="500" text-anchor="start">其他模板</text>
      <path d="M 134 302 C 198 260, 268 346, 334 302 S 478 302, 542 302" fill="none" stroke="#c17f3b" stroke-width="3" opacity="0.35"/>
      <circle cx="400" cy="162" r="42" fill="rgba(58,140,111,0.15)" stroke="#3a8c6f" stroke-width="2.5"/>
      <text x="400" y="170" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">RdRp</text>
      <circle class="stall-ring" cx="400" cy="162" r="50" fill="none" stroke="rgba(58,140,111,0.2)" stroke-width="2.5" stroke-dasharray="6 6"/>
      <text x="400" y="88" fill="#3a8c6f" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">暂停 / 脱离</text>
      <path class="switch-arrow" marker-end="url(#rs-small)" d="M 430 188 C 470 196, 496 208, 518 224"/>
      <text x="578" y="200" fill="#3a8c6f" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">切换到相似模板</text>
      <rect x="614" y="64" width="168" height="48" rx="12" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="698" y="96" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">结合松动</text>
      <rect x="614" y="136" width="168" height="48" rx="12" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="698" y="168" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">相似模板</text>
      <rect x="614" y="208" width="168" height="48" rx="12" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="698" y="240" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">二级结构</text>
      <text x="320" y="398" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">暂停 → 重新配对 → 继续复制</text>
    </svg>
  `,

  /* ── 13 XBB 基因组 ────────────────────────────────────── */
  'xbb-genome': `
    <svg class="mechanism-svg" viewBox="0 0 720 220" aria-hidden="true">
      <defs>
        <marker id="xbb-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a3a4a"/>
        </marker>
      </defs>
      <text class="svg-kicker" x="46" y="28">XBB recombinant mosaic</text>
      <text x="58" y="70" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="end">BJ.1</text>
      <rect x="118" y="52" width="380" height="24" rx="12" fill="#8a7aaa" opacity="0.7"/>
      <text x="58" y="112" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="end">BM.1.1.1</text>
      <rect x="118" y="94" width="470" height="24" rx="12" fill="#7aaa8a" opacity="0.7"/>
      <text x="58" y="160" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="end">XBB</text>
      <rect x="118" y="142" width="280" height="28" rx="14" fill="#8a7aaa" opacity="0.7"/>
      <rect x="394" y="142" width="194" height="28" rx="14" fill="#7aaa8a" opacity="0.7"/>
      <line class="breakpoint" x1="394" y1="42" x2="394" y2="184"/>
      <text x="394" y="202" fill="#c17f3b" font-family="system-ui" font-size="12" font-weight="500" text-anchor="middle">Spike RBD breakpoint</text>
      <path class="svg-arrow" marker-end="url(#xbb-arrow)" d="M 282 86 C 304 108, 330 130, 362 146"/>
    </svg>
  `,

  /* ── 14 重组频率 ──────────────────────────────────────── */
  'frequency-landscape': `
    <svg class="mechanism-svg" viewBox="0 0 720 220" aria-hidden="true">
      <text class="svg-kicker" x="46" y="28">pandemic-scale recombination landscape</text>
      <circle cx="126" cy="118" r="56" fill="rgba(58,140,111,0.1)" stroke="#3a8c6f" stroke-width="2.5"/>
      <text x="126" y="108" fill="#1a3a4a" font-family="JetBrains Mono,monospace" font-size="24" font-weight="700" text-anchor="middle">589</text>
      <text x="126" y="138" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">events</text>
      <circle cx="302" cy="118" r="56" fill="rgba(58,140,111,0.1)" stroke="#3a8c6f" stroke-width="2.5"/>
      <text x="302" y="108" fill="#1a3a4a" font-family="JetBrains Mono,monospace" font-size="24" font-weight="700" text-anchor="middle">2.7%</text>
      <text x="302" y="138" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">detectable ancestry</text>
      <rect x="456" y="104" width="176" height="26" rx="12" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <rect class="spike-peak" x="580" y="104" width="38" height="26" rx="12" fill="rgba(58,140,111,0.2)" stroke="#3a8c6f" stroke-width="1.5"/>
      <path class="peak-curve" d="M 456 92 C 500 74, 536 96, 570 56 C 604 16, 638 68, 632 92" fill="none" stroke="#3a8c6f" stroke-width="2.5"/>
      <text x="548" y="162" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">3' end / Spike peak</text>
    </svg>
  `,

  /* ── 15 进化加速器 ────────────────────────────────────── */
  'evolution-accelerator': `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 440" aria-hidden="true">
      <defs>
        <marker id="ea-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
        </marker>
      </defs>
      <text class="svg-kicker" x="72" y="48">recombination as an evolutionary accelerator</text>
      <rect x="84" y="128" width="140" height="60" rx="16" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="154" y="165" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">亲本 A</text>
      <rect x="84" y="232" width="140" height="60" rx="16" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="154" y="269" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="600" text-anchor="middle">亲本 B</text>
      <path class="svg-arrow" marker-end="url(#ea-arrow)" d="M 242 160 C 328 162, 366 180, 444 206"/>
      <path class="svg-arrow" marker-end="url(#ea-arrow)" d="M 242 268 C 328 264, 366 238, 444 212"/>
      <rect class="evo-core" x="462" y="160" width="136" height="84" rx="22" fill="rgba(58,140,111,0.15)" stroke="#3a8c6f" stroke-width="2.5"/>
      <text x="530" y="196" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">重组</text>
      <text x="530" y="222" fill="#5a6a7a" font-family="system-ui" font-size="13" text-anchor="middle">一次组合</text>
      <path class="svg-arrow" marker-end="url(#ea-arrow)" d="M 616 202 H 714"/>
      <circle class="advantage-node" cx="748" cy="202" r="50" fill="rgba(58,140,111,0.12)" stroke="#3a8c6f" stroke-width="2.5"/>
      <text x="748" y="190" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="700" text-anchor="middle">逃逸</text>
      <text x="748" y="214" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="700" text-anchor="middle">传播</text>
      <text x="430" y="370" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">逐步突变之外，重组能快速整合既有有利片段</text>
    </svg>
  `,

	  /* ── 16 Indel 三段对比 ───────────────────────────────── */
	  'indel-spectrum': `
	    <svg class="mechanism-svg" viewBox="0 0 720 240" aria-hidden="true">
	      <text class="svg-kicker" x="42" y="32">SNP  &middot;  Indel  &middot;  Recombination</text>
	      <rect x="52" y="62" width="36" height="36" rx="8" fill="rgba(26,58,74,.06)" stroke="#e2e6ea" stroke-width="1.5"/>
	      <text x="70" y="87" fill="#1a3a4a" font-family="system-ui" font-size="18" font-weight="700" text-anchor="middle">A</text>
	      <rect x="92" y="62" width="36" height="36" rx="8" fill="rgba(26,58,74,.06)" stroke="#e2e6ea" stroke-width="1.5"/>
	      <text x="110" y="87" fill="#1a3a4a" font-family="system-ui" font-size="18" font-weight="700" text-anchor="middle">U</text>
	      <rect class="is-hot" x="132" y="62" width="36" height="36" rx="8" fill="rgba(58,140,111,.15)" stroke="#3a8c6f" stroke-width="2"/>
	      <text x="150" y="87" fill="#1a3a4a" font-family="system-ui" font-size="18" font-weight="700" text-anchor="middle">C</text>
	      <rect x="172" y="62" width="36" height="36" rx="8" fill="rgba(26,58,74,.06)" stroke="#e2e6ea" stroke-width="1.5"/>
	      <text x="190" y="87" fill="#1a3a4a" font-family="system-ui" font-size="18" font-weight="700" text-anchor="middle">G</text>
	      <text x="134" y="126" fill="#5a6a7a" font-family="system-ui" font-size="13" text-anchor="middle">1 nt &middot; 点突变</text>
	      <rect x="292" y="56" width="136" height="48" rx="10" fill="rgba(58,140,111,.12)" stroke="#3a8c6f" stroke-width="2.5" stroke-dasharray="6 4"/>
	      <text x="360" y="78" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">Δ 6–21 nt</text>
	      <text x="360" y="94" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">2–7 个密码子</text>
	      <text x="360" y="132" fill="#5a6a7a" font-family="system-ui" font-size="13" text-anchor="middle">插入与缺失 &middot; 结构性后果</text>
	      <rect x="508" y="56" width="160" height="48" rx="10" fill="rgba(26,58,74,.08)" stroke="#e2e6ea" stroke-width="1.5"/>
	      <text x="588" y="74" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">~10 kb+</text>
	      <text x="588" y="94" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">大段 RNA 拼接</text>
	      <text x="588" y="132" fill="#5a6a7a" font-family="system-ui" font-size="13" text-anchor="middle">重组 &middot; 多重突变一次引入</text>
	      <path d="M 124 152 L 124 164 L 596 164 L 596 152" fill="none" stroke="#e2e6ea" stroke-width="1"/>
	      <text x="360" y="184" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">Indel 介于二者之间：改变长度不大，后果常常是结构性的</text>
	    </svg>
	  `,

	  /* ── 17 Indel 机制 ──────────────────────────────────── */
	  'indel-mechanisms': `
	    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 440" aria-hidden="true">
	      <defs>
	        <marker id="im-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
	          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
	        </marker>
	      </defs>
	      <text class="svg-kicker" x="72" y="44">polymerase slippage &middot; template switching &middot; hairpin stalling</text>
	      <rect x="44" y="70" width="244" height="294" rx="18" fill="rgba(26,58,74,.03)" stroke="#e2e6ea" stroke-width="1.5"/>
	      <text x="166" y="104" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700" text-anchor="middle">聚合酶滑移</text>
	      <line x1="120" y1="136" x2="212" y2="136" stroke="#1a3a4a" stroke-width="3" stroke-linecap="round"/>
	      <circle cx="166" cy="136" r="16" fill="rgba(58,140,111,.15)" stroke="#3a8c6f" stroke-width="2"/>
	      <text x="166" y="141" fill="#1a3a4a" font-family="system-ui" font-size="10" font-weight="700" text-anchor="middle">RdRp</text>
	      <path d="M 190 136 C 200 150, 210 180, 210 196 L 210 216" fill="none" stroke="#3a8c6f" stroke-width="2.5" marker-end="url(#im-arrow)"/>
	      <text x="166" y="256" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">聚合酶在重复序列</text>
	      <text x="166" y="276" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">区域滑移产生缺失</text>
	      <text x="166" y="336" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">缺失 / 插入</text>
	      <rect x="308" y="70" width="244" height="294" rx="18" fill="rgba(58,140,111,.04)" stroke="#3a8c6f" stroke-width="1.5"/>
	      <text x="430" y="104" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700" text-anchor="middle">模板切换</text>
	      <line x1="372" y1="150" x2="488" y2="150" stroke="#1a3a4a" stroke-width="3" stroke-linecap="round" opacity=".5"/>
	      <line x1="372" y1="186" x2="488" y2="186" stroke="#3a8c6f" stroke-width="3" stroke-linecap="round" opacity=".6"/>
	      <circle cx="430" cy="150" r="14" fill="rgba(58,140,111,.12)" stroke="#3a8c6f" stroke-width="2"/>
	      <text x="430" y="155" fill="#1a3a4a" font-family="system-ui" font-size="10" font-weight="700" text-anchor="middle">RdRp</text>
	      <path d="M 430 164 C 410 174, 420 180, 430 186" fill="none" stroke="#3a8c6f" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#im-arrow)"/>
	      <text x="430" y="256" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">短程模板跳跃</text>
	      <text x="430" y="276" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">携带新生链重配对</text>
	      <text x="430" y="336" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">缺失 / 小插入</text>
	      <rect x="572" y="70" width="244" height="294" rx="18" fill="rgba(26,58,74,.03)" stroke="#e2e6ea" stroke-width="1.5"/>
	      <text x="694" y="104" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700" text-anchor="middle">RNA 二级结构</text>
	      <path d="M 636 144 C 636 132, 654 132, 654 156 S 636 180, 636 168" fill="none" stroke="#1a3a4a" stroke-width="3" stroke-linecap="round"/>
	      <path d="M 680 144 C 680 132, 698 132, 698 156 S 680 180, 680 168" fill="none" stroke="#1a3a4a" stroke-width="3" stroke-linecap="round"/>
	      <circle cx="694" cy="196" r="12" fill="rgba(200,75,75,.15)" stroke="#c84b4b" stroke-width="2"/>
	      <text x="694" y="200" fill="#c84b4b" font-family="system-ui" font-size="10" font-weight="700" text-anchor="middle">Pause</text>
	      <text x="694" y="256" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">发夹结构使 RdRp</text>
	      <text x="694" y="276" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">暂停 → 跳跃 → 缺失</text>
	      <text x="694" y="336" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">缺失</text>
	      <text x="430" y="406" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">三种机制均在复制过程中可发生，产物体量从几个核苷酸到数十个核苷酸</text>
	    </svg>
	  `,

	  /* ── 18 NTD 超级位点 ────────────────────────────────── */
	  'ntd-hotspot': `
	    <svg class="mechanism-svg" viewBox="0 0 720 240" aria-hidden="true">
	      <text class="svg-kicker" x="42" y="32">NTD supersite &amp; flexible loop architecture</text>
	      <rect x="42" y="66" width="636" height="14" rx="7" fill="rgba(26,58,74,.06)"/>
	      <rect x="42" y="66" width="168" height="14" rx="7" fill="rgba(58,140,111,.2)" stroke="#3a8c6f" stroke-width="2"/>
	      <text x="126" y="64" fill="#3a8c6f" font-family="system-ui" font-size="11" font-weight="600" text-anchor="middle">NTD</text>
	      <rect x="236" y="66" width="170" height="14" rx="7" fill="rgba(26,58,74,.08)" stroke="#e2e6ea" stroke-width="1"/>
	      <text x="321" y="64" fill="#5a6a7a" font-family="system-ui" font-size="11" font-weight="500" text-anchor="middle">RBD</text>
	      <rect x="480" y="66" width="100" height="14" rx="7" fill="rgba(26,58,74,.08)" stroke="#e2e6ea" stroke-width="1"/>
	      <text x="530" y="64" fill="#5a6a7a" font-family="system-ui" font-size="11" font-weight="500" text-anchor="middle">S1/S2</text>
	      <rect x="594" y="66" width="84" height="14" rx="7" fill="rgba(26,58,74,.08)" stroke="#e2e6ea" stroke-width="1"/>
	      <text x="636" y="64" fill="#5a6a7a" font-family="system-ui" font-size="11" font-weight="500" text-anchor="middle">S2</text>
	      <text x="60" y="128" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="600">NTD 展开：</text>
	      <rect x="172" y="112" width="260" height="52" rx="12" fill="rgba(58,140,111,.06)" stroke="#3a8c6f" stroke-width="1.5"/>
	      <path d="M 190 132 C 206 120, 218 148, 234 132 S 262 148, 278 132 S 306 148, 322 132 S 350 148, 366 132 S 394 148, 410 132" fill="none" stroke="#1a3a4a" stroke-width="2.5" stroke-linecap="round"/>
	      <circle cx="234" cy="126" r="5" fill="#3a8c6f"/>
	      <circle cx="278" cy="126" r="5" fill="#3a8c6f"/>
	      <circle cx="322" cy="126" r="5" fill="#3a8c6f"/>
	      <circle cx="366" cy="126" r="5" fill="#3a8c6f"/>
	      <circle cx="410" cy="126" r="5" fill="#3a8c6f"/>
	      <text x="466" y="138" fill="#3a8c6f" font-family="system-ui" font-size="13" font-weight="600">超级位点</text>
	      <path d="M 466 146 C 466 160, 322 152, 322 131" fill="none" stroke="#3a8c6f" stroke-width="1.5" stroke-dasharray="3 3"/>
	      <text x="360" y="216" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">“扛得住改动 + 改动后收益大”——NTD 成为 indel 高发热点。</text>
	    </svg>
	  `,

	  /* ── 19 趋同缺失 ────────────────────────────────────── */
	  'deletion-cases': `
	    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 440" aria-hidden="true">
	      <text class="svg-kicker" x="72" y="44">recurrent deletion sites across lineages</text>
	      <rect x="60" y="70" width="160" height="32" rx="8" fill="rgba(26,58,74,.06)" stroke="#e2e6ea" stroke-width="1"/>
	      <text x="140" y="90" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">ΔH69/V70</text>
	      <rect x="250" y="74" width="300" height="24" rx="12" fill="rgba(58,140,111,.15)"/>
	      <text x="400" y="90" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="500" text-anchor="middle">Alpha &middot; Omicron &middot; B.1.1.7</text>
	      <text x="590" y="90" fill="#5a6a7a" font-family="system-ui" font-size="12">抗体结合位移</text>
	      <rect x="60" y="120" width="160" height="32" rx="8" fill="rgba(26,58,74,.06)" stroke="#e2e6ea" stroke-width="1"/>
	      <text x="140" y="140" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">ΔY144</text>
	      <rect x="250" y="124" width="300" height="24" rx="12" fill="rgba(58,140,111,.15)"/>
	      <text x="400" y="140" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="500" text-anchor="middle">N439K 背景 &middot; B.1.1.7</text>
	      <text x="590" y="140" fill="#5a6a7a" font-family="system-ui" font-size="12">NTD 抗原位点</text>
	      <rect x="60" y="170" width="160" height="32" rx="8" fill="rgba(26,58,74,.06)" stroke="#e2e6ea" stroke-width="1"/>
	      <text x="140" y="190" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">ΔE156-F157</text>
	      <rect x="250" y="174" width="300" height="24" rx="12" fill="rgba(58,140,111,.15)"/>
	      <text x="400" y="190" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="500" text-anchor="middle">Delta &middot; 趋同</text>
	      <text x="590" y="190" fill="#5a6a7a" font-family="system-ui" font-size="12">NTD 超级位点</text>
	      <rect x="60" y="220" width="160" height="32" rx="8" fill="rgba(26,58,74,.06)" stroke="#e2e6ea" stroke-width="1"/>
	      <text x="140" y="240" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">ΔV143-Y145</text>
	      <rect x="250" y="224" width="300" height="24" rx="12" fill="rgba(58,140,111,.15)"/>
	      <text x="400" y="240" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="500" text-anchor="middle">Omicron &middot; BA.2</text>
	      <text x="590" y="240" fill="#5a6a7a" font-family="system-ui" font-size="12">NTD 超级位点</text>
	      <path d="M 300 280 L 300 296" fill="none" stroke="#3a8c6f" stroke-width="2"/>
	      <text x="300" y="314" fill="#3a8c6f" font-family="system-ui" font-size="13" font-weight="600" text-anchor="middle">趋同选择压力</text>
	      <text x="430" y="406" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="500" text-anchor="middle">不同谱系反复在 NTD 相似位置出现缺失突变，指向共同的免疫逃逸优势</text>
	    </svg>
	  `,

	  /* ── 20 ins214EPE ────────────────────────────────────── */
	  'ins214epe': `
	    <svg class="mechanism-svg" viewBox="0 0 720 240" aria-hidden="true">
	      <text class="svg-kicker" x="42" y="32">ins214EPE in BA.1 NTD — three amino acids from a neighbouring site</text>
	      <path d="M 128 84 C 176 56, 256 64, 310 90 S 394 120, 432 86 S 506 60, 560 84 S 648 108, 680 84" fill="none" stroke="#1a3a4a" stroke-width="2.5" opacity=".2"/>
	      <text x="128" y="170" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">NTD surface loop</text>
	      <circle cx="432" cy="86" r="36" fill="rgba(58,140,111,.12)" stroke="#3a8c6f" stroke-width="2.5" stroke-dasharray="6 4"/>
	      <text x="432" y="72" fill="#3a8c6f" font-family="system-ui" font-size="13" font-weight="700" text-anchor="middle">214</text>
	      <text x="432" y="88" fill="#3a8c6f" font-family="system-ui" font-size="11" font-weight="600" text-anchor="middle">EPE</text>
	      <text x="432" y="150" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">Glu-Pro-Glu</text>
	      <text x="432" y="166" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">来自邻近基因组区域</text>
	      <rect x="124" y="190" width="472" height="30" rx="8" fill="rgba(26,58,74,.04)" stroke="#e2e6ea" stroke-width="1"/>
	      <text x="360" y="209" fill="#1a3a4a" font-family="JetBrains Mono,monospace" font-size="13" text-anchor="middle">··· N-R-I ·</text>
	      <text x="360" y="209" fill="#3a8c6f" font-family="JetBrains Mono,monospace" font-size="13" font-weight="700" text-anchor="middle" dx="62">E-P-E</text>
	      <text x="360" y="209" fill="#1a3a4a" font-family="JetBrains Mono,monospace" font-size="13" text-anchor="middle" dx="114">· K-R-I ···</text>
	    </svg>
	  `,

	  /* ── 21 慢性感染时间线 ──────────────────────────────── */
	  'chronic-indel': `
	    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 440" aria-hidden="true">
	      <text class="svg-kicker" x="72" y="44">chronic infection — 521-day longitudinal sampling</text>
	      <line x1="100" y1="104" x2="760" y2="104" stroke="#e2e6ea" stroke-width="2"/>
	      <text x="100" y="96" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">Day 0</text>
	      <text x="760" y="96" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">Day 521</text>
	      <circle cx="160" cy="104" r="6" fill="#3a8c6f"/>
	      <text x="160" y="80" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">D30</text>
	      <circle cx="320" cy="104" r="6" fill="#3a8c6f"/>
	      <text x="320" y="80" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">D150</text>
	      <circle cx="480" cy="104" r="6" fill="#3a8c6f"/>
	      <text x="480" y="80" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">D300</text>
	      <circle cx="640" cy="104" r="6" fill="#3a8c6f"/>
	      <text x="640" y="80" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">D450</text>
	      <circle cx="720" cy="104" r="6" fill="#c84b4b"/>
	      <text x="720" y="80" fill="#c84b4b" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">Last</text>
	      <rect x="140" y="130" width="28" height="36" rx="4" fill="rgba(26,58,74,.15)"/>
	      <text x="154" y="178" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">2</text>
	      <rect x="300" y="120" width="28" height="46" rx="4" fill="rgba(26,58,74,.15)"/>
	      <text x="314" y="178" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">5</text>
	      <rect x="460" y="110" width="28" height="56" rx="4" fill="rgba(26,58,74,.15)"/>
	      <text x="474" y="178" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">8</text>
	      <rect x="620" y="118" width="28" height="48" rx="4" fill="rgba(26,58,74,.15)"/>
	      <text x="634" y="178" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">6</text>
	      <text x="430" y="156" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">替换 (substitution) 计数</text>
	      <rect x="170" y="210" width="28" height="20" rx="4" fill="rgba(58,140,111,.25)"/>
	      <text x="184" y="248" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">0</text>
	      <rect x="330" y="208" width="28" height="22" rx="4" fill="rgba(58,140,111,.25)"/>
	      <text x="344" y="248" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">1</text>
	      <rect x="490" y="200" width="28" height="30" rx="4" fill="rgba(58,140,111,.35)"/>
	      <text x="504" y="248" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">3</text>
	      <rect x="650" y="202" width="28" height="28" rx="4" fill="rgba(58,140,111,.35)"/>
	      <text x="664" y="248" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">2</text>
	      <text x="430" y="226" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">缺失 (deletion) 计数</text>
	      <rect x="180" y="310" width="500" height="66" rx="14" fill="rgba(58,140,111,.08)" stroke="#3a8c6f" stroke-width="1.5"/>
	      <text x="430" y="336" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">Indel 在 Spike 中富集 — 尤其 NTD &amp; RBD</text>
	      <text x="430" y="360" fill="#5a6a7a" font-family="system-ui" font-size="13" text-anchor="middle">在长期感染的纵向采样中，缺失突变随时间积累并主要集中于 Spike 区域</text>
	    </svg>
	  `
	};

diagrams['three-way-comparison'] = `
  <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 900 440" aria-hidden="true">
    <defs>
      <marker id="tw-arrow-neutral" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#5a6a7a"/>
      </marker>
      <marker id="tw-arrow-accent" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
      </marker>
    </defs>
    <g class="comparison-card comparison-card--euk">
      <rect x="36" y="54" width="256" height="300" rx="22" fill="rgba(26,58,74,0.03)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="164" y="96" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">真核生物</text>
      <path class="chromosome-left" d="M 126 134 C 150 176, 150 252, 126 294" fill="none" stroke="#1a3a4a" stroke-width="7" opacity="0.38" stroke-linecap="round"/>
      <path class="chromosome-left" d="M 150 134 C 126 176, 126 252, 150 294" fill="none" stroke="#1a3a4a" stroke-width="7" opacity="0.18" stroke-linecap="round"/>
      <path class="chromosome-right" d="M 204 134 C 180 176, 180 252, 204 294" fill="none" stroke="#5a6a7a" stroke-width="7" opacity="0.36" stroke-linecap="round"/>
      <path class="chromosome-right" d="M 180 134 C 204 176, 204 252, 180 294" fill="none" stroke="#5a6a7a" stroke-width="7" opacity="0.18" stroke-linecap="round"/>
      <path class="pairing-guide" marker-end="url(#tw-arrow-neutral)" d="M 126 310 C 142 324, 188 324, 204 310" fill="none" stroke="#5a6a7a" stroke-width="2" stroke-dasharray="5 6"/>
      <text x="164" y="332" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">同源染色体配对</text>
    </g>
    <g class="comparison-card comparison-card--prok">
      <rect x="322" y="54" width="256" height="300" rx="22" fill="rgba(26,58,74,0.03)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="450" y="96" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">原核生物</text>
      <ellipse cx="486" cy="222" rx="68" ry="42" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="2"/>
      <text x="486" y="228" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">受体细胞</text>
      <path class="uptake-arrow" marker-end="url(#tw-arrow-neutral)" d="M 360 174 C 390 174, 414 188, 444 210" fill="none" stroke="#5a6a7a" stroke-width="2.5" stroke-dasharray="7 7"/>
      <g class="uptake-dna">
        <path d="M 352 172 C 372 154, 392 188, 414 170 S 456 154, 476 172" fill="none" stroke="#5a6a7a" stroke-width="3" stroke-linecap="round"/>
        <circle cx="352" cy="172" r="5.5" fill="#5a6a7a"/>
        <circle cx="476" cy="172" r="5.5" fill="#5a6a7a"/>
      </g>
      <text x="450" y="332" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">外源 DNA 摄取</text>
    </g>
    <g class="comparison-card comparison-card--virus">
      <rect x="608" y="54" width="256" height="300" rx="22" fill="rgba(26,58,74,0.03)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="736" y="96" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">SARS-CoV-2</text>
      <line class="mini-template template-a" x1="700" y1="126" x2="700" y2="276" stroke="#5a6a7a" stroke-width="4" stroke-linecap="round"/>
      <line class="mini-template template-b" x1="776" y1="126" x2="776" y2="276" stroke="#5a6a7a" stroke-width="4" stroke-linecap="round"/>
      <line x1="690" y1="154" x2="710" y2="154" stroke="#5a6a7a" stroke-width="1.5" opacity="0.22"/>
      <line x1="690" y1="194" x2="710" y2="194" stroke="#5a6a7a" stroke-width="1.5" opacity="0.22"/>
      <line x1="690" y1="234" x2="710" y2="234" stroke="#5a6a7a" stroke-width="1.5" opacity="0.22"/>
      <line x1="766" y1="154" x2="786" y2="154" stroke="#5a6a7a" stroke-width="1.5" opacity="0.22"/>
      <line x1="766" y1="194" x2="786" y2="194" stroke="#5a6a7a" stroke-width="1.5" opacity="0.22"/>
      <line x1="766" y1="234" x2="786" y2="234" stroke="#5a6a7a" stroke-width="1.5" opacity="0.22"/>
      <path class="mini-chain mini-chain-a" d="M 700 126 V 160" fill="none" stroke="#1a3a4a" stroke-width="3" stroke-linecap="round" opacity="0"/>
      <path class="mini-chain mini-chain-jump" d="M 700 160 C 718 178, 744 190, 776 206" fill="none" stroke="#3a8c6f" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 5" opacity="0"/>
      <path class="mini-chain mini-chain-b" d="M 776 206 V 264" fill="none" stroke="#3a8c6f" stroke-width="3" stroke-linecap="round" opacity="0"/>
      <circle class="mini-rdrp" cx="700" cy="162" r="21" fill="rgba(26,58,74,0.08)" stroke="#5a6a7a" stroke-width="2.5"/>
      <text class="mini-rdrp-label" x="700" y="167" fill="#1a3a4a" font-family="system-ui" font-size="10" font-weight="700" text-anchor="middle">RdRp</text>
      <path class="mini-jump" marker-end="url(#tw-arrow-accent)" d="M 706 220 C 720 230, 750 230, 770 206" fill="none" stroke="#3a8c6f" stroke-width="2.5" stroke-dasharray="5 5" opacity="0"/>
      <text x="736" y="332" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">模板跳跃</text>
    </g>
  </svg>
`;

diagrams['base-substitution'] = `
  <svg class="mechanism-svg" viewBox="0 0 720 240" aria-hidden="true">
    <defs>
      <marker id="bs-arrow-red" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#1a3a4a"/>
      </marker>
    </defs>
    <text class="svg-kicker" x="42" y="32">single nucleotide substitution</text>
    <rect x="48" y="68" width="52" height="40" rx="10" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
    <rect x="114" y="68" width="52" height="40" rx="10" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
    <rect class="base-target" x="180" y="68" width="52" height="40" rx="10" fill="rgba(58,140,111,0.12)" stroke="#3a8c6f" stroke-width="2"/>
    <rect x="246" y="68" width="52" height="40" rx="10" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
    <text x="74" y="95" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="600" text-anchor="middle">A</text>
    <text x="140" y="95" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="600" text-anchor="middle">U</text>
    <text class="original-base" x="206" y="95" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">C</text>
    <text class="replacement-base" x="206" y="95" fill="#c84b4b" font-family="system-ui" font-size="16" font-weight="700" text-anchor="middle">U</text>
    <text x="272" y="95" fill="#1a3a4a" font-family="system-ui" font-size="16" font-weight="600" text-anchor="middle">G</text>
    <path class="svg-arrow" marker-end="url(#bs-arrow-red)" d="M 320 90 C 360 90, 390 90, 430 90"/>
    <rect x="450" y="68" width="164" height="42" rx="20" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="1.5"/>
    <circle cx="480" cy="89" r="11" fill="rgba(26,58,74,0.08)" stroke="#e2e6ea" stroke-width="1.5"/>
    <circle class="changed-aa" cx="530" cy="89" r="11" fill="rgba(58,140,111,0.15)" stroke="#3a8c6f" stroke-width="2"/>
    <circle cx="580" cy="89" r="11" fill="rgba(26,58,74,0.08)" stroke="#e2e6ea" stroke-width="1.5"/>
    <text class="aa-label" x="530" y="140" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">氨基酸改变</text>
    <path class="effect-line" d="M 204 164 C 276 214, 462 214, 532 164" fill="none" stroke="#3a8c6f" stroke-width="2.5" opacity="0.55"/>
    <text x="370" y="216" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="500" text-anchor="middle">单个碱基变化可能放大为功能差异</text>
  </svg>
`;

diagrams['host-factory'] = `
  <svg class="mechanism-svg" viewBox="0 0 720 240" aria-hidden="true">
    <defs>
      <marker id="hf-arrow-new" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
      </marker>
    </defs>
    <text class="svg-kicker" x="42" y="32">persistent infection creates a mutation reservoir</text>
    <g class="host-body" transform="translate(96 70)">
      <circle cx="54" cy="30" r="24" fill="rgba(26,58,74,0.08)" stroke="#e2e6ea" stroke-width="2"/>
      <path d="M 18 110 C 24 66, 86 66, 92 110 Z" fill="rgba(26,58,74,0.06)" stroke="#e2e6ea" stroke-width="2"/>
      <text x="54" y="142" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="700" text-anchor="middle">免疫缺陷宿主</text>
    </g>
    <rect class="infection-window" x="242" y="78" width="236" height="72" rx="16" fill="rgba(26,58,74,0.04)" stroke="#e2e6ea" stroke-width="1.5"/>
    <text x="360" y="104" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700" text-anchor="middle">长期持续感染</text>
    <text x="360" y="128" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">数月复制压力下持续产生突变</text>
    <g class="mutation-burst">
      <circle cx="292" cy="176" r="5" fill="#3a8c6f"/>
      <circle cx="322" cy="164" r="5" fill="#3a8c6f"/>
      <circle cx="352" cy="184" r="5" fill="#c17f3b"/>
      <circle cx="382" cy="160" r="5" fill="#3a8c6f"/>
      <circle cx="414" cy="180" r="5" fill="#c84b4b"/>
      <circle cx="444" cy="166" r="5" fill="#3a8c6f"/>
    </g>
    <path class="spread-arrow" marker-end="url(#hf-arrow-new)" d="M 480 118 C 534 102, 574 108, 620 126" fill="none" stroke="#3a8c6f" stroke-width="3" stroke-dasharray="8 8"/>
    <g class="population-cloud">
      <circle cx="634" cy="112" r="14" fill="rgba(26,58,74,0.07)" stroke="#e2e6ea" stroke-width="1.5"/>
      <circle cx="662" cy="132" r="14" fill="rgba(26,58,74,0.07)" stroke="#e2e6ea" stroke-width="1.5"/>
      <circle cx="614" cy="150" r="14" fill="rgba(26,58,74,0.07)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="638" y="194" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="700" text-anchor="middle">进入人群</text>
    </g>
    <text x="360" y="224" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="500" text-anchor="middle">点击推进：持续感染 → 突变积累 → 外溢传播</text>
  </svg>
`;

diagrams['indel-mechanisms'] = `
  <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 440" aria-hidden="true">
    <defs>
      <marker id="im-neutral" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#5a6a7a"/>
      </marker>
      <marker id="im-accent" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
      </marker>
    </defs>
    <text class="svg-kicker" x="72" y="44">polymerase slippage · template switching · hairpin stalling</text>

    <g class="indel-card indel-card--slippage">
      <rect x="44" y="70" width="244" height="318" rx="18" fill="rgba(26,58,74,.03)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="166" y="104" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700" text-anchor="middle">聚合酶滑移</text>
      <path class="slip-rna slip-rna-template" d="M 78 146 H 242" fill="none" stroke="#5a6a7a" stroke-width="3" stroke-linecap="round"/>
      <g class="slip-repeat">
        <rect x="122" y="136" width="18" height="20" rx="4" fill="rgba(26,58,74,.06)" stroke="#e2e6ea"/>
        <rect x="144" y="136" width="18" height="20" rx="4" fill="rgba(26,58,74,.06)" stroke="#e2e6ea"/>
        <rect x="166" y="136" width="18" height="20" rx="4" fill="rgba(26,58,74,.06)" stroke="#e2e6ea"/>
        <text x="131" y="151" fill="#1a3a4a" font-family="JetBrains Mono,monospace" font-size="10" font-weight="700" text-anchor="middle">A</text>
        <text x="153" y="151" fill="#1a3a4a" font-family="JetBrains Mono,monospace" font-size="10" font-weight="700" text-anchor="middle">A</text>
        <text x="175" y="151" fill="#1a3a4a" font-family="JetBrains Mono,monospace" font-size="10" font-weight="700" text-anchor="middle">A</text>
      </g>
      <path class="slip-rna slip-new-chain" d="M 86 186 H 146 C 154 186, 154 216, 162 216 C 170 216, 170 186, 178 186 H 232" fill="none" stroke="#5a6a7a" stroke-width="3" stroke-linecap="round"/>
      <path class="slip-unpaired-bulge" d="M 146 186 C 154 186, 154 216, 162 216 C 170 216, 170 186, 178 186" fill="none" stroke="#c84b4b" stroke-width="3.5" stroke-linecap="round" opacity="0"/>
      <circle class="slip-pol" cx="96" cy="146" r="18" fill="rgba(26,58,74,.08)" stroke="#5a6a7a" stroke-width="2"/>
      <text class="slip-pol-label" x="96" y="151" fill="#1a3a4a" font-family="system-ui" font-size="10" font-weight="700" text-anchor="middle">RdRp</text>
      <text x="166" y="282" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">RNA 重复序列处错位</text>
      <text x="166" y="302" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">产生跳过或重复碱基</text>
      <text x="166" y="350" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">缺失 / 插入</text>
    </g>

    <g class="indel-card indel-card--switch">
      <rect x="308" y="70" width="244" height="318" rx="18" fill="rgba(26,58,74,.03)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="430" y="104" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700" text-anchor="middle">模板切换</text>
      <line class="indel-template-a" x1="370" y1="142" x2="498" y2="142" stroke="#5a6a7a" stroke-width="3" stroke-linecap="round"/>
      <line class="indel-template-b" x1="370" y1="204" x2="498" y2="204" stroke="#5a6a7a" stroke-width="3" stroke-linecap="round"/>
      <path class="indel-chain-a" d="M 382 166 H 430" fill="none" stroke="#1a3a4a" stroke-width="3" stroke-linecap="round" opacity="0"/>
      <path class="indel-chain-jump" d="M 430 166 C 412 182, 416 208, 430 224" fill="none" stroke="#3a8c6f" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="4 4" opacity="0"/>
      <path class="indel-chain-b" d="M 430 224 H 500" fill="none" stroke="#3a8c6f" stroke-width="4" stroke-linecap="round" opacity="0"/>
      <circle class="indel-switch-pol" cx="430" cy="142" r="16" fill="rgba(26,58,74,.08)" stroke="#5a6a7a" stroke-width="2"/>
      <text class="indel-switch-pol-label" x="430" y="147" fill="#1a3a4a" font-family="system-ui" font-size="10" font-weight="700" text-anchor="middle">RdRp</text>
      <path class="indel-switch-arc" marker-end="url(#im-accent)" d="M 448 158 C 478 168, 480 188, 448 202" fill="none" stroke="#3a8c6f" stroke-width="2.5" stroke-dasharray="5 5" opacity="0"/>
      <text x="430" y="282" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">短程模板跳跃</text>
      <text x="430" y="302" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">新生链随 RdRp 重配对</text>
      <text x="430" y="350" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">小段插入 / 缺失</text>
    </g>

    <g class="indel-card indel-card--hairpin">
      <rect x="572" y="70" width="244" height="318" rx="18" fill="rgba(26,58,74,.03)" stroke="#e2e6ea" stroke-width="1.5"/>
      <text x="694" y="104" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700" text-anchor="middle">RNA 二级结构</text>
      <path class="hairpin-extended-rna" d="M 604 214 H 670 M 724 214 H 792" fill="none" stroke="#5a6a7a" stroke-width="4" stroke-linecap="round"/>
      <path class="hairpin-stem-left" d="M 670 214 V 158" fill="none" stroke="#5a6a7a" stroke-width="4" stroke-linecap="round"/>
      <path class="hairpin-loop" d="M 670 158 C 670 120, 724 120, 724 158" fill="none" stroke="#5a6a7a" stroke-width="4" stroke-linecap="round"/>
      <path class="hairpin-stem-right" d="M 724 158 V 214" fill="none" stroke="#5a6a7a" stroke-width="4" stroke-linecap="round"/>
      <g class="hairpin-pairs" opacity=".45">
        <line x1="670" y1="172" x2="724" y2="172" stroke="#5a6a7a" stroke-width="1.6"/>
        <line x1="670" y1="188" x2="724" y2="188" stroke="#5a6a7a" stroke-width="1.6"/>
        <line x1="670" y1="204" x2="724" y2="204" stroke="#5a6a7a" stroke-width="1.6"/>
      </g>
      <circle class="hairpin-pol" cx="610" cy="214" r="15" fill="rgba(26,58,74,.08)" stroke="#5a6a7a" stroke-width="2"/>
      <text class="hairpin-pol-label" x="610" y="219" fill="#1a3a4a" font-family="system-ui" font-size="9" font-weight="700" text-anchor="middle">RdRp</text>
      <path class="hairpin-stall" d="M 650 218 C 640 238, 666 244, 676 222" fill="none" stroke="#c84b4b" stroke-width="2.5" stroke-dasharray="4 4" opacity="0"/>
      <text x="696" y="282" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">发夹区让聚合酶停顿、出错</text>
      <text x="696" y="302" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">进一步提高 indel 发生率</text>
      <text x="694" y="350" fill="#1a3a4a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">停顿 → 错位 → 缺失</text>
    </g>
  </svg>
`;


/* ═══════════════════════════════════════════════════════════════
 * Inline slide data — embedded to eliminate fetch dependency
 * (works with file://, Open Design preview, HTTP server)
 * ═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
 * Initialisation
 * ═══════════════════════════════════════════════════════════════ */
async function initDeck() {
  try {
    const response = await fetch('data/content.json');
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const content = await response.json();
    deckState.slides = content.slides || [];
    document.getElementById('deck-title').textContent = content.deckTitle || '学术演示';
    if (deckSection) deckSection.textContent = content.section || '';
    renderSlides();
    showSlide(getInitialSlideIndex());
    bindEvents();
  } catch (error) {
    stage.innerHTML = `
      <section class="slide is-active slide--error" data-layout="summary">
        <div class="slide-content">
          <p class="slide-eyebrow">Data Error</p>
          <h2 class="slide-title">内容加载失败</h2>
          <p class="slide-subtitle">请通过本地静态服务器访问，并检查 data/content.json。</p>
        </div>
      </section>
    `;
    console.error('Deck init error:', error);
  }
}

diagrams['ntd-hotspot'] = `
  <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 440" aria-hidden="true">
    <defs>
      <marker id="ntd-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
      </marker>
    </defs>
    <text class="svg-kicker" x="72" y="44">NTD hotspot: non-random distribution · flexible loops · antibody supersite</text>

    <g class="ntd-stage ntd-stage--axis">
      <text x="96" y="88" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700">1. 非随机分布</text>
      <rect x="90" y="116" width="690" height="18" rx="9" fill="rgba(26,58,74,.06)"/>
      <rect x="90" y="116" width="188" height="18" rx="9" fill="rgba(58,140,111,.10)" stroke="#3a8c6f" stroke-width="1.5"/>
      <rect x="328" y="116" width="172" height="18" rx="9" fill="rgba(26,58,74,.06)" stroke="#d7dde3"/>
      <rect x="594" y="116" width="186" height="18" rx="9" fill="rgba(26,58,74,.06)" stroke="#d7dde3"/>
      <text x="184" y="110" fill="#3a8c6f" font-family="system-ui" font-size="12" font-weight="700" text-anchor="middle">NTD</text>
      <text x="414" y="110" fill="#5a6a7a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">RBD</text>
      <text x="686" y="110" fill="#5a6a7a" font-family="system-ui" font-size="12" font-weight="600" text-anchor="middle">S2</text>
      <circle class="ntd-indel-dot ntd-dot-1" cx="610" cy="125" r="5"/>
      <circle class="ntd-indel-dot ntd-dot-2" cx="438" cy="125" r="5"/>
      <circle class="ntd-indel-dot ntd-dot-3" cx="702" cy="125" r="5"/>
      <circle class="ntd-indel-dot ntd-dot-4" cx="362" cy="125" r="5"/>
      <circle class="ntd-indel-dot ntd-dot-5" cx="540" cy="125" r="5"/>
      <text x="430" y="164" fill="#5a6a7a" font-family="system-ui" font-size="13" text-anchor="middle">点击推进：indel 标记向 NTD 收束，表示热点集中</text>
    </g>

    <g class="ntd-stage ntd-stage--loop">
      <text x="96" y="208" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700">2. 柔性 loop 扛得住长度变化</text>
      <rect x="90" y="232" width="326" height="116" rx="18" fill="rgba(26,58,74,.03)" stroke="#d7dde3" stroke-width="1.4"/>
      <path class="ntd-domain-shell" d="M 132 292 C 158 246, 242 244, 290 268 C 336 292, 340 328, 292 334 C 224 342, 154 332, 132 292 Z" fill="rgba(58,140,111,.055)" stroke="#5a6a7a" stroke-width="2"/>
      <path class="ntd-flex-loop ntd-loop-a" d="M 196 258 C 212 230, 246 230, 262 258" fill="none" stroke="#3a8c6f" stroke-width="4" stroke-linecap="round"/>
      <path class="ntd-flex-loop ntd-loop-b" d="M 278 282 C 306 262, 330 280, 314 306" fill="none" stroke="#3a8c6f" stroke-width="4" stroke-linecap="round"/>
      <circle class="ntd-insert-node" cx="232" cy="238" r="7" fill="#c84b4b" opacity="0"/>
      <text x="253" y="372" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">loop 变长/变短，但整体 NTD 轮廓保持</text>
    </g>

    <g class="ntd-stage ntd-stage--supersite">
      <text x="486" y="208" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700">3. 超级位点改造抗体识别表面</text>
      <rect x="478" y="232" width="302" height="116" rx="18" fill="rgba(26,58,74,.03)" stroke="#d7dde3" stroke-width="1.4"/>
      <path class="ntd-supersite-surface" d="M 528 304 C 558 258, 650 258, 704 300 C 670 336, 574 344, 528 304 Z" fill="rgba(58,140,111,.09)" stroke="#3a8c6f" stroke-width="2.2"/>
      <path class="ntd-supersite-patch" d="M 578 294 C 596 276, 642 278, 664 298 C 642 312, 604 316, 578 294 Z" fill="rgba(58,140,111,.24)" stroke="#3a8c6f" stroke-width="2"/>
      <g class="ntd-antibody">
        <path d="M 650 250 L 688 214" fill="none" stroke="#c84b4b" stroke-width="8" stroke-linecap="round"/>
        <path d="M 688 214 L 718 196" fill="none" stroke="#c84b4b" stroke-width="8" stroke-linecap="round"/>
        <path d="M 688 214 L 682 178" fill="none" stroke="#c84b4b" stroke-width="8" stroke-linecap="round"/>
        <circle cx="650" cy="250" r="9" fill="#c84b4b"/>
      </g>
      <path class="ntd-mismatch" d="M 632 282 C 650 270, 666 270, 682 282" fill="none" stroke="#c84b4b" stroke-width="3" stroke-dasharray="5 5" opacity="0"/>
      <text x="629" y="372" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">超级位点是一片抗体集中识别区域，不是单个氨基酸点</text>
    </g>

    <text x="430" y="414" fill="#1a3a4a" font-family="system-ui" font-size="15" font-weight="700" text-anchor="middle">“扛得住改动 + 改动后收益大”——NTD 成为 indel 高发热点</text>
  </svg>
`;

diagrams['deletion-cases'] = `
  <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 440" aria-hidden="true">
    <defs>
      <marker id="del-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
      </marker>
    </defs>
    <text class="svg-kicker" x="72" y="44">recurrent NTD deletions across independent lineages</text>

    <g class="del-lineage del-lineage--alpha">
      <rect x="70" y="78" width="168" height="42" rx="12" fill="rgba(26,58,74,.04)" stroke="#d7dde3"/>
      <text x="154" y="104" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="700" text-anchor="middle">Alpha · ΔY144</text>
      <path class="del-loop del-loop-a" d="M 292 100 C 316 74, 350 74, 374 100 S 426 126, 452 100" fill="none" stroke="#5a6a7a" stroke-width="4" stroke-linecap="round"/>
      <path class="del-segment del-segment-a" d="M 340 78 C 354 74, 364 78, 374 100" fill="none" stroke="#c84b4b" stroke-width="5" stroke-linecap="round"/>
      <path class="del-converge del-converge-a" d="M 464 100 C 548 96, 594 132, 642 184" fill="none" stroke="#3a8c6f" stroke-width="2.5" stroke-dasharray="7 7" marker-end="url(#del-arrow)" opacity="0"/>
    </g>

    <g class="del-lineage del-lineage--delta">
      <rect x="70" y="168" width="168" height="42" rx="12" fill="rgba(26,58,74,.04)" stroke="#d7dde3"/>
      <text x="154" y="194" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="700" text-anchor="middle">Delta · ΔE156/F157</text>
      <path class="del-loop del-loop-b" d="M 292 190 C 318 160, 358 164, 384 190 S 426 216, 452 190" fill="none" stroke="#5a6a7a" stroke-width="4" stroke-linecap="round"/>
      <path class="del-segment del-segment-b" d="M 348 164 C 366 166, 376 174, 384 190" fill="none" stroke="#c84b4b" stroke-width="5" stroke-linecap="round"/>
      <path class="del-converge del-converge-b" d="M 464 190 C 538 190, 596 192, 642 206" fill="none" stroke="#3a8c6f" stroke-width="2.5" stroke-dasharray="7 7" marker-end="url(#del-arrow)" opacity="0"/>
    </g>

    <g class="del-lineage del-lineage--ba1">
      <rect x="70" y="258" width="168" height="42" rx="12" fill="rgba(26,58,74,.04)" stroke="#d7dde3"/>
      <text x="154" y="284" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="700" text-anchor="middle">BA.1 · ΔV143/Y145</text>
      <path class="del-loop del-loop-c" d="M 292 280 C 318 252, 356 254, 378 280 S 424 306, 452 280" fill="none" stroke="#5a6a7a" stroke-width="4" stroke-linecap="round"/>
      <path class="del-segment del-segment-c" d="M 342 255 C 360 254, 370 262, 378 280" fill="none" stroke="#c84b4b" stroke-width="5" stroke-linecap="round"/>
      <path class="del-converge del-converge-c" d="M 464 280 C 548 276, 594 246, 642 222" fill="none" stroke="#3a8c6f" stroke-width="2.5" stroke-dasharray="7 7" marker-end="url(#del-arrow)" opacity="0"/>
    </g>

    <g class="del-supersite">
      <path d="M 638 212 C 658 168, 738 164, 778 206 C 752 252, 680 262, 638 212 Z" fill="rgba(58,140,111,.08)" stroke="#3a8c6f" stroke-width="2"/>
      <path class="del-supersite-patch" d="M 672 210 C 694 184, 734 188, 750 210 C 730 230, 694 234, 672 210 Z" fill="rgba(58,140,111,.20)" stroke="#3a8c6f" stroke-width="2"/>
      <text x="716" y="154" fill="#3a8c6f" font-family="system-ui" font-size="13" font-weight="700" text-anchor="middle">NTD 同一抗体表位</text>
      <text x="716" y="288" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">不同谱系反复命中相近表面</text>
    </g>

    <text x="430" y="398" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">缺失片段消失 → loop 收拢 → 多谱系汇聚：趋同进化与正选择信号</text>
  </svg>
`;

diagrams['ins214epe'] = `
  <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 440" aria-hidden="true">
    <defs>
      <marker id="ins-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3a8c6f"/>
      </marker>
    </defs>
    <text class="svg-kicker" x="72" y="44">ins214EPE in BA.1 NTD — local insertion reshapes a surface loop</text>

    <g class="ins-loop-stage">
      <text x="116" y="92" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700">NTD surface loop</text>
      <path class="ins-loop-backbone" d="M 126 218 C 184 148, 292 150, 354 218 S 512 288, 610 218" fill="none" stroke="#5a6a7a" stroke-width="5" stroke-linecap="round"/>
      <circle class="ins-site" cx="354" cy="218" r="18" fill="rgba(58,140,111,.08)" stroke="#3a8c6f" stroke-width="2.4" stroke-dasharray="6 5"/>
      <text x="354" y="224" fill="#3a8c6f" font-family="system-ui" font-size="13" font-weight="800" text-anchor="middle">214</text>
      <path class="ins-loop-expanded" d="M 126 218 C 184 148, 284 152, 326 204 C 350 154, 416 154, 440 204 C 492 284, 560 254, 610 218" fill="none" stroke="#3a8c6f" stroke-width="5" stroke-linecap="round" opacity="0"/>
    </g>

    <g class="ins-peptide">
      <rect x="668" y="122" width="42" height="34" rx="10" fill="rgba(58,140,111,.12)" stroke="#3a8c6f" stroke-width="1.5"/>
      <rect x="716" y="122" width="42" height="34" rx="10" fill="rgba(58,140,111,.12)" stroke="#3a8c6f" stroke-width="1.5"/>
      <rect x="764" y="122" width="42" height="34" rx="10" fill="rgba(58,140,111,.12)" stroke="#3a8c6f" stroke-width="1.5"/>
      <text x="689" y="144" fill="#1a3a4a" font-family="JetBrains Mono,monospace" font-size="15" font-weight="800" text-anchor="middle">E</text>
      <text x="737" y="144" fill="#1a3a4a" font-family="JetBrains Mono,monospace" font-size="15" font-weight="800" text-anchor="middle">P</text>
      <text x="785" y="144" fill="#1a3a4a" font-family="JetBrains Mono,monospace" font-size="15" font-weight="800" text-anchor="middle">E</text>
    </g>
    <path class="ins-route" d="M 668 166 C 596 174, 486 188, 386 210" fill="none" stroke="#3a8c6f" stroke-width="2.5" stroke-dasharray="7 7" marker-end="url(#ins-arrow)" opacity="0"/>

    <g class="ins-origin-note">
      <rect x="122" y="318" width="616" height="48" rx="14" fill="rgba(26,58,74,.035)" stroke="#d7dde3"/>
      <text x="430" y="338" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">可能来源：模板切换 / 局部重复 / 聚合酶滑移</text>
      <text x="430" y="358" fill="#5a6a7a" font-family="system-ui" font-size="12" text-anchor="middle">动画只表示“插入发生并改变局部表面”，不把来源画成定论</text>
    </g>

    <text x="430" y="404" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">E-P-E 插入 214 位 → loop 局部撑开 → NTD 表面被微整形</text>
  </svg>
`;

diagrams['chronic-indel'] = `
  <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 440" aria-hidden="true">
    <text class="svg-kicker" x="72" y="44">chronic infection — longitudinal accumulation of substitutions and deletions</text>

    <g class="chronic-timeline">
      <line x1="100" y1="104" x2="760" y2="104" stroke="#d7dde3" stroke-width="3" stroke-linecap="round"/>
      <line class="chronic-progress" x1="100" y1="104" x2="760" y2="104" stroke="#3a8c6f" stroke-width="4" stroke-linecap="round" stroke-dasharray="660" stroke-dashoffset="660"/>
      <text x="100" y="82" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">Day 0</text>
      <text x="760" y="82" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">Day 521</text>
      <circle class="chronic-sample sample-1" cx="160" cy="104" r="7"/>
      <circle class="chronic-sample sample-2" cx="320" cy="104" r="7"/>
      <circle class="chronic-sample sample-3" cx="480" cy="104" r="7"/>
      <circle class="chronic-sample sample-4" cx="640" cy="104" r="7"/>
      <circle class="chronic-sample sample-5" cx="760" cy="104" r="7"/>
      <text x="160" y="130" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">D30</text>
      <text x="320" y="130" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">D150</text>
      <text x="480" y="130" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">D300</text>
      <text x="640" y="130" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">D420</text>
    </g>

    <g class="chronic-spike-map">
      <text x="112" y="190" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="700">Spike 区域选择压力</text>
      <rect x="100" y="214" width="560" height="26" rx="13" fill="rgba(26,58,74,.05)" stroke="#d7dde3"/>
      <rect class="chronic-zone chronic-zone-ntd" x="112" y="216" width="128" height="22" rx="11" fill="rgba(58,140,111,.08)" stroke="#d7dde3"/>
      <rect class="chronic-zone chronic-zone-rbd" x="282" y="216" width="132" height="22" rx="11" fill="rgba(58,140,111,.08)" stroke="#d7dde3"/>
      <text x="176" y="208" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">NTD</text>
      <text x="348" y="208" fill="#5a6a7a" font-family="system-ui" font-size="11" text-anchor="middle">RBD</text>
      <g class="chronic-mutations">
        <circle class="snv snv-1" cx="132" cy="227" r="4"/><circle class="snv snv-2" cx="318" cy="227" r="4"/>
        <circle class="snv snv-3" cx="366" cy="227" r="4"/><circle class="snv snv-4" cx="456" cy="227" r="4"/>
        <circle class="snv snv-5" cx="536" cy="227" r="4"/><circle class="snv snv-6" cx="620" cy="227" r="4"/>
        <path class="del-mark del-1" d="M 166 218 L 188 236 M 188 218 L 166 236" stroke="#c84b4b" stroke-width="3" stroke-linecap="round"/>
        <path class="del-mark del-2" d="M 216 218 L 238 236 M 238 218 L 216 236" stroke="#c84b4b" stroke-width="3" stroke-linecap="round"/>
        <path class="del-mark del-3" d="M 388 218 L 410 236 M 410 218 L 388 236" stroke="#c84b4b" stroke-width="3" stroke-linecap="round"/>
      </g>
    </g>

    <g class="chronic-counts">
      <rect x="120" y="286" width="248" height="68" rx="16" fill="rgba(26,58,74,.035)" stroke="#d7dde3"/>
      <rect x="492" y="286" width="248" height="68" rx="16" fill="rgba(26,58,74,.035)" stroke="#d7dde3"/>
      <text x="244" y="314" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="700" text-anchor="middle">Substitutions</text>
      <text class="chronic-count chronic-count-snv" x="244" y="338" fill="#3a8c6f" font-family="JetBrains Mono,monospace" font-size="22" font-weight="800" text-anchor="middle">34</text>
      <text x="616" y="314" fill="#1a3a4a" font-family="system-ui" font-size="13" font-weight="700" text-anchor="middle">Deletions</text>
      <text class="chronic-count chronic-count-del" x="616" y="338" fill="#c84b4b" font-family="JetBrains Mono,monospace" font-size="22" font-weight="800" text-anchor="middle">8</text>
    </g>

    <text x="430" y="404" fill="#1a3a4a" font-family="system-ui" font-size="14" font-weight="600" text-anchor="middle">长期复制窗口中，SNV 与 deletion 共同积累，并在免疫压力相关区域富集</text>
  </svg>
`;

/* ═══════════════════════════════════════════════════════════════
 * Rendering
 * ═══════════════════════════════════════════════════════════════ */
function renderSlides() {
  stage.innerHTML = deckState.slides.map((slide, index) => createSlideMarkup(slide, index)).join('');
}

function createSlideMarkup(slide, index) {
  const points = (slide.points || []).map(p => `<li>${escapeHtml(p)}</li>`).join('');
  const label = slide.label || `Slide ${String(index + 1).padStart(2, '0')}`;
  const layout = slide.layout || 'hero-mechanism';

  return `
    <section class="slide" data-slide-index="${index}" data-layout="${layout}" data-diagram="${escapeAttr(slide.diagram || '')}">
      <div class="slide-content">
        <p class="slide-eyebrow">${escapeHtml(label)}</p>
        <h2 class="slide-title">${escapeHtml(slide.title || '')}</h2>
        ${slide.subtitle ? `<p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>` : ''}
        ${slide.text ? `<p class="slide-body">${escapeHtml(slide.text)}</p>` : ''}
        ${points ? `<ul class="bullet-list">${points}</ul>` : ''}
      </div>
      ${createVisualMarkup(slide)}
    </section>
  `;
}

function createVisualMarkup(slide) {
  const img = slide.image ? createImageMarkup(slide) : '';
  const dia = slide.diagram ? createDiagramMarkup(slide.diagram) : '';
  const prot = slide.proteinViewer ? createProteinViewerMarkup(slide.proteinViewer) : '';
  if (!img && !dia && !prot) return '';
  return `<div class="slide-visual">${img}${dia}${prot}</div>`;
}

function createImageMarkup(slide) {
  const src = slide.image;
  return `
    <figure class="media-frame">
      <img src="${escapeAttr(src)}" alt="${escapeAttr(slide.alt || slide.title || '演示图片')}" loading="lazy" onerror="this.closest(\'.media-frame\').classList.add(\'is-image-error\')" />
      ${slide.caption ? `<figcaption class="image-caption">${escapeHtml(slide.caption)}</figcaption>` : ''}
    </figure>
  `;
}

function createDiagramMarkup(type) {
  const svg = diagrams[type];
  if (!svg) return '';
  return `
    <div class="diagram-card diagram-${escapeAttr(type)}" role="img" aria-label="${escapeAttr(diagramTitles[type] || '机制示意图')}">
      ${svg}
    </div>
  `;
}

function createProteinViewerMarkup(viewer) {
  const mappedHotspots = viewer.highlightResidues || [];
  const unresolvedHotspots = viewer.unresolvedResidues || [];
  const mappedLabels = viewer.highlightLabels || mappedHotspots;
  const unresolvedLabels = viewer.unresolvedLabels || unresolvedHotspots;
  return `
    <section class="protein-panel" aria-label="XBB.1 Spike 蛋白质三维可视化窗口" data-protein-viewer
      data-pdb-id="${escapeAttr(viewer.pdbId)}"
      data-model-url="${escapeAttr(viewer.modelUrl)}"
      data-protein-color="${escapeAttr(viewer.proteinColor)}"
      data-hotspot-color="${escapeAttr(viewer.hotspotColor || '#2f9b68')}"
      data-highlight-residues="${escapeAttr(mappedHotspots.join(','))}">
      <div class="protein-panel__topline">
        <span>Protein Structure</span>
        <strong>${escapeHtml(viewer.pdbId)}</strong>
      </div>
      <div class="protein-viewer" data-protein-stage>
        <div class="protein-fallback">
          <span class="protein-fallback__spinner"></span>
          <p>正在加载 XBB.1 Spike 结构...</p>
        </div>
      </div>
      <div class="protein-legend">
        <span><i style="background:${escapeAttr(viewer.proteinColor)}"></i>Spike 三聚体</span>
        <span><i style="background:${escapeAttr(viewer.hotspotColor || '#2f9b68')}"></i>可映射热点</span>
      </div>
      <p class="protein-source">${escapeHtml(viewer.description)}</p>
      <p class="protein-note">绿色热点：${escapeHtml(mappedLabels.join('、'))}。未解析区域：${escapeHtml(unresolvedLabels.join('、'))}。</p>
    </section>
  `;
}

/* ═══════════════════════════════════════════════════════════════
 * Navigation
 * ═══════════════════════════════════════════════════════════════ */
function bindEvents() {
  nextBtn.addEventListener('click', () => goToSlide(deckState.currentIndex + 1, 'next'));
  prevBtn.addEventListener('click', () => goToSlide(deckState.currentIndex - 1, 'prev'));
  stage.addEventListener('click', handleStageClick);
  window.addEventListener('keydown', handleKeyboard);
  window.addEventListener('hashchange', () => {
    const idx = getInitialSlideIndex();
    if (idx !== deckState.currentIndex) goToSlide(idx, idx > deckState.currentIndex ? 'next' : 'prev');
  });
}

function handleStageClick(event) {
  const img = event.target.closest('.media-frame img, .slide-media img, img[data-slide-image]');
  if (!img || !stage.contains(img)) return;
  const slide = deckState.slides[deckState.currentIndex];
  if (!slide || !slide.image) return;
  openFigureOverlay(slide);
}

function openFigureOverlay(slide) {
  closeFigureOverlay();
  const captionText = slide.figureCaption || slide.caption || slide.alt || '该图未提供图注。';
  const overlay = document.createElement('div');
  overlay.className = 'figure-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <button class="figure-overlay__close" type="button" aria-label="关闭放大图">×</button>
    <div class="figure-overlay__image-wrap">
      <img src="${escapeAttr(slide.image)}" alt="${escapeAttr(slide.alt || slide.title || '放大图')}" />
    </div>
    <div class="figure-overlay__caption">
      <strong>${escapeHtml(slide.title || '图注')}</strong>
      <p>${escapeHtml(captionText)}</p>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.figure-overlay__close').focus();
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.closest('.figure-overlay__close')) closeFigureOverlay();
  });
}

function closeFigureOverlay() {
  document.querySelector('.figure-overlay')?.remove();
}

function handleKeyboard(e) {
  if (e.key === 'Escape' && document.querySelector('.figure-overlay')) {
    closeFigureOverlay();
    e.preventDefault();
    return;
  }
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault();
    goToSlide(deckState.currentIndex + 1, 'next');
  }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    goToSlide(deckState.currentIndex - 1, 'prev');
  }
}

function goToSlide(nextIndex, dir) {
  if (nextIndex < 0 || nextIndex >= deckState.slides.length || nextIndex === deckState.currentIndex) return;
  deckState.direction = dir || (nextIndex > deckState.currentIndex ? 'next' : 'prev');
  showSlide(nextIndex);
}

function showSlide(index) {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prev = slides[deckState.currentIndex];
  const next = slides[index];

  if (!next) return;

  slides.forEach(s => s.classList.remove('is-active', 'is-exiting-left', 'is-exiting-right'));

  if (prev && prev !== next) {
    prev.classList.add(deckState.direction === 'next' ? 'is-exiting-left' : 'is-exiting-right');
  }

  next.classList.add('is-active');
  deckState.currentIndex = index;
  updateNav();

  // Trigger diagram animations and interactions
  activateSlideEffects(next);
}

function updateNav() {
  const total = deckState.slides.length || 1;
  counter.textContent = `${String(deckState.currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  prevBtn.disabled = deckState.currentIndex === 0;
  nextBtn.disabled = deckState.currentIndex === total - 1;
  try{window.history.replaceState(null,'','#slide-'+(deckState.currentIndex+1))}catch(e){}

  // Update section label
  const section = deckState.currentIndex < 7 ? 'Point Mutation' : (deckState.currentIndex < 15 ? 'Recombination' : 'Indel');
  if (deckSection) deckSection.textContent = section;
}

function getInitialSlideIndex() {
  const m = window.location.hash.match(/slide-(\d+)/i);
  if (!m) return 0;
  const i = Number(m[1]) - 1;
  if (Number.isNaN(i)) return 0;
  return Math.min(Math.max(i, 0), Math.max(deckState.slides.length - 1, 0));
}

/* ═══════════════════════════════════════════════════════════════
 * Slide effects — restart animations, bind interactions
 * ═══════════════════════════════════════════════════════════════ */
function activateSlideEffects(slide) {
  restartDiagramMotion(slide);
  bindNarrativeInteraction(slide);
  bindIndelMechanisms(slide);
  bindTemplateSwitch(slide);
  bindProkaryoticTransfer(slide);
  mountProteinViewer(slide);
}

function restartDiagramMotion(slide) {
  const cards = slide.querySelectorAll('.diagram-card');
  cards.forEach(card => {
    card.classList.remove('is-animated', 'is-focused', 'is-transforming', 'is-conjugating', 'is-transducing');
    delete card.dataset.step;
    delete card.dataset.compare;
    void card.offsetWidth;  // force reflow for animation restart
    card.classList.add('is-animated');
  });
}

/* ─── Click-to-focus interactions for explanatory diagrams ── */
function bindNarrativeInteraction(slide) {
  const diagram = slide.querySelector('.diagram-card');
  if (!diagram || diagram.dataset.narrativeBound === 'true') return;
  if (diagram.classList.contains('diagram-prokaryotic-transfer') || diagram.classList.contains('diagram-viral-template-switch')) return;

  diagram.dataset.narrativeBound = 'true';
  diagram.tabIndex = 0;
  diagram.setAttribute('role', 'button');

  let step = 0;
  const stepCounts = {
    'diagram-base-substitution': 3,
    'diagram-dual-function': 2,
    'diagram-convergence': 4,
    'diagram-immune-escape': 4,
    'diagram-host-factory': 3,
    'diagram-epistasis': 4,
    'diagram-ntd-hotspot': 3,
    'diagram-deletion-cases': 1,
    'diagram-ins214epe': 1,
    'diagram-chronic-indel': 1,
    'diagram-rdRp-switch-engine': 3,
    'diagram-eukaryotic-crossing': 3,
    'diagram-three-way-comparison': 3,
    'diagram-xbb-genome': 2,
    'diagram-frequency-landscape': 4
  };
  const maxSteps = Object.entries(stepCounts).find(([name]) => diagram.classList.contains(name))?.[1] || 1;
  const run = (event) => {
    if (diagram.classList.contains('diagram-three-way-comparison') && event && event.type === 'click') {
      const svg = diagram.querySelector('svg');
      const box = svg.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width;
      diagram.dataset.compare = x < 0.34 ? 'euk' : (x < 0.67 ? 'prok' : 'virus');
    }
    step = step >= maxSteps ? 1 : step + 1;
    diagram.dataset.step = String(step);
    diagram.classList.remove('is-focused');
    void diagram.offsetWidth;
    diagram.classList.add('is-focused');
  };
  diagram.addEventListener('click', run);
  diagram.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); run(event); }
  });
}

/* ─── Slide 10: Prokaryotic transfer interactions ──────────── */
function bindProkaryoticTransfer(slide) {
  const diagram = slide.querySelector('.diagram-prokaryotic-transfer');
  if (!diagram || diagram.dataset.bound === 'true') return;

  diagram.dataset.bound = 'true';
  const classMap = { transformation: 'is-transforming', conjugation: 'is-conjugating', transduction: 'is-transducing' };

  diagram.querySelectorAll('[data-prok-trigger]').forEach(el => {
    const run = () => {
      const cls = classMap[el.dataset.prokTrigger];
      if (!cls) return;
      diagram.classList.remove(cls);
      void diagram.offsetWidth;
      diagram.classList.add(cls);
    };
    el.addEventListener('click', run);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); }
    });
  });
}

function bindIndelMechanisms(slide) {
  const diagram = slide.querySelector('.diagram-indel-mechanisms');
  if (!diagram || diagram.dataset.indelBound === 'true') return;

  diagram.dataset.indelBound = 'true';
  diagram.tabIndex = 0;
  diagram.setAttribute('role', 'button');
  const activate = (mode) => {
    diagram.dataset.indel = mode;
    diagram.classList.remove('is-focused');
    void diagram.offsetWidth;
    diagram.classList.add('is-focused');
  };
  diagram.addEventListener('click', (event) => {
    const svg = diagram.querySelector('svg');
    const box = svg.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    activate(x < 0.34 ? 'slippage' : (x < 0.67 ? 'switch' : 'hairpin'));
  });
  diagram.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    const order = ['slippage', 'switch', 'hairpin'];
    const current = order.indexOf(diagram.dataset.indel);
    activate(order[(current + 1) % order.length]);
  });
}

/* ─── Slide 12: Detailed template-switch interaction ───────── */
function bindTemplateSwitch(slide) {
  const diagram = slide.querySelector('.diagram-viral-template-switch');
  if (!diagram || diagram.dataset.tsBound === 'true') return;
  diagram.dataset.tsBound = 'true';

  const svg = diagram.querySelector('svg');
  const pol = svg.querySelector('.ts-pol');
  const polRing = svg.querySelector('.ts-pol-ring');
  const polHint = svg.querySelector('.ts-pol-hint');
  const stepText = svg.querySelector('.ts-step-text');
  const resetBtn = svg.querySelector('.ts-reset');

  // Dynamic SVG elements
  const chainA = svg.querySelector('.ts-chain-a');
  const pairA = svg.querySelector('.ts-pair-a');
  const chainDetach = svg.querySelector('.ts-chain-detach');
  const jumpArc = svg.querySelector('.ts-jump-arc');
  const chainB = svg.querySelector('.ts-chain-b');
  const pairB = svg.querySelector('.ts-pair-b');
  const chimericLabel = svg.querySelector('.ts-chimeric');

  const Y = {
    polA: 130,       // RdRp on template A
    polDetach: 55,   // RdRp lifted above
    polB: 250,       // RdRp on template B
    chainA: 165,     // nascent chain below template A
    chainDetach: 105,// chain lifted
    chainB: 230,     // chain above template B
  };

  const X = {
    init: 680,
    step2: 520,
    step3: 360,
    step5: 360,
    step6: 200,
  };

  let step = 0;
  const totalSteps = 6;

  function setD(el, d) {
    if (el) el.setAttribute('d', d);
  }

  function updateView(s) {
    step = s;
    polRing.classList.remove('ts-pulse');

    // Reset all dynamic layers to hidden
    chainA.style.opacity = '0';
    pairA.style.opacity = '0';
    chainDetach.style.opacity = '0';
    jumpArc.style.opacity = '0';
    chainB.style.opacity = '0';
    pairB.style.opacity = '0';
    chimericLabel.style.opacity = '0';

    switch (s) {
      case 0: // Reset — initial deckState
        pol.style.transform = 'translate(' + X.init + 'px, ' + Y.polA + 'px)';
        polRing.style.fill = 'rgba(58,140,111,0.12)';
        polRing.style.stroke = '#3a8c6f';
        polHint.textContent = '点击 ▼';
        stepText.textContent = '点击 RdRp 启动模板切换 ▶';
        break;

      case 1: // RdRp activated, pulse
        pol.style.transform = 'translate(' + X.init + 'px, ' + Y.polA + 'px)';
        polRing.style.fill = 'rgba(58,140,111,0.12)';
        polRing.style.stroke = '#3a8c6f';
        polRing.classList.add('ts-pulse');
        polHint.textContent = '▶ 点击前进';
        stepText.textContent = 'Step 1/6: RdRp 激活 — 开始沿模板 A 复制';
        break;

      case 2: // RdRp moves to 520, short chain on A
        pol.style.transform = 'translate(' + X.step2 + 'px, ' + Y.polA + 'px)';
        setD(chainA, 'M ' + X.step2 + ' ' + Y.chainA + ' L ' + X.init + ' ' + Y.chainA);
        chainA.style.opacity = '1';
        pairA.style.opacity = '1';
        polHint.textContent = '▶ 点击前进';
        stepText.textContent = 'Step 2/6: RdRp 沿模板 A 前进 — 新生链开始延伸';
        break;

      case 3: // RdRp moves to 360, longer chain on A
        pol.style.transform = 'translate(' + X.step3 + 'px, ' + Y.polA + 'px)';
        setD(chainA, 'M ' + X.step3 + ' ' + Y.chainA + ' L ' + X.init + ' ' + Y.chainA);
        chainA.style.opacity = '1';
        pairA.style.opacity = '1';
        polHint.textContent = '▶ 点击前进';
        stepText.textContent = 'Step 3/6: RdRp 继续前进 — 新生链逐步生长';
        break;

      case 4: // RdRp detaches from A
        pol.style.transform = 'translate(' + X.step3 + 'px, ' + Y.polDetach + 'px)';
        setD(chainDetach, 'M ' + X.step3 + ' ' + Y.chainDetach + ' L ' + X.init + ' ' + Y.chainDetach);
        chainDetach.style.opacity = '1';
        polRing.style.fill = 'rgba(200,75,75,0.15)';
        polRing.style.stroke = '#c84b4b';
        polHint.textContent = '▶ 点击前进';
        stepText.textContent = 'Step 4/6: RdRp 遇到障碍 — 暂停 → 从模板 A 脱离';
        break;

      case 5: // Jump to B, re-anneal
        pol.style.transform = 'translate(' + X.step5 + 'px, ' + Y.polB + 'px)';
        setD(chainDetach, 'M ' + X.step5 + ' ' + Y.chainDetach + ' L ' + X.init + ' ' + Y.chainDetach);
        chainDetach.style.opacity = '1';
        setD(jumpArc, 'M ' + X.step5 + ' ' + Y.chainDetach + ' Q 280 175, ' + X.step5 + ' ' + Y.chainB);
        jumpArc.style.opacity = '1';
        setD(chainB, 'M ' + (X.step5 - 20) + ' ' + Y.chainB + ' L ' + X.step5 + ' ' + Y.chainB);
        chainB.style.opacity = '1';
        pairB.style.opacity = '1';
        polRing.style.fill = 'rgba(58,140,111,0.12)';
        polRing.style.stroke = '#3a8c6f';
        polHint.textContent = '▶ 点击前进';
        stepText.textContent = 'Step 5/6: 新生链 3′ 端与模板 B 同源配对 — 模板跳跃';
        break;

      case 6: // Continue on B, chimeric genome complete
        pol.style.transform = 'translate(' + X.step6 + 'px, ' + Y.polB + 'px)';
        setD(chainDetach, 'M ' + X.step5 + ' ' + Y.chainDetach + ' L ' + X.init + ' ' + Y.chainDetach);
        chainDetach.style.opacity = '1';
        setD(jumpArc, 'M ' + X.step5 + ' ' + Y.chainDetach + ' Q 280 175, ' + X.step5 + ' ' + Y.chainB);
        jumpArc.style.opacity = '1';
        setD(chainB, 'M ' + X.step6 + ' ' + Y.chainB + ' L ' + X.step5 + ' ' + Y.chainB);
        chainB.style.opacity = '1';
        pairB.style.opacity = '1';
        chimericLabel.style.opacity = '1';
        polHint.textContent = '✓ 完成';
        stepText.textContent = 'Step 6/6: RdRp 在模板 B 上继续复制 — 嵌合基因组诞生 ✅';
        break;
    }
  }

  // Initialize at step 0
  updateView(0);

  // Click RdRp to advance
  pol.addEventListener('click', function () {
    if (step < totalSteps) updateView(step + 1);
  });
  pol.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && step < totalSteps) {
      e.preventDefault();
      updateView(step + 1);
    }
  });

  // Reset button
  resetBtn.addEventListener('click', function () { updateView(0); });
}

/* ─── Slide 13: NGL protein viewer ─────────────────────────── */
function loadNgl() {
  if (window.NGL) return Promise.resolve(window.NGL);
  if (deckState.nglScriptPromise) return deckState.nglScriptPromise;

  deckState.nglScriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'public/vendor/ngl.js';
    s.async = true;
    s.onload = () => resolve(window.NGL);
    s.onerror = () => reject(new Error('NGL script load failed'));
    document.head.append(s);
  });
  return deckState.nglScriptPromise;
}

async function mountProteinViewer(slide) {
  const panel = slide.querySelector('[data-protein-viewer]');
  if (!panel) { disposeProteinViewer(); return; }
  if (panel.dataset.ready === 'true') {
    requestAnimationFrame(() => deckState.proteinStage?.handleResize());
    return;
  }

  disposeProteinViewer();

  const container = panel.querySelector('[data-protein-stage]');
  const modelUrl = panel.dataset.modelUrl;
  const proteinColor = panel.dataset.proteinColor || '#d86fa6';
  const hotspotColor = panel.dataset.hotspotColor || '#2f9b68';
  const highlightResidues = (panel.dataset.highlightResidues || '').split(',').filter(Boolean);

  try {
    const NGL = await loadNgl();
    container.innerHTML = '';
    const stage = new NGL.Stage(container, {
      backgroundColor: '#F7F8FA',
      clipNear: 0, fogNear: 80, fogFar: 100
    });

    const resizeHandler = () => stage.handleResize();
    window.addEventListener('resize', resizeHandler, { passive: true });

    const ext = modelUrl.toLowerCase().endsWith('.pdb') ? 'pdb' : 'cif';
    const component = await stage.loadFile(modelUrl, { ext });
    const chains = ':A or :B or :C';

    component.addRepresentation('surface', {
      sele: chains, color: proteinColor, opacity: 0.52, surfaceType: 'ms', useWorker: false
    });
    component.addRepresentation('cartoon', {
      sele: chains, color: proteinColor, opacity: 0.42
    });
    if (highlightResidues.length) {
      component.addRepresentation('spacefill', {
        sele: `(${highlightResidues.join(' or ')}) and (${chains})`,
        color: hotspotColor,
        radiusScale: 1.05
      });
    }

    component.autoView(chains, 900);
    stage.viewerControls.zoom(-0.28);

    deckState.proteinStage = stage;
    deckState.proteinResizeHandler = resizeHandler;
    panel.dataset.ready = 'true';
    requestAnimationFrame(() => {
      stage.handleResize();
      setTimeout(() => stage.handleResize(), 350);
    });
  } catch (error) {
    container.innerHTML = `
      <div class="protein-fallback protein-fallback--error">
        <strong>3D 结构加载失败</strong>
        <p>已保留真实结构来源：RCSB ${escapeHtml(panel.dataset.pdbId)}。请检查网络或 CDN 访问。</p>
        <small>${escapeHtml(error.message)}</small>
      </div>
    `;
  }
}

function disposeProteinViewer() {
  if (deckState.proteinStage) { deckState.proteinStage.dispose(); deckState.proteinStage = null; }
  if (deckState.proteinResizeHandler) { window.removeEventListener('resize', deckState.proteinResizeHandler); deckState.proteinResizeHandler = null; }
}

/* ═══════════════════════════════════════════════════════════════
 * Utilities
 * ═══════════════════════════════════════════════════════════════ */
function escapeHtml(v) {
  return String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}
function escapeAttr(v) {
  return escapeHtml(v).replaceAll('`', '&#096;');
}

/* ─── Boot ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initDeck);
})();
