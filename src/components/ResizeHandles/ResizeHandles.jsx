import { getCurrentWindow } from "@tauri-apps/api/window";

const dirs = [
  "north",
  "south",
  "east",
  "west",
  "northEast",
  "northWest",
  "southEast",
  "southWest",
];

export default function ResizeHandles() {
  const start = (dir) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const win = getCurrentWindow();
    if (typeof win.startResizeDragging === "function") {
      win.startResizeDragging(dir).catch(() => {});
    }
  };

  return (
    <>
      {dirs.map((dir) => (
        <div
          key={dir}
          className={`resize-handle rh-${dir}`}
          onMouseDown={start(dir)}
        />
      ))}
    </>
  );
}
