import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Guard against negative radius errors from third-party canvas libraries
if (typeof window !== 'undefined' && window.CanvasRenderingContext2D) {
  const originalArc = CanvasRenderingContext2D.prototype.arc;
  CanvasRenderingContext2D.prototype.arc = function(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean
  ) {
    const safeRadius = Math.max(0, isNaN(radius) ? 0 : radius);
    return originalArc.call(this, x, y, safeRadius, startAngle, endAngle, counterclockwise);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

