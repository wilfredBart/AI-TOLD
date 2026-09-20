from __future__ import annotations

import json
import os
import socket
import urllib.error
import urllib.request

DEFAULT_MODEL = os.getenv("AI_PIPELINE_MODEL", "tinyllama")
OLLAMA_BASE_URL = os.getenv("AI_PIPELINE_OLLAMA_URL", "http://127.0.0.1:11434")
DEFAULT_TIMEOUT = int(os.getenv("AI_PIPELINE_TIMEOUT", "30"))


def normalize_conversation(conversation: list[dict] | None = None) -> list[dict]:
    if not conversation:
        return []

    if not isinstance(conversation, list):
        raise TypeError("chat request 'conversation' must be a list of message objects")

    normalized_messages: list[dict] = []
    for index, item in enumerate(conversation):
        if not isinstance(item, dict):
            raise TypeError(f"conversation item at index {index} must be an object")

        role = item.get("role", "user")
        content = item.get("content", "")

        if role not in {"user", "assistant", "system"}:
            raise ValueError(f"conversation item at index {index} has unsupported role '{role}'")

        if not isinstance(content, str):
            raise TypeError(f"conversation item at index {index} must have a string 'content' field")

        cleaned_content = content.strip()
        if cleaned_content:
            normalized_messages.append({"role": role, "content": cleaned_content})

    return normalized_messages


def get_model_response(
    message: str,
    model_name: str | None = None,
    conversation: list[dict] | None = None,
) -> str:
    clean_message = (message or "").strip()
    if not clean_message:
        raise ValueError("chat request payload must include a non-empty 'message' field")

    selected_model = model_name or DEFAULT_MODEL
    history = normalize_conversation(conversation)
    endpoint = f"{OLLAMA_BASE_URL.rstrip('/')}/api/chat"
    payload = {
        "model": selected_model,
        "messages": [*history, {"role": "user", "content": clean_message}],
        "stream": False,
    }

    request = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(request, timeout=DEFAULT_TIMEOUT) as response:
            raw_body = response.read().decode("utf-8")
    except (socket.timeout, TimeoutError) as exc:
        raise RuntimeError(f"local model request timed out at {endpoint}") from exc
    except urllib.error.URLError as exc:
        reason = getattr(exc, "reason", str(exc))
        raise RuntimeError(
            f"local model service unavailable at {endpoint}: {reason}"
        ) from exc

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
