from pydantic import ValidationError

from .llm import generate_json, generate_text
from .memory import ClinicMemory, patient_namespace
from .models import MemoryCandidate, MemoryRecord, Visit, now_iso
from .state import CANDIDATES, create_visit, get_patient


def ensure_patient_profile_memory(memory: ClinicMemory, patient_id: str, doctor_id: str) -> None:
    patient = get_patient(patient_id)
    exists = any(
        record.memory_type == "patient_profile" and record.active_status == "active"
        for record in memory.all_for_patient(patient_id)
    )
    if exists:
        return
    memory.remember(
        patient_id=patient_id,
        doctor_id=doctor_id,
        text=(
            f"Patient profile: {patient.full_name}, age {patient.age}, gender {patient.gender}. "
            f"History: {', '.join(patient.basic_history) or 'not recorded'}. "
            f"Allergies: {', '.join(patient.allergies) or 'not recorded'}. "
            f"Medications: {', '.join(patient.medications) or 'not recorded'}. "
            f"Active conditions: {', '.join(patient.active_conditions) or 'not recorded'}."
        ),
        memory_type="patient_profile",
        source_type="patient-profile",
    )


def summarize_patient(memory: ClinicMemory, patient_id: str, doctor_id: str) -> str:
    ensure_patient_profile_memory(memory, patient_id, doctor_id)
    patient = get_patient(patient_id)
    memories = memory.search(
        patient_namespace(patient_id),
        "patient history last visit active problems medications allergies",
        limit=12,
    )
    memory_block = format_memory_block(memories)
    prompt = f"""
You are assisting a doctor before seeing a returning patient.
Use only the patient record and retrieved LangMem memories below.
Do not invent diagnosis, lab results, medications, or history.

Patient record:
{patient.model_dump_json(indent=2)}

Retrieved LangMem memories:
{memory_block or "No LangMem memories retrieved."}

Write a concise clinical history summary for physician review.
"""
    return generate_text(prompt, max_new_tokens=320)


def answer_question(memory: ClinicMemory, patient_id: str, doctor_id: str, question: str) -> str:
    ensure_patient_profile_memory(memory, patient_id, doctor_id)
    patient = get_patient(patient_id)
    memories = memory.search(patient_namespace(patient_id), question, limit=12)
    memory_block = format_memory_block(memories)
    prompt = f"""
Answer the doctor's question using only the patient record and retrieved LangMem memories.
If the answer is not present, say that it is not available in memory.

Patient record:
{patient.model_dump_json(indent=2)}

Question:
{question}

Retrieved LangMem memories:
{memory_block or "No relevant memories retrieved."}
"""
    return generate_text(prompt, max_new_tokens=320)


def run_visit(memory: ClinicMemory, patient_id: str, doctor_id: str, note: str) -> tuple[Visit, list[MemoryCandidate]]:
    visit = create_visit(patient_id, doctor_id, note)
    visit = generate_soap_draft(memory, visit)
    candidates = complete_visit_and_extract(memory, visit)
    return visit, candidates


def generate_soap_draft(memory: ClinicMemory, visit: Visit) -> Visit:
    patient = get_patient(visit.patient_id)
    memories = memory.search(patient_namespace(visit.patient_id), visit.raw_doctor_note, limit=12)
    memory_block = format_memory_block(memories)
    prompt = f"""
Generate a SOAP note draft for physician review.
Rules:
- Start with "DRAFT FOR PHYSICIAN REVIEW".
- Use only the doctor note, patient record, and retrieved LangMem memories.
- If objective data is absent, write "No objective data entered".
- Do not make final diagnoses or independent prescriptions.

Patient record:
{patient.model_dump_json(indent=2)}

Retrieved LangMem memories:
{memory_block or "No relevant memories retrieved."}

Doctor note:
{visit.raw_doctor_note}
"""
    visit.ai_draft_summary = generate_text(prompt, max_new_tokens=480)
    visit.running_summary = generate_text(
        f"Summarize this current visit note in 3 concise bullets for temporary context only:\n{visit.raw_doctor_note}",
        max_new_tokens=180,
    )
    visit.updated_at = now_iso()
    return visit


def complete_visit_and_extract(memory: ClinicMemory, visit: Visit) -> list[MemoryCandidate]:
    visit.status = "completed"
    visit.final_doctor_summary = visit.ai_draft_summary
    visit.updated_at = now_iso()
    candidates = extract_memory_candidates(memory, visit)
    CANDIDATES.extend(candidates)
    return candidates


def extract_memory_candidates(memory: ClinicMemory, visit: Visit) -> list[MemoryCandidate]:
    existing = memory.search(patient_namespace(visit.patient_id), visit.raw_doctor_note, limit=12)
    existing_block = "\n".join(
        f"- id={m.memory_id}; type={m.memory_type}; summary={m.summary}; active={m.active_status}"
        for m in existing
    )
    prompt = f"""
Extract memory candidates from this completed doctor visit.
Return a JSON array only.

Each item must exactly follow this object shape:
{{
  "memory_type": "clinical_fact" | "visit_summary" | "medication" | "allergy" | "follow_up_task" | "communication_preference",
  "summary": "short physician-facing memory",
  "confidence": "low" | "medium" | "high" | "confirmed",
  "verification_status": "ai-extracted-pending-review",
  "structured_data": {{}},
  "supersedes_query": "optional search phrase for older memory this replaces, or null"
}}

Rules:
- Extract only facts present in the note or SOAP draft.
- Do not invent results, diagnoses, or medication instructions.
- If the note says an old issue improved, stopped, resolved, replaced, or changed, include supersedes_query.
- If there is no useful long-term memory, return [].

Existing active LangMem memories:
{existing_block or "No existing memories."}

Doctor note:
{visit.raw_doctor_note}

SOAP draft:
{visit.ai_draft_summary}
"""
    return parse_candidates(generate_json(prompt, max_new_tokens=700), visit)


def parse_candidates(raw: object, visit: Visit) -> list[MemoryCandidate]:
    if not isinstance(raw, list):
        raise ValueError("MedGemma memory extraction must return a JSON array.")

    candidates: list[MemoryCandidate] = []
    errors: list[str] = []
    for item in raw:
        try:
            candidates.append(
                MemoryCandidate(
                    patient_id=visit.patient_id,
                    doctor_id=visit.doctor_id,
                    visit_id=visit.visit_id,
                    **item,
                )
            )
        except (TypeError, ValidationError) as exc:
            errors.append(str(exc))

    if not errors:
        return candidates

    repaired = generate_json(
        "Repair these invalid memory extraction items into the required JSON array schema. "
        "Keep only information present in the invalid items.\n\n"
        f"Invalid items:\n{raw}\n\nValidation errors:\n{errors}",
        max_new_tokens=700,
    )
    if not isinstance(repaired, list):
        raise ValueError("MedGemma repair did not return a JSON array.")
    return [
        MemoryCandidate(
            patient_id=visit.patient_id,
            doctor_id=visit.doctor_id,
            visit_id=visit.visit_id,
            **item,
        )
        for item in repaired
    ]


def approve_candidate(memory: ClinicMemory, candidate_id: str) -> MemoryRecord:
    candidate = find_candidate(candidate_id)
    candidate.status = "approved"
    candidate.verification_status = "doctor-confirmed"
    candidate.confidence = "confirmed"
    candidate.updated_at = now_iso()

    record = memory.remember(
        patient_id=candidate.patient_id,
        doctor_id=candidate.doctor_id,
        text=candidate.summary,
        memory_type=candidate.memory_type,
        source_type="doctor-approved-memory-candidate",
    )
    record.visit_id = candidate.visit_id
    record.structured_data = candidate.structured_data
    record.source_id = candidate.candidate_id
    memory.add_record(record)

    if candidate.supersedes_query:
        matches = [
            item
            for item in memory.search(patient_namespace(candidate.patient_id), candidate.supersedes_query, limit=5)
            if item.memory_id != record.memory_id and item.active_status == "active"
        ]
        if matches:
            memory.supersede(matches[0].memory_id, record)

    return record


def reject_candidate(candidate_id: str) -> MemoryCandidate:
    candidate = find_candidate(candidate_id)
    candidate.status = "rejected"
    candidate.verification_status = "rejected"
    candidate.updated_at = now_iso()
    return candidate


def find_candidate(candidate_id: str) -> MemoryCandidate:
    for candidate in CANDIDATES:
        if candidate.candidate_id == candidate_id:
            return candidate
    raise KeyError(f"Unknown candidate_id: {candidate_id}")


def format_memory_block(memories: list[MemoryRecord]) -> str:
    return "\n".join(
        f"- {m.summary} | type={m.memory_type} | status={m.verification_status} | confidence={m.confidence}"
        for m in memories
        if m.active_status == "active"
    )
