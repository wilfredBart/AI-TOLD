import json
import socket
import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[1]
PIPELINE_DIR = ROOT / "ai-pipeline"
for candidate in (ROOT, PIPELINE_DIR):
    path_str = str(candidate)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)

import model_client
import pipeline_api


class ModelClientTests(unittest.TestCase):
    def test_default_model_is_small_and_stable(self):
        self.assertEqual(model_client.DEFAULT_MODEL, "tinyllama")

    def test_timeout_is_configurable_and_socket_timeout_is_wrapped(self):
        captured = {}

        def fake_urlopen(request, timeout=None):
            captured["timeout"] = timeout
            raise socket.timeout("timed out")

        with patch.object(model_client.urllib.request, "urlopen", side_effect=fake_urlopen):
            with self.assertRaisesRegex(RuntimeError, "timed out"):
                model_client.get_model_response("hello")

        self.assertEqual(captured["timeout"], model_client.DEFAULT_TIMEOUT)

    def test_status_envelope_reports_pipeline_state(self):
        response = pipeline_api.build_status_response("ready", model="tinyllama")

        self.assertEqual(response["type"], "status")
        self.assertEqual(response["payload"]["status"], "ready")
        self.assertEqual(response["payload"]["model"], "tinyllama")

    def test_history_is_sent_with_latest_message_to_model(self):
        captured = {}

        class FakeResponse:
            def __enter__(self):
                return self

            def __exit__(self, exc_type, exc, tb):
                return False

            def read(self):
                return json.dumps({"message": {"content": "antwoord vanuit context"}}).encode("utf-8")

        def fake_urlopen(request, timeout=None):
            captured["payload"] = json.loads(request.data.decode("utf-8"))
            captured["timeout"] = timeout
            return FakeResponse()

        with patch.object(model_client.urllib.request, "urlopen", side_effect=fake_urlopen):
            reply = model_client.get_model_response(
                "wat zei ik net?",
                conversation=[
                    {"role": "user", "content": "wie ben je?"},
                    {"role": "assistant", "content": "ik ben AI-TOLD"},
                ],
            )

        self.assertEqual(reply, "antwoord vanuit context")
        self.assertEqual(
            captured["payload"]["messages"],
            [
                {"role": "user", "content": "wie ben je?"},
                {"role": "assistant", "content": "ik ben AI-TOLD"},
                {"role": "user", "content": "wat zei ik net?"},
            ],
        )

    def test_chat_request_accepts_optional_conversation_payload(self):
        payload = {
            "message": "volgende vraag",
            "conversation": [
                {"role": "user", "content": "eerste vraag"},
                {"role": "assistant", "content": "eerste antwoord"},
            ],
        }

        self.assertEqual(pipeline_api.validate_chat_request(payload), "volgende vraag")


if __name__ == "__main__":
    unittest.main()
