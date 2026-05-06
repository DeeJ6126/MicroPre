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
  "base-substitution": "碱基替换机制示意",
  "dual-function": "点突变两大功能示意",
  convergence: "趋同进化示意",
  "immune-escape": "Omicron 免疫逃逸示意",
  "host-factory": "免疫缺陷宿主体内进化示意",
  epistasis: "上位性效应示意",
  "summary-map": "点突变核心地位总结图"
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
      <section class="slide is-active" data-layout="text-only">
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
  const bullets = (slide.points || [])
    .map((point) => `<li>${escapeHtml(point)}</li>`)
    .join("");
  const label = slide.label || `PPT ${String(index + 1).padStart(2, "0")}`;
  const layout = slide.layout || "split-visual";
  const visual = createVisualMarkup(slide);

  return `
    <section class="slide" data-slide-index="${index}" data-layout="${layout}" data-diagram="${escapeAttribute(slide.diagram || "")}">
      <div class="slide-content">
        <p class="slide-label">${escapeHtml(label)}</p>
        <h2 class="slide-title">${escapeHtml(slide.title || "")}</h2>
        ${slide.subtitle ? `<p class="slide-subtitle">${escapeHtml(slide.subtitle)}</p>` : ""}
        ${bullets ? `<ul class="bullet-list">${bullets}</ul>` : ""}
      </div>
      ${visual}
    </section>
  `;
}

function createVisualMarkup(slide) {
  const imageMarkup = slide.image ? createImageMarkup(slide) : "";
  const diagramMarkup = slide.diagram ? createDiagramMarkup(slide.diagram) : "";

  if (!imageMarkup && !diagramMarkup) {
    return "";
  }

  return `
    <div class="slide-visual">
      ${imageMarkup}
      ${diagramMarkup}
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

const diagrams = {
  "base-substitution": `
    <svg class="mechanism-svg" viewBox="0 0 620 250" aria-hidden="true">
      <defs>
        <marker id="arrow-base" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g class="svg-step">
        <text class="svg-label" x="42" y="42">RNA 复制</text>
        <rect class="base-token" x="36" y="70" width="56" height="48" rx="10" />
        <rect class="base-token" x="104" y="70" width="56" height="48" rx="10" />
        <rect class="base-token is-hot" x="172" y="70" width="56" height="48" rx="10" />
        <rect class="base-token" x="240" y="70" width="56" height="48" rx="10" />
        <text class="base-text" x="64" y="101">A</text>
        <text class="base-text" x="132" y="101">U</text>
        <text class="base-text" x="200" y="101">C</text>
        <text class="base-text" x="268" y="101">G</text>
        <text class="svg-note" x="173" y="147">C -> U</text>
      </g>
      <path class="svg-arrow" marker-end="url(#arrow-base)" d="M 318 94 C 360 94, 372 94, 414 94" />
      <g class="svg-step">
        <text class="svg-label" x="438" y="42">蛋白表达</text>
        <rect class="protein-chain" x="430" y="70" width="132" height="48" rx="24" />
        <circle class="protein-node" cx="454" cy="94" r="14" />
        <circle class="protein-node is-hot" cx="496" cy="94" r="14" />
        <circle class="protein-node" cx="538" cy="94" r="14" />
        <text class="svg-note" x="410" y="147">氨基酸改变</text>
      </g>
      <path class="effect-line" d="M 188 166 C 246 220, 398 220, 494 166" />
      <text class="effect-text" x="210" y="218">单点变化可能改变蛋白功能</text>
    </svg>
  `,
  "dual-function": `
    <svg class="mechanism-svg" viewBox="0 0 620 250" aria-hidden="true">
      <defs>
        <marker id="arrow-dual" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <circle class="rbd-core" cx="145" cy="126" r="58" />
      <text class="rbd-text" x="145" y="118">RBD</text>
      <text class="rbd-subtext" x="145" y="143">点突变</text>
      <path class="svg-arrow" marker-end="url(#arrow-dual)" d="M 210 104 C 275 60, 332 55, 398 73" />
      <path class="svg-arrow" marker-end="url(#arrow-dual)" d="M 210 148 C 275 194, 332 198, 398 178" />
      <g class="function-box">
        <rect x="404" y="34" width="166" height="78" rx="12" />
        <text x="487" y="67">ACE2 亲和力</text>
        <text x="487" y="92">结合增强</text>
      </g>
      <g class="function-box function-box-alt">
        <rect x="404" y="138" width="166" height="78" rx="12" />
        <text x="487" y="171">抗原表位</text>
        <text x="487" y="196">识别下降</text>
      </g>
    </svg>
  `,
  convergence: `
    <svg class="mechanism-svg" viewBox="0 0 620 250" aria-hidden="true">
      <defs>
        <marker id="arrow-convergence" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g class="lineage lineage-one">
        <rect x="58" y="38" width="142" height="44" rx="12" />
        <text x="129" y="67">Alpha</text>
      </g>
      <g class="lineage lineage-two">
        <rect x="58" y="103" width="142" height="44" rx="12" />
        <text x="129" y="132">Beta</text>
      </g>
      <g class="lineage lineage-three">
        <rect x="58" y="168" width="142" height="44" rx="12" />
        <text x="129" y="197">Gamma</text>
      </g>
      <path class="svg-arrow" marker-end="url(#arrow-convergence)" d="M 214 60 C 286 60, 318 91, 383 116" />
      <path class="svg-arrow" marker-end="url(#arrow-convergence)" d="M 214 125 C 282 125, 318 125, 382 125" />
      <path class="svg-arrow" marker-end="url(#arrow-convergence)" d="M 214 190 C 286 190, 318 159, 383 134" />
      <circle class="selection-core" cx="455" cy="125" r="60" />
      <text class="selection-main" x="455" y="119">N501Y</text>
      <text class="selection-sub" x="455" y="147">趋同选择</text>
    </svg>
  `,
  "immune-escape": `
    <svg class="mechanism-svg" viewBox="0 0 620 250" aria-hidden="true">
      <defs>
        <marker id="arrow-escape" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <path class="rbd-surface" d="M 250 70 C 305 28, 390 42, 416 103 C 446 171, 373 215, 302 189 C 244 168, 208 108, 250 70 Z" />
      <text class="surface-text" x="328" y="126">Omicron RBD</text>
      <g class="mutation-tags">
        <text x="233" y="52">K417N</text>
        <text x="404" y="69">E484A</text>
        <text x="398" y="196">Q493R</text>
      </g>
      <path class="antibody antibody-faded" d="M 88 74 L 138 124 L 88 174 M 138 124 L 174 124" />
      <text class="svg-note" x="54" y="210">抗体识别下降</text>
      <path class="svg-arrow" marker-end="url(#arrow-escape)" d="M 416 126 C 462 126, 484 126, 526 126" />
      <rect class="ace2-block" x="530" y="88" width="54" height="76" rx="10" />
      <text class="ace2-text" x="557" y="132">ACE2</text>
      <text class="effect-text" x="378" y="226">结合维持，逃逸增强</text>
    </svg>
  `,
  "host-factory": `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 760 360" aria-hidden="true">
      <defs>
        <marker id="arrow-host" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <circle class="host-body" cx="130" cy="170" r="68" />
      <circle class="host-head" cx="130" cy="80" r="34" />
      <text class="host-label" x="130" y="270">免疫缺陷宿主</text>
      <path class="timeline" marker-end="url(#arrow-host)" d="M 238 170 H 650" />
      <g class="time-node">
        <circle cx="300" cy="170" r="18" />
        <text x="300" y="220">持续感染</text>
      </g>
      <g class="time-node">
        <circle cx="430" cy="170" r="18" />
        <text x="430" y="220">突变积累</text>
      </g>
      <g class="time-node">
        <circle cx="560" cy="170" r="18" />
        <text x="560" y="220">适应筛选</text>
      </g>
      <g class="variant-cloud">
        <circle cx="300" cy="116" r="9" />
        <circle cx="348" cy="98" r="7" />
        <circle cx="392" cy="112" r="11" />
        <circle cx="456" cy="92" r="8" />
        <circle cx="512" cy="118" r="10" />
        <circle cx="570" cy="96" r="7" />
      </g>
      <path class="svg-arrow spread-arrow" marker-end="url(#arrow-host)" d="M 610 142 C 660 112, 690 96, 724 76" />
      <text class="effect-text" x="548" y="54">外溢传播</text>
    </svg>
  `,
  epistasis: `
    <svg class="mechanism-svg" viewBox="0 0 620 250" aria-hidden="true">
      <defs>
        <marker id="arrow-epi" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <g class="epi-grid">
        <rect x="58" y="52" width="132" height="58" rx="12" />
        <rect x="218" y="52" width="132" height="58" rx="12" />
        <rect x="58" y="140" width="132" height="58" rx="12" />
        <rect class="epi-hot" x="218" y="140" width="132" height="58" rx="12" />
        <text x="124" y="87">单突变 A</text>
        <text x="284" y="87">单突变 B</text>
        <text x="124" y="176">背景突变</text>
        <text x="284" y="176">组合优势</text>
      </g>
      <path class="svg-arrow" marker-end="url(#arrow-epi)" d="M 370 168 C 426 168, 438 168, 492 168" />
      <g class="synergy-badge">
        <circle cx="536" cy="168" r="48" />
        <text x="536" y="160">1+1</text>
        <text x="536" y="188">&gt; 2</text>
      </g>
      <text class="svg-note" x="70" y="226">同一突变在不同背景下，效果可以完全不同</text>
    </svg>
  `,
  "summary-map": `
    <svg class="mechanism-svg mechanism-svg-large" viewBox="0 0 760 360" aria-hidden="true">
      <defs>
        <marker id="arrow-summary" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <circle class="summary-core" cx="380" cy="178" r="72" />
      <text class="summary-core-text" x="380" y="172">点突变</text>
      <text class="summary-core-sub" x="380" y="202">进化引擎</text>
      <g class="summary-node node-a">
        <rect x="86" y="52" width="162" height="58" rx="14" />
        <text x="167" y="87">RBD 热点</text>
      </g>
      <g class="summary-node node-b">
        <rect x="512" y="52" width="162" height="58" rx="14" />
        <text x="593" y="87">亲和力优化</text>
      </g>
      <g class="summary-node node-c">
        <rect x="74" y="252" width="186" height="58" rx="14" />
        <text x="167" y="287">免疫逃逸</text>
      </g>
      <g class="summary-node node-d">
        <rect x="500" y="252" width="186" height="58" rx="14" />
        <text x="593" y="287">上位性组合</text>
      </g>
      <path class="summary-link" marker-end="url(#arrow-summary)" d="M 318 140 C 264 112, 232 98, 250 88" />
      <path class="summary-link" marker-end="url(#arrow-summary)" d="M 442 140 C 496 112, 528 98, 510 88" />
      <path class="summary-link" marker-end="url(#arrow-summary)" d="M 318 216 C 258 242, 226 260, 260 274" />
      <path class="summary-link" marker-end="url(#arrow-summary)" d="M 442 216 C 500 242, 530 260, 500 274" />
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
