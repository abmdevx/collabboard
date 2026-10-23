function normalizeRect(x, y, width, height) {
  const left = width < 0 ? x + width : x;
  const top = height < 0 ? y + height : y;
  const right = width < 0 ? x : x + width;
  const bottom = height < 0 ? y : y + height;

  return { left, top, right, bottom };
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

  return normalizeRect(element.x, element.y, element.width, element.height);
}

export function drawElement(ctx, element) {
  ctx.strokeStyle = element.color;
  ctx.lineWidth = element.strokeWidth || 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (element.type === "text") {
    ctx.fillStyle = element.color;
    ctx.font = `${element.fontSize || 24}px ${element.fontFamily || "Arial"}`;
    ctx.textBaseline = "top";
    ctx.fillText(element.text || "", element.x, element.y);
    return;
  }

  if (element.type === "rectangle") {
    ctx.strokeRect(element.x, element.y, element.width, element.height);
    return;
  }

  if (["ellipse", "triangle", "diamond", "arrow"].includes(element.type)) {
    const centerX = element.x + element.width / 2;
    const centerY = element.y + element.height / 2;
    const right = element.x + element.width;
    const bottom = element.y + element.height;

    ctx.beginPath();
    if (element.type === "ellipse") {
      ctx.ellipse(centerX, centerY, Math.abs(element.width / 2), Math.abs(element.height / 2), 0, 0, Math.PI * 2);
    } else if (element.type === "triangle") {
      ctx.moveTo(centerX, element.y);
      ctx.lineTo(right, bottom);
      ctx.lineTo(element.x, bottom);
      ctx.closePath();
    } else if (element.type === "diamond") {
      ctx.moveTo(centerX, element.y);
      ctx.lineTo(right, centerY);
      ctx.lineTo(centerX, bottom);
      ctx.lineTo(element.x, centerY);
      ctx.closePath();
    } else {
      const angle = Math.atan2(element.height, element.width);
      const headLength = Math.min(18, Math.max(8, Math.hypot(element.width, element.height) * 0.2));
      ctx.moveTo(element.x, element.y);
      ctx.lineTo(right, bottom);
      ctx.moveTo(right, bottom);
      ctx.lineTo(right - headLength * Math.cos(angle - Math.PI / 6), bottom - headLength * Math.sin(angle - Math.PI / 6));
      ctx.moveTo(right, bottom);
      ctx.lineTo(right - headLength * Math.cos(angle + Math.PI / 6), bottom - headLength * Math.sin(angle + Math.PI / 6));
    }
    ctx.stroke();
    return;
  }

  if (element.type === "line") {
    ctx.beginPath();
    ctx.moveTo(element.x, element.y);
    ctx.lineTo(element.x + element.width, element.y + element.height);
    ctx.stroke();
    return;
  }

  if (element.type === "pencil") {
    if (!element.points || element.points.length < 2) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(element.points[0].x, element.points[0].y);

    for (let i = 1; i < element.points.length; i += 1) {
      ctx.lineTo(element.points[i].x, element.points[i].y);
    }

    ctx.stroke();
  }
}

export function getElementAtPosition(elements, x, y) {
  const tolerance = 10;

  for (let i = elements.length - 1; i >= 0; i -= 1) {
    const element = elements[i];
    const bounds = getElementBounds(element);
    const inside =
      x >= bounds.left - tolerance &&
      x <= bounds.right + tolerance &&
      y >= bounds.top - tolerance &&
      y <= bounds.bottom + tolerance;

    if (inside) {
      return element;
    }
  }

  return null;
}

export function translateElement(element, dx, dy) {
  if (element.type === "pencil") {
    return {
      ...element,
      x: element.x + dx,
      y: element.y + dy,
      points: element.points.map((point) => ({
        x: point.x + dx,
        y: point.y + dy,
      })),
    };
  }

  return {
    ...element,
    x: element.x + dx,
    y: element.y + dy,
  };
}
