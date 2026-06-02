import json
import re
import sys
from functools import lru_cache
from typing import Any

import torch
from huggingface_hub.errors import GatedRepoError, HfHubHTTPError
from transformers import AutoModelForImageTextToText, AutoProcessor

from .config import HF_TOKEN, MODEL_ID


SAFETY_SYSTEM = (
    "You are MedGemma used inside a physician-facing demo. "
    "Do not provide a final diagnosis or prescribe independently. "
    "Only draft concise clinical text for physician review. "
    "Never invent labs, history, vitals, or exam findings."
)


@lru_cache(maxsize=1)
def load_model():
    dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
    kwargs = {"token": HF_TOKEN} if HF_TOKEN else {}
    processor = AutoProcessor.from_pretrained(MODEL_ID, **kwargs)
    model = AutoModelForImageTextToText.from_pretrained(
        MODEL_ID,
        dtype=dtype,
        device_map="auto",
        **kwargs,
    )
    return processor, model


def generate_text(prompt: str, max_new_tokens: int = 384, temperature: float = 0.0) -> str:
    processor, model = load_model()
    messages = [
        {"role": "system", "content": [{"type": "text", "text": SAFETY_SYSTEM}]},
        {"role": "user", "content": [{"type": "text", "text": prompt}]},
    ]
    inputs = processor.apply_chat_template(
        messages,
        add_generation_prompt=True,
        tokenize=True,
        return_dict=True,
        return_tensors="pt",
    ).to(model.device)

    kwargs = {"max_new_tokens": max_new_tokens, "do_sample": temperature > 0}
    if temperature > 0:
        kwargs["temperature"] = temperature

    with torch.inference_mode():
        outputs = model.generate(**inputs, **kwargs)

    prompt_length = inputs["input_ids"].shape[-1]
    return processor.decode(outputs[0][prompt_length:], skip_special_tokens=True).strip()


def generate_json(prompt: str, max_new_tokens: int = 512) -> Any:
    text = generate_text(
        f"{prompt}\n\nReturn valid JSON only. Do not wrap it in markdown.",
        max_new_tokens=max_new_tokens,
    )
    parsed = parse_json_like(text)
    if parsed is not None:
        return parsed

    repaired = generate_text(
        "Repair this response into valid JSON only. Preserve only information present in it.\n\n"
        f"Response:\n{text}",
        max_new_tokens=max_new_tokens,
    )
    parsed = parse_json_like(repaired)
    if parsed is None:
        raise ValueError(f"MedGemma did not return valid JSON: {text[:500]}")
    return parsed


def parse_json_like(text: str) -> Any | None:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"(\{.*\}|\[.*\])", text, flags=re.DOTALL)
        if not match:
            return None
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            return None


def explain_model_access_error(exc: Exception) -> int:
    if isinstance(exc, GatedRepoError) or "gated repo" in str(exc).lower() or "401 client error" in str(exc).lower():
        print(
            "MedGemma access failed. Set HF_TOKEN and accept "
            "https://huggingface.co/google/medgemma-4b-it terms.",
            file=sys.stderr,
        )
        return 2
    if isinstance(exc, HfHubHTTPError):
        print(f"Hugging Face download failed: {exc}", file=sys.stderr)
        return 2
    raise exc
