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

LLM agents usually do not have reliable long-term memory. They forget user or domain context between sessions, and when developers add memory manually it quickly becomes hard to search, update, scope, and trust.

## How LangMem helps

LangMem provides memory primitives for agents: scoped namespaces, memory search, memory creation tools, and LangGraph store integration. It gives the application a structured way to save and retrieve long-term context instead of treating every interaction as a fresh prompt.

## Test project

To test LangMem, I built a small doctor-facing patient memory assistant. The medical use case is only the test scenario: create a patient, write a visit note, extract memory candidates, approve them, and use approved memory in later visits.

## Experiment findings

- LangMem is most useful when memory is scoped clearly, such as per user, patient, project, or workspace.
- The framework gives good primitives, but the application still needs to decide what should become memory and who can approve it.
- Search and manage tools are simple enough to integrate, especially if the app already uses LangGraph-style storage.
- For sensitive domains, memory metadata such as source, confidence, status, and superseding rules matters as much as the memory text itself.

## What worked

- Patient-scoped namespaces kept memories isolated and easy to reason about.
- The manage/search tools worked well as a memory layer behind a normal application workflow.
- Human review before activating extracted memories made the demo safer and more realistic.
- Approved memories could be reused for summaries, Q&A, and follow-up notes.

## Limitations

- The demo uses LangGraph InMemoryStore, so memory disappears after restart.
- LangMem does not replace product-level memory policy; the app still needs review, correction, and deletion rules.
- Memory extraction quality depends on the LLM and schema validation around it.
- Production use would need persistence, audit logs, access control, and privacy controls.

## Before / After

Before: the app has to pass all relevant history through the prompt every time. After: LangMem lets the app retrieve scoped long-term memories when they are needed.

## Scorecard

| Criteria | Score |
|---|---|
| Setup Experience | 7/10 |
| Documentation Quality | 8/10 |
| Developer Experience | 8/10 |
| Output Quality | 8/10 |
| Production Readiness | 6/10 |
| Hiring Signal | 9/10 |

## Final verdict

LangMem is a practical memory layer for agent applications. I would use it when an app needs scoped long-term context, but I would keep memory policy in the application: what gets saved, who approves it, how it is corrected, and when it is deleted.

## Links

- Official docs: [https://langchain-ai.github.io/langmem/](https://langchain-ai.github.io/langmem/)
- GitHub: [https://github.com/langchain-ai/langmem](https://github.com/langchain-ai/langmem)
- Experiment folder: [GitHub folder](https://github.com/NijatZeynalov/100-AI-frameworks/tree/main/experiments/001-langmem)

## Tested at

2026-06-02
