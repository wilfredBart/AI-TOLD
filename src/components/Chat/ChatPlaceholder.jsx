import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function ChatPlaceholder() {
  const [status, setStatus] = useState("LOCAL CHANNEL READY");
  const [testing, setTesting] = useState(false);

  async function testPipeline() {
    setTesting(true);
    setStatus("CONNECTING...");

    try {
      const response = await invoke("ai_pipeline_ping");
      const messageType = response?.type ?? response?.payload?.type;
      const payload = response?.payload ?? response;
      const source = payload?.source ?? response?.source ?? "ai-pipeline";

      if (messageType === "error") {
        const errorCode = payload?.code ?? "AI_PIPELINE_ERROR";
        const errorMessage = payload?.message ?? "Unknown pipeline error";
        setStatus(`PIPELINE UNAVAILABLE · ${errorCode} · ${errorMessage}`);
        return;
      }

      if (messageType === "pong" || payload?.type === "pong") {
        setStatus(`PIPELINE ONLINE · ${source}`);
      } else {
        setStatus("PIPELINE RESPONDED");
      }
    } catch (error) {
      setStatus(`PIPELINE ERROR · ${String(error)}`);
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

        <button type="button" onClick={testPipeline} disabled={testing}>
          {testing ? "..." : "PING"}
        </button>
      </div>
    </div>
  );
}
