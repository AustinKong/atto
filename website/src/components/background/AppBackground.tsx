import ShapeGrid from './ShapeGrid';

import './AppBackground.css';

export default function AppBackground() {
  return (
    <div className="app-background" aria-hidden="true">
      <div className="gradient-layer">
        {/* <Grainient
          color1="#ffd29d"
          color2="#ff5c35"
          color3="#2a145f"
          timeSpeed={0.2}
          colorBalance={0.08}
          warpStrength={1}
          warpFrequency={4.8}
          warpSpeed={1.35}
          warpAmplitude={52}
          blendAngle={-22}
          blendSoftness={0.1}
          rotationAmount={360}
          noiseScale={1.8}
          grainAmount={0.06}
          grainScale={1.7}
          contrast={1.3}
          gamma={1}
          saturation={1.05}
          centerX={-0.04}
          centerY={-0.08}
          zoom={0.86}
        /> */}
      </div>
      <div className="shape-grid-layer">
        <ShapeGrid
          borderColor="rgba(28, 25, 23, 0.24)"
          direction="diagonal"
          hoverFillColor="rgba(28, 25, 23, 0.08)"
          interactive={false}
          shape="square"
          speed={0.28}
          squareSize={44}
        />
      </div>
      <div className="background-vignette" />
    </div>
  );
}
