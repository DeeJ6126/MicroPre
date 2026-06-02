const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const content = JSON.parse(read('data/content.json'));
const html = read('index.html');
const script = read('script.js');
const style = read('style.css');

assert.strictEqual(content.slides.length, 22, 'deck must contain 22 slides');

const expectedTitles = [
  '引入：什么是点突变？',
  '一、点突变的两大核心功能',
  '二、关键突变：N501Y 的趋同进化',
  '三、Omicron：从“更强结合”转向“更强逃逸”',
  '四、免疫缺陷宿主：点突变的“进化工厂”',
  '五、上位性效应：突变不是单打独斗',
  '总结：点突变的核心地位',
  '什么是病毒重组',
  '与真核生物不同',
  '与原核生物不同',
  '对比总结',
  '机制',
  'Omicron 例子：XBB',
  '为什么重组的频率',
  '重组对于病毒进化的重要性'
];
assert.deepStrictEqual(
  content.slides.slice(0, 15).map((slide) => slide.title),
  expectedTitles,
  'first two chapters must use PDF titles'
);

assert.strictEqual(content.slides[1].points.length, 2, 'slide 2 must keep only the two PDF functions');
assert.strictEqual(content.slides[6].points.length, 6, 'slide 7 must expose the six PDF summary items');
assert.strictEqual(content.slides[7].points, undefined, 'slide 8 must not add explanatory bullets');
assert.strictEqual(content.slides[8].points, undefined, 'slide 9 must not add explanatory bullets');
assert.strictEqual(content.slides[7].diagram, 'rdRp-switch-engine', 'slide 8 must keep the concept-level switch diagram');
assert.strictEqual(content.slides[11].diagram, 'viral-template-switch', 'slide 12 must keep the detailed mechanism diagram');
assert.match(script, /class="comparison-card comparison-card--euk"/, 'slide 11 must render a neutral eukaryotic comparison card');
assert.match(script, /同源染色体配对/, 'slide 11 first card must be renamed to homologous chromosome pairing');
assert.match(script, /外源 DNA 摄取/, 'slide 11 second card must be renamed to extracellular DNA uptake');
assert.match(script, /模板跳跃/, 'slide 11 third card must be renamed to template jumping');
assert.match(style, /diagram-three-way-comparison\[data-compare="virus"\] \.comparison-card--virus/, 'slide 11 SARS-CoV-2 card must only highlight after click');

const proteinSlides = content.slides
  .map((slide, index) => slide.proteinViewer ? index + 1 : null)
  .filter(Boolean);
assert.deepStrictEqual(proteinSlides, [13], 'only slide 13 may keep a protein viewer');
assert.strictEqual(content.slides[12].proteinViewer.pdbId, '8IOS');
assert.strictEqual(content.slides[12].proteinViewer.modelUrl, 'public/vendor/8IOS.pdb');
assert.strictEqual(content.slides[12].proteinViewer.proteinColor, '#d86fa6');
assert.deepStrictEqual(
  content.slides[12].proteinViewer.highlightResidues,
  [83, 213, 339, 346, 368, 408, 445, 446, 460, 486, 490, 614],
  'slide 13 must expose the source figure XBB.1 Spike sites with modeled coordinates'
);
assert.deepStrictEqual(
  content.slides[12].proteinViewer.unresolvedResidues,
  [146, 183, 252],
  'slide 13 must disclose source figure sites omitted from 3D because coordinates are unresolved'
);
assert.deepStrictEqual(
  content.slides[12].proteinViewer.unresolvedLabels,
  ['H146Q', 'Q183E', 'G252V'],
  'slide 13 must name unresolved source-figure mutation sites'
);
assert.ok(fs.existsSync(path.join(root, 'public/vendor/ngl.js')), 'pinned local NGL runtime must exist');
assert.ok(fs.existsSync(path.join(root, 'public/vendor/8IOS.pdb')), 'local RCSB 8IOS PDB export must exist');

assert.match(html, /href="style\.css"/, 'index must reference style.css');
assert.match(html, /src="script\.js"/, 'index must reference script.js');
assert.doesNotMatch(html, /const CONTENT_DATA/, 'index must not embed a second content copy');
assert.doesNotMatch(script, /const CONTENT_DATA/, 'script must load the JSON source of truth');
assert.match(script, /fetch\(['"]data\/content\.json['"]\)/, 'script must fetch JSON content');
assert.match(
  script,
  /restartDiagramMotion\(slide\);\s+bindNarrativeInteraction\(slide\);/,
  'narrative click interactions must be registered when a slide activates'
);
assert.match(script, /bindProkaryoticTransfer\(slide\)/, 'slide 10 transfer interactions must be registered');
assert.match(script, /bindTemplateSwitch\(slide\)/, 'slide 12 detailed template switch interaction must be registered');
assert.doesNotMatch(script, /ngl@latest/, 'NGL must not load an unpinned CDN version');
assert.match(script, /highlightResidues/, 'viewer must render verified XBB.1 hotspots');

console.log('verify-deck: all assertions passed');
