import type { CSSProperties } from 'react';

const gridStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(120,113,108,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,113,108,0.12) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
  opacity: 0.45
};

const gradientLayerStyle: CSSProperties = {
  background:
    'radial-gradient(circle at 12% 18%, rgba(194,65,12,0.28), transparent 34%), radial-gradient(circle at 85% 16%, rgba(154,52,18,0.2), transparent 36%), radial-gradient(circle at 50% 88%, rgba(251,191,36,0.18), transparent 42%), linear-gradient(180deg, rgba(255,251,247,0.9), rgba(255,251,247,0.98))'
};

export default function AppBackground() {
  return (
    <div className="app-background" aria-hidden="true">
      <div className="gradient-layer" style={gradientLayerStyle} />
      <div className="shape-grid-layer" style={gridStyle} />
    </div>
  );
}
