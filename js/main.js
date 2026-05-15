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
    showSlide(0);
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
        <ellipse cx="220" cy="220" rx="126" ry="72" />
        <text x="220" y="226">供体细胞</text>
        <circle class="plasmid" cx="282" cy="178" r="24" />
      </g>
      <g class="bacterium bacterium-recipient">
        <ellipse cx="640" cy="220" rx="126" ry="72" />
        <text x="640" y="226">受体细胞</text>
      </g>
      <path class="transfer-bridge" marker-end="url(#arrow-prok)" d="M 342 220 C 418 178, 486 178, 562 220" />
      <path class="external-dna" d="M 370 326 C 420 302, 480 354, 530 326" />
      <text class="svg-note" x="450" y="372">外源 DNA / 质粒进入细胞</text>
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
      </defs>
      <text class="svg-kicker" x="80" y="58">co-infection + homologous pairing + polymerase pausing</text>
      <g class="template-cloud">
        <path class="cloud-rna a" d="M 88 150 C 160 102, 238 198, 310 150 S 466 150, 538 150" />
        <path class="cloud-rna b" d="M 110 246 C 182 198, 260 294, 332 246 S 488 246, 560 246" />
        <path class="cloud-rna c" d="M 142 332 C 214 284, 292 380, 364 332 S 520 332, 592 332" />
      </g>
      <g class="polymerase engine">
        <circle cx="430" cy="196" r="48" />
        <text x="430" y="204">RdRp</text>
      </g>
      <path class="stall-ring" d="M 378 196 A 52 52 0 1 1 480 196" />
      <path class="svg-arrow" marker-end="url(#arrow-rdrp)" d="M 478 220 C 548 248, 610 284, 684 318" />
      <g class="factor-list">
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
