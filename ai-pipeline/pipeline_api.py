from __future__ import annotations

from datetime import datetime, timezone
import os
import uuid

HOST = "127.0.0.1"
PORT = 8765
BASE_URL = f"http://{HOST}:{PORT}"

PING_ROUTE = "/ping"
CHAT_ROUTE = "/chat"
DEFAULT_MODEL = os.getenv("AI_PIPELINE_MODEL", "llama3.2")


def create_envelope(message_type: str, source: str, target: str, payload: dict):
    return {
        "type": message_type,
        "requestId": str(uuid.uuid4()),
        "source": source,
        "target": target,
        "payload": payload,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def validate_chat_request(payload: object):
    if not isinstance(payload, dict):
        raise ValueError("chat request must be a JSON object")

    if "message" not in payload:
        raise ValueError("chat request payload must include a 'message' field")

    message = payload["message"]
    if not isinstance(message, str):
        raise TypeError("chat request 'message' must be a string")

    cleaned_message = message.strip()
    return cleaned_message


def build_ping_response():
    return create_envelope(
        "pong",
        "ai-pipeline",
        "tauri",
        {
            "endpoint": PING_ROUTE,
            "status": "ok",
            "service": "ai-pipeline",
        },
    )


def build_chat_response(message: str, response_text: str | None = None, model: str | None = None):
    normalized_message = (message or "").strip()
    normalized_response = (response_text or "").strip()
    selected_model = model or DEFAULT_MODEL

    if not normalized_response:
        normalized_response = f"AI-pipeline echo: {normalized_message or 'hello'}"

    return create_envelope(
        "chat_response",
        "ai-pipeline",
        "frontend",
        {
            "endpoint": CHAT_ROUTE,
            "status": "ok",
            "service": "ai-pipeline",
            "model": selected_model,
            "userMessage": normalized_message,
            "response": normalized_response,
        },
    )


def build_error_response(code: str, message: str, target: str = "frontend"):
    return create_envelope(
        "error",
        "ai-pipeline",
        target,
        {
            "code": code,
            "message": message,
        },
    )
