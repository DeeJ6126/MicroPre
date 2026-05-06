window.PresentationEffects = {
  activate(slide) {
    restartDiagramMotion(slide);
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
