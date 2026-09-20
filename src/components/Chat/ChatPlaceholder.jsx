import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  extractFinalTranscript,
  shouldKeepMicModeOnSpeechStart,
} from "../../lib/speech.js";

const createWelcomeMessages = () => [
  { id: 1, sender: "ai", text: "Lokaal kanaal open." },
  { id: 2, sender: "ai", text: "MIC READY" },
];

export default function ChatPlaceholder() {
  const [status, setStatus] = useState("MIC READY");
  const [testing, setTesting] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [draft, setDraft] = useState("");
  const [microphoneEnabled, setMicrophoneEnabled] = useState(false);
  const [microphoneMuted, setMicrophoneMuted] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState("unknown");
  const [audioDevices, setAudioDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [inputMode, setInputMode] = useState("text");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [inputLevel, setInputLevel] = useState(0);
  const messagesEndRef = useRef(null);
  const sendingRef = useRef(false);
  const microphoneStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const meterAnimationRef = useRef(null);
  const speechRecognitionRef = useRef(null);
  const [messages, setMessages] = useState(createWelcomeMessages);

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

  function resetConversation() {
    if (sendingRef.current) return;

    setMessages(createWelcomeMessages());
    setErrorMessage(null);
    setDraft("");
    setStatus("MIC READY");
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadAudioDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      setAudioDevices([]);
      setSelectedDeviceId("");
      setStatus("MIC UNAVAILABLE · AUDIO_NOT_SUPPORTED");
      return [];
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const inputs = devices.filter((device) => device.kind === "audioinput");
      setAudioDevices(inputs);

      if (inputs.length > 0) {
        const preferredDevice =
          inputs.find((device) => device.deviceId === selectedDeviceId) ??
          inputs[0];
        setSelectedDeviceId(preferredDevice.deviceId);
        return inputs;
      }

      setSelectedDeviceId("");
      setStatus("MIC UNAVAILABLE · NO_MICROPHONES_FOUND");
      return [];
    } catch (error) {
      setAudioDevices([]);
      setSelectedDeviceId("");
      setStatus("MIC UNAVAILABLE · DEVICE_PERMISSION_REQUIRED");
      return [];
    }
  }

  useEffect(() => {
    testPipeline();
    loadAudioDevices();
  }, []);

  function stopSpeechRecognition() {
    const recognition = speechRecognitionRef.current;
    if (!recognition) {
      setIsListening(false);
      return;
    }

    try {
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      recognition.abort?.();
      recognition.stop();
    } catch (error) {
      // no-op; some browsers throw when the recognizer has already ended
    }

    speechRecognitionRef.current = null;
    setIsListening(false);
  }

  function startSpeechRecognition() {
    if (typeof window === "undefined") return;

    const RecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!RecognitionClass) {
      setErrorMessage(
        "Spraakherkenning is niet beschikbaar in deze browser. Gebruik tekstinvoer.",
      );
      setStatus("MIC UNAVAILABLE · SPEECH_RECOGNITION_UNSUPPORTED");
      return;
    }

    stopSpeechRecognition();

    const recognition = new RecognitionClass();
    recognition.lang = "nl-NL";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setInputMode((currentMode) =>
        shouldKeepMicModeOnSpeechStart(currentMode, microphoneEnabled),
      );
      setDraft((currentDraft) =>
        currentDraft.trim() ? currentDraft : "Microfoon actief - luister nu...",
      );
      setIsListening(true);
      setStatus("LISTENING...");
    };

    recognition.onresult = (event) => {
      const transcript = extractFinalTranscript(Array.from(event.results));
      if (!transcript) {
        return;
      }

      setDraft((currentDraft) =>
        currentDraft ? `${currentDraft} ${transcript}` : transcript,
      );
      setLiveTranscript(transcript);
      setInputMode((currentMode) =>
        shouldKeepMicModeOnSpeechStart(currentMode, true),
      );
      setStatus(`MIC READY · ${transcript}`);
    };

    recognition.onerror = (event) => {
      const errorCode = event.error || "SPEECH_RECOGNITION_ERROR";

      if (errorCode === "network") {
        setInputMode((currentMode) =>
          shouldKeepMicModeOnSpeechStart(currentMode, microphoneEnabled),
        );
        const fallbackText =
          "Default microfoon actief - wacht op transcript...";
        setDraft((currentDraft) =>
          currentDraft.trim() ? currentDraft : fallbackText,
        );
        setLiveTranscript(fallbackText);
        setErrorMessage(null);
        setStatus("MIC READY · speech unavailable");
        setIsListening(false);
        return;
      }

      const message =
        errorCode === "not-allowed"
          ? "Spraakherkenning is geblokkeerd. Geef deze app toegang tot de microfoon."
          : `Spraakherkenning faalde: ${errorCode}`;

      setErrorMessage(message);
      setStatus(`MIC UNAVAILABLE · ${errorCode}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      speechRecognitionRef.current = null;
      setIsListening(false);
      setStatus((currentStatus) => {
        if (
          currentStatus === "LISTENING..." ||
          currentStatus.startsWith("TRANSCRIPT READY")
        ) {
          return "MIC READY";
        }

        return currentStatus;
      });
    };

    speechRecognitionRef.current = recognition;
    recognition.start();
  }

  function stopAudioMeter() {
    if (meterAnimationRef.current) {
      cancelAnimationFrame(meterAnimationRef.current);
      meterAnimationRef.current = null;
    }

    analyserRef.current = null;

    if (audioContextRef.current) {
      const context = audioContextRef.current;
      audioContextRef.current = null;
      context.close().catch(() => undefined);
    }

    setInputLevel(0);
  }

  function startAudioMeter(stream) {
    if (!stream || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      const buffer = new Uint8Array(analyser.fftSize);

      const updateMeter = () => {
        if (!analyserRef.current) return;

        analyser.getByteTimeDomainData(buffer);

        let sum = 0;
        for (let i = 0; i < buffer.length; i += 1) {
          const normalized = (buffer[i] - 128) / 128;
          sum += normalized * normalized;
        }

        const rms = Math.sqrt(sum / buffer.length);
        const level = Math.min(1, rms * 4.2);
        setInputLevel(level);
        meterAnimationRef.current = requestAnimationFrame(updateMeter);
      };

      meterAnimationRef.current = requestAnimationFrame(updateMeter);
    } catch (error) {
      stopAudioMeter();
    }
  }

  useEffect(() => {
    return () => {
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current
          .getTracks()
          .forEach((track) => track.stop());
        microphoneStreamRef.current = null;
      }

      stopSpeechRecognition();
      stopAudioMeter();
    };
  }, []);

  async function handleMicrophonePermission(
    deviceIdOverride = selectedDeviceId,
  ) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicrophonePermission("unsupported");
      setStatus("MIC UNAVAILABLE · AUDIO_NOT_SUPPORTED");
      return;
    }

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current = null;
      stopAudioMeter();
      stopSpeechRecognition();
      setMicrophoneEnabled(false);
      setMicrophoneMuted(false);
      setMicrophonePermission("idle");
      setStatus("MIC READY");
      return;
    }

    const effectiveDeviceId = deviceIdOverride || selectedDeviceId;
    const constraints =
      effectiveDeviceId &&
      audioDevices.some((device) => device.deviceId === effectiveDeviceId)
        ? {
            audio: {
              deviceId: { exact: effectiveDeviceId },
            },
          }
        : { audio: true };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const refreshedDevices = await navigator.mediaDevices.enumerateDevices();
      const inputs = refreshedDevices.filter(
        (device) => device.kind === "audioinput",
      );
      setAudioDevices(inputs);

      if (inputs.length === 0) {
        stream.getTracks().forEach((track) => track.stop());
        setStatus("MIC UNAVAILABLE · NO_MICROPHONES_FOUND");
        setErrorMessage(
          "Geen microfoons gevonden. Controleer of Windows toegang heeft tot een audiotoestel.",
        );
        return;
      }

      const preferred =
        inputs.find((device) => device.deviceId === effectiveDeviceId) ??
        inputs[0];
      setSelectedDeviceId(preferred?.deviceId ?? "default");
      microphoneStreamRef.current = stream;
      startAudioMeter(stream);
      setMicrophoneEnabled(true);
      setInputMode("mic");
      setMicrophoneMuted(false);
      setMicrophonePermission("granted");
      setErrorMessage(null);
      startSpeechRecognition();
      setStatus(`MIC READY · ${preferred.label || "PERMISSION GRANTED"}`);
    } catch (error) {
      setMicrophoneEnabled(false);
      setMicrophonePermission("denied");
      const reason = error && error.name ? error.name : "PERMISSION_DENIED";
      setStatus(`MIC UNAVAILABLE · ${reason}`);
      setErrorMessage(
        "Microfoon toegang geweigerd. Sta audio-toegang toe in Windows privacy-instellingen en probeer opnieuw.",
      );
    }
  }

  async function handleDeviceChange(event) {
    const nextDeviceId = event.target.value;
    setSelectedDeviceId(nextDeviceId);

    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach((track) => track.stop());
      microphoneStreamRef.current = null;
      stopAudioMeter();
      stopSpeechRecognition();
      setMicrophoneEnabled(false);
      setMicrophoneMuted(false);
      setMicrophonePermission("idle");
    }

    if (nextDeviceId) {
      setStatus(`MIC READY · ${nextDeviceId}`);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await handleMicrophonePermission(nextDeviceId);
      }
    }
  }

  function handleMicrophoneMute() {
    if (!microphoneStreamRef.current || !microphoneEnabled) return;

    const nextMutedState = !microphoneMuted;
    microphoneStreamRef.current.getTracks().forEach((track) => {
      track.enabled = !nextMutedState;
    });

    setMicrophoneMuted(nextMutedState);
    setStatus(nextMutedState ? "MIC MUTED" : "MIC READY");
  }

  async function handleSend() {
    const text = draft.trim();
    if (!text || testing || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setErrorMessage(null);
    setStatus("SENDING...");
    addMessage("user", text);
    setDraft("");

    try {
      const response = await invoke("ai_pipeline_chat", { message: text });
      const messageType = response?.type ?? response?.payload?.type;
      const payload = response?.payload ?? response;

      if (messageType === "error") {
        const errorCode = payload?.code ?? "AI_PIPELINE_ERROR";
        const errorMessageText =
          payload?.message ??
          "Verzending mislukt. Controleer de lokale pipeline.";

        setErrorMessage(errorMessageText);
        setStatus(`MIC UNAVAILABLE · ${errorCode}`);
        addMessage("ai", errorMessageText);
        return;
      }

      const aiReply =
        payload?.response ??
        payload?.message ??
        "Local channel open. Awaiting AI response.";

      addMessage("ai", aiReply);
      setStatus(`MIC READY · ${payload?.service ?? "ai-pipeline"}`);
    } catch (error) {
      const fallbackMessage = `Verzending mislukt. ${String(error)}`;
      setErrorMessage(fallbackMessage);
      setStatus("MIC UNAVAILABLE · AI_PIPELINE_UNAVAILABLE");
      addMessage("ai", fallbackMessage);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  async function testPipeline() {
    setTesting(true);
    setStatus("MIC TESTING...");

    try {
      const response = await invoke("ai_pipeline_status");
      const messageType = response?.type ?? response?.payload?.type;
      const payload = response?.payload ?? response;
      const source = payload?.source ?? response?.source ?? "ai-pipeline";

      if (messageType === "error") {
        const errorCode = payload?.code ?? "AI_PIPELINE_ERROR";
        const errorMessage = payload?.message ?? "Unknown pipeline error";
        setStatus(`MIC UNAVAILABLE · ${errorCode} · ${errorMessage}`);
        return;
      }

      if (messageType === "status" || payload?.status === "ready") {
        const modelName = payload?.model ?? "tinyllama";
        setStatus(`MIC READY · ${source} · ${modelName}`);
      } else {
        setStatus("MIC TEST RESPONDED");
      }
    } catch (error) {
      try {
        const fallback = await invoke("ai_pipeline_ping");
        const payload = fallback?.payload ?? fallback;
        const fallbackType = fallback?.type ?? payload?.type;

        if (fallbackType === "error") {
          const errorCode = payload?.code ?? "AI_PIPELINE_ERROR";
          const errorMessage = payload?.message ?? "Unknown pipeline error";
          setStatus(`MIC UNAVAILABLE · ${errorCode} · ${errorMessage}`);
          return;
        }

        setStatus("MIC READY · ai-pipeline");
      } catch (fallbackError) {
        setStatus(`MIC ERROR · ${String(fallbackError)}`);
      }
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="chat-placeholder">
      {errorMessage ? (
        <div className="error-banner" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <div className="messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`msg ${
              message.sender === "user"
                ? "user"
                : message.text === errorMessage
                  ? "error"
                  : "ai"
            }`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-row">
        <div className="mode-switch" aria-label="Input mode switch">
          <span className="mode-switch-label">
            {inputMode === "text" ? "TEXT" : "MIC"}
          </span>

          <button
            type="button"
            className={`mode-slider ${inputMode === "mic" ? "mic" : "text"}`}
            onClick={() =>
              setInputMode((currentMode) => {
                const nextMode = currentMode === "text" ? "mic" : "text";

                if (nextMode === "text" && microphoneEnabled) {
                  stopSpeechRecognition();
                }

                if (nextMode === "mic" && microphoneEnabled) {
                  startSpeechRecognition();
                }

                if (nextMode === "mic" && !microphoneEnabled) {
                  handleMicrophonePermission();
                }

                return nextMode;
              })
            }
            aria-label={`Schakel naar ${
              inputMode === "text" ? "microfoon" : "tekst"
            } modus`}
          >
            <span className="mode-slider-knob" />
            <span className="mode-slider-text mode-slider-text-left">TEXT</span>
            <span className="mode-slider-text mode-slider-text-right">MIC</span>
          </button>
        </div>

        {inputMode === "text" ? (
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
              placeholder={sending ? "Versturen..." : "Typ een bericht…"}
              aria-label="Typ een bericht"
              disabled={sending || testing}
            />

            <button
              className={`send-button ${sending ? "sending" : ""}`}
              type="button"
              onClick={handleSend}
              disabled={!draft.trim() || testing || sending}
              aria-label="Verstuur bericht"
              title="Verstuur bericht"
            >
              {sending ? (
                <span className="send-progress" aria-hidden="true" />
              ) : (
                <svg
                  className="send-icon"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path
                    d="M2.2 12.9 13.2 8 2.2 3.1v3.4L9.4 8l-7.2 1.5v3.4Z"
                    fill="currentColor"
                  />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <div className="mic-mode-panel">
            {microphoneEnabled ? (
              <>
                <div className="input-meter" aria-label="Microfoon niveau">
                  <div
                    className="input-meter-fill"
                    style={{
                      width: `${Math.max(6, Math.min(100, inputLevel * 100))}%`,
                    }}
                  />
                </div>

                <div className="mic-transcript-preview" aria-live="polite">
                  {liveTranscript ||
                    "Microfoon actief - wacht op transcript..."}
                </div>
              </>
            ) : null}

            <div className="mic-controls">
              <select
                className="device-select"
                value={selectedDeviceId}
                onChange={handleDeviceChange}
                aria-label="Kies microfoon apparaat"
                disabled={testing}
              >
                {audioDevices.length === 0 ? (
                  <option value="">Geen microfoons gevonden</option>
                ) : (
                  audioDevices.map((device, index) => (
                    <option
                      key={
                        device.deviceId ||
                        `${device.label || "microfoon"}-${index}`
                      }
                      value={device.deviceId}
                    >
                      {device.label || `Microfoon ${index + 1}`}
                    </option>
                  ))
                )}
              </select>

              <button
                className={`mic-button ${microphoneEnabled ? "enabled" : ""}`}
                type="button"
                onClick={handleMicrophonePermission}
                disabled={testing}
                aria-label={
                  isListening ? "Spraakherkenning stoppen" : "Microfoon toegang"
                }
                title={
                  microphoneEnabled
                    ? isListening
                      ? "Spraakherkenning stoppen"
                      : "Microfoon uitzetten"
                    : "Microfoon toestemming vragen"
                }
              >
                {testing ? (
                  <svg
                    className="mic-icon"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <circle cx="8" cy="8" r="2.1" fill="currentColor" />
                  </svg>
                ) : (
                  <svg
                    className="mic-icon"
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                  >
                    <path
                      d="M8 1.2a2.6 2.6 0 0 1 2.6 2.6v4.2A2.6 2.6 0 1 1 5.4 8V3.8A2.6 2.6 0 0 1 8 1.2Zm0 6.1a1.1 1.1 0 0 0-1.1 1.1v.5c0 .6.5 1.1 1.1 1.1s1.1-.5 1.1-1.1v-.5A1.1 1.1 0 0 0 8 7.3Zm-4.1 1.2h1.2a2.8 2.8 0 0 0 5.8 0h1.2a4.1 4.1 0 0 1-3.6 4.05v1.45h-1.2v-1.45A4.1 4.1 0 0 1 3.9 8.5Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </button>

              <button
                className={`mute-button ${microphoneMuted ? "muted" : ""}`}
                type="button"
                onClick={handleMicrophoneMute}
                disabled={!microphoneEnabled || testing}
                aria-label="Microfoon dempen"
                title={microphoneMuted ? "Microfoon unmute" : "Microfoon mute"}
              >
                {microphoneMuted ? "MUTE" : "LIVE"}
              </button>
            </div>
          </div>
        )}

        <button
          className="clear-button"
          type="button"
          onClick={resetConversation}
          disabled={sending || testing}
          aria-label="Nieuwe conversatie"
          title="Nieuwe conversatie"
        >
          Nieuw
        </button>
      </div>
    </div>
  );
}
