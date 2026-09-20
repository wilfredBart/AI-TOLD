from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import uuid


HOST = "127.0.0.1"
PORT = 8765


def make_message(message_type, source, target, payload):
    return {
        "type": message_type,
        "requestId": str(uuid.uuid4()),
        "source": source,
        "target": target,
        "payload": payload,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


class AIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/ping":
            response = make_message(
                "pong",
                "ai-pipeline",
                "tauri",
                {
                    "endpoint": "/ping",
                    "status": "ok",
                    "service": "ai-pipeline",
                },
            )

            body = json.dumps(response).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

            return

        self.send_response(404)
        self.end_headers()

    def log_message(self, format, *args):
        print(f"[AI-PIPELINE] {format % args}")


def main():
    server = HTTPServer((HOST, PORT), AIHandler)

    print(f"AI pipeline listening on http://{HOST}:{PORT}")
    print("Ping endpoint: /ping")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nAI pipeline stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()