import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourcePath = path.resolve(repoRoot, "..", "experiments.txt");
const coverImageSourcePath = path.resolve(
  repoRoot,
  "..",
  "ChatGPT Image Jun 1, 2026, 01_08_31 PM.png",
);
const coverImageTargetPath = path.join(repoRoot, "docs", "assets", "lab-cover.png");

const CATEGORY_META = {
  "agentic-ai": {
    title: "Agentic AI & Agent Memory",
    goal: "Build memory-aware and stateful agents that can operate across sessions and workflows.",
    problems:
      "Persistent memory, browser actions, temporal context graphs, and automation loops for practical agents.",
    short: "Memory-aware agents, browser agents, and stateful automation.",
  },
  "structured-output-guardrails-eval": {
    title: "Structured Output, Guardrails & Evaluation",
    goal: "Improve reliability, safety, and evaluation quality for LLM apps.",
    problems:
      "Schema-first outputs, input/output safety checks, red-team style testing, and prompt/model evaluation.",
    short: "Schema validation, safety checks, and eval pipelines.",
  },
  "vlm-document-ai": {
    title: "VLM, OCR & Document Understanding",
    goal: "Convert complex documents into reliable machine-readable content.",
    problems:
      "Reading order, table/formula extraction, layout-heavy PDFs, and document intelligence ingestion.",
    short: "OCR, VLM extraction, and document parsing.",
  },
  "lora-finetuning": {
    title: "LoRA, Fine-tuning & Adapter Infrastructure",
    goal: "Test practical fine-tuning and adapter workflows for efficient model adaptation.",
    problems:
      "LoRA variants, multi-adapter training, adapter serving, and diffusion fine-tuning workflows.",
    short: "LoRA/QLoRA training, adapters, and serving.",
  },
  recsys: {
    title: "Personalization & Recommendation Systems",
    goal: "Measure real-world recommendation and personalization performance through practical projects.",
    problems:
      "Ranking, feature freshness, recommendation backends, and retrieval + ranking personalization.",
    short: "Ranking, recommendation engines, and feature stores.",
  },
  "knowledge-base": {
    title: "Knowledge Base, RAG & Document Intelligence",
    goal: "Build and compare practical KB/RAG workflows for real documents.",
    problems:
      "RAG orchestration, PDF-heavy ingestion, citations, and second-brain style retrieval.",
    short: "KB platforms, RAG engines, and doc-heavy workflows.",
  },
  "llm-inference": {
    title: "LLM Inference & Serving",
    goal: "Benchmark inference stacks for throughput, latency, and efficiency.",
    problems:
      "Serving architecture, KV-cache reuse, high-throughput inference, and low-bit deployment.",
    short: "Inference engines, serving stacks, and low-bit runtime.",
  },
};

const FRAMEWORK_TO_CATEGORY = new Map(
  [
    ["LangMem", "agentic-ai"],
    ["Mem0", "agentic-ai"],
    ["Zep", "agentic-ai"],
    ["Graphiti", "agentic-ai"],
    ["Letta", "agentic-ai"],
    ["Supermemory", "agentic-ai"],
    ["Cognee", "agentic-ai"],
    ["Agno", "agentic-ai"],
    ["Browser Use", "agentic-ai"],
    ["Stagehand", "agentic-ai"],
    ["Honcho", "agentic-ai"],
    ["memU", "agentic-ai"],
    ["BAML", "structured-output-guardrails-eval"],
    ["Guardrails AI", "structured-output-guardrails-eval"],
    ["promptfoo", "structured-output-guardrails-eval"],
    ["garak", "structured-output-guardrails-eval"],
    ["olmOCR", "vlm-document-ai"],
    ["ModelScope ms-swift", "lora-finetuning"],
    ["Axolotl", "lora-finetuning"],
    ["AdapterHub Adapters", "lora-finetuning"],
    ["m-LoRA", "lora-finetuning"],
    ["LoRAX", "lora-finetuning"],
    ["SimpleTuner", "lora-finetuning"],
    ["Metarank", "recsys"],
    ["Gorse", "recsys"],
    ["RecBole", "recsys"],
    ["Cornac", "recsys"],
    ["Vespa", "recsys"],
    ["Feast", "recsys"],
    ["Dify", "knowledge-base"],
    ["RAGFlow", "knowledge-base"],
    ["Quivr", "knowledge-base"],
    ["MinerU", "knowledge-base"],
    ["RTP-LLM", "llm-inference"],
    ["Mooncake", "llm-inference"],
    ["BitNet.cpp", "llm-inference"],
  ].map(([name, slug]) => [normName(name), slug]),
);

function normName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractObjectChunks(raw) {
  const chunks = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escape = false;
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === "{") {
      if (depth === 0) start = i;
      depth += 1;
    } else if (ch === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        chunks.push(raw.slice(start, i + 1));
        start = -1;
      }
    }
  }
  return chunks;
}

function parseObjectChunk(chunk) {
  const cleaned = chunk.replace(/,\s*}/g, "}");
  try {
    return JSON.parse(cleaned);
  } catch {
    const obj = {};
    const rx = /"([^"]+)"\s*:\s*("(?:\\.|[^"\\])*"|null|true|false|-?\d+(?:\.\d+)?)/g;
    let m;
    while ((m = rx.exec(cleaned)) !== null) {
      const key = m[1];
      const token = m[2];
      try {
        obj[key] = JSON.parse(token);
      } catch {
        obj[key] = token;
      }
    }
    return obj;
  }
}

function categoryFor(item) {
  const named = FRAMEWORK_TO_CATEGORY.get(normName(item.name));
  if (named) return named;
  const cat = String(item.category || "").toLowerCase();
  if (/(recsys|recomm|feature_store|ranking)/.test(cat)) return "recsys";
  if (/(lora|adapter|finetun|fine_tuning|diffusion)/.test(cat)) return "lora-finetuning";
  if (/(ocr|vlm|document)/.test(cat)) return "vlm-document-ai";
  if (/(guard|eval|schema|prompt)/.test(cat)) return "structured-output-guardrails-eval";
  if (/(rag|knowledge|second_brain)/.test(cat)) return "knowledge-base";
  if (/(inference|serving|cache|bitnet|llm)/.test(cat)) return "llm-inference";
  return "agentic-ai";
}

function cleanText(value) {
  if (value == null) return null;
  return String(value).trim() || null;
}

function mdEscape(value) {
  return String(value || "").replace(/\|/g, "\\|");
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function copyIfExists(source, target) {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

const raw = fs.readFileSync(sourcePath, "utf8");
const chunks = extractObjectChunks(raw);
const parsed = chunks.map(parseObjectChunk).filter((x) => x && x.name);

const deduped = [];
const seen = new Set();
for (const item of parsed) {
  const key = normName(item.name);
  if (!key || seen.has(key)) continue;
  seen.add(key);
  deduped.push(item);
}

const normalized = deduped.map((item, idx) => {
  const number = String(idx + 1).padStart(3, "0");
  const frameworkSlug = slugify(item.name);
  const slug = `${number}-${frameworkSlug}`;
  const categorySlug = categoryFor(item);
  const categoryTitle = CATEGORY_META[categorySlug].title;
  const problem =
    cleanText(item.problem_solved) || cleanText(item.vlm_problem_solved) || "TBD";
  const officialUrl = cleanText(item.official_url) || cleanText(item.docs_url);
  const docsUrl = cleanText(item.docs_url) || cleanText(item.official_url);
  return {
    experiment_number: number,
    slug,
    name: cleanText(item.name),
    primary_category: categoryTitle,
    primary_category_slug: categorySlug,
    secondary_tags: ["100AIFrameworks", categorySlug],
    status: "Pending",
    problem_solved: problem,
    what_it_does: cleanText(item.what_it_does) || "TBD",
    official_url: officialUrl,
    github_url: cleanText(item.github_url),
    docs_url: docsUrl,
    sample_project: cleanText(item.sample_project) || "TBD",
    before_after_angle: cleanText(item.before_after_angle) || cleanText(item.before_after) || null,
    linkedin_hook: cleanText(item.linkedin_hook) || cleanText(item.best_post_angle) || null,
    selected_from_source: "experiments.txt",
    tested_at: null,
    published_at: null,
    linkedin_url: null,
    newsletter_url: null,
    experiment_url: null,
    score: null,
  };
});

const byCategory = {};
for (const f of normalized) {
  byCategory[f.primary_category_slug] ||= [];
  byCategory[f.primary_category_slug].push(f);
}

for (const list of Object.values(byCategory)) {
  list.sort((a, b) => a.experiment_number.localeCompare(b.experiment_number));
}

const total = normalized.length;
const categoryCount = Object.keys(byCategory).length;

writeFile(
  path.join(repoRoot, "data", "frameworks.json"),
  `${JSON.stringify(normalized, null, 2)}\n`,
);
copyIfExists(coverImageSourcePath, coverImageTargetPath);

const readme = `# #100AI Frameworks Lab

![#100AI Frameworks Lab](docs/assets/lab-cover.png)

I am experimenting with 100 open-source AI frameworks through practical, real project-based implementations. For each framework, I document what I build, how the setup feels, where the tool is useful, and whether it looks ready for serious engineering work.
`;
writeFile(path.join(repoRoot, "README.md"), readme);

const docsIndex = `# #100AI Frameworks Lab

<section class="lab-hero">
  <div class="lab-hero-copy">
    <div class="lab-kicker">Public AI Engineering Lab</div>
    <h1>#100AI Frameworks Lab</h1>
    <p>I am testing 100 open-source AI frameworks through practical, real project-based experiments and writing engineering notes from the process.</p>
    <div class="lab-actions">
      <a href="progress-dashboard/" class="lab-button primary">View dashboard</a>
      <a href="experiments/" class="lab-button">Browse experiments</a>
      <a href="https://www.linkedin.com/in/nijat-zeynalov-064163142/" class="lab-button linkedin-contact" aria-label="Contact on LinkedIn">
        <span class="linkedin-mark">in</span>
        Contact
      </a>
    </div>
  </div>
  <figure class="lab-hero-media">
    <img src="assets/lab-cover.png" alt="#100AI Frameworks Lab visual identity" />
  </figure>
</section>

<section class="metric-grid">
  <article><strong>100</strong><span>target frameworks</span></article>
  <article><strong>${total}</strong><span>selected</span></article>
  <article><strong>${total}</strong><span>pending</span></article>
  <article><strong>0</strong><span>tested</span></article>
  <article><strong>${categoryCount}</strong><span>categories</span></article>
</section>

<section class="lab-section">
  <div class="section-heading">
    <p>Focus areas</p>
    <h2>Organized by engineering problem, not hype.</h2>
  </div>
  <div class="category-grid">
    <a href="categories/agentic-ai/">Agentic AI & Memory</a>
    <a href="categories/knowledge-base/">Knowledge Base & RAG</a>
    <a href="categories/recsys/">Recommendation Systems</a>
    <a href="categories/lora-finetuning/">LoRA & Fine-tuning</a>
    <a href="categories/vlm-document-ai/">Document AI</a>
    <a href="categories/structured-output-guardrails-eval/">Guardrails & Eval</a>
    <a href="categories/llm-inference/">LLM Inference</a>
  </div>
</section>

<section class="lab-section">
  <div class="section-heading">
    <p>Workflow</p>
    <h2>Each framework becomes a real project note.</h2>
  </div>
  <div class="flow-grid">
    <article><span>01</span><h3>Select</h3><p>Choose a framework with a clear engineering use case.</p></article>
    <article><span>02</span><h3>Build</h3><p>Use it inside a practical project instead of reviewing it in isolation.</p></article>
    <article><span>03</span><h3>Document</h3><p>Write notes on setup, developer experience, output quality, and tradeoffs.</p></article>
    <article><span>04</span><h3>Decide</h3><p>Summarize where the framework is useful and what I would trust it for.</p></article>
  </div>
</section>
`;
writeFile(path.join(repoRoot, "docs", "index.md"), docsIndex);

const dashboardRows = normalized
  .map((f) => {
    const official = f.official_url ? `[Official](${f.official_url})` : "TBD";
    const gh = f.github_url ? `[GitHub](${f.github_url})` : "TBD";
    return `| ${f.experiment_number} | ${mdEscape(f.name)} | ${mdEscape(
      f.primary_category,
    )} | Pending | ${mdEscape(f.sample_project || "TBD")} | ${official} | ${gh} | [Page](experiments/${f.slug}.md) |`;
  })
  .join("\n");

const progress = `# Progress Dashboard

- Total target: 100
- Currently selected: ${total}
- Pending: ${total}
- Tested: 0
- Published: 0
- Categories covered: ${categoryCount}

| # | Framework | Category | Status | Planned project | Official Docs | GitHub | Experiment Page |
|---|---|---|---|---|---|---|---|
${dashboardRows}
`;
writeFile(path.join(repoRoot, "docs", "progress-dashboard.md"), progress);

for (const [slug, meta] of Object.entries(CATEGORY_META)) {
  const list = byCategory[slug] || [];
  const rows = list
    .map(
      (f) =>
        `| ${f.experiment_number} | ${mdEscape(f.name)} | Pending | ${mdEscape(
          f.sample_project || "TBD",
        )} | [Experiment](../experiments/${f.slug}.md) |`,
    )
    .join("\n");
  const content = `# ${meta.title}

## Goal

${meta.goal}

## Problem Space

${meta.problems}

## Frameworks

| # | Framework | Status | Planned project | Docs Page |
|---|---|---|---|---|
${rows}
`;
  writeFile(path.join(repoRoot, "docs", "categories", `${slug}.md`), content);
}

for (const [week, title] of [
  ["week-01", "Week 01"],
  ["week-02", "Week 02"],
]) {
  const content = `# ${title}

- Status: Planned
- Theme: TBD
- Frameworks planned: TBD
- Public notes: Not written yet

## Notes

TBD
`;
  writeFile(path.join(repoRoot, "docs", "weekly-logs", `${week}.md`), content);
}

const expIndexRows = normalized
  .map((f) => `- [${f.experiment_number} - ${f.name}](${f.slug}.md)`)
  .join("\n");
writeFile(
  path.join(repoRoot, "docs", "experiments", "index.md"),
  `# Experiments\n\n${expIndexRows}\n`,
);

for (const f of normalized) {
  const docsPage = `# ${f.experiment_number} - ${f.name}

## Status

Pending

## Category

${f.primary_category}

## Tags

\`#100AIFrameworks\`, \`#${f.primary_category_slug}\`

## Problem

TBD

## What it does

TBD

## Planned project

TBD

## Why this framework

TBD

## Current status

This experiment has not been run yet. Status: Pending.

## Planned evaluation criteria

- Setup experience
- Documentation quality
- Developer experience
- Output quality
- Debuggability
- Production readiness
- Hiring signal

## Scorecard

| Criteria | Score |
|---|---|
| Setup Experience | TBD |
| Documentation Quality | TBD |
| Developer Experience | TBD |
| Output Quality | TBD |
| Debuggability | TBD |
| Production Readiness | TBD |
| Hiring Signal | TBD |

## Links

- Official docs: TBD
- GitHub: TBD
- Weekly log: Not assigned yet
- Experiment folder: [GitHub folder](https://github.com/NijatZeynalov/100-AI-frameworks/tree/main/experiments/${f.slug})

## Notes

TBD
`;
  writeFile(path.join(repoRoot, "docs", "experiments", `${f.slug}.md`), docsPage);

  const expReadme = `# ${f.experiment_number} - ${f.name}

Status: Pending

Docs page: ../../docs/experiments/${f.slug}.md
`;
  writeFile(path.join(repoRoot, "experiments", f.slug, "README.md"), expReadme);
  writeFile(path.join(repoRoot, "experiments", f.slug, "code", ".gitkeep"), "");
  writeFile(path.join(repoRoot, "experiments", f.slug, "data", ".gitkeep"), "");
  writeFile(path.join(repoRoot, "experiments", f.slug, "screenshots", ".gitkeep"), "");

  const results = {
    framework: f.name,
    slug: f.slug,
    status: "Pending",
    category: f.primary_category,
    tested_at: null,
    published_at: null,
    linkedin_url: null,
    newsletter_url: null,
    experiment_url: null,
    scorecard: {
      setup_experience: null,
      documentation_quality: null,
      developer_experience: null,
      output_quality: null,
      debuggability: null,
      production_readiness: null,
      before_after_value: null,
      hiring_signal: null,
    },
    results: {
      summary: null,
      what_worked: [],
      what_failed: [],
      production_notes: [],
      final_verdict: null,
    },
  };
  writeFile(
    path.join(repoRoot, "experiments", f.slug, "results.json"),
    `${JSON.stringify(results, null, 2)}\n`,
  );
}

writeFile(
  path.join(repoRoot, "templates", "experiment-template.md"),
  `# 000 - Framework Name

## Status

Pending

## Category

Category Name

## Tags

\`#100AIFrameworks\`, \`#category-slug\`

## Problem

TBD

## What it does

TBD

## Planned project

TBD

## Why this framework

TBD

## Current status

This experiment has not been run yet. Status: Pending.

## Planned evaluation criteria

- Setup experience
- Documentation quality
- Developer experience
- Output quality
- Debuggability
- Production readiness
- Hiring signal

## Scorecard

| Criteria | Score |
|---|---|
| Setup Experience | TBD |
| Documentation Quality | TBD |
| Developer Experience | TBD |
| Output Quality | TBD |
| Debuggability | TBD |
| Production Readiness | TBD |
| Hiring Signal | TBD |

## Links

- Official docs: TBD
- GitHub: TBD
- Weekly log: Not assigned yet
- Experiment folder: GitHub folder link

## Notes

TBD
`,
);

writeFile(
  path.join(repoRoot, "templates", "scorecard-template.md"),
  `# Scorecard Template

- Framework: TBD
- Category: TBD
- Status: Pending
- Setup: TBD
- Docs: TBD
- DX: TBD
- Output quality: TBD
- Debuggability: TBD
- Production potential: TBD
- Hiring signal: TBD
- Final verdict: TBD
`,
);

writeFile(path.join(repoRoot, "assets", "images", ".gitkeep"), "");
writeFile(path.join(repoRoot, "assets", "diagrams", ".gitkeep"), "");

const navExperiments = normalized
  .map((f) => `      - ${f.experiment_number} ${f.name}: experiments/${f.slug}.md`)
  .join("\n");

const mkdocs = `site_name: 100 AI Frameworks Lab
site_description: Public AI engineering lab for 100 open-source frameworks
site_url: https://nijatzeynalov.github.io/100-AI-frameworks/

theme:
  name: mkdocs
  navigation_depth: 3

extra_css:
  - stylesheets/custom.css

extra_javascript:
  - javascripts/custom.js

nav:
  - Home: index.md
  - Progress Dashboard: progress-dashboard.md
  - Weekly Logs:
      - Week 01: weekly-logs/week-01.md
      - Week 02: weekly-logs/week-02.md
  - Categories:
      - Agentic AI: categories/agentic-ai.md
      - Guardrails & Eval: categories/structured-output-guardrails-eval.md
      - VLM & Document AI: categories/vlm-document-ai.md
      - LoRA & Fine-tuning: categories/lora-finetuning.md
      - RecSys: categories/recsys.md
      - Knowledge Base: categories/knowledge-base.md
      - LLM Inference: categories/llm-inference.md
  - Experiments:
      - Index: experiments/index.md
${navExperiments}
`;
writeFile(path.join(repoRoot, "mkdocs.yml"), mkdocs);

console.log(`Generated ${normalized.length} frameworks across ${categoryCount} categories.`);
