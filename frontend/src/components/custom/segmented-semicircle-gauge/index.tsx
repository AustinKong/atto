import { Box } from '@chakra-ui/react';

import { Tooltip } from '@/components/ui/Tooltip';

// Segment bar width and gap in degrees
const BAR_DEG = 4;
const GAP_DEG = 3;
const TOTAL_DEG = BAR_DEG + GAP_DEG;

// Ring geometry (SVG units, viewBox is 200×110)
const CX = 100;
const CY = 100;
const OUTER_R = 90;
const INNER_R = 62;

const RED = 'var(--chakra-colors-fg-error)';
const YELLOW = 'var(--chakra-colors-fg-warning)';
const GREEN = 'var(--chakra-colors-fg-success)';
const EMPTY = 'var(--chakra-colors-bg-emphasized)';

// Convert polar angle (0° = left, 180° = right, sweeping top) to SVG x/y
function polarToCart(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Build an SVG arc path for a single segment spanning [startDeg, endDeg]
function segmentPath(startDeg: number, endDeg: number): string {
  const o0 = polarToCart(CX, CY, OUTER_R, startDeg);
  const o1 = polarToCart(CX, CY, OUTER_R, endDeg);
  const i0 = polarToCart(CX, CY, INNER_R, endDeg);
  const i1 = polarToCart(CX, CY, INNER_R, startDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${o0.x} ${o0.y}`,
    `A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${o1.x} ${o1.y}`,
    `L ${i0.x} ${i0.y}`,
    `A ${INNER_R} ${INNER_R} 0 ${large} 0 ${i1.x} ${i1.y}`,
    'Z',
  ].join(' ');
}

// Color for a segment starting at angleDeg out of 180
function colorForAngle(angleDeg: number, fillDeg: number): string {
  if (angleDeg >= fillDeg) return EMPTY;
  if (angleDeg < 60) return RED;
  if (angleDeg < 120) return YELLOW;
  return GREEN;
}

export function SegmentedSemicircleGauge({ percent = 0 }: { percent: number }) {
  const clamped = Math.min(1, Math.max(0, percent));
  const percentAsPercentage = Math.round(clamped * 100);
  const fillDeg = clamped * 180;

  const segments = [];
  for (let start = 0; start < 180; start += TOTAL_DEG) {
    const end = Math.min(start + BAR_DEG, 180);
    segments.push({
      path: segmentPath(start, end),
      color: colorForAngle(start, fillDeg),
    });
  }

  return (
    <Tooltip content={`${percentAsPercentage}% Match`}>
      <Box w="full">
        <svg
          viewBox="0 0 200 110"
          style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
          aria-hidden
        >
          {segments.map(({ path, color }, i) => (
            <path key={i} d={path} fill={color} />
          ))}

          <text
            x="100"
            y="95"
            textAnchor="middle"
            fill="currentColor"
            style={{
              fontSize: '36px',
              fontWeight: 'bold',
              fontFamily: 'inherit',
            }}
          >
            {percentAsPercentage}%
          </text>
        </svg>
      </Box>
    </Tooltip>
  );
}
