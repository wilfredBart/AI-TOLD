import { invoke } from "@tauri-apps/api/core";

export default function WindowControls() {
  const stopDrag = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const minimize = (e) => {
    e.stopPropagation();
    invoke("window_minimize").catch(console.error);
  };

  const toggleMaximize = (e) => {
    e.stopPropagation();
    invoke("window_toggle_maximize").catch(console.error);
  };

  const hideToTray = (e) => {
    e.stopPropagation();
    invoke("window_hide_to_tray").catch(console.error);
  };

  return (
    <div className="window-controls" data-tauri-drag-region="false">
      <button
        type="button"
        className="ctrl-btn"
        title="Minimize"
        onMouseDown={stopDrag}
        onClick={minimize}
      >
        ─
      </button>
      <button
        type="button"
        className="ctrl-btn"
        title="Maximize"
        onMouseDown={stopDrag}
        onClick={toggleMaximize}
      >
        □
      </button>
      <button
        type="button"
        className="ctrl-btn close"
        title="Hide to tray"
        onMouseDown={stopDrag}
        onClick={hideToTray}
      >
        ×
      </button>
    </div>
  );
}
