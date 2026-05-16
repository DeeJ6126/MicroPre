const state = {
  slides: [],
  currentIndex: 0,
  direction: "next"
};

const stage = document.querySelector("#slide-stage");
const nextButton = document.querySelector("#next-button");
const prevButton = document.querySelector("#prev-button");
const counter = document.querySelector("#slide-counter");
const deckTitle = document.querySelector("#deck-title");
const deckSection = document.querySelector("#deck-section");

const diagramTitles = {
  "base-substitution": "碱基替换到蛋白功能改变",
  "dual-function": "点突变的受体结合与免疫逃逸双功能",
  convergence: "N501Y 趋同进化示意",
  "immune-escape": "Omicron 免疫逃逸机制",
  "host-factory": "免疫缺陷宿主体内进化工厂",
  epistasis: "突变组合的上位性效应",
  "summary-map": "点突变核心地位总结图",
  "viral-template-switch": "病毒 RNA 复制过程中的模板切换",
  "eukaryotic-crossing": "真核生物同源染色体交换",
  "prokaryotic-transfer": "原核生物基因流动",
  "three-way-comparison": "三类重组机制对比",
  "rdRp-switch-engine": "RdRp 换轨复制机制",
  "xbb-genome": "XBB 重组基因组示意",
  "frequency-landscape": "重组频率与断点分布",
  "evolution-accelerator": "重组作为进化加速器"
};

async function initDeck() {
  try {
    const response = await fetch("data/content.json");
    if (!response.ok) {
      throw new Error(`content.json load failed: ${response.status}`);
    }

    const content = await response.json();
    state.slides = content.slides || [];
    deckTitle.textContent = content.deckTitle || "学术演示";
    deckSection.textContent = content.section || "";
    renderSlides();
    showSlide(getInitialSlideIndex());
    bindEvents();
  } catch (error) {
    stage.innerHTML = `
      <section class="slide is-active" data-layout="summary">
        <div class="slide-content">
          <p class="slide-label">Data Error</p>
          <h2 class="slide-title">内容加载失败</h2>
          <p class="slide-subtitle">请通过本地服务器访问项目，并检查 data/content.json。</p>
        </div>
      </section>
    `;
    console.error(error);
  }
}

function renderSlides() {
  stage.innerHTML = state.slides.map((slide, index) => createSlideMarkup(slide, index)).join("");
}

function createSlideMarkup(slide, index) {
  const points = (slide.points || []).map((point) => `<li>${escapeHtml(point)}</li>`).join("");
  const label = slide.label || `Slide ${String(index + 1).padStart(2, "0")}`;
  const layout = slide.layout || "hero-mechanism";

  return `
    <section class="slide" data-slide-index="${index}" data-layout="${layout}" data-diagram="${escapeAttribute(slide.diagram || "")}">
      <div class="slide-content">
        <p class="slide-label">${escapeHtml(label)}</p>
        <h2 class="slide-title">${escapeHtml(slide.title || "")}</h2>
        ${slide.subtitle ? `<p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
        ${points ? `<ul class="bullet-list">${points}</ul>` : ""}
      </div>
      ${createVisualMarkup(slide)}
    </section>
  `;
}

function createVisualMarkup(slide) {
  const imageMarkup = slide.image ? createImageMarkup(slide) : "";
  const diagramMarkup = slide.diagram ? createDiagramMarkup(slide.diagram) : "";
  const proteinMarkup = slide.proteinViewer ? createProteinViewerMarkup(slide.proteinViewer) : "";

  if (!imageMarkup && !diagramMarkup && !proteinMarkup) {
    return "";
  }

  return `
    <div class="slide-visual">
      ${imageMarkup}
      ${diagramMarkup}
      ${proteinMarkup}
    </div>
  `;
}

function createImageMarkup(slide) {
  return `
    <figure class="media-frame">
      <img src="${escapeAttribute(slide.image)}" alt="${escapeAttribute(slide.alt || slide.title || "演示图片")}" />
      ${slide.caption ? `<figcaption class="image-caption">${escapeHtml(slide.caption)}</figcaption>` : ""}
    </figure>
  `;
}

function createDiagramMarkup(type) {
  const diagram = diagrams[type];
  if (!diagram) {
    return "";
  }

  return `
    <div class="diagram-card diagram-${escapeAttribute(type)}" role="img" aria-label="${escapeAttribute(diagramTitles[type] || "机制示意图")}">
      ${diagram}
    </div>
  `;
}

function createProteinViewerMarkup(viewer) {
  return `
    <section
      class="protein-panel"
      aria-label="XBB spike 蛋白质三维可视化窗口"
      data-protein-viewer
      data-pdb-id="${escapeAttribute(viewer.pdbId)}"
      data-model-url="${escapeAttribute(viewer.modelUrl)}"
      data-protein-color="${escapeAttribute(viewer.proteinColor)}"
      data-mutation-color="${escapeAttribute(viewer.mutationColor)}"
      data-highlight-residues="${escapeAttribute(viewer.highlightResidues)}"
    >
      <div class="protein-panel__topline">
        <span>Protein Structure</span>
        <strong>${escapeHtml(viewer.pdbId)}</strong>
      </div>
      <div class="protein-viewer" data-protein-stage>
        <div class="protein-fallback">
          <span class="protein-fallback__spinner"></span>
          <p>正在加载 XBB.1.5 Spike 结构...</p>
        </div>
      </div>
      <div class="protein-legend">
        <span><i style="background:${escapeAttribute(viewer.proteinColor)}"></i>Spike 表面</span>
        <span><i style="background:${escapeAttribute(viewer.mutationColor)}"></i>突变位点 / V213E</span>
      </div>
      <p class="protein-source">${escapeHtml(viewer.description)}</p>
    </section>
  `;
}

const diagrams = {
  "base-substitution": `
    <svg class="mechanism-svg" viewBox="0 0 760 260" aria-hidden="true">
      <defs>
        <marker id="arrow-base" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <text class="svg-kicker" x="48" y="38">single nucleotide substitution</text>
      <g class="base-strip">
        <rect x="54" y="78" width="58" height="46" rx="12" />
        <rect x="126" y="78" width="58" height="46" rx="12" />
        <rect class="is-hot" x="198" y="78" width="58" height="46" rx="12" />
        <rect x="270" y="78" width="58" height="46" rx="12" />
        <text x="83" y="108">A</text>
        <text x="155" y="108">U</text>
        <text x="227" y="108">C</text>
        <text x="299" y="108">G</text>
        <text class="svg-note" x="227" y="158">C -> U</text>
      </g>
      <path class="svg-arrow" marker-end="url(#arrow-base)" d="M 350 102 C 402 102, 432 102, 482 102" />
      <g class="protein-chain">
        <rect x="502" y="77" width="182" height="48" rx="24" />
        <circle cx="536" cy="101" r="13" />
        <circle class="is-hot" cx="592" cy="101" r="13" />
        <circle cx="648" cy="101" r="13" />
        <text class="svg-note" x="592" y="158">氨基酸改变</text>
      </g>
      <path class="effect-line" d="M 226 178 C 300 238, 492 238, 592 178" />
      <text class="effect-text" x="402" y="236">单个碱基变化可能放大为功能差异</text>
    </svg>
  `,
  "dual-function": `
    <svg class="mechanism-svg" viewBox="0 0 760 260" aria-hidden="true">
      <defs>
        <marker id="arrow-dual" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <circle class="rbd-core" cx="156" cy="132" r="66" />
      <text class="rbd-text" x="156" y="125">RBD</text>
      <text class="rbd-subtext" x="156" y="153">点突变</text>
      <path class="svg-arrow" marker-end="url(#arrow-dual)" d="M 232 110 C 314 56, 386 58, 470 82" />
      <path class="svg-arrow" marker-end="url(#arrow-dual)" d="M 232 154 C 314 208, 386 206, 470 182" />
      <g class="function-box">
        <rect x="488" y="42" width="194" height="76" rx="18" />
        <text x="585" y="76">ACE2 结合增强</text>
        <text x="585" y="100">入侵效率上升</text>
      </g>
      <g class="function-box function-box-alt">
        <rect x="488" y="142" width="194" height="76" rx="18" />
        <text x="585" y="176">抗体识别下降</text>
        <text x="585" y="200">免疫逃逸增强</text>
      </g>
    </svg>
  `,
  convergence: `
    <svg class="mechanism-svg" viewBox="0 0 760 260" aria-hidden="true">
      <defs>
        <marker id="arrow-convergence" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g class="lineage lineage-one">
        <rect x="64" y="42" width="154" height="46" rx="16" />
        <text x="141" y="72">Alpha</text>
      </g>
      <g class="lineage lineage-two">
        <rect x="64" y="107" width="154" height="46" rx="16" />
        <text x="141" y="137">Beta</text>
      </g>
      <g class="lineage lineage-three">
        <rect x="64" y="172" width="154" height="46" rx="16" />
        <text x="141" y="202">Gamma</text>
      </g>
      <path class="svg-arrow" marker-end="url(#arrow-convergence)" d="M 240 65 C 332 70, 392 98, 472 120" />
      <path class="svg-arrow" marker-end="url(#arrow-convergence)" d="M 240 130 H 470" />
      <path class="svg-arrow" marker-end="url(#arrow-convergence)" d="M 240 195 C 332 190, 392 162, 472 140" />
      <circle class="selection-core" cx="570" cy="130" r="68" />
      <text class="selection-main" x="570" y="124">N501Y</text>
      <text class="selection-sub" x="570" y="153">趋同选择</text>
    </svg>
  `,
  "immune-escape": `
    <svg class="mechanism-svg" viewBox="0 0 760 260" aria-hidden="true">
      <defs>
        <marker id="arrow-escape" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <path class="rbd-surface" d="M 290 68 C 360 24, 462 48, 490 118 C 518 190, 428 226, 346 198 C 276 174, 240 104, 290 68 Z" />
      <text class="surface-text" x="384" y="130">Omicron RBD</text>
      <g class="mutation-tags">
        <text x="268" y="56">K417N</text>
        <text x="488" y="78">E484A</text>
        <text x="474" y="216">Q493R</text>
      </g>
      <path class="antibody antibody-faded" d="M 96 72 L 154 130 L 96 188 M 154 130 L 202 130" />
      <text class="svg-note" x="132" y="224">抗体识别下降</text>
      <path class="svg-arrow" marker-end="url(#arrow-escape)" d="M 496 132 C 540 132, 568 132, 614 132" />
      <rect class="ace2-block" x="622" y="90" width="62" height="84" rx="14" />
      <text class="ace2-text" x="653" y="138">ACE2</text>
      <text class="effect-text" x="492" y="240">结合维持，逃逸增强</text>
    </svg>
  `,
  "host-factory": `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 460" aria-hidden="true">
      <defs>
        <marker id="arrow-host" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <circle class="host-body" cx="150" cy="230" r="76" />
      <circle class="host-head" cx="150" cy="120" r="38" />
      <text class="host-label" x="150" y="340">免疫缺陷宿主</text>
      <path class="timeline" marker-end="url(#arrow-host)" d="M 270 230 H 730" />
      <g class="time-node">
        <circle cx="340" cy="230" r="20" />
        <text x="340" y="286">持续感染</text>
      </g>
      <g class="time-node">
        <circle cx="488" cy="230" r="20" />
        <text x="488" y="286">突变积累</text>
      </g>
      <g class="time-node">
        <circle cx="636" cy="230" r="20" />
        <text x="636" y="286">适应筛选</text>
      </g>
      <g class="variant-cloud">
        <circle cx="326" cy="154" r="9" />
        <circle cx="386" cy="130" r="7" />
        <circle cx="452" cy="148" r="11" />
        <circle cx="526" cy="126" r="8" />
        <circle cx="602" cy="154" r="10" />
        <circle cx="682" cy="132" r="7" />
      </g>
      <path class="svg-arrow spread-arrow" marker-end="url(#arrow-host)" d="M 674 190 C 736 150, 772 118, 812 72" />
      <text class="effect-text" x="690" y="64">外溢传播</text>
    </svg>
  `,
  epistasis: `
    <svg class="mechanism-svg" viewBox="0 0 760 260" aria-hidden="true">
      <defs>
        <marker id="arrow-epi" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g class="epi-grid">
        <rect x="84" y="56" width="168" height="64" rx="18" />
        <text x="168" y="94">背景 A</text>
        <rect x="84" y="154" width="168" height="64" rx="18" />
        <text x="168" y="192">背景 B</text>
        <rect class="epi-hot" x="508" y="86" width="184" height="92" rx="24" />
        <text x="600" y="126">突变组合</text>
        <text x="600" y="154">1 + 1 > 2</text>
      </g>
      <path class="svg-arrow" marker-end="url(#arrow-epi)" d="M 270 88 C 356 86, 416 102, 500 122" />
      <path class="svg-arrow" marker-end="url(#arrow-epi)" d="M 270 186 C 356 188, 416 164, 500 140" />
      <text class="effect-text" x="380" y="238">同一突变在不同遗传背景中效果不同</text>
    </svg>
  `,
  "summary-map": `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 460" aria-hidden="true">
      <defs>
        <marker id="arrow-summary" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <circle class="summary-core" cx="430" cy="224" r="78" />
      <text class="summary-core-title" x="430" y="216">点突变</text>
      <text class="summary-core-sub" x="430" y="248">基础引擎</text>
      <g class="summary-node">
        <rect x="92" y="86" width="190" height="58" rx="20" />
        <text x="187" y="123">RBD 热点</text>
      </g>
      <g class="summary-node">
        <rect x="578" y="86" width="190" height="58" rx="20" />
        <text x="673" y="123">ACE2 亲和力</text>
      </g>
      <g class="summary-node">
        <rect x="92" y="306" width="190" height="58" rx="20" />
        <text x="187" y="343">免疫逃逸</text>
      </g>
      <g class="summary-node">
        <rect x="578" y="306" width="190" height="58" rx="20" />
        <text x="673" y="343">上位性</text>
      </g>
      <path class="summary-link" marker-end="url(#arrow-summary)" d="M 360 188 C 300 150, 270 132, 282 118" />
      <path class="summary-link" marker-end="url(#arrow-summary)" d="M 502 188 C 552 154, 586 130, 578 118" />
      <path class="summary-link" marker-end="url(#arrow-summary)" d="M 360 260 C 300 298, 270 322, 282 336" />
      <path class="summary-link" marker-end="url(#arrow-summary)" d="M 502 260 C 552 296, 586 320, 578 336" />
    </svg>
  `,
  "viral-template-switch": `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 460" aria-hidden="true">
      <defs>
        <marker id="arrow-template" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <text class="svg-kicker" x="80" y="58">copy-choice / template switching</text>
      <g class="rna-template template-a">
        <text x="92" y="125">亲本模板 A</text>
        <path d="M 90 158 C 150 118, 210 198, 270 158 S 390 158, 450 158 S 570 118, 630 158 S 750 158, 790 142" />
      </g>
      <g class="rna-template template-b">
        <text x="92" y="286">亲本模板 B</text>
        <path d="M 90 318 C 150 278, 210 358, 270 318 S 390 318, 450 318 S 570 278, 630 318 S 750 318, 790 302" />
      </g>
      <path class="nascent-rna" d="M 110 190 C 198 170, 272 184, 344 164 C 428 140, 494 226, 560 294 C 620 356, 704 336, 780 306" />
      <g class="polymerase">
        <circle cx="382" cy="166" r="44" />
        <text x="382" y="174">RdRp</text>
      </g>
      <path class="jump-arc" marker-end="url(#arrow-template)" d="M 414 190 C 480 210, 504 256, 548 294" />
      <text class="effect-text" x="430" y="238">模板跳跃</text>
      <g class="chimera">
        <rect x="218" y="390" width="168" height="28" rx="14" />
        <rect x="386" y="390" width="256" height="28" rx="14" />
        <text x="430" y="448">嵌合基因组：A 片段 + B 片段</text>
      </g>
    </svg>
  `,
  "eukaryotic-crossing": `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 460" aria-hidden="true">
      <text class="svg-kicker" x="88" y="60">meiosis / homologous chromosome pairing</text>
      <g class="chromosome-pair">
        <path class="chromosome chromosome-blue" d="M 250 94 C 310 170, 310 282, 250 360" />
        <path class="chromosome chromosome-blue" d="M 305 94 C 245 170, 245 282, 305 360" />
        <path class="chromosome chromosome-silver" d="M 560 94 C 500 170, 500 282, 560 360" />
        <path class="chromosome chromosome-silver" d="M 505 94 C 565 170, 565 282, 505 360" />
      </g>
      <path class="crossover crossover-left" d="M 283 202 C 354 232, 430 232, 532 202" />
      <path class="crossover crossover-right" d="M 532 252 C 442 224, 360 224, 283 252" />
      <g class="controlled-tags">
        <rect x="138" y="380" width="176" height="44" rx="22" />
        <text x="226" y="408">结构化</text>
        <rect x="344" y="380" width="176" height="44" rx="22" />
        <text x="432" y="408">受控</text>
        <rect x="550" y="380" width="176" height="44" rx="22" />
        <text x="638" y="408">染色体交换</text>
      </g>
    </svg>
  `,
  "prokaryotic-transfer": `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 860 460" aria-hidden="true">
      <defs>
        <marker id="arrow-prok" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <text class="svg-kicker" x="88" y="58">transformation / conjugation / transduction</text>
      <g class="bacterium bacterium-donor">
        <ellipse cx="206" cy="220" rx="112" ry="62" />
        <text x="206" y="226">供体细胞</text>
        <g class="plasmid-transfer" data-prok-trigger="conjugation" role="button" tabindex="0" aria-label="点击演示质粒经接合进入受体细胞">
          <circle class="plasmid" cx="250" cy="184" r="22" />
          <path class="plasmid-loop" d="M 238 184 C 238 168, 262 168, 262 184 S 238 200, 238 184" />
        </g>
      </g>
      <g class="bacterium bacterium-recipient">
        <ellipse cx="646" cy="220" rx="126" ry="72" />
        <text x="646" y="226">受体细胞</text>
      </g>
      <g class="process-labels">
        <text x="172" y="104">转导</text>
        <text x="430" y="154">接合</text>
        <text x="380" y="356">转化</text>
      </g>
      <path class="transfer-bridge conjugation-arrow" marker-end="url(#arrow-prok)" d="M 268 184 C 382 164, 488 172, 556 208" />
      <path class="transfer-bridge transformation-arrow" marker-end="url(#arrow-prok)" d="M 356 338 C 444 328, 516 292, 568 244" />
      <g class="transformation-dna" data-prok-trigger="transformation" role="button" tabindex="0" aria-label="点击演示外源 DNA 通过转化进入受体细胞">
        <path class="external-dna" d="M 250 338 C 286 314, 326 362, 364 338 S 438 316, 476 338" />
        <circle class="dna-handle" cx="250" cy="338" r="8" />
        <circle class="dna-handle" cx="476" cy="338" r="8" />
      </g>
      <g class="phage-transfer" data-prok-trigger="transduction" role="button" tabindex="0" aria-label="点击演示噬菌体靠近受体细胞并注入遗传物质">
        <polygon class="phage-head" points="144,116 176,96 208,116 208,154 176,174 144,154" />
        <line class="phage-tail" x1="176" y1="174" x2="176" y2="222" />
        <line class="phage-leg" x1="176" y1="222" x2="146" y2="250" />
        <line class="phage-leg" x1="176" y1="222" x2="176" y2="256" />
        <line class="phage-leg" x1="176" y1="222" x2="206" y2="250" />
      </g>
      <path class="transfer-bridge phage-approach" marker-end="url(#arrow-prok)" d="M 220 148 C 356 108, 512 118, 590 168" />
      <path class="phage-dna-injection" marker-end="url(#arrow-prok)" d="M 560 178 C 592 188, 612 198, 632 212" />
      <text class="svg-note" x="430" y="408">点击 DNA、质粒或噬菌体，分别演示三类原核重组路径</text>
    </svg>
  `,
  "three-way-comparison": `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 980 460" aria-hidden="true">
      <defs>
        <marker id="arrow-compare" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g class="compare-card compare-euk">
        <rect x="40" y="62" width="280" height="320" rx="26" />
        <text class="compare-title" x="180" y="112">真核生物</text>
        <path class="mini-chromosome" d="M 138 152 C 178 208, 178 266, 138 320" />
        <path class="mini-chromosome alt" d="M 220 152 C 180 208, 180 266, 220 320" />
        <text x="180" y="354">染色体片段交换</text>
      </g>
      <g class="compare-card compare-prok">
        <rect x="350" y="62" width="280" height="320" rx="26" />
        <text class="compare-title" x="490" y="112">原核生物</text>
        <ellipse cx="435" cy="225" rx="62" ry="38" />
        <ellipse cx="545" cy="225" rx="62" ry="38" />
        <path class="svg-arrow" marker-end="url(#arrow-compare)" d="M 494 225 H 506" />
        <text x="490" y="354">细胞间基因流动</text>
      </g>
      <g class="compare-card compare-virus">
        <rect x="660" y="62" width="280" height="320" rx="26" />
        <text class="compare-title" x="800" y="112">SARS-CoV-2</text>
        <path class="mini-rna a" d="M 720 178 C 770 144, 812 212, 860 178" />
        <path class="mini-rna b" d="M 720 268 C 770 234, 812 302, 860 268" />
        <path class="jump-arc" marker-end="url(#arrow-compare)" d="M 770 188 C 802 214, 810 238, 840 262" />
        <text x="800" y="354">复制瞬间模板跳跃</text>
      </g>
    </svg>
  `,
  "rdRp-switch-engine": `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 900 460" aria-hidden="true">
      <defs>
        <marker id="arrow-rdrp" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        <marker id="arrow-switch" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.8" markerHeight="5.8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <text class="svg-kicker" x="80" y="58">co-infection + homologous pairing + polymerase pausing</text>
      <g class="template-cloud">
        <text class="template-label" x="142" y="120">当前模板</text>
        <path class="cloud-rna a" d="M 88 150 C 160 102, 238 198, 310 150 S 466 150, 538 150" />
        <text class="template-label" x="154" y="218">相似模板</text>
        <path class="cloud-rna b" d="M 110 246 C 182 198, 260 294, 332 246 S 488 246, 560 246" />
        <text class="template-label" x="164" y="304">其他模板</text>
        <path class="cloud-rna c" d="M 142 332 C 214 284, 292 380, 364 332 S 520 332, 592 332" />
      </g>
      <g class="polymerase engine">
        <circle cx="430" cy="178" r="48" />
        <text x="430" y="186">RdRp</text>
      </g>
      <circle class="stall-ring" cx="430" cy="178" r="57" />
      <text class="switch-label" x="430" y="98">暂停 / 脱离</text>
      <path class="switch-arrow" marker-end="url(#arrow-switch)" d="M 462 204 C 506 212, 536 228, 558 246" />
      <text class="switch-label" x="622" y="220">切换到相似模板</text>
      <g class="factor-list">
        <text class="factor-title" x="742" y="76">促成因素</text>
        <rect x="650" y="96" width="184" height="54" rx="16" />
        <text x="742" y="129">结合松动</text>
        <rect x="650" y="176" width="184" height="54" rx="16" />
        <text x="742" y="209">相似模板</text>
        <rect x="650" y="256" width="184" height="54" rx="16" />
        <text x="742" y="289">二级结构</text>
      </g>
      <text class="effect-text" x="360" y="420">暂停 -> 重新配对 -> 继续复制</text>
    </svg>
  `,
  "xbb-genome": `
    <svg class="mechanism-svg" viewBox="0 0 760 240" aria-hidden="true">
      <defs>
        <marker id="arrow-xbb" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <text class="svg-kicker" x="54" y="36">XBB recombinant mosaic</text>
      <text class="genome-label" x="68" y="82">BJ.1</text>
      <rect class="segment segment-bj" x="128" y="62" width="420" height="28" rx="14" />
      <text class="genome-label" x="68" y="128">BM.1.1.1</text>
      <rect class="segment segment-bm" x="128" y="108" width="520" height="28" rx="14" />
      <text class="genome-label" x="68" y="180">XBB</text>
      <rect class="segment segment-bj" x="128" y="160" width="310" height="32" rx="16" />
      <rect class="segment segment-bm" x="430" y="160" width="218" height="32" rx="16" />
      <line class="breakpoint" x1="430" x2="430" y1="52" y2="204" />
      <text class="svg-note" x="430" y="224">Spike RBD breakpoint</text>
      <path class="svg-arrow" marker-end="url(#arrow-xbb)" d="M 308 96 C 332 122, 360 146, 394 164" />
    </svg>
  `,
  "frequency-landscape": `
    <svg class="mechanism-svg" viewBox="0 0 760 240" aria-hidden="true">
      <text class="svg-kicker" x="54" y="36">pandemic-scale recombination landscape</text>
      <g class="stat-orbit">
        <circle cx="138" cy="132" r="64" />
        <text class="stat-value" x="138" y="122">589</text>
        <text class="stat-label" x="138" y="154">events</text>
      </g>
      <g class="stat-orbit">
        <circle cx="330" cy="132" r="64" />
        <text class="stat-value" x="330" y="122">2.7%</text>
        <text class="stat-label" x="330" y="154">detectable ancestry</text>
      </g>
      <g class="genome-axis">
        <rect x="500" y="116" width="196" height="30" rx="15" />
        <rect class="spike-peak" x="638" y="116" width="42" height="30" rx="15" />
        <path class="peak-curve" d="M 500 104 C 548 84, 590 108, 628 62 C 666 18, 704 78, 696 104" />
        <text x="598" y="178">3' end / Spike peak</text>
      </g>
    </svg>
  `,
  "evolution-accelerator": `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 900 460" aria-hidden="true">
      <defs>
        <marker id="arrow-evo" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <text class="svg-kicker" x="80" y="58">recombination as an evolutionary accelerator</text>
      <g class="evo-track">
        <rect x="92" y="136" width="154" height="70" rx="22" />
        <text x="169" y="178">亲本 A</text>
        <rect x="92" y="250" width="154" height="70" rx="22" />
        <text x="169" y="292">亲本 B</text>
        <path class="svg-arrow" marker-end="url(#arrow-evo)" d="M 270 172 C 366 174, 408 194, 492 222" />
        <path class="svg-arrow" marker-end="url(#arrow-evo)" d="M 270 286 C 366 282, 408 254, 492 226" />
        <rect class="evo-core" x="512" y="172" width="150" height="96" rx="28" />
        <text x="587" y="212">重组</text>
        <text x="587" y="240">一次组合</text>
        <path class="svg-arrow" marker-end="url(#arrow-evo)" d="M 684 220 H 790" />
        <circle class="advantage-node" cx="820" cy="220" r="58" />
        <text x="820" y="207">逃逸</text>
        <text x="820" y="236">传播</text>
      </g>
      <text class="effect-text" x="452" y="392">逐步突变之外，重组能快速整合既有有利片段</text>
    </svg>
  `
};

function bindEvents() {
  nextButton.addEventListener("click", () => goToSlide(state.currentIndex + 1));
  prevButton.addEventListener("click", () => goToSlide(state.currentIndex - 1));
  window.addEventListener("keydown", handleKeyboard);
}

function handleKeyboard(event) {
  if (event.key === "ArrowRight" || event.key === "PageDown" || event.key === " ") {
    event.preventDefault();
    goToSlide(state.currentIndex + 1);
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    goToSlide(state.currentIndex - 1);
  }
}

function goToSlide(nextIndex) {
  if (nextIndex < 0 || nextIndex >= state.slides.length || nextIndex === state.currentIndex) {
    return;
  }

  state.direction = nextIndex > state.currentIndex ? "next" : "prev";
  showSlide(nextIndex);
}

function showSlide(index) {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const previousSlide = slides[state.currentIndex];
  const activeSlide = slides[index];

  if (!activeSlide) {
    return;
  }

  slides.forEach((slide) => {
    slide.classList.remove("is-active", "is-exiting-left", "is-exiting-right");
  });

  if (previousSlide && previousSlide !== activeSlide) {
    previousSlide.classList.add(state.direction === "next" ? "is-exiting-left" : "is-exiting-right");
  }

  activeSlide.classList.add("is-active");
  state.currentIndex = index;
  updateNavigation();
  window.PresentationEffects?.activate(activeSlide);
}

function updateNavigation() {
  const total = state.slides.length || 1;
  counter.textContent = `${String(state.currentIndex + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  prevButton.disabled = state.currentIndex === 0;
  nextButton.disabled = state.currentIndex === total - 1;
  const hash = `slide-${state.currentIndex + 1}`;
  if (window.location.hash.slice(1) !== hash) {
    window.history.replaceState(null, "", `#${hash}`);
  }
}

function getInitialSlideIndex() {
  const match = window.location.hash.match(/slide-(\d+)/i);
  if (!match) {
    return 0;
  }

  const requested = Number(match[1]) - 1;
  if (Number.isNaN(requested)) {
    return 0;
  }

  return Math.min(Math.max(requested, 0), Math.max(state.slides.length - 1, 0));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

initDeck();
