import { useState } from "react";
import "./App.css";
import TitleBar from "./components/TitleBar/TitleBar";
import AvatarView from "./components/Avatar/AvatarView";
import ChatPlaceholder from "./components/Chat/ChatPlaceholder";

function App() {
  const [pinned, setPinned] = useState(false);
  const [dock, setDock] = useState("float");

  return (
    <div className={`app-shell ${dock !== "float" ? "is-docked" : ""}`}>
      <div className="oled-scan" />
      <TitleBar
        pinned={pinned}
        setPinned={setPinned}
        dock={dock}
        setDock={setDock}
      />

      <main className="main-content">
        <section className="avatar-section">
          <AvatarView />
        </section>

        <section className="chat-section">
          <ChatPlaceholder />
        </section>
      </main>

      <footer className="status-bar">
        <span className="led" />
        <span>LOCAL</span>
        <span className="sep">/</span>
        <span>{pinned ? "PINNED" : "FREE"}</span>
        <span className="sep">/</span>
        <span>{dock === "float" ? "FLOAT" : `DOCK ${dock.toUpperCase()}`}</span>
        <span className="hotkey">Ctrl+Shift+Space</span>
      </footer>
    </div>
  );
}

export default App;
