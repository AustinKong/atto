import ShapeGrid from './ShapeGrid';

import './AppBackground.css';

export default function AppBackground() {
  return (
    <div className="app-background" aria-hidden="true">
      <div className="shape-grid-layer">
        <ShapeGrid
          borderColor="rgba(28, 25, 23, 0.24)"
          direction="diagonal"
          interactive={false}
          fillViewport
          shape="square"
          speed={0.28}
          squareSize={44}
        />
      </div>
      <div className="background-vignette" />
    </div>
  );
}
