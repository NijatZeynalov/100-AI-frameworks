from .config import DEFAULT_DOCTOR_ID
from .memory import ClinicMemory
from .services import answer_question, approve_candidate, run_visit, summarize_patient
from .state import PATIENTS, create_patient, reset_runtime_state


TEST_MEMORY = ClinicMemory()


def reset_test_state() -> None:
    global TEST_MEMORY
    reset_runtime_state()
    TEST_MEMORY = ClinicMemory()


def run_tests() -> int:
    reset_test_state()
    results = [
        run_case("Case1: new patient note -> SOAP -> candidate approval", case_new_patient_visit),
        run_case("Case2: returning patient history/question -> new note updates memory", case_returning_patient),
        run_case("Case3: changed medication history -> candidate overwrite path", case_update_overwrite),
    ]
    for result in results:
        print(("PASS" if result["passed"] else "FAIL") + " - " + result["name"])
        if result["error"]:
            print("  " + result["error"])
        for item in result["evidence"]:
            print("  " + item)
    return 0 if all(result["passed"] for result in results) else 1


def run_case(name: str, fn):
    try:
        return {"name": name, "passed": True, "evidence": fn(), "error": None}
    except Exception as exc:
        return {"name": name, "passed": False, "evidence": [], "error": f"{type(exc).__name__}: {exc}"}


def case_new_patient_visit() -> list[str]:
    patient = create_patient("Test Patient One", 52, "male", basic_history=["Hypertension"])
    visit, candidates = run_visit(
        TEST_MEMORY,
        patient.patient_id,
        DEFAULT_DOCTOR_ID,
        "Patient reports exertional chest tightness for two weeks. BP monitoring recommended.",
    )
    approved = [approve_candidate(TEST_MEMORY, item.candidate_id) for item in candidates]
    assert visit.ai_draft_summary
    assert candidates
    assert approved
    return [f"patient={patient.patient_id}", f"candidates={len(candidates)}", f"approved={len(approved)}"]


def case_returning_patient() -> list[str]:
    patient = PATIENTS[0]
    history = summarize_patient(TEST_MEMORY, patient.patient_id, DEFAULT_DOCTOR_ID)
    answer = answer_question(TEST_MEMORY, patient.patient_id, DEFAULT_DOCTOR_ID, "What happened last visit?")
    _, candidates = run_visit(
        TEST_MEMORY,
        patient.patient_id,
        DEFAULT_DOCTOR_ID,
        "Patient reports chest tightness improved, but mild dyspnea persists on stairs.",
    )
    assert history.strip()
    assert answer.strip()
    assert candidates
    return [f"history_chars={len(history)}", f"answer_chars={len(answer)}", f"new_candidates={len(candidates)}"]


def case_update_overwrite() -> list[str]:
    patient = PATIENTS[0]
    _, candidates = run_visit(
        TEST_MEMORY,
        patient.patient_id,
        DEFAULT_DOCTOR_ID,
        "Amlodipine was stopped. Losartan 50mg was started.",
    )
    medication_candidates = [item for item in candidates if item.memory_type == "medication"]
    assert medication_candidates
    approved = [approve_candidate(TEST_MEMORY, item.candidate_id) for item in medication_candidates]
    approved_text = " | ".join(item.summary for item in approved)
    assert "losartan" in approved_text.lower()
    assert "amlodipine" in approved_text.lower()
    return [f"medication_candidates={len(medication_candidates)}", f"approved={approved_text}"]


if __name__ == "__main__":
    raise SystemExit(run_tests())
