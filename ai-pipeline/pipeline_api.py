from __future__ import annotations

from datetime import datetime, timezone
import os
import uuid

HOST = "127.0.0.1"
PORT = 8765
BASE_URL = f"http://{HOST}:{PORT}"

PING_ROUTE = "/ping"
CHAT_ROUTE = "/chat"
STATUS_ROUTE = "/status"
DEFAULT_MODEL = os.getenv("AI_PIPELINE_MODEL", "tinyllama")


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
    if not cleaned_message:
        raise ValueError("chat request payload must include a non-empty 'message' field")

    conversation = payload.get("conversation", [])
    if conversation is None:
        conversation = []

    if not isinstance(conversation, list):
        raise TypeError("chat request 'conversation' must be a list of message objects")

    for index, item in enumerate(conversation):
        if not isinstance(item, dict):
            raise TypeError(f"conversation item at index {index} must be an object")

        role = item.get("role", "user")
        content = item.get("content", "")
        if role not in {"user", "assistant", "system"}:
            raise ValueError(f"conversation item at index {index} has unsupported role '{role}'")
        if not isinstance(content, str):
            raise TypeError(f"conversation item at index {index} must have a string 'content' field")

    return cleaned_message


def extract_conversation(payload: dict):
    if not isinstance(payload, dict):
        return []

    conversation = payload.get("conversation", [])
    if not conversation:
        return []

    if not isinstance(conversation, list):
        raise TypeError("chat request 'conversation' must be a list of message objects")

    normalized = []
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
            normalized.append({"role": role, "content": cleaned_content})

    return normalized


def build_ping_response():
    return create_envelope(
        "pong",
        "ai-pipeline",
        "tauri",
        {
            "endpoint": PING_ROUTE,
            "status": "ok",
            "service": "ai-pipeline",
            "model": DEFAULT_MODEL,
        },
    )


def build_status_response(state: str = "ready", model: str | None = None):
    normalized_state = (state or "ready").strip().lower()
    selected_model = model or DEFAULT_MODEL

    return create_envelope(
        "status",
        "ai-pipeline",
        "frontend",
        {
            "endpoint": STATUS_ROUTE,
            "status": normalized_state,
            "service": "ai-pipeline",
            "model": selected_model,
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
            "status": "error",
        },
    )
