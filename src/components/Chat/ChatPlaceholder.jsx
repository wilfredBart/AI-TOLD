export default function ChatPlaceholder() {
  return (
    <div className="chat-placeholder">
      <div className="messages">
        <div className="msg ai">
          Lokaal kanaal open. Voice en agents komen in de volgende fase.
        </div>
      </div>
      <div className="input-row">
        <input type="text" placeholder="Typ een bericht…" disabled />
        <button type="button" disabled>
          Send
        </button>
      </div>
    </div>
  );
}
