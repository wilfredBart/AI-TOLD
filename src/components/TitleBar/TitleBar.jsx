import { invoke } from "@tauri-apps/api/core";

function IconBtn({ title, active, onClick, children, danger }) {
  const stop = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  return (
    <button
      type="button"
      className={`icon-btn ${active ? "active" : ""} ${danger ? "danger" : ""}`}
      title={title}
      onMouseDown={stop}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export default function TitleBar({ pinned, setPinned, dock, setDock }) {
  const pin = async () => {
    const next = !pinned;
    await invoke("window_set_pinned", { pinned: next });
    setPinned(next);
  };

  const dockSide = async (side) => {
    await invoke("window_dock", { side });
    setDock(side);
  };

  const undock = async () => {
    await invoke("window_undock");
    setDock("float");
  };

  return (
    <div className="titlebar">
      <div className="titlebar-drag" data-tauri-drag-region>
        <span className="brand-mark" />
        <div className="titlebar-title">AI-TOLED</div>
      </div>

      <div className="titlebar-actions" data-tauri-drag-region="false">
        <IconBtn
          title={pinned ? "Always on top uit" : "Always on top"}
          active={pinned}
          onClick={pin}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path d="M8 1.5a.75.75 0 0 1 .75.75v6.19l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V2.25A.75.75 0 0 1 8 1.5Zm-5 11.25h10v1.5H3v-1.5Z" />
          </svg>
        </IconBtn>
        <IconBtn
          title="Dock links"
          active={dock === "left"}
          onClick={() => dockSide("left")}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path d="M2 3h12v10H2V3Zm1.5 1.5v7h3v-7h-3Z" />
          </svg>
        </IconBtn>
        <IconBtn
          title="Dock rechts"
          active={dock === "right"}
          onClick={() => dockSide("right")}
        >
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path d="M2 3h12v10H2V3Zm9.5 1.5v7h3v-7h-3Z" />
          </svg>
        </IconBtn>
        <IconBtn title="Zwevend venster" active={dock === "float"} onClick={undock}>
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path d="M3 3h10v10H3V3Zm1.5 1.5v7h7v-7h-7Z" />
          </svg>
        </IconBtn>

        <span className="action-split" />

        <IconBtn title="Minimaliseren" onClick={() => invoke("window_minimize")}>
          <span className="glyph">─</span>
        </IconBtn>
        <IconBtn
          title="Maximaliseren"
          onClick={() => invoke("window_toggle_maximize")}
        >
          <span className="glyph">□</span>
        </IconBtn>
        <IconBtn
          title="Verbergen naar tray"
          danger
          onClick={() => invoke("window_hide_to_tray")}
        >
          <span className="glyph">×</span>
        </IconBtn>
      </div>
    </div>
  );
}
