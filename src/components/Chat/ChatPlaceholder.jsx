import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export default function ChatPlaceholder() {
  const [status, setStatus] = useState("MIC READY");
  const [testing, setTesting] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, sender: "ai", text: "Lokaal kanaal open." },
    { id: 2, sender: "ai", text: "MIC READY" },
  ]);

  function addMessage(sender, text) {
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now() + Math.random(),
        sender,
        text,
      },
    ]);
  }

  function handleSend() {
    const text = draft.trim();
    if (!text || testing) return;

    addMessage("user", text);
    setStatus(`USER · ${text}`);
    setDraft("");
  }

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
        {messages.map((message) => (
          <div
            key={message.id}
            className={`msg ${message.sender === "user" ? "user" : "ai"}`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className="input-row">
        <div className="input-shell">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSend();
              }
            }}
            placeholder="Typ een bericht…"
            aria-label="Typ een bericht"
          />

          <button
            className="send-button"
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || testing}
            aria-label="Verstuur bericht"
            title="Verstuur bericht"
          >
            <svg className="send-icon" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M2.2 12.9 13.2 8 2.2 3.1v3.4L9.4 8l-7.2 1.5v3.4Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

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
