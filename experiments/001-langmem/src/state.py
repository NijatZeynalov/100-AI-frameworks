from uuid import uuid4

from .models import MemoryCandidate, Patient, Visit, now_iso


PATIENTS: list[Patient] = []
VISITS: list[Visit] = []
CANDIDATES: list[MemoryCandidate] = []


def reset_runtime_state() -> None:
    PATIENTS.clear()
    VISITS.clear()
    CANDIDATES.clear()


def create_patient(
    full_name: str,
    age: int,
    gender: str,
    basic_history: list[str] | None = None,
    allergies: list[str] | None = None,
    medications: list[str] | None = None,
    active_conditions: list[str] | None = None,
) -> Patient:
    patient = Patient(
        patient_id=f"patient_{uuid4().hex[:8]}",
        full_name=full_name,
        age=age,
        gender=gender,
        basic_history=basic_history or [],
        allergies=allergies or [],
        medications=medications or [],
        active_conditions=active_conditions or [],
    )
    PATIENTS.append(patient)
    return patient


def get_patient(patient_id: str) -> Patient:
    for patient in PATIENTS:
        if patient.patient_id == patient_id:
            return patient
    raise KeyError(f"Unknown patient_id: {patient_id}")


def patient_preview(patient: Patient) -> str:
    facts = patient.active_conditions + patient.allergies + patient.medications
    return ", ".join(facts[:4]) or "No saved profile facts"


def touch_patient(patient_id: str) -> None:
    for patient in PATIENTS:
        if patient.patient_id == patient_id:
            patient.updated_at = now_iso()


def create_visit(patient_id: str, doctor_id: str, note: str) -> Visit:
    visit = Visit(patient_id=patient_id, doctor_id=doctor_id, raw_doctor_note=note)
    VISITS.append(visit)
    return visit


def pending_candidates(patient_id: str) -> list[MemoryCandidate]:
    return [
        candidate
        for candidate in CANDIDATES
        if candidate.patient_id == patient_id and candidate.status == "pending"
    ]
