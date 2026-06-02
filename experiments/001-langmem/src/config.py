import os
from pathlib import Path

from dotenv import load_dotenv


ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / ".env")

MODEL_ID = os.getenv("MEDGEMMA_MODEL_ID", "google/medgemma-4b-it")
HF_TOKEN = os.getenv("HF_TOKEN") or None
CLINIC_ID = os.getenv("CLINIC_ID", "demo_clinic")
DEFAULT_DOCTOR_ID = os.getenv("DEFAULT_DOCTOR_ID", "doctor_001")
