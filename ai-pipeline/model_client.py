from __future__ import annotations

import json
import os
import urllib.error
import urllib.request

DEFAULT_MODEL = os.getenv("AI_PIPELINE_MODEL", "llama3.2")
OLLAMA_BASE_URL = os.getenv("AI_PIPELINE_OLLAMA_URL", "http://127.0.0.1:11434")


def get_model_response(message: str, model_name: str | None = None) -> str:
    clean_message = (message or "").strip()
    if not clean_message:
        raise ValueError("chat request payload must include a non-empty 'message' field")

    selected_model = model_name or DEFAULT_MODEL
    endpoint = f"{OLLAMA_BASE_URL.rstrip('/')}/api/chat"
    payload = {
        "model": selected_model,
        "messages": [{"role": "user", "content": clean_message}],
        "stream": False,
    }

    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            raw_body = response.read().decode("utf-8")
    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"local model service unavailable at {endpoint}: {exc.reason}"
        ) from exc
    except TimeoutError as exc:
        raise RuntimeError(f"local model request timed out at {endpoint}") from exc

    try:
        body = json.loads(raw_body)
    except json.JSONDecodeError as exc:
        raise RuntimeError("local model returned invalid JSON") from exc

    if "message" in body and isinstance(body["message"], dict):
        content = body["message"].get("content", "")
    else:
        content = body.get("response", "")

    normalized_content = " ".join((content or "").split())
    if not normalized_content:
        raise RuntimeError("local model returned an empty response")

    return normalized_content
