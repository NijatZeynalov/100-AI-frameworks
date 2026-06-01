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

const ENGLISH_FIELD_OVERRIDES = {
  langmem: {
    problem_solved:
      "AI agents often fail to learn from prior conversations and ask the same questions again in each new session.",
    what_it_does:
      "Provides long-term memory, memory extraction, prompt optimization, and LangGraph storage integration for agents.",
    before_after_angle:
      "Before: the chatbot starts from scratch every time. After: the agent uses previous conversations to provide more personalized answers.",
  },
  mem0: {
    problem_solved: "LLM apps often lack persistent user context and personalization.",
    what_it_does:
      "Works as a universal memory layer that stores and retrieves user, agent, and session memory.",
    before_after_angle:
      "Before: the support bot treats every ticket separately. After: the bot responds with better context from customer history.",
  },
  zep: {
    problem_solved:
      "Enterprise agents struggle to manage dynamic business context and conversation history at scale.",
    what_it_does:
      "Provides governed, low-latency context retrieval through a temporal knowledge graph-based memory layer.",
    before_after_angle:
      "Before: CRM notes remain plain text. After: the agent uses a temporal relationship graph.",
  },
  graphiti: {
    problem_solved:
      "RAG systems often require batch knowledge graph rebuilds whenever information changes.",
    what_it_does:
      "Builds real-time temporal context graphs and incrementally stores new facts and relationship changes.",
    before_after_angle:
      "Before: recent meeting notes are lost inside static RAG. After: the agent can inspect decision timelines and relationship changes.",
  },
  letta: {
    problem_solved:
      "Agents struggle to manage long-term behavior, core memory, and archival memory.",
    what_it_does:
      "Provides a platform for building stateful agents with memory blocks, archival memory, and self-improving behavior.",
    before_after_angle:
      "Before: the coding assistant gives generic advice. After: it mentors based on the user's history.",
  },
  supermemory: {
    problem_solved:
      "Building memory, user profiles, and RAG pipelines separately adds operational overhead to AI apps.",
    what_it_does:
      "Provides ingestion, semantic search, user profiling, and context management through a memory API.",
    before_after_angle:
      "Before: bookmark search remains keyword-based. After: the assistant responds with user memory and semantic context.",
  },
  cognee: {
    problem_solved:
      "Agents often miss relationships between documents, decisions, and workflows.",
    what_it_does:
      "Turns structured and unstructured data into queryable context using embeddings and graph memory.",
    before_after_angle:
      "Before: RAG only finds similar chunks. After: the agent reasons through a relationship graph.",
  },
  agno: {
    problem_solved:
      "Prototype agents are difficult to run, trace, schedule, and manage as production services.",
    what_it_does:
      "Provides an agent platform with RBAC, tracing, scheduling, memory, human review loops, and a control plane.",
    before_after_angle:
      "Before: the notebook demo runs manually. After: it runs as a scheduled, traceable agent service.",
  },
  "browser-use": {
    problem_solved:
      "AI agents struggle to click, fill forms, navigate, and extract information from real websites.",
    what_it_does:
      "Makes websites accessible to AI agents and controls browser automation through natural language and tools.",
    before_after_angle:
      "Before: job search happens manually across browser tabs. After: a browser agent automates repetitive browsing.",
  },
  stagehand: {
    problem_solved:
      "Selenium and Playwright selectors are brittle when high-level AI browser actions are needed.",
    what_it_does:
      "Provides natural language plus code-based browser automation through act, extract, observe, and agent primitives.",
    before_after_angle:
      "Before: the scraper breaks when CSS selectors change. After: AI-assisted extraction is more flexible.",
  },
  baml: {
    problem_solved:
      "Managing prompts as strings creates versioning and structured output reliability problems.",
    what_it_does:
      "Turns prompt engineering into schema engineering through a DSL for reliable LLM functions.",
    before_after_angle:
      "Before: prompts are scattered inside application code. After: BAML functions make prompts and schemas maintainable.",
  },
  "guardrails-ai": {
    problem_solved:
      "LLM apps need protection against input/output risks, PII leakage, unsafe content, and malformed structured data.",
    what_it_does:
      "Provides input/output guards, validators, risk detection, and structured data validation.",
    before_after_angle:
      "Before: the bot can return sensitive data without checks. After: guards block and validate risky input/output.",
  },
  "modelscope-ms-swift": {
    problem_solved:
      "Teams need one CLI and Web UI to manage many model families and tuning methods.",
    what_it_does:
      "Supports LoRA, QLoRA, DoRA, LoRA+, LongLoRA, LoRA-GA, ReFT, RS-LoRA, and multimodal fine-tuning workflows.",
    sample_project:
      "Compare LoRA, DoRA, and LongLoRA on the same dataset.",
    before_after_angle:
      "Before: only one LoRA adapter is tested. After: multiple adapter methods are compared across accuracy, latency, and memory.",
  },
  axolotl: {
    problem_solved:
      "Complex LoRA/QLoRA, DPO, multimodal, and MoE fine-tuning configurations are hard to manage in a production-like way.",
    what_it_does:
      "Provides a configuration-first training stack for advanced LLM fine-tuning workflows.",
    sample_project:
      "Run a LoRA fine-tuning experiment focused only on expert weights in a MoE model.",
    before_after_angle:
      "Before: MoE fine-tuning is expensive in VRAM. After: expert-focused LoRA can provide cheaper adaptation.",
  },
  "adapterhub-adapters": {
    problem_solved:
      "Teams need a modular way to train and reuse adapters across domains and tasks.",
    what_it_does:
      "Provides adapter composition, adapter merging, QLoRA support, and modular transfer learning workflows.",
    sample_project:
      "Build a concept with finance, support, and Azerbaijani tone adapters for one base model.",
    before_after_angle:
      "Before: each task needs a separate model. After: modular adapters provide task-specific behavior.",
  },
  "m-lora": {
    problem_solved:
      "Training many domain adapters can create GPU utilization and latency problems.",
    what_it_does:
      "Focuses on fine-tuning many LoRA/QLoRA adapters at the same time on one base model.",
    sample_project:
      "Train three adapters for the same base model: legal, finance, and customer support.",
    before_after_angle:
      "Before: adapters are trained one by one. After: multi-LoRA scheduling can be compared by throughput.",
  },
  lorax: {
    problem_solved:
      "Deploying a separate endpoint for every fine-tuned model is expensive.",
    what_it_does:
      "Serves many LoRA adapters on a shared base model with dynamic adapter loading and routing.",
    sample_project:
      "Train three LoRA adapters and build a dynamic adapter routing demo with LoRAX.",
    before_after_angle:
      "Before: every adapter needs a separate endpoint. After: one shared base model can dynamically load adapters.",
  },
  simpletuner: {
    problem_solved:
      "Image and video generation models need production-like LoRA training and job orchestration.",
    what_it_does:
      "Provides a training toolkit for diffusion model fine-tuning, including FLUX, SDXL, SD3, and video generation models.",
    sample_project:
      "Train a brand-style LoRA that teaches a FLUX or SDXL model a consistent product visual identity.",
    before_after_angle:
      "Before: the image model does not preserve brand style. After: LoRA produces more consistent brand visuals.",
  },
  honcho: {
    problem_solved:
      "Agents may store memory but fail to update a useful user model through reasoning.",
    what_it_does:
      "Provides a reasoning memory layer for stateful agents across people, projects, sessions, and ideas.",
    before_after_angle:
      "Before: the assistant behaves like a reminder tool. After: it makes proactive suggestions based on a user model.",
  },
  memu: {
    problem_solved:
      "Proactive 24/7 agents often fail to structure user routines and long-term preferences.",
    what_it_does:
      "Extracts structured memory from multimodal inputs and creates a hierarchical memory file system.",
    before_after_angle:
      "Before: the assistant only responds when asked. After: it offers proactive help based on learned routines.",
  },
  metarank: {
    problem_solved: "Search and listing pages often show the same results to every user.",
    what_it_does:
      "Personalizes product listings, articles, search results, and recommendations through a low-code learning-to-rank service.",
    before_after_angle:
      "Before: search results are ordered by static relevance. After: ranking is personalized using user behavior.",
  },
  gorse: {
    problem_solved:
      "Recommendation backends for products or content are often written from scratch.",
    what_it_does:
      "Provides a Go-based open-source recommender engine using users, items, and feedback.",
    before_after_angle:
      "Before: trending repositories are the same for everyone. After: users get personalized repository lists based on interests.",
  },
  recbole: {
    problem_solved:
      "Recommendation algorithms need a unified experiment framework for fair comparison.",
    what_it_does:
      "Provides a PyTorch-based framework for 100+ recommendation models and multiple recommendation tasks.",
    before_after_angle:
      "Before: recommendations are random or trend-based. After: RecBole produces behavior-based top-N recommendations.",
  },
  cornac: {
    problem_solved:
      "It is difficult to include text, image, and social features in recommendation models.",
    what_it_does:
      "Provides a comparative framework for multimodal recommender systems.",
    before_after_angle:
      "Before: recommendations only use interaction data. After: image and text metadata improve cold-start recommendations.",
  },
  vespa: {
    problem_solved:
      "Search, vector retrieval, and ranking personalization are often built in separate systems.",
    what_it_does:
      "Provides a scalable engine for search, vector search, tensor ranking, and recommendation serving.",
    before_after_angle:
      "Before: search only uses query relevance. After: user embeddings and behavior influence the ranking score.",
  },
  promptfoo: {
    problem_solved: "Prompt and model comparisons are often not cost-aware.",
    what_it_does:
      "Provides an open-source LLM evaluation framework for prompts, models, RAG, and agents with caching plus cost/token reporting workflows.",
    sample_project:
      "Build an accuracy, latency, and cost table for 20 prompt variants.",
    before_after_angle:
      "Before: prompt selection is manual. After: promptfoo provides a token-aware evaluation matrix.",
  },
  garak: {
    problem_solved:
      "LLM applications are not systematically tested for prompt injection, jailbreaks, leakage, and hallucination weaknesses.",
    what_it_does:
      "Provides an NVIDIA-backed open-source LLM vulnerability scanner with probes for prompt injection, data leakage, jailbreaks, and related risks.",
    sample_project:
      "Run garak prompt injection probes against my own chatbot endpoint.",
    before_after_angle:
      "Before: security is checked with manual prompts. After: garak reports vulnerable categories.",
  },
  dify: {
    problem_solved:
      "LLM apps, RAG pipelines, workflows, agents, and observability are often built separately.",
    what_it_does:
      "Provides an open-source LLM app platform with knowledge bases, RAG, agent workflows, model management, and observability.",
  },
  ragflow: {
    problem_solved:
      "Complex PDFs, tables, scanned documents, and formatted reports do not work well with basic chunking.",
    what_it_does:
      "Provides a deep document understanding-based open-source RAG engine with citations, parsing, and enterprise RAG workflows.",
  },
  quivr: {
    problem_solved:
      "Personal and team knowledge bases need a fast, opinionated RAG core.",
    what_it_does:
      "Provides a second brain-style RAG platform/core with any-file ingestion, custom RAG, tools, and internet search support.",
  },
  "rtp-llm": {
    problem_solved:
      "Industrial-scale LLM serving needs a production-proven, high-performance engine.",
    what_it_does:
      "Provides an Alibaba open-source LLM inference acceleration engine with batching, GPU memory management, prefill/decode separation, and multi-hardware support.",
    before_after_angle:
      "Before: a generic server sees higher latency under heavy load. After: RTP-LLM demonstrates an industrial serving architecture.",
  },
  mooncake: {
    problem_solved:
      "KV cache movement and reuse are major bottlenecks in disaggregated LLM serving.",
    what_it_does:
      "Provides Moonshot AI/Kimi serving components focused on KV-cache-centric disaggregated serving through Transfer Engine and Mooncake Store.",
    sample_project:
      "Build a KV-cache reuse demo for repeated long-context workloads.",
    before_after_angle:
      "Before: long prompts are recomputed on every request. After: a Mooncake-style cache store shows reuse.",
  },
  "bitnet-cpp": {
    problem_solved:
      "1-bit and ternary LLMs need a dedicated efficient inference framework.",
    what_it_does:
      "Provides the official inference framework inside Microsoft's BitNet repository for 1-bit LLM inference, benchmarking, and deployment.",
    sample_project:
      "Run the BitNet b1.58 model on CPU and compare it with a normal quantized model.",
    before_after_angle:
      "Before: a normal low-bit model is still memory-heavy. After: a 1-bit model has a much smaller memory footprint.",
  },
  feast: {
    problem_solved:
      "Real-time recommendation models often do not receive fresh user, item, and context features.",
    before_after_angle:
      "Before: the model uses stale batch features. After: Feast online features enable real-time personalization.",
  },
};

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
  if (!fs.existsSync(source) || fs.existsSync(target)) return;
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
  const englishOverride = ENGLISH_FIELD_OVERRIDES[frameworkSlug] || {};
  const problem =
    cleanText(item.problem_solved) || cleanText(item.vlm_problem_solved) || "TBD";
  const officialUrl = cleanText(item.official_url) || cleanText(item.docs_url);
  const docsUrl = cleanText(item.docs_url) || cleanText(item.official_url);
  const normalizedItem = {
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
    linkedin_hook: null,
    selected_from_source: "experiments.txt",
    tested_at: null,
    published_at: null,
    linkedin_url: null,
    newsletter_url: null,
    experiment_url: null,
    score: null,
  };
  return { ...normalizedItem, ...englishOverride };
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
