# #100AI Frameworks Lab

I am testing 100 open-source AI frameworks through practical mini-builds. For each framework, I document the problem it solves, setup experience, production-readiness notes, and a final engineering verdict.

## What This Repo Is

This repository is a public AI engineering lab. The first version starts with selected frameworks in Pending status. No experiment results are fabricated.

## Current Progress

- Target: 100 frameworks
- Currently selected: 36
- Pending: 36
- Tested: 0
- Published: 0
- Categories covered: 7

## Categories

- Agentic AI & Agent Memory
- Structured Output, Guardrails & Evaluation
- VLM, OCR & Document Understanding
- LoRA, Fine-tuning & Adapter Infrastructure
- Personalization & Recommendation Systems
- Knowledge Base, RAG & Document Intelligence
- LLM Inference & Serving

## Repository Structure

```
docs/                 # Public documentation pages
data/frameworks.json  # Normalized framework list parsed from experiments.txt
experiments/          # Per-framework experiment workspaces
templates/            # Reusable templates
assets/               # Shared images/diagrams
scripts/              # Generation helpers
```

## Status Legend

- Pending: Selected but not tested yet
- Scanned: Docs/GitHub reviewed
- Installed: Installed locally or in cloud
- Built: Mini project implemented
- Tested: Results measured
- Published: Shared on LinkedIn/newsletter
- Skipped: Removed after review

## How Experiments Are Documented

Each framework has:

1. A docs page in `docs/experiments/`
2. An experiment folder in `experiments/{slug}/`
3. A placeholder `results.json` with null values

## Run Docs Locally

```bash
pip install mkdocs
mkdocs serve
```

Then open `http://127.0.0.1:8000`.

## Follow Along

This lab is updated weekly with new experiment notes and scorecards.

LinkedIn updates: TBD
