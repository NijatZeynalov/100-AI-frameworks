# Clinical Memory Assistant

- Framework: LangMem
- Status: Tested
- Experiment: 001
- Tested at: 2026-06-02

A lightweight doctor-facing demo that uses local MedGemma as the clinical LLM and LangMem as the patient memory layer.

The app supports three core workflows:

- Create a new patient, write a doctor note, generate a SOAP draft, extract memory candidates, and approve them.
- Reopen an existing patient, retrieve remembered history, ask questions, and add a new visit note.
- Update existing history, such as medication changes, and approve memory candidates that supersede older memories.

## LangMem Features Used

- LangGraph `InMemoryStore` as the runtime memory store used by LangMem tools.
- `create_manage_memory_tool` for writing doctor-approved memories.
- `create_search_memory_tool` for retrieving patient history from memory.
- Dynamic namespaces per patient: `("clinic_memory", clinic_id, patient_id)`.
- Long-term memory behavior inside the running session: approved memories are reused when the patient returns.
- Semantic clinical memories: symptoms, medications, allergies, follow-up tasks, and visit facts.
- Patient profile memory: basic patient context is stored as a patient-scoped memory.
- Memory search: doctor questions retrieve relevant memories before MedGemma answers.
- Human-in-the-loop memory review: MedGemma creates candidates, doctor approves or rejects them.
- Verification status: candidates start as `ai-extracted-pending-review`; approved memories become `doctor-confirmed`.
- Confidence labels: extracted candidates and approved memories carry confidence values.
- Memory update/superseding: approved update candidates can mark older active memories as superseded.
- Source tracking: approved memories keep source metadata such as visit/candidate origin.
- Structured memory schema: memory records and candidates are represented with typed Pydantic models.
- Short-term visit summary: the current visit note is summarized separately before long-term approval.
- Background-style extraction flow: memory candidates are extracted after SOAP generation and visit completion, not while typing.

Memory is runtime-only in this demo. Restarting the server clears patients, visits, candidates, and memories.

## Experiment Findings

- LangMem works well as a patient-scoped long-term memory layer when each patient gets a dedicated namespace.
- The safest useful pattern was candidate extraction plus doctor approval, not automatic memory activation.
- Domain metadata matters. Verification status, confidence, source type, visit id, and active/superseded state made the memory layer easier to inspect and reason about.
- LangMem search supported multiple workflows from the same approved memory store: pre-visit history summaries, doctor Q&A, SOAP drafting context, and updated follow-up visits.
- Memory updates need application policy. Superseding older clinical facts or medication memories should be handled explicitly instead of relying only on semantic similarity.
- `InMemoryStore` is good for proving the workflow, but production use would need persistence, audit logs, authentication, encryption, and PHI-safe storage.

## Engineering Verdict

LangMem is a strong fit for domain-scoped agent memory when the application owns the safety workflow around it. For clinical-style use cases, the important pattern is patient-scoped memory plus human review. I would not let extracted memories become active automatically, but I would use LangMem as the memory substrate behind a governed review and persistence layer.

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
