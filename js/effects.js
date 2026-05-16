let activeProteinStage = null;
let activeProteinResizeHandler = null;

window.PresentationEffects = {
  activate(slide) {
    restartDiagramMotion(slide);
    mountProteinViewer(slide);
  }
};

function restartDiagramMotion(slide) {
  const diagrams = slide.querySelectorAll(".diagram-card");

  diagrams.forEach((diagram) => {
    diagram.classList.remove("is-animated");
    void diagram.offsetWidth;
    diagram.classList.add("is-animated");
  });
}

function loadNglScript() {
  if (window.NGL) {
    return Promise.resolve(window.NGL);
  }

  if (window.__nglScriptPromise) {
    return window.__nglScriptPromise;
  }

  window.__nglScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/ngl@latest/dist/ngl.js";
    script.async = true;
    script.onload = () => resolve(window.NGL);
    script.onerror = () => reject(new Error("NGL script load failed"));
    document.head.append(script);
  });

  return window.__nglScriptPromise;
}

async function mountProteinViewer(slide) {
  const panel = slide.querySelector("[data-protein-viewer]");
  if (!panel) {
    disposeProteinViewer();
    return;
  }

  if (panel.dataset.ready === "true") {
    requestAnimationFrame(() => activeProteinStage?.handleResize());
    return;
  }

  disposeProteinViewer();

  const container = panel.querySelector("[data-protein-stage]");
  const modelUrl = panel.dataset.modelUrl;
  const proteinColor = panel.dataset.proteinColor || "#d86fa6";
  const mutationColor = panel.dataset.mutationColor || "#2f8f5b";
  const highlightResidues = panel.dataset.highlightResidues || "209,339,346,368,445,486,490";

  try {
    const NGL = await loadNglScript();
    container.innerHTML = "";
    const stage = new NGL.Stage(container, {
      backgroundColor: "#FAFAFA",
      clipNear: 0,
      fogNear: 80,
      fogFar: 100
    });

    const resizeHandler = () => stage.handleResize();
    window.addEventListener("resize", resizeHandler, { passive: true });

    const component = await stage.loadFile(modelUrl, { ext: "cif" });
    const chains = ":A or :B or :C";
    const residueSelection = highlightResidues
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .join(" or ");

    const mutationSelection = "(209:A or 209:B or 209:C or 339:A or 346:A or 368:A or 445:A or 486:A or 490:A)";

    component.addRepresentation("surface", {
      sele: chains,
      color: proteinColor,
      opacity: 0.42,
      surfaceType: "ms",
      useWorker: false
    });

    component.addRepresentation("cartoon", {
      sele: chains,
      color: proteinColor,
      opacity: 0.38
    });

    component.addRepresentation("ball+stick", {
      sele: `(${chains}) and (${residueSelection})`,
      color: mutationColor,
      scale: 3.2,
      aspectRatio: 1.4
    });

    component.addRepresentation("surface", {
      sele: mutationSelection,
      color: mutationColor,
      opacity: 1,
      surfaceType: "ms",
      useWorker: false
    });

    component.addRepresentation("spacefill", {
      sele: "(209:A or 209:B or 209:C)",
      color: mutationColor,
      scale: 5.6,
      opacity: 1
    });

    component.addRepresentation("label", {
      sele: ":A and 209",
      labelType: "text",
      labelText: "V213E",
      color: "#1f5f3e",
      backgroundColor: "#FAFAFA",
      backgroundOpacity: 0.86,
      zOffset: 2.6,
      size: 2.1
    });

    component.autoView(mutationSelection, 900);
    stage.viewerControls.zoom(-0.42);
    activeProteinStage = stage;
    activeProteinResizeHandler = resizeHandler;
    panel.dataset.ready = "true";
    requestAnimationFrame(() => {
      stage.handleResize();
      window.setTimeout(() => stage.handleResize(), 350);
    });
  } catch (error) {
    container.innerHTML = `
      <div class="protein-fallback protein-fallback--error">
        <strong>3D 结构加载失败</strong>
        <p>已保留真实结构来源：RCSB ${panel.dataset.pdbId}。请检查网络或 CDN 访问。</p>
        <small>${escapeHtml(error.message)}</small>
      </div>
    `;
  }
}

function disposeProteinViewer() {
  if (activeProteinStage) {
    activeProteinStage.dispose();
    activeProteinStage = null;
  }

  if (activeProteinResizeHandler) {
    window.removeEventListener("resize", activeProteinResizeHandler);
    activeProteinResizeHandler = null;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
