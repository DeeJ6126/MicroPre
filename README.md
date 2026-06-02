# SARS-CoV-2 Molecular Evolution Presentation v2

This directory contains the interactive academic presentation redesign.
The stable legacy implementation is preserved under `legacy-reference/` as
read-only reference material.

## Start Here

Run the presentation from a local static server:

```powershell
cd E:\Microbiology\presentation-v2
python -m http.server 8092
```

Then open:

```text
http://127.0.0.1:8092/
```

The runtime requires HTTP because it loads `data/content.json` with `fetch`.

Read these files before making changes:

1. `HANDOFF.md` - content, interaction, scientific, and acceptance requirements.
2. `source-materials/README.md` - source asset inventory.
3. `START_HERE.md` - historical redesign prompt.

## Workspace Layout

```text
presentation-v2/
  HANDOFF.md
  START_HERE.md
  legacy-reference/        # archived v1 implementation; reference only
  source-materials/        # original images, documents, and legacy JSON
  public/
    img/                   # images ready for use by the v2 app
    docs/
    vendor/                # pinned NGL runtime and local 8IOS XBB.1 structure
  data/
    content.json           # single runtime content source for all 22 slides
  src/
    data/
    diagrams/
    interactions/
    slides/
    styles/
    viewers/
  tests/
```

The browser entry points are `index.html`, `style.css`, and `script.js`.

## Safety Note

This folder was copied from the original Git repository and still points to:

```text
https://github.com/DeeJ6126/MicroPre.git
```

Do not push redesign work to that remote until the new version has been
reviewed and an explicit deployment decision has been made.
