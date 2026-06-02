from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .config import DEFAULT_DOCTOR_ID, ROOT_DIR
from .memory import ClinicMemory
from .services import answer_question, approve_candidate, reject_candidate, run_visit, summarize_patient
from .state import PATIENTS, create_patient, get_patient, patient_preview, pending_candidates


app = FastAPI(title="MedGemma LangMem Patient Memory")
app.mount("/static", StaticFiles(directory=ROOT_DIR / "static"), name="static")
APP_MEMORY = ClinicMemory()


class PatientCreateRequest(BaseModel):
    full_name: str
    age: int
    gender: str = "not specified"
    basic_history: str = ""
    allergies: str = ""
    medications: str = ""
    active_conditions: str = ""


class PatientScopedRequest(BaseModel):
    patient_id: str
    doctor_id: str = DEFAULT_DOCTOR_ID


class AskRequest(PatientScopedRequest):
    question: str


class VisitRequest(PatientScopedRequest):
    note: str


class ReviewRequest(BaseModel):
    candidate_id: str
    action: str


@app.get("/")
def index():
    return FileResponse(ROOT_DIR / "static" / "index.html")


@app.get("/api/state")
def state(patient_id: str | None = None, doctor_id: str = DEFAULT_DOCTOR_ID):
    selected = get_selected_patient(patient_id)
    payload = {
        "doctor_id": doctor_id,
        "patients": [{**p.model_dump(), "preview": patient_preview(p)} for p in PATIENTS],
        "patient": selected.model_dump() if selected else None,
        "memories": [],
        "pending": [],
    }
    if selected:
        payload["memories"] = [item.model_dump(mode="json") for item in APP_MEMORY.all_for_patient(selected.patient_id)]
        payload["pending"] = [item.model_dump(mode="json") for item in pending_candidates(selected.patient_id)]
    return payload


@app.post("/api/patients")
def api_create_patient(req: PatientCreateRequest):
    patient = create_patient(
        full_name=req.full_name,
        age=req.age,
        gender=req.gender,
        basic_history=split_values(req.basic_history),
        allergies=split_values(req.allergies),
        medications=split_values(req.medications),
        active_conditions=split_values(req.active_conditions),
    )
    return {"patient": patient.model_dump()}


@app.post("/api/summary")
def api_summary(req: PatientScopedRequest):
    return {"summary": summarize_patient(APP_MEMORY, req.patient_id, req.doctor_id)}


@app.post("/api/ask")
def api_ask(req: AskRequest):
    return {"answer": answer_question(APP_MEMORY, req.patient_id, req.doctor_id, req.question)}


@app.post("/api/visit")
def api_visit(req: VisitRequest):
    if not req.note.strip():
        raise HTTPException(status_code=400, detail="Doctor note is required.")
    visit, candidates = run_visit(APP_MEMORY, req.patient_id, req.doctor_id, req.note)
    return {
        "visit": visit.model_dump(),
        "running_summary": visit.running_summary,
        "soap": visit.ai_draft_summary,
        "candidates": [item.model_dump(mode="json") for item in candidates],
    }


@app.post("/api/review")
def api_review(req: ReviewRequest):
    if req.action == "approve":
        return {"memory": approve_candidate(APP_MEMORY, req.candidate_id).model_dump(mode="json")}
    if req.action == "reject":
        return {"candidate": reject_candidate(req.candidate_id).model_dump(mode="json")}
    raise HTTPException(status_code=400, detail="action must be approve or reject")


def get_selected_patient(patient_id: str | None):
    if patient_id:
        return get_patient(patient_id)
    return PATIENTS[0] if PATIENTS else None


def split_values(value: str) -> list[str]:
    return [item.strip() for item in value.replace("\n", ",").split(",") if item.strip()]
