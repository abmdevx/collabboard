function getElementId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `el-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createElement({ tool, startX, startY, x, y, color, strokeWidth, userId, text = "", fontFamily = "Arial", fontSize = 24 }) {
  const base = {
    id: getElementId(),
    type: tool,
    x: startX,
    y: startY,
    width: x - startX,
    height: y - startY,
    points: [],
    color,
    strokeWidth,
    userId,
  };

  if (tool === "pencil") {
    return {
      ...base,
      points: [
        { x: startX, y: startY },
        { x, y },
      ],
    };
  }

  if (tool === "text") {
    return {
      ...base,
      text,
      fontFamily,
      fontSize,
      width: Math.max(24, text.length * fontSize * 0.55),
      height: fontSize,
    };
  }

  return base;
}

export function updateDraftElement(element, x, y) {
  if (!element) {
    return null;
  }

  if (element.type === "pencil") {
    return {
      ...element,
      points: [...element.points, { x, y }],
    };
  }

  return {
    ...element,
    width: x - element.x,
    height: y - element.y,
  };
}
