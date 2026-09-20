from http.server import BaseHTTPRequestHandler, HTTPServer
import json

from model_client import get_model_response
from pipeline_api import (
    BASE_URL,
    CHAT_ROUTE,
    HOST,
    PING_ROUTE,
    PORT,
    STATUS_ROUTE,
    build_chat_response,
    build_error_response,
    build_ping_response,
    build_status_response,
    extract_conversation,
    validate_chat_request,
)


class AIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == PING_ROUTE:
            response = build_ping_response()
            body = json.dumps(response).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path == STATUS_ROUTE:
            response = build_status_response("ready")
            body = json.dumps(response).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        if self.path != CHAT_ROUTE:
            self.send_response(404)
            self.end_headers()
            return

        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length) if content_length > 0 else b"{}"

        try:
            payload = json.loads(raw_body.decode("utf-8")) if raw_body else {}
        except json.JSONDecodeError:
            payload = {}

        try:
            message = validate_chat_request(payload)
            conversation = extract_conversation(payload)
            model_reply = get_model_response(message, conversation=conversation)
            response = build_chat_response(message, response_text=model_reply)
            status_code = 200
        except (TypeError, ValueError) as exc:
            response = build_error_response(
                "INVALID_CHAT_REQUEST",
                str(exc),
                target="frontend",
            )
            status_code = 400
        except RuntimeError as exc:
            response = build_error_response(
                "MODEL_UNAVAILABLE",
                str(exc),
                target="frontend",
            )
            status_code = 503

        body = json.dumps(response).encode("utf-8")

        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        print(f"[AI-PIPELINE] {format % args}")


def main():
    server = HTTPServer((HOST, PORT), AIHandler)

    print(f"AI pipeline listening on {BASE_URL}")
    print(f"Ping endpoint: {PING_ROUTE}")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nAI pipeline stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()