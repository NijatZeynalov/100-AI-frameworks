# Clinical Memory Assistant

- Framework: LangMem
- Status: Tested
- Experiment: 001
- Tested at: 2026-06-02

A lightweight doctor-facing demo that uses local MedGemma as the clinical LLM and LangMem as the patient memory layer.

This is the test project for LangMem. The goal is not to build a full medical product, but to see how LangMem behaves when an application needs scoped, reviewable long-term memory.

The app supports:

- Patient creation and patient-scoped memory namespaces.
- SOAP draft generation from the current note plus retrieved memories.
- Memory candidate extraction after a visit.
- Doctor approval or rejection before a memory becomes active.
- Returning-patient summaries and Q&A from approved memory.
- Basic memory update/superseding behavior.

## LangMem Features Used

- LangGraph `InMemoryStore` as the runtime memory store used by LangMem tools.
- `create_manage_memory_tool` for writing doctor-approved memories.
- `create_search_memory_tool` for retrieving patient history from memory.
- Dynamic namespaces per patient: `("clinic_memory", clinic_id, patient_id)`.
- Pydantic models around LangMem records for status, confidence, source, and superseding metadata.

## Experiment Findings

- LangMem is useful when memory has a clear scope, such as one user, patient, project, or workspace.
- The core tools are easy to place behind a normal application workflow.
- The application still needs memory policy: approval, correction, deletion, source tracking, and privacy rules.
- `InMemoryStore` is fine for a demo, but real use needs persistent storage.

## Engineering Verdict

LangMem is a practical memory layer for agent applications. I would use it when an app needs scoped long-term context, but I would keep the memory policy in the application: what gets saved, who approves it, how it is corrected, and when it is deleted.

## Run

```powershell
python -m pip install -r requirements.txt
$env:HF_TOKEN="hf_..."
python -m uvicorn src.api:app --host 127.0.0.1 --port 8011
```

Open:

```text
http://127.0.0.1:8011
```
