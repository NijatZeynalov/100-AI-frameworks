from datetime import datetime, timezone
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, Field


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


MemoryType = Literal[
    "patient_profile",
    "clinical_fact",
    "visit_summary",
    "medication",
    "allergy",
    "follow_up_task",
    "communication_preference",
    "procedural_rule",
    "doctor_preference",
    "feedback",
]

VerificationStatus = Literal[
    "patient-reported",
    "doctor-confirmed",
    "ai-extracted-pending-review",
    "superseded",
    "corrected",
    "rejected",
]

Confidence = Literal["low", "medium", "high", "confirmed"]


class Patient(BaseModel):
    patient_id: str
    full_name: str
    age: int
    gender: str
    basic_history: list[str] = Field(default_factory=list)
    allergies: list[str] = Field(default_factory=list)
    medications: list[str] = Field(default_factory=list)
    active_conditions: list[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class Visit(BaseModel):
    visit_id: str = Field(default_factory=lambda: f"visit_{uuid4().hex[:8]}")
    patient_id: str
    doctor_id: str
    visit_date: str = Field(default_factory=now_iso)
    raw_doctor_note: str = ""
    running_summary: str = ""
    ai_draft_summary: str = ""
    final_doctor_summary: str = ""
    status: Literal["open", "completed"] = "open"
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class MemoryRecord(BaseModel):
    memory_id: str = Field(default_factory=lambda: str(uuid4()))
    namespace: tuple[str, ...]
    memory_type: MemoryType
    summary: str
    structured_data: dict[str, Any] = Field(default_factory=dict)
    patient_id: str | None = None
    doctor_id: str | None = None
    visit_id: str | None = None
    source_type: str = "demo"
    source_id: str | None = None
    verification_status: VerificationStatus = "ai-extracted-pending-review"
    confidence: Confidence = "medium"
    active_status: Literal["active", "superseded", "rejected"] = "active"
    superseded_by: str | None = None
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class MemoryCandidate(BaseModel):
    candidate_id: str = Field(default_factory=lambda: f"candidate_{uuid4().hex[:8]}")
    patient_id: str
    doctor_id: str
    visit_id: str | None = None
    memory_type: MemoryType
    summary: str
    confidence: Confidence = "medium"
    verification_status: VerificationStatus = "ai-extracted-pending-review"
    structured_data: dict[str, Any] = Field(default_factory=dict)
    supersedes_query: str | None = None
    status: Literal["pending", "approved", "rejected"] = "pending"
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)
