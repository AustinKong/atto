import { useEffect, useRef } from 'react';

import './ShapeGrid.css';

type GridDirection = 'diagonal' | 'down' | 'left' | 'right' | 'up';
type GridShape = 'circle' | 'hexagon' | 'square' | 'triangle';

type GridCell = {
  x: number;
  y: number;
};

type ShapeGridProps = {
  direction?: GridDirection;
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  shape?: GridShape;
  hoverTrailAmount?: number;
  interactive?: boolean;
  className?: string;
};

function getWrappedOffset(value: number, size: number) {
  return ((value % size) + size) % size;
}

export default function ShapeGrid({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 40,
  hoverFillColor = '#222',
  shape = 'square',
  hoverTrailAmount = 0,
  interactive = true,
  className = ''
}: ShapeGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef(0);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquare = useRef<GridCell | null>(null);
  const trailCells = useRef<GridCell[]>([]);
  const cellOpacities = useRef(new Map<string, number>());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx) {
      return;
    }

    const isHex = shape === 'hexagon';
    const isTriangle = shape === 'triangle';
    const hexHorizontal = squareSize * 1.5;
    const hexVertical = squareSize * Math.sqrt(3);

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawHex(cx: number, cy: number, size: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI / 3) * i;
        const vx = cx + size * Math.cos(angle);
        const vy = cy + size * Math.sin(angle);

        if (i === 0) {
          ctx.moveTo(vx, vy);
        } else {
          ctx.lineTo(vx, vy);
        }
      }
      ctx.closePath();
    }

    function drawCircle(cx: number, cy: number, size: number) {
      ctx.beginPath();
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
      ctx.closePath();
    }

    function drawTriangle(cx: number, cy: number, size: number, flip: boolean) {
      ctx.beginPath();
      if (flip) {
        ctx.moveTo(cx, cy + size / 2);
        ctx.lineTo(cx + size / 2, cy - size / 2);
        ctx.lineTo(cx - size / 2, cy - size / 2);
      } else {
        ctx.moveTo(cx, cy - size / 2);
        ctx.lineTo(cx + size / 2, cy + size / 2);
        ctx.lineTo(cx - size / 2, cy + size / 2);
      }
      ctx.closePath();
    }

    function updateCellOpacities() {
      const targets = new Map<string, number>();

      if (interactive && hoveredSquare.current) {
        targets.set(`${hoveredSquare.current.x},${hoveredSquare.current.y}`, 1);
      }

      if (interactive && hoverTrailAmount > 0) {
        trailCells.current.forEach((cell, index) => {
          const key = `${cell.x},${cell.y}`;

          if (!targets.has(key)) {
            targets.set(key, (trailCells.current.length - index) / (trailCells.current.length + 1));
          }
        });
      }

      targets.forEach((_target, key) => {
        if (!cellOpacities.current.has(key)) {
          cellOpacities.current.set(key, 0);
        }
      });

      cellOpacities.current.forEach((opacity, key) => {
        const target = targets.get(key) || 0;
        const next = opacity + (target - opacity) * 0.15;

        if (next < 0.005) {
          cellOpacities.current.delete(key);
        } else {
          cellOpacities.current.set(key, next);
        }
      });
    }

    function drawCellFill(cellKey: string, draw: () => void) {
      const alpha = cellOpacities.current.get(cellKey);

      if (!alpha) {
        return;
      }

      ctx.globalAlpha = alpha;
      draw();
      ctx.fillStyle = hoverFillColor;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    function drawGrid() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = borderColor;

      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHorizontal);
        const offsetX = getWrappedOffset(gridOffset.current.x, hexHorizontal);
        const offsetY = getWrappedOffset(gridOffset.current.y, hexVertical);
        const cols = Math.ceil(width / hexHorizontal) + 3;
        const rows = Math.ceil(height / hexVertical) + 3;

        for (let col = -2; col < cols; col += 1) {
          for (let row = -2; row < rows; row += 1) {
            const cx = col * hexHorizontal + offsetX;
            const rowOffset = (col + colShift) % 2 !== 0 ? hexVertical / 2 : 0;
            const cy = row * hexVertical + rowOffset + offsetY;
            const cellKey = `${col},${row}`;

            drawCellFill(cellKey, () => drawHex(cx, cy, squareSize));
            drawHex(cx, cy, squareSize);
            ctx.stroke();
          }
        }
      } else if (isTriangle) {
        const halfWidth = squareSize / 2;
        const colShift = Math.floor(gridOffset.current.x / halfWidth);
        const rowShift = Math.floor(gridOffset.current.y / squareSize);
        const offsetX = getWrappedOffset(gridOffset.current.x, halfWidth);
        const offsetY = getWrappedOffset(gridOffset.current.y, squareSize);
        const cols = Math.ceil(width / halfWidth) + 4;
        const rows = Math.ceil(height / squareSize) + 4;

        for (let col = -2; col < cols; col += 1) {
          for (let row = -2; row < rows; row += 1) {
            const cx = col * halfWidth + offsetX;
            const cy = row * squareSize + squareSize / 2 + offsetY;
            const flip = ((col + colShift + row + rowShift) % 2 + 2) % 2 !== 0;
            const cellKey = `${col},${row}`;

            drawCellFill(cellKey, () => drawTriangle(cx, cy, squareSize, flip));
            drawTriangle(cx, cy, squareSize, flip);
            ctx.stroke();
          }
        }
      } else if (shape === 'circle') {
        const offsetX = getWrappedOffset(gridOffset.current.x, squareSize);
        const offsetY = getWrappedOffset(gridOffset.current.y, squareSize);
        const cols = Math.ceil(width / squareSize) + 3;
        const rows = Math.ceil(height / squareSize) + 3;

        for (let col = -2; col < cols; col += 1) {
          for (let row = -2; row < rows; row += 1) {
            const cx = col * squareSize + squareSize / 2 + offsetX;
            const cy = row * squareSize + squareSize / 2 + offsetY;
            const cellKey = `${col},${row}`;

            drawCellFill(cellKey, () => drawCircle(cx, cy, squareSize));
            drawCircle(cx, cy, squareSize);
            ctx.stroke();
          }
        }
      } else {
        const offsetX = getWrappedOffset(gridOffset.current.x, squareSize);
        const offsetY = getWrappedOffset(gridOffset.current.y, squareSize);
        const cols = Math.ceil(width / squareSize) + 3;
        const rows = Math.ceil(height / squareSize) + 3;

        for (let col = -2; col < cols; col += 1) {
          for (let row = -2; row < rows; row += 1) {
            const x = col * squareSize + offsetX;
            const y = row * squareSize + offsetY;
            const cellKey = `${col},${row}`;

            const alpha = cellOpacities.current.get(cellKey);
            if (alpha) {
              ctx.globalAlpha = alpha;
              ctx.fillStyle = hoverFillColor;
              ctx.fillRect(x, y, squareSize, squareSize);
              ctx.globalAlpha = 1;
            }

            ctx.strokeRect(x, y, squareSize, squareSize);
          }
        }
      }
    }

    function updateAnimation() {
      const effectiveSpeed = Math.max(speed, 0.1);
      const wrapX = isHex ? hexHorizontal * 2 : squareSize;
      const wrapY = isHex ? hexVertical : isTriangle ? squareSize * 2 : squareSize;

      switch (direction) {
        case 'right':
          gridOffset.current.x = getWrappedOffset(gridOffset.current.x - effectiveSpeed, wrapX);
          break;
        case 'left':
          gridOffset.current.x = getWrappedOffset(gridOffset.current.x + effectiveSpeed, wrapX);
          break;
        case 'up':
          gridOffset.current.y = getWrappedOffset(gridOffset.current.y + effectiveSpeed, wrapY);
          break;
        case 'down':
          gridOffset.current.y = getWrappedOffset(gridOffset.current.y - effectiveSpeed, wrapY);
          break;
        case 'diagonal':
          gridOffset.current.x = getWrappedOffset(gridOffset.current.x - effectiveSpeed, wrapX);
          gridOffset.current.y = getWrappedOffset(gridOffset.current.y - effectiveSpeed, wrapY);
          break;
      }

      updateCellOpacities();
      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    }

    function setHoveredCell(cell: GridCell) {
      if (hoveredSquare.current?.x === cell.x && hoveredSquare.current.y === cell.y) {
        return;
      }

      if (hoveredSquare.current && hoverTrailAmount > 0) {
        trailCells.current.unshift({ ...hoveredSquare.current });
        trailCells.current.length = Math.min(trailCells.current.length, hoverTrailAmount);
      }

      hoveredSquare.current = cell;
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      if (isHex) {
        const colShift = Math.floor(gridOffset.current.x / hexHorizontal);
        const offsetX = getWrappedOffset(gridOffset.current.x, hexHorizontal);
        const offsetY = getWrappedOffset(gridOffset.current.y, hexVertical);
        const adjustedX = mouseX - offsetX;
        const adjustedY = mouseY - offsetY;
        const col = Math.round(adjustedX / hexHorizontal);
        const rowOffset = (col + colShift) % 2 !== 0 ? hexVertical / 2 : 0;
        const row = Math.round((adjustedY - rowOffset) / hexVertical);

        setHoveredCell({ x: col, y: row });
      } else if (isTriangle) {
        const halfWidth = squareSize / 2;
        const offsetX = getWrappedOffset(gridOffset.current.x, halfWidth);
        const offsetY = getWrappedOffset(gridOffset.current.y, squareSize);
        const col = Math.round((mouseX - offsetX) / halfWidth);
        const row = Math.floor((mouseY - offsetY) / squareSize);

        setHoveredCell({ x: col, y: row });
      } else if (shape === 'circle') {
        const offsetX = getWrappedOffset(gridOffset.current.x, squareSize);
        const offsetY = getWrappedOffset(gridOffset.current.y, squareSize);
        const col = Math.round((mouseX - offsetX) / squareSize);
        const row = Math.round((mouseY - offsetY) / squareSize);

        setHoveredCell({ x: col, y: row });
      } else {
        const offsetX = getWrappedOffset(gridOffset.current.x, squareSize);
        const offsetY = getWrappedOffset(gridOffset.current.y, squareSize);
        const col = Math.floor((mouseX - offsetX) / squareSize);
        const row = Math.floor((mouseY - offsetY) / squareSize);

        setHoveredCell({ x: col, y: row });
      }
    }

    function handlePointerLeave() {
      if (hoveredSquare.current && hoverTrailAmount > 0) {
        trailCells.current.unshift({ ...hoveredSquare.current });
        trailCells.current.length = Math.min(trailCells.current.length, hoverTrailAmount);
      }

      hoveredSquare.current = null;
    }

    const resizeObserver = new ResizeObserver(resizeCanvas);

    resizeObserver.observe(canvas);
    resizeCanvas();
    if (interactive) {
      canvas.addEventListener('pointermove', handlePointerMove);
      canvas.addEventListener('pointerleave', handlePointerLeave);
    }
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(requestRef.current);
      if (interactive) {
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerleave', handlePointerLeave);
      }
    };
  }, [
    borderColor,
    direction,
    hoverFillColor,
    hoverTrailAmount,
    interactive,
    shape,
    speed,
    squareSize
  ]);

  return <canvas ref={canvasRef} className={`shapegrid-canvas ${className}`.trim()} />;
}
