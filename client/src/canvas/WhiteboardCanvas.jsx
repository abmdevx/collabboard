import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import throttle from "lodash.throttle";
import { createElement, updateDraftElement } from "../utils/elementFactory";
import { drawElement, getElementAtPosition, translateElement } from "../utils/geometry";

function getCanvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

function getElementBounds(element) {
  if (element.type === "pencil" && element.points?.length) {
    const xs = element.points.map((point) => point.x);
    const ys = element.points.map((point) => point.y);
    return {
      left: Math.min(...xs),
      top: Math.min(...ys),
      right: Math.max(...xs),
      bottom: Math.max(...ys),
    };
  }

  const right = element.x + element.width;
  const bottom = element.y + element.height;

  return {
    left: Math.min(element.x, right),
    top: Math.min(element.y, bottom),
    right: Math.max(element.x, right),
    bottom: Math.max(element.y, bottom),
  };
}

function drawSelectionGuides(context, elements) {
  context.save();
  context.strokeStyle = "#0ea5e9";
  context.fillStyle = "rgba(14, 165, 233, 0.08)";
  context.lineWidth = 1;
  context.setLineDash([5, 4]);

  elements.forEach((element) => {
    const bounds = getElementBounds(element);
    const padding = 6;
    const width = Math.max(bounds.right - bounds.left + padding * 2, 12);
    const height = Math.max(bounds.bottom - bounds.top + padding * 2, 12);
    context.fillRect(bounds.left - padding, bounds.top - padding, width, height);
    context.strokeRect(bounds.left - padding, bounds.top - padding, width, height);
  });

  context.restore();
}

function drawScene(canvas, elements, showSelectionGuides = false) {
  const context = canvas.getContext("2d");
  const scale = window.devicePixelRatio || 1;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.save();
  context.scale(scale, scale);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  elements.forEach((element) => drawElement(context, element));
  if (showSelectionGuides) {
    drawSelectionGuides(context, elements);
  }
  context.restore();
}

function getCanvasCursor(tool) {
  if (tool === "pencil") {
    const pencilSvg = encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="m5 27 5.5-1.3L26 10.2a3.2 3.2 0 0 0-4.5-4.5L6 21.2 5 27Z" fill="#facc15" stroke="#18181b" stroke-width="2"/><path d="m19 7 6 6" stroke="#18181b" stroke-width="2"/></svg>'
    );
    return `url("data:image/svg+xml,${pencilSvg}") 3 28, crosshair`;
  }

  if (["rectangle", "ellipse", "triangle", "diamond", "arrow", "line"].includes(tool)) return "crosshair";
  if (tool === "eraser") return "cell";
  return "default";
}

function shouldShowItemGuides(tool) {
  return tool === "select" || tool === "eraser";
}

export function WhiteboardCanvas({
  elements,
  roomId,
  socket,
  setElements,
  selectedTool,
  color,
  strokeWidth,
  userId,
  fontFamily,
  fontSize,
}) {
  const canvasRef = useRef(null);
  const draftRef = useRef(null);
  const dragRef = useRef(null);
  const textEditorRef = useRef(null);
  const textInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textEditor, setTextEditor] = useState(null);

  const emitCursor = useMemo(
    () =>
      throttle((x, y) => {
        socket?.emit("CURSOR_MOVE", { roomId, cursor: { x, y } });
      }, 60),
    [roomId, socket]
  );

  const emitSceneChange = useMemo(
    () =>
      throttle(
        (nextElements) => socket?.emit("SCENE_CHANGE", { roomId, elements: nextElements }),
        120
      ),
    [roomId, socket]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    function resize() {
      const scale = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * scale;
      canvas.height = canvas.clientHeight * scale;
      drawScene(canvas, elements, shouldShowItemGuides(selectedTool));
    }

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [elements, selectedTool]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawScene(canvas, elements, shouldShowItemGuides(selectedTool));
  }, [elements, selectedTool]);

  useEffect(() => {
    if (selectedTool !== "text" && textEditorRef.current) {
      textEditorRef.current = null;
      setTextEditor(null);
    }
  }, [selectedTool]);

  useLayoutEffect(() => {
    if (textEditor) {
      textInputRef.current?.focus();
    }
  }, [textEditor]);

  useEffect(
    () => () => {
      emitCursor.cancel();
      emitSceneChange.cancel();
    },
    [emitCursor, emitSceneChange]
  );

  function updateElements(nextElements) {
    setElements(nextElements, { record: true });
    emitSceneChange(nextElements);
  }

  function commitText(value = textEditorRef.current?.value) {
    const editor = textEditorRef.current;
    if (!editor || !value?.trim()) {
      textEditorRef.current = null;
      setTextEditor(null);
      return;
    }

    updateElements([
      ...elements,
      createElement({
        tool: "text",
        startX: editor.x,
        startY: editor.y,
        x: editor.x,
        y: editor.y,
        color,
        strokeWidth,
        userId,
        text: value.trim(),
        fontFamily,
        fontSize,
      }),
    ]);
    textEditorRef.current = null;
    setTextEditor(null);
  }

  function handlePointerDown(event) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = getCanvasPoint(canvas, event);

    if (textEditorRef.current) {
      commitText();
    }

    if (selectedTool === "select") {
      canvas.setPointerCapture(event.pointerId);
      setIsDrawing(true);
      const selected = getElementAtPosition(elements, point.x, point.y);
      if (selected) dragRef.current = { selected, start: point };
      return;
    }

    if (selectedTool === "eraser") {
      canvas.setPointerCapture(event.pointerId);
      setIsDrawing(true);
      const selected = getElementAtPosition(elements, point.x, point.y);
      if (selected) updateElements(elements.filter((element) => element.id !== selected.id));
      return;
    }

    if (selectedTool === "text") {
      event.preventDefault();
      textEditorRef.current = { x: point.x, y: point.y, value: "" };
      setTextEditor(textEditorRef.current);
      setIsDrawing(false);
      return;
    }

    canvas.setPointerCapture(event.pointerId);
    setIsDrawing(true);
    draftRef.current = createElement({
      tool: selectedTool,
      startX: point.x,
      startY: point.y,
      x: point.x,
      y: point.y,
      color,
      strokeWidth,
      userId,
    });
  }

  function handlePointerMove(event) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = getCanvasPoint(canvas, event);
    emitCursor(point.x, point.y);

    if (!isDrawing) return;
    if (selectedTool === "select" && dragRef.current) {
      const { selected, start } = dragRef.current;
      const dx = point.x - start.x;
      const dy = point.y - start.y;
      const nextElements = elements.map((element) =>
        element.id === selected.id ? translateElement(selected, dx, dy) : element
      );
      drawScene(canvas, nextElements, true);
      return;
    }

    if (draftRef.current) {
      draftRef.current = updateDraftElement(draftRef.current, point.x, point.y);
      drawScene(canvas, [...elements, draftRef.current], shouldShowItemGuides(selectedTool));
    }
  }

  function handlePointerUp(event) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = getCanvasPoint(canvas, event);
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    setIsDrawing(false);

    if (selectedTool === "select" && dragRef.current) {
      const { selected, start } = dragRef.current;
      const nextElements = elements.map((element) =>
        element.id === selected.id
          ? translateElement(selected, point.x - start.x, point.y - start.y)
          : element
      );
      dragRef.current = null;
      if (point.x !== start.x || point.y !== start.y) updateElements(nextElements);
      return;
    }

    if (draftRef.current) {
      const nextElements = [...elements, draftRef.current];
      draftRef.current = null;
      updateElements(nextElements);
    }
  }

  return (
    <div className="relative h-[calc(100vh-180px)] min-h-[420px] w-full overflow-hidden rounded-2xl border border-zinc-700/30 bg-white">
      {textEditor ? (
        <input
          ref={textInputRef}
          value={textEditor.value}
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => {
            const value = event.target.value;
            textEditorRef.current = { ...textEditorRef.current, value };
            setTextEditor((current) => ({ ...current, value }));
          }}
          onBlur={commitText}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitText(event.currentTarget.value);
            }
            if (event.key === "Escape") {
              textEditorRef.current = null;
              setTextEditor(null);
            }
          }}
          placeholder="Type here..."
          className="absolute z-20 min-w-[140px] rounded border border-sky-400 bg-white px-2 py-1 text-base text-zinc-900 shadow-lg outline-none caret-sky-600"
          style={{
            left: textEditor.x,
            top: textEditor.y,
            fontFamily,
            fontSize,
            color,
          }}
          aria-label="Enter whiteboard text"
        />
      ) : null}
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        style={{ cursor: getCanvasCursor(selectedTool) }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      />
    </div>
  );
}
