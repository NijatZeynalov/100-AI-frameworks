from uuid import uuid4

from langgraph.store.memory import InMemoryStore
from langmem import create_manage_memory_tool, create_search_memory_tool

from .config import CLINIC_ID
from .models import MemoryCandidate, MemoryRecord, now_iso


def patient_namespace(patient_id: str) -> tuple[str, ...]:
    return ("clinic_memory", CLINIC_ID, patient_id)


class ClinicMemory:
    """Runtime LangMem store for patient-scoped memory."""

    def __init__(self) -> None:
        self.store = InMemoryStore()

    def add_record(self, record: MemoryRecord) -> MemoryRecord:
        self.store.put(record.namespace, record.memory_id, record.model_dump(mode="json"))
        return record

    def add_candidate(
        self,
        candidate: MemoryCandidate,
        namespace: tuple[str, ...],
        patient_id: str | None,
        doctor_id: str | None,
        visit_id: str | None,
        source_type: str,
        source_id: str | None,
    ) -> MemoryRecord:
        return self.add_record(
            MemoryRecord(
                namespace=namespace,
                memory_type=candidate.memory_type,
                summary=candidate.summary,
                structured_data=candidate.structured_data,
                patient_id=patient_id,
                doctor_id=doctor_id,
                visit_id=visit_id,
                source_type=source_type,
                source_id=source_id,
                verification_status=candidate.verification_status,
                confidence=candidate.confidence,
            )
        )

    def remember(
        self,
        patient_id: str,
        doctor_id: str,
        text: str,
        memory_type: str,
        source_type: str = "doctor-confirmed",
    ) -> MemoryRecord:
        namespace = patient_namespace(patient_id)
        tool = create_manage_memory_tool(namespace=namespace, store=self.store)
        result = tool.invoke({"content": text, "action": "create"})
        langmem_id = str(result).split("created memory ")[-1].strip() or str(uuid4())
        return self.add_record(
            MemoryRecord(
                memory_id=langmem_id,
                namespace=namespace,
                memory_type=memory_type,
                patient_id=patient_id,
                doctor_id=doctor_id,
                summary=text,
                source_type=source_type,
                verification_status="doctor-confirmed",
                confidence="confirmed",
            )
        )

    def search(self, namespace: tuple[str, ...], query: str, limit: int = 8) -> list[MemoryRecord]:
        create_search_memory_tool(namespace=namespace, store=self.store).invoke(
            {"query": query, "limit": limit}
        )
        return [
            MemoryRecord(**item.value)
            for item in self.store.search(namespace, limit=limit)
            if "memory_id" in item.value
        ]

    def all_for_patient(self, patient_id: str) -> list[MemoryRecord]:
        return [
            MemoryRecord(**item.value)
            for item in self.store.search(patient_namespace(patient_id), limit=1000)
            if "memory_id" in item.value
        ]

    def supersede(self, old_memory_id: str, new_record: MemoryRecord) -> MemoryRecord:
        old = self.find(old_memory_id)
        old.verification_status = "superseded"
        old.active_status = "superseded"
        old.superseded_by = new_record.memory_id
        old.updated_at = now_iso()
        self.add_record(old)
        return self.add_record(new_record)

    def find(self, memory_id: str) -> MemoryRecord:
        for namespace in self.store.list_namespaces():
            item = self.store.get(namespace, memory_id)
            if item and "memory_id" in item.value:
                return MemoryRecord(**item.value)
        raise KeyError(f"Unknown memory_id: {memory_id}")
