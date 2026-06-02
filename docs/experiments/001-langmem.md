# 001 - LangMem

## Status

Tested

## Project

Clinical Memory Assistant

## Category

Agentic AI & Agent Memory

## Tags

`#100AIFrameworks`, `#agentic-ai`

## Problem

Doctors need patient-specific memory across visits without letting unreviewed AI-extracted facts silently become clinical history.

## What it does

Uses LangMem as a patient-scoped memory layer for a MedGemma-powered clinical assistant, with explicit namespaces, search, memory creation, review status, confidence labels, and superseding behavior.

## Built project

Built a FastAPI demo where a doctor creates a patient, writes a visit note, gets a MedGemma SOAP draft, reviews LangMem memory candidates, approves or rejects them, and later retrieves patient-specific memory for follow-up questions and updated visits.

## Stack

- FastAPI backend with a static doctor-facing UI
- LangMem manage/search tools on top of LangGraph InMemoryStore
- Dynamic patient namespaces: clinic, clinic_id, patient_id
- Pydantic models for patients, visits, memory records, and memory candidates
- Local MedGemma through Hugging Face Transformers for SOAP generation and extraction

## Experiment findings

- LangMem fits well as an explicit long-term memory layer when memory is scoped by patient namespace instead of being treated as global chat history.
- The most useful pattern was not automatic memory writing, but candidate extraction followed by doctor approval before a memory becomes active.
- Wrapping LangMem records with domain metadata made the memory layer easier to reason about: verification status, confidence, source type, visit id, and active/superseded state were all important.
- Memory search worked naturally for returning-patient questions and pre-visit summaries once patient profile and approved visit memories were stored.
- Memory updates require application-level policy. Superseding an old medication or clinical fact needs explicit metadata and matching logic, not only semantic recall.
- The demo proves the workflow, but the default InMemoryStore is runtime-only and should be replaced before any serious deployment.

## What worked

- Patient-scoped LangMem namespaces kept memories isolated between patients.
- Human-in-the-loop review made the clinical memory workflow safer and more understandable.
- Typed Pydantic schemas gave structure to otherwise free-form memory extraction.
- The same memory layer supported SOAP drafting, patient history summaries, doctor Q&A, and memory update flows.
- Separating short-term visit summary from long-term approved memory kept the workflow clearer.

## Limitations

- All patients, visits, candidates, and memories are runtime-only; restarting the server clears the demo state.
- MedGemma access requires a Hugging Face token and accepted gated model terms.
- The extraction flow still depends on LLM JSON reliability, so schema repair and physician review remain necessary.
- The demo has no authentication, authorization, audit trail, encryption, or PHI-safe persistence.
- The test flow depends on the local model path and is not yet split into fast mocked tests and slower model-backed tests.

## Production notes

- Replace InMemoryStore with a persistent, auditable store before production use.
- Add authentication, role-based access, encryption, audit logs, and explicit PHI handling policies.
- Keep the doctor approval step for extracted memories; do not auto-activate AI-extracted clinical facts.
- Add deterministic mock tests for memory workflow logic and separate integration tests for model-backed extraction.
- Track memory provenance and superseding/correction history as first-class clinical safety metadata.

## Before / After

Before: each visit depends on the current note and scattered prior context. After: doctor-approved LangMem memories bring back patient history, medications, allergies, follow-up tasks, and changed facts during later visits.

## Scorecard

| Criteria | Score |
|---|---|
| Setup Experience | 7/10 |
| Documentation Quality | 8/10 |
| Developer Experience | 8/10 |
| Output Quality | 8/10 |
| Debuggability | 7/10 |
| Production Readiness | 6/10 |
| Hiring Signal | 9/10 |

## Final verdict

LangMem is a strong fit for domain-scoped agent memory when the application owns the safety workflow around it. For clinical-style use cases, the valuable pattern is patient-scoped memory plus human approval, not automatic memory persistence. The framework is promising for serious engineering work, but production readiness depends on persistence, auditability, access control, and evaluation around the memory extraction layer.

## Links

- Official docs: [https://langchain-ai.github.io/langmem/](https://langchain-ai.github.io/langmem/)
- GitHub: [https://github.com/langchain-ai/langmem](https://github.com/langchain-ai/langmem)
- Experiment folder: [GitHub folder](https://github.com/NijatZeynalov/100-AI-frameworks/tree/main/experiments/001-langmem)

## Tested at

2026-06-02
