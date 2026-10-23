import { createElement as createIconElement, useState } from "react";
import { ALargeSmall, Eraser, Minus, MousePointer2, Palette, Pencil, Redo2, Ruler, Save, Shapes, TextCursorInput, Trash2, Type, Undo2 } from "lucide-react";

export function Toolbar({
  onClear,
  onSave,
  selectedTool,
  onToolChange,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  fontFamily,
  onFontFamilyChange,
  fontSize,
  onFontSizeChange,
}) {
  const [openControl, setOpenControl] = useState(null);
  const minFontSize = 10;
  const maxFontSize = 72;
  const minStrokeWidth = 1;
  const maxStrokeWidth = 12;
  const tools = [
    ["select", "Select", MousePointer2],
    ["pencil", "Pencil", Pencil],
    ["line", "Line", Minus],
    ["eraser", "Eraser", Eraser],
    ["text", "Text", TextCursorInput],
  ];

  return (
    <div className="toolbar-panel relative z-40 flex w-full flex-wrap items-center gap-2 overflow-visible rounded-2xl border border-zinc-700/30 bg-zinc-950/80 p-3 text-zinc-100 shadow-xl backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        {tools.map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            onClick={() => onToolChange(value)}
            className={`rounded-lg p-2 ${selectedTool === value ? "bg-sky-400 text-zinc-950" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}
            title={label}
            aria-label={label}
          >
            {createIconElement(Icon, { size: 16, "aria-hidden": true })}
          </button>
        ))}
        <label className={`flex items-center gap-2 rounded-lg p-2 ${["rectangle", "ellipse", "triangle", "diamond", "arrow"].includes(selectedTool) ? "bg-sky-400 text-zinc-950" : "bg-zinc-800 text-zinc-200"}`} title="Choose shape">
          <Shapes size={16} aria-hidden="true" />
          <select
            value={["rectangle", "ellipse", "triangle", "diamond", "arrow"].includes(selectedTool) ? selectedTool : ""}
            onChange={(event) => onToolChange(event.target.value)}
            className="rounded bg-zinc-900 px-1 font-medium text-zinc-100 outline-none"
            aria-label="Choose a shape"
          >
            <option value="" disabled className="bg-zinc-900 text-zinc-100">
              Choose
            </option>
            <option value="rectangle" className="bg-zinc-900 text-zinc-100">Rectangle</option>
            <option value="ellipse" className="bg-zinc-900 text-zinc-100">Ellipse</option>
            <option value="triangle" className="bg-zinc-900 text-zinc-100">Triangle</option>
            <option value="diamond" className="bg-zinc-900 text-zinc-100">Diamond</option>
            <option value="arrow" className="bg-zinc-900 text-zinc-100">Arrow</option>
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-lg bg-zinc-800 p-2" title="Choose color">
          <Palette size={16} aria-hidden="true" />
          <input type="color" value={color} onChange={(event) => onColorChange(event.target.value)} />
        </label>
        <label className="flex items-center gap-2 rounded-lg bg-zinc-800 p-2" title="Choose font">
          <Type size={16} aria-hidden="true" />
          <select
            value={fontFamily}
            onChange={(event) => onFontFamilyChange(event.target.value)}
            className="rounded bg-zinc-900 px-1 font-medium text-zinc-100 outline-none"
            aria-label="Choose text font"
          >
            <option value="Arial" className="bg-zinc-900 text-zinc-100">Arial</option>
            <option value="Georgia" className="bg-zinc-900 text-zinc-100">Georgia</option>
            <option value="Courier New" className="bg-zinc-900 text-zinc-100">Courier New</option>
            <option value="Verdana" className="bg-zinc-900 text-zinc-100">Verdana</option>
            <option value="Trebuchet MS" className="bg-zinc-900 text-zinc-100">Trebuchet MS</option>
          </select>
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenControl((current) => (current === "fontSize" ? null : "fontSize"))}
            className={`rounded-lg p-2 ${openControl === "fontSize" ? "bg-sky-400 text-zinc-950" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}
            title={`Text size: ${fontSize}px`}
            aria-label={`Choose text size, currently ${fontSize} pixels`}
            aria-expanded={openControl === "fontSize"}
          >
            <ALargeSmall size={16} aria-hidden="true" />
          </button>
          {openControl === "fontSize" ? (
            <div className="absolute left-0 top-full z-30 mt-2 flex w-52 flex-col gap-2 rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>Text size</span>
                <span>{fontSize}px</span>
              </div>
              <input
                type="range"
                min={minFontSize}
                max={maxFontSize}
                value={fontSize}
                onChange={(event) => onFontSizeChange(Number(event.target.value))}
                aria-label="Choose text size"
              />
              <input
                type="number"
                min={minFontSize}
                max={maxFontSize}
                value={fontSize}
                onChange={(event) => {
                  const value = Math.min(maxFontSize, Math.max(minFontSize, Number(event.target.value) || minFontSize));
                  onFontSizeChange(value);
                }}
                className="w-full rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-sky-400"
                aria-label="Enter text size in pixels"
              />
              <span className="text-[11px] text-zinc-500">Allowed: {minFontSize}-{maxFontSize}px</span>
            </div>
          ) : null}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenControl((current) => (current === "strokeWidth" ? null : "strokeWidth"))}
            className={`rounded-lg p-2 ${openControl === "strokeWidth" ? "bg-sky-400 text-zinc-950" : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"}`}
            title={`Stroke width: ${strokeWidth}px`}
            aria-label={`Choose stroke width, currently ${strokeWidth} pixels`}
            aria-expanded={openControl === "strokeWidth"}
          >
            <Ruler size={16} aria-hidden="true" />
          </button>
          {openControl === "strokeWidth" ? (
            <div className="absolute left-0 top-full z-30 mt-2 flex w-52 flex-col gap-2 rounded-lg border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span>Stroke width</span>
                <span>{strokeWidth}px</span>
              </div>
              <input
                type="range"
                min={minStrokeWidth}
                max={maxStrokeWidth}
                value={strokeWidth}
                onChange={(event) => onStrokeWidthChange(Number(event.target.value))}
                aria-label="Choose stroke width"
              />
              <input
                type="number"
                min={minStrokeWidth}
                max={maxStrokeWidth}
                value={strokeWidth}
                onChange={(event) => {
                  const value = Math.min(maxStrokeWidth, Math.max(minStrokeWidth, Number(event.target.value) || minStrokeWidth));
                  onStrokeWidthChange(value);
                }}
                className="w-full rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-sky-400"
                aria-label="Enter stroke width in pixels"
              />
              <span className="text-[11px] text-zinc-500">Allowed: {minStrokeWidth}-{maxStrokeWidth}px</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={onUndo} className="rounded-lg bg-zinc-700 p-2 hover:bg-zinc-600" title="Undo" aria-label="Undo">
          <Undo2 size={16} aria-hidden="true" />
        </button>
        <button type="button" onClick={onRedo} className="rounded-lg bg-zinc-700 p-2 hover:bg-zinc-600" title="Redo" aria-label="Redo">
          <Redo2 size={16} aria-hidden="true" />
        </button>
        <button type="button" onClick={onClear} className="rounded-lg bg-rose-500 p-2 text-white hover:bg-rose-400" title="Clear whiteboard" aria-label="Clear whiteboard">
          <Trash2 size={16} aria-hidden="true" />
        </button>
        <button type="button" onClick={onSave} className="rounded-lg bg-emerald-500 p-2 text-zinc-900 hover:bg-emerald-400" title="Save whiteboard" aria-label="Save whiteboard">
          <Save size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
