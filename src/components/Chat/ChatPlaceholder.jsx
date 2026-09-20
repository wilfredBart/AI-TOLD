import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function ChatPlaceholder() {
  const [status, setStatus] = useState("MIC READY");
  const [testing, setTesting] = useState(false);

  async function testPipeline() {
    setTesting(true);
    setStatus("MIC TESTING...");

    try {
      const response = await invoke("ai_pipeline_ping");
      const messageType = response?.type ?? response?.payload?.type;
      const payload = response?.payload ?? response;
      const source = payload?.source ?? response?.source ?? "ai-pipeline";

      if (messageType === "error") {
        const errorCode = payload?.code ?? "AI_PIPELINE_ERROR";
        const errorMessage = payload?.message ?? "Unknown pipeline error";
        setStatus(`MIC UNAVAILABLE · ${errorCode} · ${errorMessage}`);
        return;
      }

      if (messageType === "pong" || payload?.type === "pong") {
        setStatus(`MIC READY · ${source}`);
      } else {
        setStatus("MIC TEST RESPONDED");
      }
    } catch (error) {
      setStatus(`MIC ERROR · ${String(error)}`);
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="chat-placeholder">
      <div className="messages">
        <div className="msg ai">Lokaal kanaal open.</div>

        <div className="msg ai">{status}</div>
      </div>

      <div className="input-row">
        <input type="text" placeholder="Typ een bericht…" disabled />

        <button
          className="mic-button"
          type="button"
          onClick={testPipeline}
          disabled={testing}
          aria-label="Microphone test button"
          title="Microphone test button (temporary ping bridge)"
        >
          {testing ? (
            <svg className="mic-icon" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="2.1" fill="currentColor" />
            </svg>
          ) : (
            <svg className="mic-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M8 1.2a2.6 2.6 0 0 1 2.6 2.6v4.2A2.6 2.6 0 1 1 5.4 8V3.8A2.6 2.6 0 0 1 8 1.2Zm0 6.1a1.1 1.1 0 0 0-1.1 1.1v.5c0 .6.5 1.1 1.1 1.1s1.1-.5 1.1-1.1v-.5A1.1 1.1 0 0 0 8 7.3Zm-4.1 1.2h1.2a2.8 2.8 0 0 0 5.8 0h1.2a4.1 4.1 0 0 1-3.6 4.05v1.45h-1.2v-1.45A4.1 4.1 0 0 1 3.9 8.5Z"
                fill="currentColor"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
