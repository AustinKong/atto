import { type TooltipAnchor, useTooltipState } from '@nivo/tooltip';
import { type CSSProperties, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const TOOLTIP_OFFSET = 14;
const TOOLTIP_Z_INDEX = 2147483647;

type TooltipSize = {
  width: number;
  height: number;
};

type ChartRect = {
  left: number;
  top: number;
};

function getChartContainer(element: SVGGElement | null) {
  return element?.ownerSVGElement?.parentElement ?? null;
}

function getAnchoredPosition({
  anchor,
  position,
  size,
}: {
  anchor: TooltipAnchor | null;
  position: [number, number];
  size: TooltipSize;
}) {
  let [x, y] = position.map(Math.round) as [number, number];

  if (anchor === 'top') {
    x -= size.width / 2;
    y -= size.height + TOOLTIP_OFFSET;
  } else if (anchor === 'right') {
    x += TOOLTIP_OFFSET;
    y -= size.height / 2;
  } else if (anchor === 'bottom') {
    x -= size.width / 2;
    y += TOOLTIP_OFFSET;
  } else if (anchor === 'left') {
    x -= size.width + TOOLTIP_OFFSET;
    y -= size.height / 2;
  } else if (anchor === 'center') {
    x -= size.width / 2;
    y -= size.height / 2;
  }

  return { x, y };
}

export function NivoTooltipPortalLayer() {
  const layerRef = useRef<SVGGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipState = useTooltipState();
  const [chartRect, setChartRect] = useState<ChartRect | null>(null);
  const [tooltipSize, setTooltipSize] = useState<TooltipSize>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!tooltipState.isVisible) {
      return;
    }

    function updateChartRect() {
      const rect = getChartContainer(layerRef.current)?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setChartRect((current) =>
        current?.left === rect.left && current.top === rect.top
          ? current
          : { left: rect.left, top: rect.top }
      );
    }

    updateChartRect();
    window.addEventListener('resize', updateChartRect);
    window.addEventListener('scroll', updateChartRect, true);

    return () => {
      window.removeEventListener('resize', updateChartRect);
      window.removeEventListener('scroll', updateChartRect, true);
    };
  }, [tooltipState.isVisible]);

  useLayoutEffect(() => {
    if (!tooltipState.isVisible) {
      return;
    }

    const rect = tooltipRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    setTooltipSize((current) =>
      current.width === rect.width && current.height === rect.height
        ? current
        : { width: rect.width, height: rect.height }
    );
  }, [chartRect, tooltipState]);

  const portalStyle = useMemo<CSSProperties>(() => {
    if (!tooltipState.isVisible) {
      return { display: 'none' };
    }

    const { x, y } = getAnchoredPosition({
      anchor: tooltipState.anchor,
      position: tooltipState.position,
      size: tooltipSize,
    });
    const left = chartRect?.left ?? 0;
    const top = chartRect?.top ?? 0;

    return {
      left: 0,
      opacity: chartRect && tooltipSize.width > 0 && tooltipSize.height > 0 ? 1 : 0,
      pointerEvents: 'none',
      position: 'fixed',
      top: 0,
      transform: `translate(${left + x}px, ${top + y}px)`,
      zIndex: TOOLTIP_Z_INDEX,
    };
  }, [chartRect, tooltipSize, tooltipState]);

  return (
    <>
      <g ref={layerRef} pointerEvents="none" />
      {tooltipState.isVisible &&
        createPortal(
          <div ref={tooltipRef} className="atto-nivo-tooltip" style={portalStyle}>
            {tooltipState.content}
          </div>,
          document.body
        )}
    </>
  );
}
