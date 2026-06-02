import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const dataPath = path.join(repoRoot, "data", "frameworks.json");

const CATEGORY_META = {
  "agentic-ai": {
    title: "Agentic AI & Agent Memory",
    goal: "Build memory-aware and stateful agents that can operate across sessions and workflows.",
    problems:
      "Persistent memory, browser actions, temporal context graphs, and automation loops for practical agents.",
  },
  "prompt-optimization-eval": {
    title: "Prompt Optimization & Evaluation",
    goal: "Improve prompt quality, structured outputs, safety checks, and evaluation workflows for LLM apps.",
    problems:
      "Prompt-as-code workflows, prompt optimization, schema-first outputs, guardrails, vulnerability testing, and prompt/model evaluation.",
  },
  "computer-vision": {
    title: "Computer Vision Frameworks",
    goal: "Test practical computer vision frameworks through real project-based experiments.",
    problems:
      "Dataset curation, model evaluation, domain adaptation, medical imaging, and real-time tracking workflows.",
  },
  "lora-finetuning": {
    title: "LoRA, Fine-tuning & Adapter Infrastructure",
    goal: "Test practical fine-tuning and adapter workflows for efficient model adaptation.",
    problems:
      "LoRA variants, multi-adapter training, adapter serving, and diffusion fine-tuning workflows.",
  },
  "model-optimization-compression": {
    title: "Model Optimization & Compression",
    goal: "Test practical techniques for making models smaller, faster, and cheaper to deploy.",
    problems:
      "Quantization, binarization, reduced-precision training, model compression, and efficient edge or accelerator deployment.",
  },
  "mlops-model-serving": {
    title: "MLOps & Model Serving",
    goal: "Evaluate the infrastructure layer needed to move model experiments into reliable production workflows.",
    problems:
      "Workflow orchestration, experiment versioning, scalable compute, inference servers, batching, multi-model serving, and deployment operations.",
  },
  recsys: {
    title: "Personalization & Recommendation Systems",
    goal: "Measure real-world recommendation and personalization performance through practical projects.",
    problems:
      "Ranking, feature freshness, recommendation backends, and retrieval plus ranking personalization.",
  },
  "knowledge-base": {
    title: "Knowledge Base, RAG & Document Intelligence",
    goal: "Build and compare practical KB/RAG workflows for real documents.",
    problems:
      "RAG orchestration, PDF-heavy ingestion, citations, and second-brain style retrieval.",
  },
  "llm-inference": {
    title: "LLM Inference & Serving",
    goal: "Benchmark inference stacks for throughput, latency, and efficiency.",
    problems:
      "Serving architecture, KV-cache reuse, high-throughput inference, and low-bit deployment.",
  },
};

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

function mdEscape(value) {
  return String(value || "").replace(/\|/g, "\\|");
}

function htmlEscape(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sortByExperimentNumber(a, b) {
  return String(a.experiment_number).localeCompare(String(b.experiment_number));
}

function required(value, fallback) {
  return value == null || value === "" ? fallback : value;
}

if (!fs.existsSync(dataPath)) {
  throw new Error(`Missing source data file: ${dataPath}`);
}

const frameworks = JSON.parse(fs.readFileSync(dataPath, "utf8"))
  .map((item) => ({
    ...item,
    status: required(item.status, "Pending"),
    primary_category_slug: required(item.primary_category_slug, "agentic-ai"),
    primary_category: required(
      item.primary_category,
      CATEGORY_META[item.primary_category_slug]?.title || "Agentic AI & Agent Memory",
    ),
  }))
  .sort(sortByExperimentNumber);

const byCategory = {};
for (const framework of frameworks) {
  byCategory[framework.primary_category_slug] ||= [];
  byCategory[framework.primary_category_slug].push(framework);
}

for (const list of Object.values(byCategory)) {
  list.sort(sortByExperimentNumber);
}

const total = frameworks.length;
const pending = frameworks.filter((item) => item.status === "Pending").length;
const tested = frameworks.filter((item) => item.status === "Tested").length;
const categoryCount = Object.keys(byCategory).length;

function buildLogoMarquee() {
  const logoDir = path.join(repoRoot, "docs", "assets", "logos");
  if (!fs.existsSync(logoDir)) return "";

  const frameworkBySlug = new Map(frameworks.map((framework) => [framework.slug, framework]));
  const logoFiles = fs
    .readdirSync(logoDir)
    .filter((file) => file.toLowerCase().endsWith(".png"))
    .sort((a, b) => a.localeCompare(b));

  if (logoFiles.length === 0) return "";

  const logoItems = logoFiles
    .map((file) => {
      const slug = path.basename(file, ".png");
      const name = frameworkBySlug.get(slug)?.name || slug.replace(/^\d{3}-/, "").replace(/-/g, " ");
      return `<span class="logo-marquee-item"><img src="assets/logos/${htmlEscape(file)}" alt="${htmlEscape(name)} logo" loading="eager" decoding="async" /></span>`;
    })
    .join("\n      ");

  const duplicateItems = logoFiles
    .map(
      (file) =>
        `<span class="logo-marquee-item"><img src="assets/logos/${htmlEscape(file)}" alt="" loading="eager" decoding="async" /></span>`,
    )
    .join("\n      ");

  return `<section class="logo-marquee-section" aria-label="Framework logos">
  <div class="logo-marquee">
    <div class="logo-marquee-track">
      <div class="logo-marquee-group">
      ${logoItems}
      </div>
      <div class="logo-marquee-group" aria-hidden="true">
      ${duplicateItems}
      </div>
    </div>
  </div>
</section>

`;
}

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
  <article><strong>${pending}</strong><span>pending</span></article>
  <article><strong>${tested}</strong><span>tested</span></article>
  <article><strong>${categoryCount}</strong><span>categories</span></article>
</section>

${buildLogoMarquee()}<section class="lab-section">
  <div class="section-heading">
    <p>Focus areas</p>
    <h2>Organized by engineering problem, not hype.</h2>
  </div>
  <div class="category-grid">
    <a href="categories/agentic-ai/">Agentic AI & Memory</a>
    <a href="categories/knowledge-base/">Knowledge Base & RAG</a>
    <a href="categories/recsys/">Recommendation Systems</a>
    <a href="categories/lora-finetuning/">LoRA & Fine-tuning</a>
    <a href="categories/computer-vision/">Computer Vision</a>
    <a href="categories/prompt-optimization-eval/">Prompt Optimization & Evaluation</a>
    <a href="categories/model-optimization-compression/">Model Optimization & Compression</a>
    <a href="categories/mlops-model-serving/">MLOps & Model Serving</a>
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

const dashboardRows = frameworks
  .map((framework) => {
    const official = framework.official_url ? `[Official](${framework.official_url})` : "TBD";
    const github = framework.github_url ? `[GitHub](${framework.github_url})` : "TBD";
    return `| ${framework.experiment_number} | ${mdEscape(framework.name)} | ${mdEscape(
      framework.primary_category,
    )} | ${mdEscape(framework.status)} | ${mdEscape(framework.sample_project || "TBD")} | ${official} | ${github} | [Page](experiments/${framework.slug}.md) |`;
  })
  .join("\n");

const progress = `# Progress Dashboard

- Total target: 100
- Currently selected: ${total}
- Pending: ${pending}
- Tested: ${tested}
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
      (framework) =>
        `| ${framework.experiment_number} | ${mdEscape(framework.name)} | ${mdEscape(
          framework.status,
        )} | ${mdEscape(framework.sample_project || "TBD")} | [Experiment](../experiments/${framework.slug}.md) |`,
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

const expIndexRows = frameworks
  .map((framework) => `- [${framework.experiment_number} - ${framework.name}](${framework.slug}.md)`)
  .join("\n");
writeFile(path.join(repoRoot, "docs", "experiments", "index.md"), `# Experiments\n\n${expIndexRows}\n`);

function markdownList(items, fallback = "TBD") {
  if (!Array.isArray(items) || items.length === 0) return fallback;
  return items.map((item) => `- ${item}`).join("\n");
}

function scorecardValue(scorecard, key) {
  const value = scorecard?.[key];
  return value == null || value === "" ? "TBD" : String(value);
}

function buildPendingExperimentPage(framework) {
  return `# ${framework.experiment_number} - ${framework.name}

## Status

${framework.status}

## Category

${framework.primary_category}

## Tags

\`#100AIFrameworks\`, \`#${framework.primary_category_slug}\`

## Problem

TBD

## What it does

TBD

## Planned project

TBD

## Why this framework

TBD

## Current status

This experiment has not been run yet. Status: ${framework.status}.

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
- Experiment folder: [GitHub folder](https://github.com/NijatZeynalov/100-AI-frameworks/tree/main/experiments/${framework.slug})

## Notes

TBD
`;
}

function buildTestedExperimentPage(framework) {
  const scorecard = framework.scorecard || {};
  const projectName = framework.project_name || framework.sample_project || framework.name;
  const keyFindings =
    Array.isArray(framework.experiment_findings) && framework.experiment_findings.length > 0
      ? framework.experiment_findings.slice(0, 4)
      : [];
  return `# ${framework.experiment_number} - ${framework.name}

## Status

${framework.status}

## Project

${projectName}

## Category

${framework.primary_category}

## Tags

\`#100AIFrameworks\`, \`#${framework.primary_category_slug}\`

## Problem

${framework.framework_problem || framework.problem_solved || "TBD"}

## How ${framework.name} helps

${framework.framework_solution || framework.what_it_does || "TBD"}

## Test project

${framework.project_summary || framework.sample_project || "TBD"}

## Experiment findings

${markdownList(keyFindings)}

## What worked

${markdownList(framework.what_worked)}

## Limitations

${markdownList(framework.limitations)}

## Before / After

${framework.before_after_angle || "TBD"}

## Scorecard

| Criteria | Score |
|---|---|
| Setup Experience | ${scorecardValue(scorecard, "setup_experience")} |
| Documentation Quality | ${scorecardValue(scorecard, "documentation_quality")} |
| Developer Experience | ${scorecardValue(scorecard, "developer_experience")} |
| Output Quality | ${scorecardValue(scorecard, "output_quality")} |
| Production Readiness | ${scorecardValue(scorecard, "production_readiness")} |
| Hiring Signal | ${scorecardValue(scorecard, "hiring_signal")} |

## Final verdict

${framework.final_verdict || "TBD"}

## Links

- Official docs: ${framework.docs_url ? `[${framework.docs_url}](${framework.docs_url})` : "TBD"}
- GitHub: ${framework.github_url ? `[${framework.github_url}](${framework.github_url})` : "TBD"}
- Experiment folder: [GitHub folder](https://github.com/NijatZeynalov/100-AI-frameworks/tree/main/experiments/${framework.slug})

## Tested at

${framework.tested_at || "TBD"}
`;
}

function buildExperimentResults(framework) {
  const result = {
    framework: framework.name,
    slug: framework.slug,
    status: framework.status,
    category: framework.primary_category,
    tested_at: framework.tested_at || null,
    published_at: framework.published_at || null,
    linkedin_url: framework.linkedin_url || null,
    newsletter_url: framework.newsletter_url || null,
    experiment_url: framework.experiment_url || null,
    scorecard: {
      setup_experience: framework.scorecard?.setup_experience ?? null,
      documentation_quality: framework.scorecard?.documentation_quality ?? null,
      developer_experience: framework.scorecard?.developer_experience ?? null,
      output_quality: framework.scorecard?.output_quality ?? null,
      debuggability: framework.scorecard?.debuggability ?? null,
      production_readiness: framework.scorecard?.production_readiness ?? null,
      before_after_value: framework.scorecard?.before_after_value ?? null,
      hiring_signal: framework.scorecard?.hiring_signal ?? null,
    },
    results: {
      summary: framework.project_summary || null,
      what_worked: framework.what_worked || [],
      what_failed: framework.limitations || [],
      production_notes: framework.production_notes || [],
      final_verdict: framework.final_verdict || null,
    },
  };
  if (framework.project_name) {
    result.project_name = framework.project_name;
  }
  if (framework.experiment_findings) {
    result.results.findings = framework.experiment_findings;
  }
  return result;
}

for (const framework of frameworks) {
  const docsPage =
    framework.status === "Tested" ? buildTestedExperimentPage(framework) : buildPendingExperimentPage(framework);
  writeFile(path.join(repoRoot, "docs", "experiments", `${framework.slug}.md`), docsPage);

  if (!framework.custom_experiment) {
    writeFile(
      path.join(repoRoot, "experiments", framework.slug, "README.md"),
      `# ${framework.experiment_number} - ${framework.name}\n\nStatus: ${framework.status}\n\nDocs page: ../../docs/experiments/${framework.slug}.md\n`,
    );
    writeFile(path.join(repoRoot, "experiments", framework.slug, "code", ".gitkeep"), "");
    writeFile(path.join(repoRoot, "experiments", framework.slug, "data", ".gitkeep"), "");
    writeFile(path.join(repoRoot, "experiments", framework.slug, "screenshots", ".gitkeep"), "");
  }

  const results = buildExperimentResults(framework);
  if (!framework.custom_experiment) {
    writeFile(
      path.join(repoRoot, "experiments", framework.slug, "results.json"),
      `${JSON.stringify(results, null, 2)}\n`,
    );
  }
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

const navExperiments = frameworks
  .map((framework) => `      - ${framework.experiment_number} ${framework.name}: experiments/${framework.slug}.md`)
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
      - Prompt Optimization & Eval: categories/prompt-optimization-eval.md
      - Computer Vision: categories/computer-vision.md
      - LoRA & Fine-tuning: categories/lora-finetuning.md
      - Model Optimization & Compression: categories/model-optimization-compression.md
      - MLOps & Model Serving: categories/mlops-model-serving.md
      - RecSys: categories/recsys.md
      - Knowledge Base: categories/knowledge-base.md
      - LLM Inference: categories/llm-inference.md
  - Experiments:
      - Index: experiments/index.md
${navExperiments}
`;
writeFile(path.join(repoRoot, "mkdocs.yml"), mkdocs);

console.log(`Generated docs for ${frameworks.length} frameworks from data/frameworks.json.`);
